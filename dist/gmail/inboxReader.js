"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNewCsvData = fetchNewCsvData;
const imap_1 = __importDefault(require("imap"));
const mailparser_1 = require("mailparser");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const BACKUP_DIR = path_1.default.join(__dirname, '../../data/processed');
/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
    if (!fs_1.default.existsSync(BACKUP_DIR)) {
        fs_1.default.mkdirSync(BACKUP_DIR, { recursive: true });
    }
}
/**
 * Create IMAP connection
 */
function createImapConnection() {
    return new imap_1.default({
        user: env_1.config.gmailUser,
        password: env_1.config.gmailAppPassword,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
    });
}
/**
 * Fetch new CSV data from Gmail IMAP with retry logic
 */
async function fetchNewCsvData() {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fetchCsvDataInternal();
        }
        catch (err) {
            logger_1.logger.error(`IMAP fetch attempt ${attempt}/${maxRetries} failed: ${err instanceof Error ? err.message : String(err)}`);
            if (attempt === maxRetries) {
                logger_1.logger.error('All IMAP fetch attempts failed');
                return [];
            }
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        }
    }
    return [];
}
/**
 * Internal implementation of CSV fetch
 */
async function fetchCsvDataInternal() {
    const imap = createImapConnection();
    const csvContents = [];
    return new Promise((resolve, reject) => {
        imap.openBox('INBOX', false, (err, box) => {
            if (err) {
                reject(err);
                return;
            }
            // Search for unseen emails
            imap.search(['UNSEEN'], async (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!results || results.length === 0) {
                    logger_1.logger.log('No new emails found');
                    imap.end();
                    resolve([]);
                    return;
                }
                let processed = 0;
                let hasError = false;
                const f = imap.fetch(results, { bodies: '' });
                f.on('message', (msg, seqno) => {
                    const chunks = [];
                    msg.on('body', (stream) => {
                        stream.on('data', (chunk) => chunks.push(chunk));
                    });
                    msg.once('end', () => {
                        const raw = Buffer.concat(chunks);
                        (0, mailparser_1.simpleParser)(raw, {}, async (err, parsed) => {
                            try {
                                if (err) {
                                    logger_1.logger.error(`Error parsing email ${seqno}: ${err.message}`);
                                    processed++;
                                    return;
                                }
                                // Check sender if CSV_SENDER_EMAIL is configured
                                if (env_1.config.csvSenderEmail) {
                                    const fromEmail = parsed.from?.text || '';
                                    if (!fromEmail.includes(env_1.config.csvSenderEmail)) {
                                        logger_1.logger.log(`Skipping email from ${fromEmail} (not from configured sender)`);
                                        processed++;
                                        return;
                                    }
                                }
                                // Process attachments
                                if (parsed.attachments && parsed.attachments.length > 0) {
                                    for (const attachment of parsed.attachments) {
                                        if (attachment.filename && attachment.filename.endsWith('.csv')) {
                                            const csvContent = attachment.content.toString('utf-8');
                                            csvContents.push(csvContent);
                                            // Backup CSV file
                                            ensureBackupDir();
                                            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                                            const backupPath = path_1.default.join(BACKUP_DIR, `${attachment.filename.replace('.csv', '')}_${timestamp}.csv`);
                                            fs_1.default.writeFileSync(backupPath, csvContent);
                                            logger_1.logger.log(`Backed up CSV to ${backupPath}`);
                                        }
                                    }
                                }
                                // Mark email as seen
                                imap.setFlags(seqno, ['\\Seen'], (err) => {
                                    if (err) {
                                        logger_1.logger.error(`Error marking email ${seqno} as seen: ${err.message}`);
                                    }
                                });
                                processed++;
                            }
                            catch (err) {
                                logger_1.logger.error(`Unexpected error processing email: ${err instanceof Error ? err.message : String(err)}`);
                                hasError = true;
                                processed++;
                            }
                        });
                    }); // msg.once('end')
                });
                f.on('error', (err) => {
                    hasError = true;
                    reject(err);
                });
                f.on('end', () => {
                    imap.end();
                });
            });
        });
        imap.on('error', (err) => {
            reject(err);
        });
        imap.on('end', () => {
            resolve(csvContents);
        });
    });
}
//# sourceMappingURL=inboxReader.js.map