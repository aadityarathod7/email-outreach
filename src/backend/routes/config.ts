import express, { Router, Request, Response } from 'express';
import { config } from '../../config/env';
import { reloadApiKeys } from '../../ai/llmService';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

const router: Router = express.Router();

/**
 * GET /api/config
 * Get current configuration
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const maskKey = (key: string) =>
      key.length > 8 ? `${key.slice(0, 6)}${'*'.repeat(key.length - 10)}${key.slice(-4)}` : '****';

    res.json({
      brandName: config.brandName,
      brandUrl: config.brandUrl,
      senderName: config.senderName,
      pollIntervalMinutes: config.pollIntervalMinutes,
      maxEmailsPerBatch: config.maxEmailsPerBatch,
      delayBetweenEmailsMs: config.delayBetweenEmailsMs,
      csvSenderEmail: config.csvSenderEmail,
      emailService: config.emailService,
      llmApiKey: config.llmApiKey ? maskKey(config.llmApiKey) : '',
      llmApiKeys: process.env.LLM_API_KEYS
        ? process.env.LLM_API_KEYS.split(',').map((k) => maskKey(k.trim())).join('\n')
        : '',
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
      'llmApiKey',
      'llmApiKeys',
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
      llmApiKey: 'LLM_API_KEY',
      llmApiKeys: 'LLM_API_KEYS',
    };

    for (let [key, value] of Object.entries(updates)) {
      // Normalize newline-separated keys to comma-separated for LLM_API_KEYS
      if (key === 'llmApiKeys') {
        value = (value as string).split('\n').map((k: string) => k.trim()).filter(Boolean).join(',');
      }
      const envKey = envMap[key];
      if (envKey) {
        const regex = new RegExp(`^${envKey}=.*$`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${envKey}=${value}`);
        } else {
          envContent = envContent.trimEnd() + `\n${envKey}=${value}\n`;
        }
      }
    }

    fs.writeFileSync(envPath, envContent);

    // Update process.env so changes take effect immediately without restart
    for (let [key, value] of Object.entries(updates)) {
      if (key === 'llmApiKeys') {
        value = (value as string).split('\n').map((k: string) => k.trim()).filter(Boolean).join(',');
      }
      const envKey = envMap[key];
      if (envKey) {
        process.env[envKey] = String(value);
        // Also update the config object fields that map directly
        const configKey = key as keyof typeof config;
        if (configKey in config) (config as unknown as Record<string, unknown>)[configKey] = value;
      }
    }

    // Reload LLM API key pool so rotation picks up new keys immediately
    reloadApiKeys();

    logger.log('Configuration updated');
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
