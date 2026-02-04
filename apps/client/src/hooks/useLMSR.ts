/**
 * Hook for LMSR calculations with safety checks
 */

import { useMemo } from 'react';
import { LMSRCalculator } from '@polygram/shared';
import type { MarketState } from '@polygram/shared';

interface LMSRResult {
  priceYes: number;
  priceNo: number;
  percentYes: number;
  percentNo: number;
  isValid: boolean;
}

/**
 * Safely calculates LMSR prices with NaN protection
 */
export function useLMSR(state: MarketState | null | undefined): LMSRResult {
  return useMemo(() => {
    // Default invalid result
    const invalidResult: LMSRResult = {
      priceYes: 0.5,
      priceNo: 0.5,
      percentYes: 50,
      percentNo: 50,
      isValid: false,
    };

    if (!state) {
      return invalidResult;
    }

    const { qYes, qNo, b } = state;

    // Validate all required fields
    if (
      typeof qYes !== 'number' ||
      typeof qNo !== 'number' ||
      typeof b !== 'number' ||
      b <= 0 ||
      !isFinite(qYes) ||
      !isFinite(qNo)
    ) {
      return invalidResult;
    }

    try {
      const priceYes = LMSRCalculator.calculatePrice({ qYes, qNo, b });
      
      // Validate calculation result
      if (!isFinite(priceYes) || priceYes < 0 || priceYes > 1) {
        return invalidResult;
      }

      const priceNo = 1 - priceYes;
      const percentYes = Math.round(priceYes * 100);
      const percentNo = Math.round(priceNo * 100);

      return {
        priceYes,
        priceNo,
        percentYes,
        percentNo,
        isValid: true,
      };
    } catch (err) {
      console.error('[LMSR] Calculation error:', err);
      return invalidResult;
    }
  }, [state?.qYes, state?.qNo, state?.b]);
}
