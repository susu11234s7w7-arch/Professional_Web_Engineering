import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/connection.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { generateId } from '../utils/id.js';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName, role } = req.body;
    const db = getDb();

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { code: 'EMAIL_ALREADY_EXISTS', message: 'A user with this email address already exists' }
      });
      return;
    }

    const userId = generateId('usr');
    const passwordHash = await hashPassword(password);
    const assignedRole = role || 'MEMBER';

    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, email.toLowerCase(), passwordHash, fullName, assignedRole);

    const token = generateToken({
      userId,
      email: email.toLowerCase(),
      role: assignedRole
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          email: email.toLowerCase(),
          fullName,
          role: assignedRole
        },
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user: any = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
      return;
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          createdAt: user.created_at
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
}

export function getMe(req: Request, res: Response, next: NextFunction): void {
  try {
    const db = getDb();
    const user: any = db.prepare('SELECT id, email, full_name as fullName, role, created_at as createdAt FROM users WHERE id = ?').get(req.user!.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User account not found' }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export function listUsers(_req: Request, res: Response, next: NextFunction): void {
  try {
    const db = getDb();
    const users = db.prepare('SELECT id, email, full_name as fullName, role FROM users ORDER BY full_name ASC').all();

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
}

