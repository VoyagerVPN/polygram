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
    expect(price).toBeCloseTo(0.5);
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
});
