import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(__dirname, '../../data/app.log');

/**
 * Ensure log directory exists
 */
function ensureLogDir() {
  const logDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Format timestamp for logging
 */
function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Write message to console and log file
 */
function write(level: string, message: string) {
  const formatted = `[${timestamp()}] [${level}] ${message}`;
  console.log(formatted);

  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, formatted + '\n');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

export const logger = {
  /**
   * Log an informational message
   */
  log: (message: string) => write('INFO', message),

  /**
   * Log a warning message
   */
  warn: (message: string) => write('WARN', message),

  /**
   * Log an error message
   */
  error: (message: string) => write('ERROR', message),
};
