import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/connection.js';
import { generateId } from '../utils/id.js';

export function listProjects(req: Request, res: Response, next: NextFunction): void {
  try {
    const db = getDb();
    const search = req.query.search ? `%${req.query.search}%` : null;

    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.key, 
        p.description, 
        p.owner_id as ownerId,
        p.created_at as createdAt,
        u.full_name as ownerName,
        COUNT(DISTINCT i.id) as issueCount,
        COUNT(DISTINCT pm.user_id) as memberCount
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN issues i ON p.id = i.project_id
      LEFT JOIN project_members pm ON p.id = pm.project_id
    `;

    const params: any[] = [];
    if (search) {
      query += ` WHERE p.name LIKE ? OR p.key LIKE ?`;
      params.push(search, search);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const projects = db.prepare(query).all(...params);

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
}

export function createProject(req: Request, res: Response, next: NextFunction): void {
  try {
    const { name, key, description } = req.body;
    const db = getDb();
    const cleanKey = key.toUpperCase().trim();

    // Check if key already exists
    const existing = db.prepare('SELECT id FROM projects WHERE key = ? COLLATE NOCASE').get(cleanKey);
    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: 'PROJECT_KEY_EXISTS', message: `Project key '${cleanKey}' is already taken` }
      });
      return;
    }

    const projectId = generateId('prj');
    const ownerId = req.user!.userId;

    const insertTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO projects (id, name, key, description, owner_id)
        VALUES (?, ?, ?, ?, ?)
      `).run(projectId, name, cleanKey, description || '', ownerId);

      // Add owner to members table
      db.prepare(`
        INSERT INTO project_members (project_id, user_id, role)
        VALUES (?, ?, 'ADMIN')
      `).run(projectId, ownerId);
    });

    insertTx();

    const createdProject: any = db.prepare(`
      SELECT p.id, p.name, p.key, p.description, p.owner_id as ownerId, p.created_at as createdAt
      FROM projects p WHERE p.id = ?
    `).get(projectId);

    res.status(201).json({
      success: true,
      data: createdProject,
      message: 'Project created successfully'
    });
  } catch (error) {
    next(error);
  }
}

export function getProjectById(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const db = getDb();

    const project: any = db.prepare(`
      SELECT p.id, p.name, p.key, p.description, p.owner_id as ownerId, p.created_at as createdAt,
             u.full_name as ownerName
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `).get(id);

    if (!project) {
      res.status(404).json({
        success: false,
        error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' }
      });
      return;
    }

    // Compute metrics
    const issues: any[] = db.prepare(`
      SELECT status, priority FROM issues WHERE project_id = ?
    `).all(id);

    const totalIssues = issues.length;
    const completedIssues = issues.filter(i => i.status === 'DONE').length;
    const completionPercentage = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    const byStatus = {
      BACKLOG: issues.filter(i => i.status === 'BACKLOG').length,
      TODO: issues.filter(i => i.status === 'TODO').length,
      IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS').length,
      IN_REVIEW: issues.filter(i => i.status === 'IN_REVIEW').length,
      DONE: completedIssues
    };

    const byPriority = {
      LOW: issues.filter(i => i.priority === 'LOW').length,
      MEDIUM: issues.filter(i => i.priority === 'MEDIUM').length,
      HIGH: issues.filter(i => i.priority === 'HIGH').length,
      URGENT: issues.filter(i => i.priority === 'URGENT').length
    };

    project.metrics = {
      totalIssues,
      completedIssues,
      completionPercentage,
      byStatus,
      byPriority
    };

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
}

export function deleteProject(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const db = getDb();

    const project: any = db.prepare('SELECT owner_id as ownerId FROM projects WHERE id = ?').get(id);
    if (!project) {
      res.status(404).json({
        success: false,
        error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' }
      });
      return;
    }

    // Check ownership or admin role
    if (project.ownerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the project owner or system admin can delete this project' }
      });
      return;
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    res.status(200).json({
      success: true,
      message: 'Project and associated resources deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
