"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const LOG_FILE = path_1.default.join(__dirname, '../../data/app.log');
/**
 * Ensure log directory exists
 */
function ensureLogDir() {
    const logDir = path_1.default.dirname(LOG_FILE);
    if (!fs_1.default.existsSync(logDir)) {
        fs_1.default.mkdirSync(logDir, { recursive: true });
    }
}
/**
 * Format timestamp for logging
 */
function timestamp() {
    return new Date().toISOString();
}
/**
 * Write message to console and log file
 */
function write(level, message) {
    const formatted = `[${timestamp()}] [${level}] ${message}`;
    console.log(formatted);
    try {
        ensureLogDir();
        fs_1.default.appendFileSync(LOG_FILE, formatted + '\n');
    }
    catch (err) {
        console.error('Failed to write to log file:', err);
    }
}
exports.logger = {
    /**
     * Log an informational message
     */
    log: (message) => write('INFO', message),
    /**
     * Log a warning message
     */
    warn: (message) => write('WARN', message),
    /**
     * Log an error message
     */
    error: (message) => write('ERROR', message),
};
//# sourceMappingURL=logger.js.map