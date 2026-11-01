import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDb, teardownTestDb } from './setup.js';

describe('Project Management API Endpoints', () => {
  let app: any;
  let authToken: string;

  beforeAll(async () => {
    setupTestDb();
    app = createApp();

    // Register user for auth
    const regRes = await request(app).post('/api/auth/register').send({
      email: 'projectlead@devpulse.io',
      password: 'LeadPassword123!',
      fullName: 'Project Lead'
    });
    authToken = regRes.body.data.token;
  });

  afterAll(() => {
    teardownTestDb();
  });

  let createdProjectId: string;

  it('POST /api/projects creates project with key and owner', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Backend Engine',
        key: 'BACK',
        description: 'Core backend microservices'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Backend Engine');
    expect(res.body.data.key).toBe('BACK');
    createdProjectId = res.body.data.id;
  });

  it('POST /api/projects rejects duplicate key with 409', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Another Backend',
        key: 'BACK',
        description: 'Duplicate key attempt'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PROJECT_KEY_EXISTS');
  });

  it('GET /api/projects returns array of projects', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/projects/:id returns project details with computed metrics', async () => {
    const res = await request(app)
      .get(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdProjectId);
    expect(res.body.data.metrics).toBeDefined();
    expect(res.body.data.metrics.totalIssues).toBe(0);
    expect(res.body.data.metrics.byStatus.TODO).toBe(0);
  });

  it('DELETE /api/projects/:id deletes project successfully', async () => {
    // Create temporary project to delete
    const tempRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Temp Project',
        key: 'TEMP'
      });
    const tempId = tempRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/projects/${tempId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    const getRes = await request(app)
      .get(`/api/projects/${tempId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(getRes.status).toBe(404);
  });
});

