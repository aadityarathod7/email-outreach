import { useState, useEffect } from 'react';
import client from '../api/client';

export interface Stats {
  totalSent: number;
  lastDay: { count: number; percentage: number };
  lastWeek: { count: number; percentage: number };
  lastMonth: { count: number; percentage: number };
  recentEmails: any[];
  chartData: Array<{ date: string; count: number }>;
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await client.get('/stats');
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}
