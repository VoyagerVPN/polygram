/**
 * Data Transfer Objects for Trading Module
 * Following SOLID: Separate data structures from business logic
 */

import { z } from 'zod';
import { TRADING_CONFIG } from '../../core/constants.js';

// Validation schemas
export const TradeSchema = z.object({
  marketId: z.string().uuid(),
  outcome: z.enum(['YES', 'NO']),
  amount: z.number()
    .positive()
    .min(TRADING_CONFIG.MIN_TRADE_AMOUNT)
    .max(TRADING_CONFIG.MAX_TRADE_AMOUNT),
});

export const TradeResponseSchema = z.object({
  success: z.boolean(),
  transactionId: z.string().uuid(),
  sharesReceived: z.number(),
  price: z.number(),
  newBalance: z.number(),
});

// Types derived from schemas
export type TradeRequest = z.infer<typeof TradeSchema>;
export type TradeResponse = z.infer<typeof TradeResponseSchema>;

// Domain entities
export interface TradeExecution {
  userId: string;
  marketId: string;
  outcome: 'YES' | 'NO';
  amount: number;
  timestamp: Date;
}

export interface TradeResult {
  transactionId: string;
  sharesReceived: number;
  pricePerShare: number;
  totalCost: number;
  newBalance: number;
  marketState: {
    qYes: number;
    qNo: number;
  };
}
