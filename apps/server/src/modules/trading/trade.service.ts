/**
 * Trade Service - Business Logic Layer
 * Following SOLID:
 * - Single Responsibility: Only handles trading logic
 * - Dependency Inversion: Depends on ITradeRepository abstraction
 */

import { LMSRCalculator, MarketState } from '@polygram/shared';
import { LMSR_CONFIG } from '../../core/constants.js';
import { TradeExecution, TradeResult } from './trade.dto.js';
import { ITradeRepository } from './trade.repository.interface.js';

export interface ITradeService {
  executeTrade(execution: TradeExecution): Promise<TradeResult>;
  getCurrentPrice(marketId: string): Promise<number>;
  estimateShares(marketId: string, amount: number, isYes: boolean): Promise<number>;
}

export class TradeService implements ITradeService {
  constructor(private repository: ITradeRepository) {}

  async executeTrade(execution: TradeExecution): Promise<TradeResult> {
    const { userId, marketId, outcome, amount } = execution;

    // 1. Validate user has sufficient balance
    const balance = await this.repository.getUserBalance(userId);
    if (balance < amount) {
      throw new InsufficientBalanceError(balance, amount);
    }

    // 2. Get current market state
    const marketState = await this.repository.getMarketState(marketId);
    if (!marketState) {
      throw new MarketNotFoundError(marketId);
    }

    // 3. Calculate shares using LMSR
    const isYes = outcome === 'YES';
    const sharesReceived = this.calculateShares(amount, marketState, isYes);

    if (sharesReceived <= 0) {
      throw new InvalidTradeError('Calculated shares must be positive');
    }

    // 4. Execute atomic transaction
    const newState: MarketState = {
      ...marketState,
      qYes: isYes ? marketState.qYes + sharesReceived : marketState.qYes,
      qNo: !isYes ? marketState.qNo + sharesReceived : marketState.qNo,
    };

    const result = await this.repository.executeTrade(
      execution,
      newState,
      sharesReceived
    );

    // 5. Record price history
    const newPrice = LMSRCalculator.calculatePrice(newState);
    await this.repository.recordPriceHistory(marketId, newPrice);

    return result;
  }

  async getCurrentPrice(marketId: string): Promise<number> {
    const state = await this.repository.getMarketState(marketId);
    if (!state) {
      throw new MarketNotFoundError(marketId);
    }
    return LMSRCalculator.calculatePrice(state);
  }

  async estimateShares(marketId: string, amount: number, isYes: boolean): Promise<number> {
    const state = await this.repository.getMarketState(marketId);
    if (!state) {
      throw new MarketNotFoundError(marketId);
    }
    return this.calculateShares(amount, state, isYes);
  }

  /**
   * Calculate shares using iterative solver for LMSR
   * C(newQ) - C(oldQ) = amount
   */
  private calculateShares(amount: number, state: MarketState, isYes: boolean): number {
    const { qYes, qNo, b } = state;
    const oldCost = LMSRCalculator.calculateCost(state);
    
    // Binary search for delta Q
    let low = 0;
    let high = amount * 100; // Upper bound
    let shares = 0;
    
    for (let i = 0; i < LMSR_CONFIG.MAX_ITERATIONS; i++) {
      const mid = (low + high) / 2;
      const testState: MarketState = {
        qYes: isYes ? qYes + mid : qYes,
        qNo: !isYes ? qNo + mid : qNo,
        b,
      };
      const newCost = LMSRCalculator.calculateCost(testState);
      const costDiff = newCost - oldCost;
      
      if (costDiff < amount) {
        shares = mid;
        low = mid;
      } else {
        high = mid;
      }
    }
    
    return shares;
  }
}

// Domain Errors
export class InsufficientBalanceError extends Error {
  constructor(public available: number, public required: number) {
    super(`Insufficient balance: ${available} < ${required}`);
    this.name = 'InsufficientBalanceError';
  }
}

export class MarketNotFoundError extends Error {
  constructor(public marketId: string) {
    super(`Market not found: ${marketId}`);
    this.name = 'MarketNotFoundError';
  }
}

export class InvalidTradeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTradeError';
  }
}
