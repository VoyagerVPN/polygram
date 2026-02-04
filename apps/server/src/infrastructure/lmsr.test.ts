import { describe, it, expect } from 'vitest';
import { LMSRCalculator, MarketState, DEFAULT_LIQUIDITY_B } from '@polygram/shared';

describe('LMSR Calculator', () => {
  const createState = (qYes: number, qNo: number, b: number = DEFAULT_LIQUIDITY_B): MarketState => ({
    qYes,
    qNo,
    b
  });

  describe('calculatePrice', () => {
    it('should calculate 0.5 for balanced market', () => {
      const state = createState(100, 100);
      const price = LMSRCalculator.calculatePrice(state);
      expect(price).toBeCloseTo(0.5, 3);
    });

    it('should increase YES price when YES shares are higher', () => {
      const state = createState(200, 100);
      const price = LMSRCalculator.calculatePrice(state);
      expect(price).toBeGreaterThan(0.5);
    });

    it('should decrease YES price when NO shares are higher', () => {
      const state = createState(100, 200);
      const price = LMSRCalculator.calculatePrice(state);
      expect(price).toBeLessThan(0.5);
    });

    it('should approach 1 when YES shares dominate', () => {
      const state = createState(1000, 1);
      const price = LMSRCalculator.calculatePrice(state);
      expect(price).toBeGreaterThan(0.9);
      expect(price).toBeLessThan(1);
    });

    it('should approach 0 when NO shares dominate', () => {
      const state = createState(1, 1000);
      const price = LMSRCalculator.calculatePrice(state);
      expect(price).toBeGreaterThan(0);
      expect(price).toBeLessThan(0.1);
    });

    it('should handle zero liquidity parameter', () => {
      const state = createState(100, 100, 1);
      const price = LMSRCalculator.calculatePrice(state);
      expect(price).toBeCloseTo(0.5, 3);
    });

    it('should handle large liquidity parameter', () => {
      const state = createState(100, 100, 10000);
      const price = LMSRCalculator.calculatePrice(state);
      expect(price).toBeCloseTo(0.5, 3);
    });
  });

  describe('calculateCost', () => {
    it('should calculate positive cost for any state', () => {
      const state = createState(100, 100);
      const cost = LMSRCalculator.calculateCost(state);
      expect(cost).toBeGreaterThan(0);
    });

    it('should increase cost with more shares', () => {
      const smallState = createState(10, 10);
      const largeState = createState(100, 100);
      
      const smallCost = LMSRCalculator.calculateCost(smallState);
      const largeCost = LMSRCalculator.calculateCost(largeState);
      
      expect(largeCost).toBeGreaterThan(smallCost);
    });

    it('should be symmetric for equal shares', () => {
      const state1 = createState(100, 50);
      const state2 = createState(50, 100);
      
      const cost1 = LMSRCalculator.calculateCost(state1);
      const cost2 = LMSRCalculator.calculateCost(state2);
      
      expect(cost1).toBeCloseTo(cost2, 5);
    });
  });

  describe('estimateShares', () => {
    it('should return positive shares for positive amount', () => {
      const state = createState(100, 100);
      const shares = LMSRCalculator.estimateShares(10, state, true);
      expect(shares).toBeGreaterThan(0);
    });

    it('should estimate more shares at lower prices', () => {
      const cheapState = createState(100, 200); // Price < 0.5
      const expensiveState = createState(200, 100); // Price > 0.5
      
      const cheapShares = LMSRCalculator.estimateShares(10, cheapState, true);
      const expensiveShares = LMSRCalculator.estimateShares(10, expensiveState, true);
      
      expect(cheapShares).toBeGreaterThan(expensiveShares);
    });

    it('should handle very small amounts', () => {
      const state = createState(100, 100);
      const shares = LMSRCalculator.estimateShares(0.01, state, true);
      expect(shares).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_LIQUIDITY_B', () => {
    it('should be defined and positive', () => {
      expect(DEFAULT_LIQUIDITY_B).toBeDefined();
      expect(DEFAULT_LIQUIDITY_B).toBeGreaterThan(0);
    });

    it('should be 150', () => {
      expect(DEFAULT_LIQUIDITY_B).toBe(150);
    });
  });
});
