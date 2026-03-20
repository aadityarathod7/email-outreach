"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const store_1 = require("../../db/store");
const logger_1 = require("../../utils/logger");
const router = express_1.default.Router();
/**
 * GET /api/stats
 * Get dashboard statistics
 */
router.get('/', (req, res) => {
    try {
        const emails = (0, store_1.getRecentSent)(10000); // Get up to 10000 recent emails
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
        const emailsByDate = {};
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
    }
    catch (err) {
        logger_1.logger.error(`Error fetching stats: ${err}`);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});
/**
 * GET /api/stats/summary
 * Get quick summary stats
 */
router.get('/summary', (req, res) => {
    try {
        const emails = (0, store_1.getRecentSent)(10000);
        const totalSent = emails.length;
        res.json({
            totalSent,
            lastUpdate: emails.length > 0 ? emails[emails.length - 1].sent_at : null,
        });
    }
    catch (err) {
        logger_1.logger.error(`Error fetching summary: ${err}`);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});
exports.default = router;
//# sourceMappingURL=stats.js.map