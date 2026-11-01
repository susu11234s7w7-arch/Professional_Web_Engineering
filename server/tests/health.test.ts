import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDb, teardownTestDb } from './setup.js';

describe('Health API Endpoint', () => {
  let app: any;

  beforeAll(() => {
    setupTestDb();
    app = createApp();
  });

  afterAll(() => {
    teardownTestDb();
  });

  it('GET /api/health returns 200 and healthy database status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.timestamp).toBeDefined();
  });
});

