"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Load and validate environment configuration
 */
function loadConfig() {
    const required = [
        'GMAIL_USER',
        'GMAIL_APP_PASSWORD',
        'SMTP_USER',
        'SMTP_APP_PASSWORD',
        'LLM_API_KEY',
        'EMAIL_SERVICE',
        'EMAIL_USER',
        'EMAIL_PASSWORD',
        'BRAND_NAME',
        'BRAND_URL',
        'SENDER_NAME',
    ];
    for (const key of required) {
        if (!process.env[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
    return {
        gmailUser: process.env.GMAIL_USER,
        gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
        smtpUser: process.env.SMTP_USER,
        smtpAppPassword: process.env.SMTP_APP_PASSWORD,
        llmApiKey: process.env.LLM_API_KEY,
        emailService: process.env.EMAIL_SERVICE,
        emailUser: process.env.EMAIL_USER,
        emailPassword: process.env.EMAIL_PASSWORD,
        brandName: process.env.BRAND_NAME,
        brandUrl: process.env.BRAND_URL,
        senderName: process.env.SENDER_NAME,
        pollIntervalMinutes: parseInt(process.env.POLL_INTERVAL_MINUTES || '120', 10),
        maxEmailsPerBatch: parseInt(process.env.MAX_EMAILS_PER_BATCH || '50', 10),
        delayBetweenEmailsMs: parseInt(process.env.DELAY_BETWEEN_EMAILS_MS || '15000', 10),
        csvSenderEmail: process.env.CSV_SENDER_EMAIL,
    };
}
exports.config = loadConfig();
//# sourceMappingURL=env.js.map