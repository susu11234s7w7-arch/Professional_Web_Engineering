import { getDb, closeDb } from './connection.js';
import { runMigrations } from './migrate.js';
import { hashPassword } from '../utils/password.js';
import { generateId } from '../utils/id.js';

async function seed() {
  console.log('[DevPulse Seed] Starting database seeding...');
  const db = getDb();
  runMigrations(db);

  // Clear existing data for clean seed
  db.exec(`
    DELETE FROM activity_logs;
    DELETE FROM comments;
    DELETE FROM issues;
    DELETE FROM project_members;
    DELETE FROM projects;
    DELETE FROM users;
  `);

  console.log('[DevPulse Seed] Cleared old records.');

  // Create Users
  const passwordHash = await hashPassword('Password123!');

  const adminId = generateId('usr');
  const devId = generateId('usr');
  const qaId = generateId('usr');

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run(adminId, 'admin@devpulse.io', passwordHash, 'Alex Rivera (Admin)', 'ADMIN');
  insertUser.run(devId, 'sarah.chen@devpulse.io', passwordHash, 'Sarah Chen (Senior Dev)', 'MEMBER');
  insertUser.run(qaId, 'marcus.vance@devpulse.io', passwordHash, 'Marcus Vance (QA Lead)', 'MEMBER');

  console.log('[DevPulse Seed] Inserted users (admin@devpulse.io, sarah.chen@devpulse.io, marcus.vance@devpulse.io).');

  // Create Project
  const projectId = generateId('prj');
  db.prepare(`
    INSERT INTO projects (id, name, key, description, owner_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    projectId,
    'DevPulse Core Platform',
    'DEV',
    'High-performance team issue tracker and agile engineering workspace.',
    adminId
  );

  // Add Project Members
  const insertMember = db.prepare(`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (?, ?, ?)
  `);
  insertMember.run(projectId, adminId, 'ADMIN');
  insertMember.run(projectId, devId, 'MEMBER');
  insertMember.run(projectId, qaId, 'MEMBER');

  // Create Issues
  const issues = [
    {
      num: 1,
      key: 'DEV-1',
      title: 'Implement JWT authentication and RBAC guards',
      description: 'Setup token issue and verification middleware with role checking.',
      status: 'DONE',
      priority: 'HIGH',
      type: 'FEATURE',
      assigneeId: devId,
      reporterId: adminId,
      dueDate: '2026-11-05'
    },
    {
      num: 2,
      key: 'DEV-2',
      title: 'Design SQLite relational schema and index strategy',
      description: 'Write DDL migrations with foreign keys and WAL mode enabled.',
      status: 'DONE',
      priority: 'HIGH',
      type: 'TASK',
      assigneeId: devId,
      reporterId: adminId,
      dueDate: '2026-11-07'
    },
    {
      num: 3,
      key: 'DEV-3',
      title: 'Build responsive Kanban board with quick status advancement',
      description: 'Enable drag-and-drop or column transition triggers with optimistic updates.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      type: 'FEATURE',
      assigneeId: devId,
      reporterId: adminId,
      dueDate: '2026-11-12'
    },
    {
      num: 4,
      key: 'DEV-4',
      title: 'Add comprehensive Vitest and Supertest automated test suite',
      description: 'Ensure 100% pass rate across auth, project, issue, and validation endpoints.',
      status: 'IN_REVIEW',
      priority: 'HIGH',
      type: 'TASK',
      assigneeId: qaId,
      reporterId: devId,
      dueDate: '2026-11-10'
    },
    {
      num: 5,
      key: 'DEV-5',
      title: 'Fix issue filter query escaping on special characters',
      description: 'Ensure search inputs with % or underscores do not break SQL parameterized queries.',
      status: 'TODO',
      priority: 'MEDIUM',
      type: 'BUG',
      assigneeId: devId,
      reporterId: qaId,
      dueDate: '2026-11-14'
    },
    {
      num: 6,
      key: 'DEV-6',
      title: 'Add automated audit trail activity stream',
      description: 'Log status changes and assignment changes with before/after diffs.',
      status: 'DONE',
      priority: 'MEDIUM',
      type: 'IMPROVEMENT',
      assigneeId: devId,
      reporterId: adminId,
      dueDate: '2026-11-08'
    },
    {
      num: 7,
      key: 'DEV-7',
      title: 'Support Markdown rendering in issue descriptions',
      description: 'Allow engineers to paste code blocks, lists, and checklists into issues.',
      status: 'BACKLOG',
      priority: 'LOW',
      type: 'FEATURE',
      assigneeId: null,
      reporterId: devId,
      dueDate: '2026-11-20'
    }
  ];

  const insertIssue = db.prepare(`
    INSERT INTO issues (id, project_id, issue_number, key, title, description, status, priority, type, assignee_id, reporter_id, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const createdIssueIds: Record<string, string> = {};

  for (const item of issues) {
    const issueId = generateId('iss');
    createdIssueIds[item.key] = issueId;
    insertIssue.run(
      issueId,
      projectId,
      item.num,
      item.key,
      item.title,
      item.description,
      item.status,
      item.priority,
      item.type,
      item.assigneeId,
      item.reporterId,
      item.dueDate
    );

    // Initial activity log
    db.prepare(`
      INSERT INTO activity_logs (id, project_id, issue_id, user_id, action, field_changed, new_value)
      VALUES (?, ?, ?, ?, 'ISSUE_CREATED', 'status', ?)
    `).run(generateId('act'), projectId, issueId, item.reporterId, item.status);
  }

  // Add realistic comments
  const insertComment = db.prepare(`
    INSERT INTO comments (id, issue_id, user_id, content)
    VALUES (?, ?, ?, ?)
  `);

  if (createdIssueIds['DEV-3']) {
    insertComment.run(
      generateId('comm'),
      createdIssueIds['DEV-3'],
      devId,
      'Optimistic state updates working nicely in client test harness.'
    );
    insertComment.run(
      generateId('comm'),
      createdIssueIds['DEV-3'],
      qaId,
      'Tested column transition on mobile viewport, looks great!'
    );
  }

  console.log('[DevPulse Seed] Database successfully seeded with demo workspace!');
  console.log('Credentials: admin@devpulse.io / Password123!');
  closeDb();
}

seed().catch(err => {
  console.error('[DevPulse Seed] Error:', err);
  process.exit(1);
});
