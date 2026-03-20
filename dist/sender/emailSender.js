"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.closeTransporter = closeTransporter;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
/**
 * Generate a random IP address for personalization
 */
function getRandomIP() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}
/**
 * Create email transporter based on configured service
 */
function createTransporter() {
    return nodemailer_1.default.createTransport({
        service: env_1.config.emailService || 'gmail',
        auth: {
            user: env_1.config.emailUser,
            pass: env_1.config.emailPassword,
        },
    });
}
let transporter = null;
/**
 * Get transporter (singleton)
 */
function getTransporter() {
    if (!transporter) {
        transporter = createTransporter();
    }
    return transporter;
}
/**
 * Send a personalized email
 */
async function sendEmail(to, subject, body) {
    try {
        // Add unsubscribe footer
        const footer = `\n\n---\nIf you'd rather not hear from us, just reply with "unsubscribe" and we'll remove you immediately.`;
        const fullBody = body + footer;
        const mailOptions = {
            from: env_1.config.emailUser,
            to,
            subject,
            text: fullBody,
            headers: {
                'X-Priority': '3',
                'Importance': 'normal',
                'X-Originating-IP': `[${getRandomIP()}]`,
                'X-Mailer': 'Personal Mail Client',
                'X-MSMail-Priority': 'Normal',
                'User-Agent': 'Mozilla/5.0',
                'MIME-Version': '1.0',
            },
        };
        const transporter = getTransporter();
        await transporter.sendMail(mailOptions);
        logger_1.logger.log(`Email sent to ${to}`);
        return true;
    }
    catch (err) {
        logger_1.logger.error(`Failed to send email to ${to}: ${err instanceof Error ? err.message : String(err)}`);
        return false;
    }
}
/**
 * Close transporter connection
 */
function closeTransporter() {
    if (transporter) {
        transporter.close();
        transporter = null;
    }
}
//# sourceMappingURL=emailSender.js.map