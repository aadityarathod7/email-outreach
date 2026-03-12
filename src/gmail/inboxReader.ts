import Imap from 'imap';
import { simpleParser } from 'mailparser';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const BACKUP_DIR = path.join(__dirname, '../../data/processed');

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Create IMAP connection
 */
function createImapConnection(): Imap {
  return new Imap({
    user: config.gmailUser,
    password: config.gmailAppPassword,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
  });
}

/**
 * Fetch new CSV data from Gmail IMAP with retry logic
 */
export async function fetchNewCsvData(): Promise<string[]> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchCsvDataInternal();
    } catch (err) {
      logger.error(
        `IMAP fetch attempt ${attempt}/${maxRetries} failed: ${err instanceof Error ? err.message : String(err)}`
      );

      if (attempt === maxRetries) {
        logger.error('All IMAP fetch attempts failed');
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
async function fetchCsvDataInternal(): Promise<string[]> {
  const imap = createImapConnection();
  const csvContents: string[] = [];

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
          logger.log('No new emails found');
          imap.end();
          resolve([]);
          return;
        }

        let processed = 0;
        let hasError = false;

        const f = imap.fetch(results, { bodies: '' });

        f.on('message', (msg, seqno) => {
          const chunks: Buffer[] = [];
          msg.on('body', (stream) => {
            stream.on('data', (chunk: Buffer) => chunks.push(chunk));
          });
          msg.once('end', () => {
            const raw = Buffer.concat(chunks);
            simpleParser(raw, {}, async (err, parsed) => {
            try {
              if (err) {
                logger.error(`Error parsing email ${seqno}: ${err.message}`);
                processed++;
                return;
              }

              // Check sender if CSV_SENDER_EMAIL is configured
              if (config.csvSenderEmail) {
                const fromEmail = parsed.from?.text || '';
                if (!fromEmail.includes(config.csvSenderEmail)) {
                  logger.log(
                    `Skipping email from ${fromEmail} (not from configured sender)`
                  );
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
                    const backupPath = path.join(
                      BACKUP_DIR,
                      `${attachment.filename.replace('.csv', '')}_${timestamp}.csv`
                    );
                    fs.writeFileSync(backupPath, csvContent);
                    logger.log(`Backed up CSV to ${backupPath}`);
                  }
                }
              }

              // Mark email as seen
              imap.setFlags(seqno, ['\\Seen'], (err) => {
                if (err) {
                  logger.error(`Error marking email ${seqno} as seen: ${err.message}`);
                }
              });

              processed++;
            } catch (err) {
              logger.error(
                `Unexpected error processing email: ${err instanceof Error ? err.message : String(err)}`
              );
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
