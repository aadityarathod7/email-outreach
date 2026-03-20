"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inboxReader_1 = require("../../gmail/inboxReader");
const logger_1 = require("../../utils/logger");
const router = express_1.default.Router();
/**
 * GET /api/gmail/check
 * Check Gmail inbox for new emails with CSV attachments
 */
router.get('/check', async (req, res) => {
    try {
        logger_1.logger.log('Checking Gmail inbox for new CSVs...');
        const csvContents = await (0, inboxReader_1.fetchNewCsvData)();
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
    }
    catch (err) {
        logger_1.logger.error(`Error checking Gmail: ${err}`);
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
router.get('/status', (req, res) => {
    try {
        res.json({
            status: 'connected',
            message: 'Gmail integration is available',
            lastCheck: null,
        });
    }
    catch (err) {
        logger_1.logger.error(`Error checking Gmail status: ${err}`);
        res.status(500).json({
            status: 'error',
            message: 'Failed to check Gmail status',
        });
    }
});
exports.default = router;
//# sourceMappingURL=gmail.js.map