/**
 * _db.ts — server-side JSON file database helper.
 * Used by all /api/[collection] route handlers.
 * File path: <project-root>/data/database.json
 *
 * Note: on Vercel (serverless / read-only FS) writeDB is a no-op.
 * Data persistence only works when running the local Next.js dev server.
 */

import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

const EMPTY_DB: Record<string, any[]> = {
  machines: [],
  lines: [],
  transfers: [],
  maintenanceTasks: [],
  machineTypes: [],
  users: [],
};

export const VALID_COLLECTIONS = Object.keys(EMPTY_DB);

export function readDB(): Record<string, any[]> {
  try {
    // Ensure the data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(DB_PATH)) {
      // First run — create an empty database file
      fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), 'utf-8');
      return { ...EMPTY_DB };
    }

    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, any[]>;

    // Fill missing collections so callers can safely access any key
    for (const key of VALID_COLLECTIONS) {
      if (!Array.isArray(parsed[key])) parsed[key] = [];
    }
    return parsed;
  } catch {
    return { ...EMPTY_DB };
  }
}

export function writeDB(db: Record<string, any[]>): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // Vercel / read-only filesystem — writes are silently ignored.
    // Data persistence only works on the local dev server.
  }
}
