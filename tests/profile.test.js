const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const authRoutes = require('../server/routes/auth');
const profileRoutes = require('../server/routes/profile');
const db = require('../server/config/database');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

describe('Тесты модуля личного кабинета', () => {
  
  let authToken;
  let userId;

  beforeAll(async () => {
    await new Promise((resolve) => db.run('DELETE FROM users', resolve));
    
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'profile@example.com',
        password: 'Test1234'
      });
    
    authToken = registerResponse.body.token;
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'test_secret');
    userId = decoded.id;
  });

  afterAll((done) => {
    db.run('DELETE FROM users', done);
  });

  describe('GET /api/profile/stats - Получение статистики', () => {
    test('Успешное получение статистики с валидным токеном', async () => {
      const response = await request(app)
        .get('/api/profile/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('nickname');
      expect(response.body).toHaveProperty('level');
      expect(response.body).toHaveProperty('rating');
      expect(response.body).toHaveProperty('wins');
      expect(response.body).toHaveProperty('playtime');
    });

    test('Отказ при отсутствии токена авторизации', async () => {
      const response = await request(app)
        .get('/api/profile/stats');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Требуется авторизация');
    });

    test('Отказ при невалидном токене', async () => {
      const response = await request(app)
        .get('/api/profile/stats')
        .set('Authorization', 'Bearer invalid_token_123');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Недействительный токен');
    });
  });

  describe('GET /api/profile/achievements - Получение достижений', () => {
    test('Успешное получение списка достижений', async () => {
      const response = await request(app)
        .get('/api/profile/achievements')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('description');
        expect(response.body[0]).toHaveProperty('rarity');
        expect(response.body[0]).toHaveProperty('percentage');
      }
    });
  });

  describe('GET /api/profile/purchases - Получение покупок', () => {
    test('Успешное получение истории покупок', async () => {
      const response = await request(app)
        .get('/api/profile/purchases')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('item_name');
        expect(response.body[0]).toHaveProperty('amount');
        expect(response.body[0]).toHaveProperty('rarity');
        expect(response.body[0]).toHaveProperty('purchase_date');
      }
    });
  });

  describe('PUT /api/profile/update - Обновление профиля', () => {
    test('Успешное изменение никнейма', async () => {
      const response = await request(app)
        .put('/api/profile/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: 'NewTestName'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Профиль обновлен');
    });

    test('Отказ при никнейме короче 3 символов', async () => {
      const response = await request(app)
        .put('/api/profile/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: 'AB'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('3 до 20 символов');
    });

    test('Отказ при никнейме длиннее 20 символов', async () => {
      const response = await request(app)
        .put('/api/profile/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: 'VeryLongNicknameMoreThan20Chars'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('3 до 20 символов');
    });
  });

});