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
  const host = config.emailHost || 'smtp.gmail.com';
  const port = config.emailPort || 465;
  const secure = port === 465;
  const user = config.emailUser;

  logger.log(`[SMTP] Connecting to ${host}:${port} (secure=${secure}) as ${user}`);

  // Try Resend API first if configured (bypasses SMTP — works on Render)
  if (process.env.RESEND_API_KEY) {
    try {
      logger.log(`[SMTP] Resend API key found — sending via Resend instead of SMTP`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${config.senderName} <${user}>`,
          to: [to],
          subject,
          text: body,
        }),
      });

      if (res.ok) {
        logger.log(`[Resend] Email sent to ${to}`);
        return true;
      }
      const errText = await res.text();
      logger.error(`[Resend] Failed: ${res.status} ${errText} — falling back to SMTP`);
    } catch (resendErr) {
      logger.error(`[Resend] Error: ${resendErr instanceof Error ? resendErr.message : String(resendErr)} — falling back to SMTP`);
    }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: config.emailPassword,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });

  try {
    const info = await transporter.sendMail({
      from: `${config.senderName} <${user}>`,
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

    logger.log(`[SMTP] Email sent to ${to} (messageId=${info.messageId})`);
    return true;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const errCode = (err as any)?.code || 'UNKNOWN';
    const errCommand = (err as any)?.command || '';
    logger.error(
      `[SMTP] Failed to send to ${to}: ${errMsg} | code=${errCode} command=${errCommand} host=${host}:${port} secure=${secure}`
    );

    if (errMsg.includes('timeout') || errMsg.includes('ETIMEDOUT')) {
      logger.error(`[SMTP] ⚠️ SMTP port ${port} is blocked on this server. Render free tier blocks outbound SMTP. Solutions: 1) Set RESEND_API_KEY env var 2) Upgrade Render to paid 3) Deploy elsewhere`);
    }

    return false;
  } finally {
    transporter.close();
  }
}

