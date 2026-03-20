"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAlreadySent = isAlreadySent;
exports.recordSent = recordSent;
exports.getSentCount = getSentCount;
exports.getRecentSent = getRecentSent;
exports.closeDb = closeDb;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DB_PATH = path_1.default.join(__dirname, '../../data/outreach.db');
const DATA_DIR = path_1.default.dirname(DB_PATH);
/**
 * Ensure data directory exists
 */
function ensureDataDir() {
    if (!fs_1.default.existsSync(DATA_DIR)) {
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    }
}
/**
 * Initialize database connection and schema
 */
function initializeDb() {
    ensureDataDir();
    const db = new better_sqlite3_1.default(DB_PATH);
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
        const columns = db.prepare("PRAGMA table_info(sent_emails)").all();
        if (!columns.some((col) => col.name === 'body')) {
            db.exec("ALTER TABLE sent_emails ADD COLUMN body TEXT DEFAULT ''");
        }
    }
    catch (error) {
        // Migration already applied or table doesn't exist yet
    }
    return db;
}
let db = null;
/**
 * Get database connection (singleton)
 */
function getDb() {
    if (!db) {
        db = initializeDb();
    }
    return db;
}
/**
 * Check if an email has already been sent
 */
function isAlreadySent(email) {
    const db = getDb();
    const stmt = db.prepare('SELECT 1 FROM sent_emails WHERE email = ?');
    return stmt.get(email) !== undefined;
}
/**
 * Record that an email was sent
 */
function recordSent(email, name, subject, body = '') {
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
function getSentCount() {
    const db = getDb();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM sent_emails');
    const result = stmt.get();
    return result.count;
}
/**
 * Get recently sent emails
 */
function getRecentSent(limit) {
    const db = getDb();
    const stmt = db.prepare(`
    SELECT email, name, subject, body, sent_at
    FROM sent_emails
    ORDER BY sent_at DESC
    LIMIT ?
  `);
    return stmt.all(limit);
}
/**
 * Close database connection
 */
function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}
//# sourceMappingURL=store.js.map