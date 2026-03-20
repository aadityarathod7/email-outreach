"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
/**
 * GET /api/config
 * Get current configuration
 */
router.get('/', (req, res) => {
    try {
        res.json({
            brandName: env_1.config.brandName,
            brandUrl: env_1.config.brandUrl,
            senderName: env_1.config.senderName,
            pollIntervalMinutes: env_1.config.pollIntervalMinutes,
            maxEmailsPerBatch: env_1.config.maxEmailsPerBatch,
            delayBetweenEmailsMs: env_1.config.delayBetweenEmailsMs,
            csvSenderEmail: env_1.config.csvSenderEmail,
            emailService: env_1.config.emailService,
        });
    }
    catch (err) {
        logger_1.logger.error(`Error fetching config: ${err}`);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});
/**
 * PATCH /api/config
 * Update configuration
 */
router.patch('/', (req, res) => {
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
        const envPath = path_1.default.join(process.cwd(), '.env');
        let envContent = fs_1.default.readFileSync(envPath, 'utf-8');
        const envMap = {
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
        fs_1.default.writeFileSync(envPath, envContent);
        logger_1.logger.log('Configuration updated');
        // Reload config (in a real app, you'd reload the config module)
        res.json({
            success: true,
            message: 'Configuration updated successfully',
            updates,
        });
    }
    catch (err) {
        logger_1.logger.error(`Error updating config: ${err}`);
        res.status(500).json({ error: 'Failed to update config' });
    }
});
exports.default = router;
//# sourceMappingURL=config.js.map