const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static create(email, password, callback) {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return callback(err);
      
      const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
      db.run(sql, [email, hash], function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, email });
      });
    });
  }

  static findByEmail(email, callback) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], callback);
  }

  static findById(id, callback) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], callback);
  }

  static comparePassword(password, hash, callback) {
    bcrypt.compare(password, hash, callback);
  }

  static updateProfile(userId, updates, callback) {
    const fields = [];
    const values = [];
    
    if (updates.nickname !== undefined) {
      fields.push('nickname = ?');
      values.push(updates.nickname);
      fields.push('last_nickname_change = CURRENT_TIMESTAMP');
    }
    
    if (updates.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(updates.avatar);
    }
    
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }

    if (fields.length === 0) {
      return callback(new Error('Нет данных для обновления'));
    }

    values.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    db.run(sql, values, callback);
  }

  static getStats(userId, callback) {
    const sql = `
      SELECT nickname, avatar, level, rating, wins, playtime 
      FROM users WHERE id = ?
    `;
    db.get(sql, [userId], callback);
  }

  static getAchievements(userId, callback) {
    const sql = 'SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_at DESC';
    db.all(sql, [userId], callback);
  }

  static getPurchases(userId, callback) {
    const sql = 'SELECT * FROM purchases WHERE user_id = ? ORDER BY purchase_date DESC';
    db.all(sql, [userId], callback);
  }

  static enableTwoFA(userId, secret, callback) {
    const sql = 'UPDATE users SET twofa_secret = ?, twofa_enabled = 1 WHERE id = ?';
    db.run(sql, [secret, userId], callback);
  }

  static disableTwoFA(userId, callback) {
    const sql = 'UPDATE users SET twofa_secret = NULL, twofa_enabled = 0 WHERE id = ?';
    db.run(sql, [userId], callback);
  }

  static blockUser(userId, callback) {
    const sql = 'UPDATE users SET is_blocked = 1 WHERE id = ?';
    db.run(sql, [userId], callback);
  }

  static unblockUser(userId, callback) {
    const sql = 'UPDATE users SET is_blocked = 0 WHERE id = ?';
    db.run(sql, [userId], callback);
  }

  static canChangeNickname(userId, callback) {
    const sql = `
      SELECT last_nickname_change 
      FROM users 
      WHERE id = ?
    `;
    db.get(sql, [userId], (err, row) => {
      if (err) return callback(err);
      
      if (!row.last_nickname_change) {
        return callback(null, true);
      }

      const lastChange = new Date(row.last_nickname_change);
      const now = new Date();
      const daysPassed = (now - lastChange) / (1000 * 60 * 60 * 24);
      
      callback(null, daysPassed >= 30);
    });
  }
}

module.exports = User;