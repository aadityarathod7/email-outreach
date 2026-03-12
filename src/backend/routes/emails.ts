import express, { Router, Request, Response } from 'express';
import { parseCsv, type UserRecord } from '../../parser/csvParser';
import { generateEmail } from '../../ai/llmService';
import { sendEmail } from '../../sender/emailSender';
import { recordSent, isAlreadySent, getRecentSent } from '../../db/store';
import { logger } from '../../utils/logger';

const router: Router = express.Router();

/**
 * GET /api/emails/sent
 * Get all sent emails with optional filtering
 */
router.get('/sent', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const filterEmail = req.query.email as string | undefined;

    const emails = getRecentSent(1000); // Get up to 1000 recent emails
    let filtered = emails;

    if (filterEmail) {
      filtered = filtered.filter((e: any) => e.email.includes(filterEmail));
    }

    const paginated = filtered.slice(offset, offset + limit);

    res.json({
      total: filtered.length,
      limit,
      offset,
      data: paginated,
    });
  } catch (err) {
    logger.error(`Error fetching sent emails: ${err}`);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

/**
 * POST /api/emails/preview
 * Generate preview of an email for a user
 */
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { email, name, plan, totalImages, prompts } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Missing email or name' });
    }

    const user: UserRecord = {
      email,
      name,
      plan: plan || 'Gold',
      totalImages: totalImages || 0,
      prompts: prompts || [],
    };

    const emailContent = await generateEmail(user);

    res.json({
      email,
      name,
      subject: emailContent.subject,
      body: emailContent.body,
    });
  } catch (err) {
    logger.error(`Error generating preview: ${err}`);
    res.status(500).json({ error: 'Failed to generate email preview' });
  }
});

/**
 * POST /api/emails/send-manual
 * Send emails from uploaded CSV
 */
router.post('/send-manual', async (req: Request, res: Response) => {
  try {
    const { csvContent, dryRun = false } = req.body;

    if (!csvContent) {
      return res.status(400).json({ error: 'Missing CSV content' });
    }

    // Parse CSV
    const users = parseCsv(csvContent);

    if (users.length === 0) {
      return res.status(400).json({ error: 'No valid users in CSV' });
    }

    logger.log(`Processing ${users.length} users from CSV`);

    const results = {
      total: users.length,
      sent: 0,
      skipped: 0,
      failed: 0,
      details: [] as any[],
    };

    // Process each user
    for (const user of users) {
      try {
        // Check if already sent
        if (isAlreadySent(user.email)) {
          results.skipped++;
          results.details.push({
            email: user.email,
            status: 'skipped',
            reason: 'Already sent',
          });
          continue;
        }

        // Generate email
        const emailContent = await generateEmail(user);

        // Send email (or skip if dry run)
        let sent = false;
        if (!dryRun) {
          sent = await sendEmail(user.email, emailContent.subject, emailContent.body);
        } else {
          sent = true; // Assume success in dry run
        }

        if (sent) {
          if (!dryRun) {
            recordSent(user.email, user.name, emailContent.subject, emailContent.body);
          }
          results.sent++;
          results.details.push({
            email: user.email,
            status: dryRun ? 'ready' : 'sent',
            subject: emailContent.subject,
          });
        } else {
          results.failed++;
          results.details.push({
            email: user.email,
            status: 'failed',
            reason: 'Email send failed',
          });
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        results.failed++;
        results.details.push({
          email: user.email,
          status: 'error',
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }

    res.json({
      ...results,
      dryRun,
      mode: dryRun ? 'preview' : 'live',
    });
  } catch (err) {
    logger.error(`Error sending emails: ${err}`);
    res.status(500).json({ error: 'Failed to send emails' });
  }
});

/**
 * POST /api/emails/send-single
 * Send a single email
 */
router.post('/send-single', async (req: Request, res: Response) => {
  try {
    const { email, subject, body } = req.body;

    if (!email || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sent = await sendEmail(email, subject, body);

    if (sent) {
      recordSent(email, 'Manual Send', subject, body);
      res.json({ success: true, message: 'Email sent' });
    } else {
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (err) {
    logger.error(`Error sending single email: ${err}`);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
