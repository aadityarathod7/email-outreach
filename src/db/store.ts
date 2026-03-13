import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../../data/outreach.db');
const DATA_DIR = path.dirname(DB_PATH);

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Initialize database connection and schema
 */
function initializeDb(): Database.Database {
  ensureDataDir();
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sent_emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      name TEXT,
      subject TEXT,
      body TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      csv_date TEXT,
      status TEXT DEFAULT 'sent'
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_email ON sent_emails(email);
  `);

  // Migration: add body column if it doesn't exist (for existing databases)
  try {
    const columns = db.prepare("PRAGMA table_info(sent_emails)").all() as Array<{ name: string }>;
    if (!columns.some((col) => col.name === 'body')) {
      db.exec("ALTER TABLE sent_emails ADD COLUMN body TEXT DEFAULT ''");
    }
  } catch (error) {
    // Migration already applied or table doesn't exist yet
  }

  return db;
}

let db: Database.Database | null = null;

/**
 * Get database connection (singleton)
 */
function getDb(): Database.Database {
  if (!db) {
    db = initializeDb();
  }
  return db;
}

/**
 * Check if an email has already been sent
 */
export function isAlreadySent(email: string): boolean {
  const db = getDb();
  const stmt = db.prepare('SELECT 1 FROM sent_emails WHERE email = ?');
  return stmt.get(email) !== undefined;
}

/**
 * Record that an email was sent
 */
export function recordSent(email: string, name: string, subject: string, body: string = ''): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO sent_emails (email, name, subject, body)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(email, name, subject, body);
}

/**
 * Get total count of sent emails
 */
export function getSentCount(): number {
  const db = getDb();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM sent_emails');
  const result = stmt.get() as { count: number };
  return result.count;
}

/**
 * Get recently sent emails
 */
export function getRecentSent(
  limit: number
): Array<{ email: string; name: string; subject: string; body: string; sent_at: string }> {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT email, name, subject, body, sent_at
    FROM sent_emails
    ORDER BY sent_at DESC
    LIMIT ?
  `);
  return stmt.all(limit) as Array<{
    email: string;
    name: string;
    subject: string;
    body: string;
    sent_at: string;
  }>;
}

/**
 * Delete a sent email by email address
 */
export function deleteSentEmail(email: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM sent_emails WHERE email = ?');
  const result = stmt.run(email);
  return result.changes > 0;
}

/**
 * Close database connection
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
