import { describe, it, expect } from 'vitest';
import { LMSRCalculator, MarketState } from './index';

describe('LMSRCalculator', () => {
  const initialState: MarketState = {
    qYes: 100,
    qNo: 100,
    b: 150
  };

  it('should calculate balanced price as 0.5', () => {
    const price = LMSRCalculator.calculatePrice(initialState);
    expect(price).toBeCloseTo(0.5, 3);
  });

  it('should increase YES price when YES shares increase', () => {
    const newState: MarketState = { ...initialState, qYes: 200 };
    const price = LMSRCalculator.calculatePrice(newState);
    expect(price).toBeGreaterThan(0.5);
  });

  it('should calculate cost consistently', () => {
    const cost = LMSRCalculator.calculateCost(initialState);
    expect(cost).toBeGreaterThan(0);
  });

  describe('estimateShares', () => {
    it('should return positive shares for positive amount', () => {
      const shares = LMSRCalculator.estimateShares(10, initialState, true);
      expect(shares).toBeGreaterThan(0);
    });

    it('should calculate cost difference approximately equal to amount', () => {
      const amount = 50;
      const shares = LMSRCalculator.estimateShares(amount, initialState, true);
      
      const newState: MarketState = {
        ...initialState,
        qYes: initialState.qYes + shares
      };
      
      const oldCost = LMSRCalculator.calculateCost(initialState);
      const newCost = LMSRCalculator.calculateCost(newState);
      const costDiff = newCost - oldCost;
      
      // Разница в cost должна быть приблизительно равна amount (в пределах 20%)
      const errorPercent = Math.abs(costDiff - amount) / amount;
      expect(errorPercent).toBeLessThan(0.2);
    });

    it('should give fewer shares when buying expensive outcome', () => {
      // Создаем несбалансированный рынок где YES дорогой
      const expensiveYesState: MarketState = {
        qYes: 250,
        qNo: 50,
        b: 100
      };
      
      const amount = 20;
      const yesPrice = LMSRCalculator.calculatePrice(expensiveYesState);
      
      // YES дороже чем NO
      expect(yesPrice).toBeGreaterThan(0.5);
      
      const yesShares = LMSRCalculator.estimateShares(amount, expensiveYesState, true);
      
      // Сравним с наивным расчетом: amount / price
      const naiveShares = amount / yesPrice;
      
      // LMSR с проскальзыванием дает меньше shares чем наивный расчет
      expect(yesShares).toBeLessThanOrEqual(naiveShares);
    });

    it('should handle very small amounts', () => {
      const shares = LMSRCalculator.estimateShares(0.01, initialState, true);
      expect(shares).toBeGreaterThan(0);
      expect(Number.isFinite(shares)).toBe(true);
    });

    it('should handle large amounts without overflow', () => {
      const shares = LMSRCalculator.estimateShares(10000, initialState, true);
      expect(Number.isFinite(shares)).toBe(true);
      expect(shares).toBeGreaterThan(0);
    });

    it('should be consistent between YES and NO in balanced market', () => {
      // В сбалансированном рынке цены равны, значит и shares должны быть равны
      const amount = 100;
      const yesShares = LMSRCalculator.estimateShares(amount, initialState, true);
      const noShares = LMSRCalculator.estimateShares(amount, initialState, false);
      
      expect(yesShares).toBeCloseTo(noShares, 1);
    });
  });
});
