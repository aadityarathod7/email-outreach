import express, { Router, Request, Response } from 'express';
import { parseCsv, type UserRecord } from '../../parser/csvParser';
import { generateEmail } from '../../ai/llmService';
import { sendEmail } from '../../sender/emailSender';
import { recordSent, isAlreadySent, getRecentSent, deleteSentEmail, deleteAllSentEmails } from '../../db/store';
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

    logger.log(`Received send-manual request. Body keys: ${Object.keys(req.body).join(', ')}`);
    logger.log(`csvContent type: ${typeof csvContent}, length: ${csvContent?.length || 0}`);

    if (!csvContent) {
      logger.error('Missing csvContent in request body');
      return res.status(400).json({ error: 'Missing CSV content' });
    }

    // Parse CSV
    let users;
    try {
      users = parseCsv(csvContent);
      logger.log(`Successfully parsed CSV: ${users.length} users`);
    } catch (parseErr) {
      logger.error(`CSV parsing error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
      return res.status(400).json({ error: `CSV parsing failed: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}` });
    }

    if (users.length === 0) {
      logger.error('No valid users found in CSV');
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
            body: emailContent.body,
          });
        } else {
          results.failed++;
          results.details.push({
            email: user.email,
            status: 'failed',
            reason: 'Email send failed',
          });
        }

      } catch (err) {
        results.failed++;
        results.details.push({
          email: user.email,
          status: 'error',
          reason: err instanceof Error ? err.message : String(err),
        });
      }

      // 3-minute delay between real sends only (skip during dry run/preview)
      if (!dryRun && user !== users[users.length - 1]) {
        logger.log(`Waiting 2 minutes before next email...`);
        await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000));
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

/**
 * DELETE /api/emails/sent
 * Delete all sent emails from history
 */
router.delete('/sent', (req: Request, res: Response) => {
  try {
    const count = deleteAllSentEmails();
    res.json({ success: true, message: `Deleted ${count} emails from history` });
  } catch (err) {
    logger.error(`Error deleting all emails: ${err}`);
    res.status(500).json({ error: 'Failed to delete emails' });
  }
});

/**
 * DELETE /api/emails/sent/:email
 * Delete a sent email from history
 */
router.delete('/sent/:email', (req: Request, res: Response) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const deleted = deleteSentEmail(email);

    if (deleted) {
      res.json({ success: true, message: 'Email deleted from history' });
    } else {
      res.status(404).json({ error: 'Email not found' });
    }
  } catch (err) {
    logger.error(`Error deleting email: ${err}`);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

export default router;
