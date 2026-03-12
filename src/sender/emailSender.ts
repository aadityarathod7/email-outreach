import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Generate a random IP address for personalization
 */
function getRandomIP(): string {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}

/**
 * Create email transporter based on configured service
 */
function createTransporter(): nodemailer.Transporter {
  return nodemailer.createTransport({
    service: config.emailService || 'gmail',
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });
}

let transporter: nodemailer.Transporter | null = null;

/**
 * Get transporter (singleton)
 */
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

/**
 * Send a personalized email
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    // Add unsubscribe footer
    const footer = `\n\n---\nIf you'd rather not hear from us, just reply with "unsubscribe" and we'll remove you immediately.`;
    const fullBody = body + footer;

    const mailOptions = {
      from: config.emailUser,
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

    logger.log(`Email sent to ${to}`);
    return true;
  } catch (err) {
    logger.error(
      `Failed to send email to ${to}: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
}

/**
 * Close transporter connection
 */
export function closeTransporter(): void {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
}
