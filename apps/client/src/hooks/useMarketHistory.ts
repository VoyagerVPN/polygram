/**
 * Hook for fetching market price history
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import type { PriceHistoryPoint } from '@/types';

interface UseMarketHistoryReturn {
  history: PriceHistoryPoint[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarketHistory(marketId: string | null): UseMarketHistoryReturn {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!marketId) {
      setHistory([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getMarketHistory(marketId);
      // Transform API response to PriceHistoryPoint format
      const transformed = data.map((p: { timestamp: string; price: number }) => ({
        time: p.timestamp,
        value: p.price,
      }));
      setHistory(transformed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(errorMessage);
      console.error('[History] Failed to fetch:', err);
    } finally {
      setIsLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}
