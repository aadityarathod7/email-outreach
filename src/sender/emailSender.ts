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
 * Send a personalized email — fresh transporter per call to avoid ETIMEDOUT
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL — no STARTTLS negotiation
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });

  try {
    await transporter.sendMail({
      from: `${config.senderName} <${config.emailUser}>`,
      to,
      subject,
      text: body,
      headers: {
        'X-Priority': '3',
        'Importance': 'normal',
        'X-Originating-IP': `[${getRandomIP()}]`,
        'X-Mailer': 'Personal Mail Client',
        'X-MSMail-Priority': 'Normal',
        'User-Agent': 'Mozilla/5.0',
        'MIME-Version': '1.0',
      },
    });

    logger.log(`Email sent to ${to}`);
    return true;
  } catch (err) {
    logger.error(
      `Failed to send email to ${to}: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  } finally {
    transporter.close();
  }
}

