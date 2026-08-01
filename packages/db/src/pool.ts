// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Locate database file path
const dbPath = process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../healthsense.db');

// Initialize SQLite database
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Register custom SQL functions to match Postgres compatibility
db.function('gen_random_uuid', () => crypto.randomUUID());
db.function('now', () => new Date().toISOString());
db.function('NOW', () => new Date().toISOString());

// Auto-initialize schema if tables do not exist
try {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }
} catch (err) {
  console.error('[DB] Error initializing SQLite schema:', err);
}

function parseJsonIfNeeded(value: any): any {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
  }
  return value;
}

function formatRow(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const formatted: Record<string, any> = {};
  for (const [key, val] of Object.entries(row)) {
    formatted[key] = parseJsonIfNeeded(val);
  }
  return formatted;
}

export const pool = {
  async query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    // Normalize: trim whitespace and strip trailing semicolons for reliable classification
    const trimmedSql = text.trim().replace(/;+$/, '').trim();
    const upperSql = trimmedSql.toUpperCase();

    // Handle transaction commands
    if (upperSql === 'BEGIN' || upperSql === 'BEGIN TRANSACTION') {
      db.exec('BEGIN TRANSACTION');
      return { rows: [], rowCount: 0 };
    }
    if (upperSql === 'COMMIT') {
      db.exec('COMMIT');
      return { rows: [], rowCount: 0 };
    }
    if (upperSql === 'ROLLBACK') {
      db.exec('ROLLBACK');
      return { rows: [], rowCount: 0 };
    }

    // Replace $1, $2 with ?1, ?2 for SQLite parameter binding
    const sqliteSql = text.replace(/\$(\d+)/g, '?$1');

    // Format params for SQLite storage
    const formattedParams = params.map((p) => {
      if (p === undefined) return null;
      if (typeof p === 'object' && p !== null && !(p instanceof Date)) {
        return JSON.stringify(p);
      }
      if (p instanceof Date) {
        return p.toISOString();
      }
      if (typeof p === 'boolean') {
        return p ? 1 : 0;
      }
      return p;
    });

    try {
      const stmt = db.prepare(sqliteSql);

      // Strip leading SQL comments for classification
      const strippedSql = upperSql.replace(/^(\s*--[^\n]*\n)*\s*/g, '').replace(/^\/\*[\s\S]*?\*\/\s*/g, '');
      const returnsRows = strippedSql.startsWith('SELECT') || strippedSql.startsWith('WITH') || upperSql.includes('RETURNING');

      if (returnsRows) {
        const rawRows = stmt.all(...formattedParams);
        const rows = rawRows.map(formatRow);
        return { rows, rowCount: rows.length };
      } else {
        const result = stmt.run(...formattedParams);
        return { rows: [], rowCount: Number(result.changes) };
      }
    } catch (err: any) {
      console.error('[DB Query Error]', { sql: sqliteSql, params: formattedParams, error: err.message });
      throw err;
    }
  },

  on(event: string, callback: (...args: any[]) => void) {
    // Stub event listener for compatibility with pg pool
  },

  async end() {
    db.close();
  }
};
