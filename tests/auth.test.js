const request = require('supertest');
const express = require('express');
const authRoutes = require('../server/routes/auth');
const db = require('../server/config/database');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Тесты модуля аутентификации', () => {
  
  beforeAll((done) => {
    db.run('DELETE FROM users', done);
  });

  afterEach((done) => {
    db.run('DELETE FROM users', done);
  });

  describe('POST /api/auth/register - Регистрация пользователя', () => {
    test('Отказ при пароле короче 8 символов', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'Test12'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Пароль должен содержать минимум 8 символов');
    });

    test('Отказ при отсутствии заглавных букв в пароле', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test3@example.com',
          password: 'test1234'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Пароль должен содержать заглавные буквы');
    });

    test('Отказ при отсутствии цифр в пароле', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test4@example.com',
          password: 'TestTest'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Пароль должен содержать цифры');
    });

    test('Отказ при регистрации с уже существующим email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Test1234'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Test5678'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email уже используется');
    });
  });

  describe('POST /api/auth/login - Вход в систему', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'Test1234'
        });
    });

    test('Отказ при неверном пароле', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPass123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Неверный email или пароль');
    });

    test('Отказ при несуществующем email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test1234'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Неверный email или пароль');
    });
  });

  describe('POST /api/auth/recovery - Восстановление доступа', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'recovery@example.com',
          password: 'Test1234'
        });
    });

    test('Успешный запрос восстановления для существующего email', async () => {
      const response = await request(app)
        .post('/api/auth/recovery')
        .send({
          email: 'recovery@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('письмо будет отправлено');
    });

    test('Нейтральный ответ для несуществующего email', async () => {
      const response = await request(app)
        .post('/api/auth/recovery')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('письмо будет отправлено');
    });
  });

});