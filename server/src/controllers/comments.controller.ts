import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/connection.js';
import { generateId } from '../utils/id.js';

export function addComment(req: Request, res: Response, next: NextFunction): void {
  try {
    const { issueId } = req.params;
    const { content } = req.body;
    const db = getDb();
    const userId = req.user!.userId;

    // Check if issue exists
    const issue: any = db.prepare('SELECT project_id as projectId FROM issues WHERE id = ?').get(issueId);
    if (!issue) {
      res.status(404).json({
        success: false,
        error: { code: 'ISSUE_NOT_FOUND', message: 'Target issue does not exist' }
      });
      return;
    }

    const commentId = generateId('comm');
    const actId = generateId('act');

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO comments (id, issue_id, user_id, content)
        VALUES (?, ?, ?, ?)
      `).run(commentId, issueId, userId, content);

      db.prepare(`
        INSERT INTO activity_logs (id, project_id, issue_id, user_id, action, field_changed, new_value)
        VALUES (?, ?, ?, ?, 'COMMENT_ADDED', 'comment', ?)
      `).run(actId, issue.projectId, issueId, userId, content.substring(0, 100));
    });

    tx();

    const created: any = db.prepare(`
      SELECT c.id, c.content, c.created_at as createdAt, u.full_name as authorName, u.email as authorEmail, u.id as userId
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(commentId);

    res.status(201).json({
      success: true,
      data: created,
      message: 'Comment posted successfully'
    });
  } catch (error) {
    next(error);
  }
}

export function listComments(req: Request, res: Response, next: NextFunction): void {
  try {
    const { issueId } = req.params;
    const db = getDb();

    const comments = db.prepare(`
      SELECT c.id, c.content, c.created_at as createdAt, u.full_name as authorName, u.email as authorEmail, u.id as userId
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.issue_id = ?
      ORDER BY c.created_at ASC
    `).all(issueId);

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
}

