import { Router, Request, Response } from 'express';
import { getDb } from '../db/connection.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const result = db.prepare('SELECT 1 as healthy').get();

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: result ? 'connected' : 'disconnected'
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

export default router;

