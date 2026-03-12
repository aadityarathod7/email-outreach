import express, { Router, Request, Response } from 'express';
import { fetchNewCsvData } from '../../gmail/inboxReader';
import { logger } from '../../utils/logger';

const router: Router = express.Router();

/**
 * GET /api/gmail/check
 * Check Gmail inbox for new emails with CSV attachments
 */
router.get('/check', async (req: Request, res: Response) => {
  try {
    logger.log('Checking Gmail inbox for new CSVs...');

    const csvContents = await fetchNewCsvData();

    if (csvContents.length === 0) {
      return res.json({
        success: true,
        message: 'No new CSV files found',
        csvCount: 0,
        csvs: [],
      });
    }

    // Parse CSV info
    const csvs = csvContents.map((content) => {
      const lines = content.split('\n').filter((l) => l.trim());
      return {
        rows: Math.max(0, lines.length - 1), // Exclude header
        columns: lines[0]?.split(',').length || 0,
        size: content.length,
      };
    });

    res.json({
      success: true,
      message: `Found ${csvContents.length} CSV file(s)`,
      csvCount: csvContents.length,
      csvs,
    });
  } catch (err) {
    logger.error(`Error checking Gmail: ${err}`);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to check Gmail',
    });
  }
});

/**
 * GET /api/gmail/status
 * Get Gmail connection status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    res.json({
      status: 'connected',
      message: 'Gmail integration is available',
      lastCheck: null,
    });
  } catch (err) {
    logger.error(`Error checking Gmail status: ${err}`);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check Gmail status',
    });
  }
});

export default router;
