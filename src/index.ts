import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { config } from './config/env';
import { logger } from './utils/logger';
import { fetchNewCsvData } from './gmail/inboxReader';
import { parseCsv, UserRecord } from './parser/csvParser';
import { generateEmail, rateLimit } from './ai/llmService';
import { sendEmail, closeTransporter } from './sender/emailSender';
import { isAlreadySent, recordSent, getSentCount, getRecentSent, closeDb } from './db/store';

/**
 * Initialize application
 */
function initializeApp() {
  logger.log('Initializing email-outreach application...');

  // Create required directories
  const dirs = ['data', 'data/processed'];
  for (const dir of dirs) {
    const dirPath = path.join(__dirname, `../${dir}`);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.log(`Created directory: ${dirPath}`);
    }
  }

  logger.log('Initialization complete');
}

/**
 * Main pipeline function
 */
async function runPipeline() {
  logger.log('Starting pipeline run...');
  let totalSent = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  try {
    // Fetch new CSV data from Gmail
    logger.log('Fetching CSV data from Gmail...');
    const csvContents = await fetchNewCsvData();

    if (csvContents.length === 0) {
      logger.log('No new CSV files found. Pipeline complete.');
      return;
    }

    logger.log(`Found ${csvContents.length} CSV file(s)`);

    // Process each CSV
    for (const csvContent of csvContents) {
      let users: UserRecord[] = [];

      try {
        users = parseCsv(csvContent);
        logger.log(`Parsed ${users.length} user records from CSV`);
      } catch (err) {
        logger.error(
          `Failed to parse CSV: ${err instanceof Error ? err.message : String(err)}`
        );
        continue;
      }

      // Filter out already-sent users
      const newUsers = users.filter((user) => !isAlreadySent(user.email));

      if (newUsers.length === 0) {
        logger.log('All users in this CSV have already been contacted');
        continue;
      }

      totalSkipped += users.length - newUsers.length;
      logger.log(`${newUsers.length} new users to contact (${totalSkipped} already sent)`);

      // Cap batch size
      const batch = newUsers.slice(0, config.maxEmailsPerBatch);

      if (batch.length < newUsers.length) {
        logger.log(
          `Capping batch at ${config.maxEmailsPerBatch} emails (${newUsers.length - batch.length} deferred)`
        );
      }

      // Send emails
      for (let i = 0; i < batch.length; i++) {
        const user = batch[i];
        const progressStr = `${totalSent + 1}/${batch.length}`;

        try {
          logger.log(`Generating email for ${user.name} (${progressStr})...`);
          const email = await generateEmail(user);

          logger.log(`Sending email to ${user.email} (${progressStr})...`);
          const sent = await sendEmail(user.email, email.subject, email.body);

          if (sent) {
            recordSent(user.email, user.name, email.subject);
            totalSent++;
            logger.log(`✓ Sent ${progressStr} - ${user.email}`);
          } else {
            totalFailed++;
            logger.error(`✗ Failed ${progressStr} - ${user.email}`);
          }
        } catch (err) {
          totalFailed++;
          logger.error(
            `✗ Error processing ${user.email}: ${err instanceof Error ? err.message : String(err)}`
          );
        }

        // Rate limiting between emails
        if (i < batch.length - 1) {
          const delaySeconds = Math.round(config.delayBetweenEmailsMs / 1000);
          logger.log(`Waiting ${delaySeconds}s before next email...`);
          await new Promise((resolve) =>
            setTimeout(resolve, config.delayBetweenEmailsMs)
          );
        }

        // API rate limit
        await rateLimit();
      }
    }

    logger.log(
      `Pipeline complete. Sent: ${totalSent}, Skipped: ${totalSkipped}, Failed: ${totalFailed}`
    );
  } catch (err) {
    logger.error(
      `Pipeline error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/**
 * Run test mode with local CSV file
 */
async function runTestMode(csvPath: string) {
  logger.log(`Running in test mode with CSV: ${csvPath}`);

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const users = parseCsv(csvContent);

    logger.log(`Parsed ${users.length} test users`);

    // Just generate email for first user as demo
    if (users.length > 0) {
      const user = users[0];
      logger.log(`Generating demo email for ${user.name}...`);
      const email = await generateEmail(user);

      logger.log('---');
      logger.log(`Subject: ${email.subject}`);
      logger.log('---');
      logger.log(email.body);
      logger.log('---');
    }
  } catch (err) {
    logger.error(`Test mode error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Schedule pipeline with cron
 */
function schedulePipeline() {
  const interval = config.pollIntervalMinutes;
  const cronExpression = `0 */${interval} * * * *`; // Every N minutes

  logger.log(`Scheduling pipeline to run every ${interval} minute(s)`);

  cron.schedule(cronExpression, () => {
    logger.log('Cron triggered pipeline run');
    runPipeline().catch((err) => {
      logger.error(`Uncaught error in pipeline: ${err}`);
    });
  });
}

/**
 * Main entry point
 */
async function main() {
  try {
    initializeApp();

    // Check for test mode
    const testCsvArg = process.argv.find((arg) => arg.startsWith('--test-csv='));
    if (testCsvArg) {
      const csvPath = testCsvArg.split('=')[1];
      await runTestMode(csvPath);
      return;
    }

    // Run pipeline once immediately
    logger.log('Running initial pipeline...');
    await runPipeline();

    // Schedule recurring runs
    schedulePipeline();

    logger.log('Application running. Press Ctrl+C to exit.');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.log('Received SIGINT, shutting down gracefully...');
      closeTransporter();
      closeDb();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.log('Received SIGTERM, shutting down gracefully...');
      closeTransporter();
      closeDb();
      process.exit(0);
    });
  } catch (err) {
    logger.error(
      `Fatal error: ${err instanceof Error ? err.message : String(err)}`
    );
    closeTransporter();
    closeDb();
    process.exit(1);
  }
}

main();
