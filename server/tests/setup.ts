import { getDb, closeDb } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

let currentTestDbPath: string | null = null;

export function setupTestDb() {
  closeDb();
  const uniqueId = crypto.randomBytes(6).toString('hex');
  currentTestDbPath = path.resolve(process.cwd(), 'data', `test-${uniqueId}.sqlite`);
  
  const dir = path.dirname(currentTestDbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = getDb(currentTestDbPath);
  runMigrations(db);
  return db;
}

export function teardownTestDb() {
  closeDb();
  if (currentTestDbPath && fs.existsSync(currentTestDbPath)) {
    try {
      fs.unlinkSync(currentTestDbPath);
    } catch (e) {
      // Ignore
    }
    currentTestDbPath = null;
  }
}
