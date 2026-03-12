import express, { Router, Request, Response } from 'express';
import { getRecentSent } from '../../db/store';
import { logger } from '../../utils/logger';

const router: Router = express.Router();

/**
 * GET /api/stats
 * Get dashboard statistics
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const emails = getRecentSent(10000); // Get up to 10000 recent emails

    // Calculate stats
    const totalSent = emails.length;

    // Last 24 hours
    const oneDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    const yesterday = new Date(now.getTime() - oneDay);

    const lastDay = emails.filter((e) => {
      const sentDate = new Date(e.sent_at);
      return sentDate >= yesterday;
    });

    // Last 7 days
    const oneWeek = 7 * oneDay;
    const lastWeek = emails.filter((e) => {
      const sentDate = new Date(e.sent_at);
      return sentDate >= new Date(now.getTime() - oneWeek);
    });

    // Last 30 days
    const oneMonth = 30 * oneDay;
    const lastMonth = emails.filter((e) => {
      const sentDate = new Date(e.sent_at);
      return sentDate >= new Date(now.getTime() - oneMonth);
    });

    // Group by date for chart
    const emailsByDate: Record<string, number> = {};
    emails.forEach((email) => {
      const date = new Date(email.sent_at).toISOString().split('T')[0];
      emailsByDate[date] = (emailsByDate[date] || 0) + 1;
    });

    const chartData = Object.entries(emailsByDate)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, count]) => ({
        date,
        count,
      }));

    res.json({
      totalSent,
      lastDay: {
        count: lastDay.length,
        percentage: totalSent > 0 ? Math.round((lastDay.length / totalSent) * 100) : 0,
      },
      lastWeek: {
        count: lastWeek.length,
        percentage: totalSent > 0 ? Math.round((lastWeek.length / totalSent) * 100) : 0,
      },
      lastMonth: {
        count: lastMonth.length,
        percentage: totalSent > 0 ? Math.round((lastMonth.length / totalSent) * 100) : 0,
      },
      recentEmails: emails.slice(-10).reverse(),
      chartData,
    });
  } catch (err) {
    logger.error(`Error fetching stats: ${err}`);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * GET /api/stats/summary
 * Get quick summary stats
 */
router.get('/summary', (req: Request, res: Response) => {
  try {
    const emails = getRecentSent(10000);
    const totalSent = emails.length;

    res.json({
      totalSent,
      lastUpdate: emails.length > 0 ? emails[emails.length - 1].sent_at : null,
    });
  } catch (err) {
    logger.error(`Error fetching summary: ${err}`);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
