/**
 * API Client for Polygram
 * Following SOLID: Single Responsibility - handles HTTP communication only
 */

import { API_BASE_URL } from '@/constants';
import type { 
  MarketsResponse, 
  MarketData,
  TradeRequest,
  TradeResponse,
  PortfolioData,
  PortfolioPosition,
  Transaction,
} from '@/types';

class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: Response,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  // Get init data from Telegram WebApp
  const initData = window.Telegram?.WebApp?.initData || '';
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new APIError(
      data?.error || `HTTP Error: ${response.status} ${response.statusText}`,
      response.status,
      response,
      data
    );
  }

  return data as T;
}

export const api = {
  /**
   * Get all active markets
   */
  async getMarkets(): Promise<MarketData[]> {
    const data = await fetchJSON<MarketsResponse>(`${API_BASE_URL}/markets`);
    return data.markets || [];
  },

  /**
   * Get market by ID
   */
  async getMarket(id: string): Promise<MarketData> {
    return fetchJSON<MarketData>(`${API_BASE_URL}/markets/${id}`);
  },

  /**
   * Get market price history
   */
  async getMarketHistory(id: string): Promise<{ timestamp: string; price: number }[]> {
    return fetchJSON<{ timestamp: string; price: number }[]>(`${API_BASE_URL}/markets/${id}/history`);
  },

  /**
   * Execute a trade (new SOLID endpoint)
   */
  async executeTrade(request: TradeRequest): Promise<TradeResponse> {
    return fetchJSON<TradeResponse>(`${API_BASE_URL}/trades`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Estimate trade outcome without executing
   */
  async estimateTrade(
    marketId: string, 
    amount: number, 
    outcome: 'YES' | 'NO'
  ): Promise<{
    estimatedShares: number;
    pricePerShare: number;
    currentPrice: number;
    totalCost: number;
  }> {
    const params = new URLSearchParams({
      marketId,
      amount: amount.toString(),
      outcome,
    });
    return fetchJSON(`${API_BASE_URL}/trades/estimate?${params}`);
  },

  /**
   * Get user portfolio data
   */
  async getPortfolio(): Promise<PortfolioData> {
    return fetchJSON<PortfolioData>(`${API_BASE_URL}/portfolio`);
  },

  /**
   * Get user positions with calculated P&L
   */
  async getPositions(): Promise<PortfolioPosition[]> {
    return fetchJSON<PortfolioPosition[]>(`${API_BASE_URL}/portfolio/positions`);
  },

  /**
   * Get user transactions
   */
  async getTransactions(): Promise<Transaction[]> {
    return fetchJSON<Transaction[]>(`${API_BASE_URL}/portfolio/transactions`);
  },
};

export { APIError };
