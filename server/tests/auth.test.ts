import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDb, teardownTestDb } from './setup.js';

describe('Authentication & User Endpoints', () => {
  let app: any;

  beforeAll(() => {
    setupTestDb();
    app = createApp();
  });

  afterAll(() => {
    teardownTestDb();
  });

  const testUser = {
    email: 'engineer@devpulse.io',
    password: 'SecurePass123!',
    fullName: 'Test Engineer'
  };

  it('POST /api/auth/register creates a new user and returns JWT token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.fullName).toBe(testUser.fullName);
    expect(res.body.data.user.role).toBe('MEMBER');
    expect(res.body.data.token).toBeDefined();
    // Sensitive data must never be exposed
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  it('POST /api/auth/register rejects duplicate email with 409', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('POST /api/auth/register rejects short passwords with 422', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'short@devpulse.io',
      password: '123',
      fullName: 'Short Pass'
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/auth/login succeeds with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('POST /api/auth/login rejects wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword999!'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/auth/me returns authenticated user details', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
    expect(res.body.data.fullName).toBe(testUser.fullName);
  });

  it('GET /api/auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

