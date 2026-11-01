import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDb, teardownTestDb } from './setup.js';

describe('Issues & Task Management API Endpoints', () => {
  let app: any;
  let authToken: string;
  let projectId: string;

  beforeAll(async () => {
    setupTestDb();
    app = createApp();

    const regRes = await request(app).post('/api/auth/register').send({
      email: 'issuelead@devpulse.io',
      password: 'LeadPassword123!',
      fullName: 'Issue Lead'
    });
    authToken = regRes.body.data.token;

    const prjRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Issue Test Project',
        key: 'ITP',
        description: 'Testing issue workflows'
      });
    projectId = prjRes.body.data.id;
  });

  afterAll(() => {
    teardownTestDb();
  });

  let issue1Id: string;
  let issue2Id: string;

  it('POST /api/projects/:projectId/issues creates issue with sequential key (ITP-1)', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/issues`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'First feature issue',
        description: 'Detailed description of feature',
        priority: 'HIGH',
        type: 'FEATURE',
        status: 'TODO'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.key).toBe('ITP-1');
    expect(res.body.data.issue_number).toBe(1);
    expect(res.body.data.status).toBe('TODO');
    expect(res.body.data.priority).toBe('HIGH');
    issue1Id = res.body.data.id;
  });

  it('POST /api/projects/:projectId/issues increments sequence to ITP-2', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/issues`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Second bug issue',
        priority: 'URGENT',
        type: 'BUG',
        status: 'BACKLOG'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.key).toBe('ITP-2');
    expect(res.body.data.issue_number).toBe(2);
    issue2Id = res.body.data.id;
  });

  it('GET /api/projects/:projectId/issues lists all issues for project', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/issues`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('GET /api/projects/:projectId/issues filters by status', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/issues?status=TODO`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].key).toBe('ITP-1');
  });

  it('GET /api/projects/:projectId/issues searches by keyword', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/issues?search=bug`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].key).toBe('ITP-2');
  });

  it('PATCH /api/issues/:id updates status and records activity log', async () => {
    const res = await request(app)
      .patch(`/api/issues/${issue1Id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'IN_PROGRESS'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');

    // Verify activity stream
    const actRes = await request(app)
      .get(`/api/issues/${issue1Id}/activity`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(actRes.status).toBe(200);
    expect(actRes.body.data.length).toBeGreaterThanOrEqual(1);
    const statusChange = actRes.body.data.find((a: any) => a.action === 'STATUS_CHANGED');
    expect(statusChange).toBeDefined();
    expect(statusChange.oldValue).toBe('TODO');
    expect(statusChange.newValue).toBe('IN_PROGRESS');
  });

  it('POST /api/issues/:issueId/comments adds comment', async () => {
    const res = await request(app)
      .post(`/api/issues/${issue1Id}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'Work has begun on branch feature/itp-1'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Work has begun on branch feature/itp-1');
    expect(res.body.data.authorName).toBe('Issue Lead');
  });

  it('GET /api/issues/:id returns issue with comments and activity stream', async () => {
    const res = await request(app)
      .get(`/api/issues/${issue1Id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.key).toBe('ITP-1');
    expect(res.body.data.comments.length).toBe(1);
    expect(res.body.data.activity.length).toBeGreaterThanOrEqual(2);
  });
});

