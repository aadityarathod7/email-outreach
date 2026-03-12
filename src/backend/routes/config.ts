import express, { Router, Request, Response } from 'express';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

const router: Router = express.Router();

/**
 * GET /api/config
 * Get current configuration
 */
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({
      brandName: config.brandName,
      brandUrl: config.brandUrl,
      senderName: config.senderName,
      pollIntervalMinutes: config.pollIntervalMinutes,
      maxEmailsPerBatch: config.maxEmailsPerBatch,
      delayBetweenEmailsMs: config.delayBetweenEmailsMs,
      csvSenderEmail: config.csvSenderEmail,
      emailService: config.emailService,
    });
  } catch (err) {
    logger.error(`Error fetching config: ${err}`);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

/**
 * PATCH /api/config
 * Update configuration
 */
router.patch('/', (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'brandName',
      'brandUrl',
      'senderName',
      'pollIntervalMinutes',
      'maxEmailsPerBatch',
      'delayBetweenEmailsMs',
      'csvSenderEmail',
    ];

    // Validate fields
    for (const key of Object.keys(updates)) {
      if (!allowedFields.includes(key)) {
        return res.status(400).json({ error: `Invalid field: ${key}` });
      }
    }

    // Update .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    const envMap: Record<string, string> = {
      brandName: 'BRAND_NAME',
      brandUrl: 'BRAND_URL',
      senderName: 'SENDER_NAME',
      pollIntervalMinutes: 'POLL_INTERVAL_MINUTES',
      maxEmailsPerBatch: 'MAX_EMAILS_PER_BATCH',
      delayBetweenEmailsMs: 'DELAY_BETWEEN_EMAILS_MS',
      csvSenderEmail: 'CSV_SENDER_EMAIL',
    };

    for (const [key, value] of Object.entries(updates)) {
      const envKey = envMap[key];
      if (envKey) {
        const regex = new RegExp(`${envKey}=.*$`, 'm');
        envContent = envContent.replace(regex, `${envKey}=${value}`);
      }
    }

    fs.writeFileSync(envPath, envContent);
    logger.log('Configuration updated');

    // Reload config (in a real app, you'd reload the config module)
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      updates,
    });
  } catch (err) {
    logger.error(`Error updating config: ${err}`);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

export default router;
