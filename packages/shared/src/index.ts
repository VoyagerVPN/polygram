/**
 * LMSR (Logarithmic Market Scoring Rule) Core Mathematics
 * Following SOLID: This module has a single responsibility of calculating market states.
 */

export interface MarketState {
  qYes: number;
  qNo: number;
  b: number;
}

export class LMSRCalculator {
  /**
   * Calculate the cost for a given set of shares
   * C = b * ln(exp(q1/b) + exp(q2/b))
   */
  static calculateCost(state: MarketState): number {
    const { qYes, qNo, b } = state;
    return b * Math.log(Math.exp(qYes / b) + Math.exp(qNo / b));
  }

  /**
   * Calculate the price for YES shares
   * P(yes) = exp(qYes/b) / (exp(qYes/b) + exp(qNo/b))
   */
  static calculatePrice(state: MarketState): number {
    const { qYes, qNo, b } = state;
    const expYes = Math.exp(qYes / b);
    const expNo = Math.exp(qNo / b);
    return expYes / (expYes + expNo);
  }

  /**
   * Calculate how many shares a user gets for a given amount of TON
   * Uses binary search to solve: C(newQ) - C(oldQ) = amount
   * This correctly accounts for price slippage in LMSR
   */
  static estimateShares(amount: number, currentState: MarketState, isYes: boolean): number {
    const { qYes, qNo, b } = currentState;
    const oldCost = this.calculateCost(currentState);
    
    // Binary search for delta Q
    let low = 0;
    // Upper bound: with very high liquidity, shares ≈ amount / price
    // With low liquidity, shares can be much less, so we use a generous upper bound
    const currentPrice = this.calculatePrice(currentState);
    const maxSharesEstimate = amount / Math.max(currentPrice, 0.01);
    let high = maxSharesEstimate * 2;
    let shares = 0;
    
    const MAX_ITERATIONS = 50;
    const PRECISION = 0.0001; // 0.01% precision
    
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const mid = (low + high) / 2;
      const testState: MarketState = {
        qYes: isYes ? qYes + mid : qYes,
        qNo: !isYes ? qNo + mid : qNo,
        b,
      };
      const newCost = this.calculateCost(testState);
      const costDiff = newCost - oldCost;
      
      if (Math.abs(costDiff - amount) < PRECISION) {
        shares = mid;
        break;
      }
      
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

export const DEFAULT_LIQUIDITY_B = 150;
