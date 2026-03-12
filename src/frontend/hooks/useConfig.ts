import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export interface Config {
  brandName: string;
  brandUrl: string;
  senderName: string;
  pollIntervalMinutes: number;
  maxEmailsPerBatch: number;
  delayBetweenEmailsMs: number;
  csvSenderEmail: string;
  emailService: string;
}

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await client.get('/config');
        setConfig(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch config');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const updateConfig = useCallback(async (updates: Partial<Config>) => {
    try {
      const data = await client.patch('/config', updates);
      setConfig((prev) => prev ? { ...prev, ...updates } : null);
      return { success: true, data };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to update config';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  }, []);

  return { config, loading, error, updateConfig };
}
