/**
 * Hook for fetching and managing markets data
 */

import { useEffect, useCallback } from 'react';
import { usePolygramStore } from '@/store/usePolygramStore';
import { api } from '@/api/client';
import type { MarketData } from '@/types';
import type { MarketState } from '@polygram/shared';

interface UseMarketsReturn {
  markets: MarketData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateMarket: (id: string, newState: Partial<MarketState>) => void;
}

export function useMarkets(): UseMarketsReturn {
  const { markets, isLoading, error, setMarkets, setLoading, setError, updateMarket } = usePolygramStore();

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getMarkets();
      
      // Validate and sanitize market data
      const validatedMarkets = data.map((market) => ({
        ...market,
        qYes: typeof market.qYes === 'number' ? market.qYes : 0,
        qNo: typeof market.qNo === 'number' ? market.qNo : 0,
        b: typeof market.b === 'number' && market.b > 0 ? market.b : 150,
        question: market.question || 'Unknown Question',
        status: (market.status || 'OPEN').toString().toUpperCase() as MarketData['status'],
      }));
      
      setMarkets(validatedMarkets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch markets';
      setError(errorMessage);
      console.error('[Markets] Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [setMarkets, setLoading, setError]);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return {
    markets,
    isLoading,
    error,
    refetch: fetchMarkets,
    updateMarket,
  };
}
