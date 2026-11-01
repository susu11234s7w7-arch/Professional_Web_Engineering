import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/connection.js';

export function getIssueActivity(req: Request, res: Response, next: NextFunction): void {
  try {
    const { issueId } = req.params;
    const db = getDb();

    const activity = db.prepare(`
      SELECT 
        a.id, 
        a.action, 
        a.field_changed as fieldChanged, 
        a.old_value as oldValue, 
        a.new_value as newValue,
        a.created_at as createdAt, 
        u.full_name as userName,
        u.email as userEmail
      FROM activity_logs a
      JOIN users u ON a.user_id = u.id
      WHERE a.issue_id = ?
      ORDER BY a.created_at DESC
    `).all(issueId);

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
}

export function getProjectActivity(req: Request, res: Response, next: NextFunction): void {
  try {
    const { projectId } = req.params;
    const db = getDb();

    const activity = db.prepare(`
      SELECT 
        a.id, 
        a.issue_id as issueId,
        i.key as issueKey,
        i.title as issueTitle,
        a.action, 
        a.field_changed as fieldChanged, 
        a.old_value as oldValue, 
        a.new_value as newValue,
        a.created_at as createdAt, 
        u.full_name as userName
      FROM activity_logs a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN issues i ON a.issue_id = i.id
      WHERE a.project_id = ?
      ORDER BY a.created_at DESC
      LIMIT 50
    `).all(projectId);

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
}

