const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const db = require('../config/database');
const generator = require('../utils/generator');

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' });
  }

  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'Пароль должен содержать заглавные буквы' });
  }

  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ error: 'Пароль должен содержать строчные буквы' });
  }

  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Пароль должен содержать цифры' });
  }

  User.create(email, password, (err, user) => {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Email уже используется' });
      }
      return res.status(500).json({ error: 'Ошибка создания аккаунта' });
    }

    const stats = generator.generateUserStats();
    
    Promise.all([
      new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET level = ?, rating = ?, playtime = ?, wins = ? WHERE id = ?',
          [stats.level, stats.rating, stats.playtime, stats.wins, user.id],
          (err) => err ? reject(err) : resolve()
        );
      }),
      
      ...(() => {
        const achievementCount = Math.floor(Math.random() * 6) + 3;
        const achievements = generator.generateMultipleAchievements(user.id, achievementCount, stats);
        
        return achievements.map(achievement => 
          new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO achievements (user_id, title, description, rarity, percentage, earned_at) VALUES (?, ?, ?, ?, ?, ?)',
              [achievement.user_id, achievement.title, achievement.description, achievement.rarity, achievement.percentage, achievement.earned_at],
              (err) => err ? reject(err) : resolve()
            );
          })
        );
      })(),
      
      ...(() => {
        const purchaseCount = Math.floor(Math.random() * 9) + 2;
        const purchases = generator.generateMultiplePurchases(user.id, purchaseCount);
        
        return purchases.map(purchase => 
          new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO purchases (user_id, item_name, amount, rarity, purchase_date) VALUES (?, ?, ?, ?, ?)',
              [purchase.user_id, purchase.item_name, purchase.amount, purchase.rarity, purchase.purchase_date],
              (err) => err ? reject(err) : resolve()
            );
          })
        );
      })()
    ])
    .then(() => {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ message: 'Аккаунт создан', token });
    })
    .catch(err => {
      console.error('Ошибка генерации данных:', err);
      res.status(500).json({ error: 'Ошибка инициализации профиля' });
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password, twofa_code } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  User.findByEmail(email, (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    if (user.is_blocked) {
      return res.status(403).json({ error: 'Аккаунт заблокирован' });
    }

    User.comparePassword(password, user.password, (err, match) => {
      if (err || !match) {
        return res.status(400).json({ error: 'Неверный email или пароль' });
      }

      if (user.twofa_enabled) {
        if (!twofa_code) {
          return res.status(200).json({ requires_2fa: true });
        }

        const verified = speakeasy.totp.verify({
          secret: user.twofa_secret,
          encoding: 'base32',
          token: twofa_code
        });

        if (!verified) {
          return res.status(400).json({ error: 'Неверный код 2FA' });
        }
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ message: 'Вход выполнен', token });
    });
  });
});

router.post('/recovery', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Укажите email' });
  }

  User.findByEmail(email, (err, user) => {
    if (err || !user) {
      return res.json({ message: 'Если аккаунт существует, письмо будет отправлено' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    const sql = 'INSERT INTO recovery_tokens (user_id, token, expires_at) VALUES (?, ?, ?)';
    db.run(sql, [user.id, token, expiresAt.toISOString()], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка создания токена' });
      }

      const recoveryLink = `http://localhost:${process.env.PORT}/recovery.html?token=${token}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Восстановление доступа к Roomer',
        html: `
          <h2>Восстановление доступа</h2>
          <p>Для восстановления доступа перейдите по ссылке:</p>
          <a href="${recoveryLink}">${recoveryLink}</a>
          <p>Ссылка действительна 1 час.</p>
        `
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error('Ошибка отправки письма:', err);
        }
      });

      res.json({ message: 'Если аккаунт существует, письмо будет отправлено' });
    });
  });
});

router.post('/recovery/reset', (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' });
  }

  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({ error: 'Пароль должен содержать заглавные буквы' });
  }

  if (!/[a-z]/.test(newPassword)) {
    return res.status(400).json({ error: 'Пароль должен содержать строчные буквы' });
  }

  if (!/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: 'Пароль должен содержать цифры' });
  }

  const sql = `
    SELECT * FROM recovery_tokens 
    WHERE token = ? AND used = 0 AND expires_at > datetime('now')
  `;

  db.get(sql, [token], (err, tokenData) => {
    if (err || !tokenData) {
      return res.status(400).json({ error: 'Недействительная или истекшая ссылка' });
    }

    const bcrypt = require('bcrypt');
    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка обновления пароля' });
      }

      db.run('UPDATE users SET password = ? WHERE id = ?', [hash, tokenData.user_id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка обновления пароля' });
        }

        db.run('UPDATE recovery_tokens SET used = 1 WHERE id = ?', [tokenData.id]);
        res.json({ message: 'Пароль успешно изменен' });
      });
    });
  });
});

router.post('/2fa/setup', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }

    const secret = speakeasy.generateSecret({
      name: `Roomer (${decoded.id})`
    });

    QRCode.toDataURL(secret.otpauth_url, (err, qrCode) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка генерации QR-кода' });
      }

      res.json({
        secret: secret.base32,
        qrCode: qrCode
      });
    });
  });
});

router.post('/2fa/enable', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const { secret, code } = req.body;
  
  if (!token || !secret || !code) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code
    });

    if (!verified) {
      return res.status(400).json({ error: 'Неверный код' });
    }

    User.enableTwoFA(decoded.id, secret, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка включения 2FA' });
      }

      res.json({ message: '2FA успешно включена' });
    });
  });
});

module.exports = router;