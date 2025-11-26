const express = require('express');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticateToken, (req, res) => {
  User.getStats(req.userId, (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка загрузки статистики' });
    }
    res.json(stats);
  });
});

router.get('/achievements', authenticateToken, (req, res) => {
  User.getAchievements(req.userId, (err, achievements) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка загрузки достижений' });
    }
    
    // Сортируем по редкости и добавляем информацию о редкости
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    achievements.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    
    res.json(achievements);
  });
});

router.get('/purchases', authenticateToken, (req, res) => {
  User.getPurchases(req.userId, (err, purchases) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка загрузки истории покупок' });
    }
    
    // Сортируем по дате (новые первыми)
    purchases.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
    
    res.json(purchases);
  });
});

router.put('/update', authenticateToken, (req, res) => {
  const { nickname, avatar, email } = req.body;
  const updates = {};

  if (nickname !== undefined) {
    if (nickname.length < 3 || nickname.length > 20) {
      return res.status(400).json({ error: 'Никнейм должен быть от 3 до 20 символов' });
    }

    User.canChangeNickname(req.userId, (err, canChange) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка проверки' });
      }

      if (!canChange) {
        return res.status(400).json({ error: 'Никнейм можно менять раз в 30 дней' });
      }

      updates.nickname = nickname;
      performUpdate();
    });
  } else {
    performUpdate();
  }

  function performUpdate() {
    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    if (email !== undefined) {
      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    User.updateProfile(req.userId, updates, (err) => {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email уже используется' });
        }
        return res.status(500).json({ error: 'Ошибка обновления профиля' });
      }

      res.json({ message: 'Профиль обновлен' });
    });
  }
});

module.exports = router;