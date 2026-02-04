/**
 * Trade Repository Interface
 * Following SOLID: Dependency Inversion - depend on abstractions
 */

import { TradeExecution, TradeResult } from './trade.dto.js';
import { MarketState } from '@polygram/shared';

export interface ITradeRepository {
  /**
   * Execute trade atomically within database transaction
   */
  executeTrade(
    execution: TradeExecution,
    marketState: MarketState,
    sharesReceived: number
  ): Promise<TradeResult>;

  /**
   * Get user balance
   */
  getUserBalance(userId: string): Promise<number>;

  /**
   * Get market state
   */
  getMarketState(marketId: string): Promise<MarketState | null>;

  /**
   * Get user's position in market
   */
  getPosition(userId: string, marketId: string): Promise<{
    sharesYes: number;
    sharesNo: number;
    invested: number;
  } | null>;

  /**
   * Record price history entry
   */
  recordPriceHistory(marketId: string, priceYes: number): Promise<void>;
}
