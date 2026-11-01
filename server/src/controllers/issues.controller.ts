import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/connection.js';
import { generateId } from '../utils/id.js';

export function listIssues(req: Request, res: Response, next: NextFunction): void {
  try {
    const { projectId } = req.params;
    const { status, priority, type, assigneeId, search } = req.query;
    const db = getDb();

    let query = `
      SELECT 
        i.id,
        i.project_id as projectId,
        i.issue_number as issueNumber,
        i.key,
        i.title,
        i.description,
        i.status,
        i.priority,
        i.type,
        i.assignee_id as assigneeId,
        i.reporter_id as reporterId,
        i.due_date as dueDate,
        i.created_at as createdAt,
        i.updated_at as updatedAt,
        u_assignee.full_name as assigneeName,
        u_assignee.email as assigneeEmail,
        u_reporter.full_name as reporterName,
        COUNT(DISTINCT c.id) as commentCount
      FROM issues i
      LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      LEFT JOIN comments c ON i.id = c.issue_id
      WHERE i.project_id = ?
    `;

    const params: any[] = [projectId];

    if (status) {
      query += ` AND i.status = ?`;
      params.push(status);
    }
    if (priority) {
      query += ` AND i.priority = ?`;
      params.push(priority);
    }
    if (type) {
      query += ` AND i.type = ?`;
      params.push(type);
    }
    if (assigneeId) {
      query += ` AND i.assignee_id = ?`;
      params.push(assigneeId);
    }
    if (search) {
      query += ` AND (i.title LIKE ? OR i.description LIKE ? OR i.key LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` GROUP BY i.id ORDER BY i.created_at DESC`;

    const issues = db.prepare(query).all(...params);

    res.status(200).json({
      success: true,
      data: issues
    });
  } catch (error) {
    next(error);
  }
}

export function createIssue(req: Request, res: Response, next: NextFunction): void {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, type, assigneeId, dueDate } = req.body;
    const db = getDb();
    const reporterId = req.user!.userId;

    // Check project exists
    const project: any = db.prepare('SELECT key FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      res.status(404).json({
        success: false,
        error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' }
      });
      return;
    }

    const issueId = generateId('iss');

    const insertTx = db.transaction(() => {
      // Calculate next issue number for this project
      const maxRow: any = db.prepare(`
        SELECT COALESCE(MAX(issue_number), 0) + 1 as nextNumber FROM issues WHERE project_id = ?
      `).get(projectId);

      const nextNumber = maxRow.nextNumber;
      const issueKey = `${project.key}-${nextNumber}`;

      db.prepare(`
        INSERT INTO issues (id, project_id, issue_number, key, title, description, status, priority, type, assignee_id, reporter_id, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        issueId,
        projectId,
        nextNumber,
        issueKey,
        title,
        description || '',
        status || 'TODO',
        priority || 'MEDIUM',
        type || 'TASK',
        assigneeId || null,
        reporterId,
        dueDate || null
      );

      // Record activity log
      const actId = generateId('act');
      db.prepare(`
        INSERT INTO activity_logs (id, project_id, issue_id, user_id, action, field_changed, new_value)
        VALUES (?, ?, ?, ?, 'ISSUE_CREATED', 'status', ?)
      `).run(actId, projectId, issueId, reporterId, status || 'TODO');

      return { nextNumber, issueKey };
    });

    const result = insertTx();

    const created: any = db.prepare(`
      SELECT 
        i.*,
        u_assignee.full_name as assigneeName,
        u_reporter.full_name as reporterName
      FROM issues i
      LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      WHERE i.id = ?
    `).get(issueId);

    res.status(201).json({
      success: true,
      data: created,
      message: `Issue ${result.issueKey} created successfully`
    });
  } catch (error) {
    next(error);
  }
}

export function getIssueById(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const db = getDb();

    const issue: any = db.prepare(`
      SELECT 
        i.*,
        p.name as projectName,
        u_assignee.full_name as assigneeName,
        u_reporter.full_name as reporterName
      FROM issues i
      JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      WHERE i.id = ?
    `).get(id);

    if (!issue) {
      res.status(404).json({
        success: false,
        error: { code: 'ISSUE_NOT_FOUND', message: 'Issue not found' }
      });
      return;
    }

    // Fetch comments
    const comments = db.prepare(`
      SELECT c.id, c.content, c.created_at as createdAt, u.full_name as authorName, u.email as authorEmail, u.id as userId
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.issue_id = ?
      ORDER BY c.created_at ASC
    `).all(id);

    // Fetch activity
    const activity = db.prepare(`
      SELECT a.id, a.action, a.field_changed as fieldChanged, a.old_value as oldValue, a.new_value as newValue,
             a.created_at as createdAt, u.full_name as userName
      FROM activity_logs a
      JOIN users u ON a.user_id = u.id
      WHERE a.issue_id = ?
      ORDER BY a.created_at DESC
    `).all(id);

    issue.comments = comments;
    issue.activity = activity;

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
}

export function updateIssue(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDb();
    const userId = req.user!.userId;

    const existing: any = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'ISSUE_NOT_FOUND', message: 'Issue not found' }
      });
      return;
    }

    const fields: string[] = [];
    const values: any[] = [];
    const activityLogsToInsert: Array<{ field: string; oldVal: string; newVal: string; action: string }> = [];

    const allowed = ['title', 'description', 'status', 'priority', 'type', 'assigneeId', 'dueDate'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        const dbColumn = key === 'assigneeId' ? 'assignee_id' : key === 'dueDate' ? 'due_date' : key;
        const currentVal = existing[dbColumn];
        const newVal = updates[key];

        if (String(currentVal ?? '') !== String(newVal ?? '')) {
          fields.push(`${dbColumn} = ?`);
          values.push(newVal);

          let action = 'ISSUE_UPDATED';
          if (key === 'status') action = 'STATUS_CHANGED';
          else if (key === 'priority') action = 'PRIORITY_CHANGED';
          else if (key === 'assigneeId') action = 'ASSIGNEE_CHANGED';

          activityLogsToInsert.push({
            field: key,
            oldVal: String(currentVal ?? 'None'),
            newVal: String(newVal ?? 'None'),
            action
          });
        }
      }
    }

    if (fields.length === 0) {
      res.status(200).json({ success: true, data: existing, message: 'No fields modified' });
      return;
    }

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const updateTx = db.transaction(() => {
      db.prepare(`UPDATE issues SET ${fields.join(', ')} WHERE id = ?`).run(...values);

      for (const log of activityLogsToInsert) {
        const actId = generateId('act');
        db.prepare(`
          INSERT INTO activity_logs (id, project_id, issue_id, user_id, action, field_changed, old_value, new_value)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(actId, existing.project_id, id, userId, log.action, log.field, log.oldVal, log.newVal);
      }
    });

    updateTx();

    const updatedIssue: any = db.prepare(`
      SELECT 
        i.*,
        u_assignee.full_name as assigneeName,
        u_reporter.full_name as reporterName
      FROM issues i
      LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
      LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
      WHERE i.id = ?
    `).get(id);

    res.status(200).json({
      success: true,
      data: updatedIssue,
      message: 'Issue updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

export function deleteIssue(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const db = getDb();

    const existing: any = db.prepare('SELECT id, reporter_id as reporterId FROM issues WHERE id = ?').get(id);
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'ISSUE_NOT_FOUND', message: 'Issue not found' }
      });
      return;
    }

    if (existing.reporterId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the reporter or an administrator can delete this issue' }
      });
      return;
    }

    db.prepare('DELETE FROM issues WHERE id = ?').run(id);

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

