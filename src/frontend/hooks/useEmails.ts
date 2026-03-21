import { useState, useCallback } from 'react';
import client from '../api/client';

export interface EmailResult {
  email: string;
  name: string;
  subject: string;
  body: string;
}

export interface SendResult {
  total: number;
  sent: number;
  skipped: number;
  failed: number;
  details: Array<{
    email: string;
    status: 'sent' | 'skipped' | 'failed' | 'error';
    subject?: string;
    reason?: string;
  }>;
  dryRun: boolean;
  mode: string;
}

export function useEmails() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewEmail = useCallback(
    async (email: string, name: string, plan: string, totalImages: number, prompts: string[]) => {
      try {
        setError(null);
        const data = await client.post('/emails/preview', {
          email,
          name,
          plan,
          totalImages,
          prompts,
        });
        return data;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to preview email';
        setError(errMsg);
        return null;
      }
    },
    []
  );

  const sendEmails = useCallback(async (csvContent: string, dryRun = false, customPrompt?: string) => {
    try {
      setSending(true);
      setError(null);
      const data = await client.post('/emails/send-manual', {
        csvContent,
        dryRun,
        customPrompt,
      });
      return data as SendResult;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to send emails';
      setError(errMsg);
      return null;
    } finally {
      setSending(false);
    }
  }, []);

  const sendSingleEmail = useCallback(async (email: string, subject: string, body: string) => {
    try {
      setSending(true);
      setError(null);
      const data = await client.post('/emails/send-single', {
        email,
        subject,
        body,
      });
      return data;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to send email';
      setError(errMsg);
      return null;
    } finally {
      setSending(false);
    }
  }, []);

  return { previewEmail, sendEmails, sendSingleEmail, sending, error };
}
