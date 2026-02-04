/**
 * Trade Controller - HTTP Layer
 * Following SOLID: Single Responsibility - handles HTTP only
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { ITradeService, InsufficientBalanceError, MarketNotFoundError, InvalidTradeError } from './trade.service.js';
import { TradeSchema, TradeRequest } from './trade.dto.js';
import { ZodError } from 'zod';

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
  };
}

export class TradeController {
  constructor(private tradeService: ITradeService) {}

  async executeTrade(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Validate input
      const body = request.body as TradeRequest;
      const validated = TradeSchema.parse(body);
      
      // Get user from auth context (set by auth middleware)
      const userId = (request as AuthenticatedRequest).user?.id;
      if (!userId) {
        reply.status(401).send({ error: 'Unauthorized' });
        return;
      }

      // Execute trade
      const result = await this.tradeService.executeTrade({
        userId,
        marketId: validated.marketId,
        outcome: validated.outcome,
        amount: validated.amount,
        timestamp: new Date(),
      });

      reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  async estimateTrade(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const query = request.query as { 
        marketId: string; 
        amount: string; 
        outcome: 'YES' | 'NO';
      };
      const { marketId, amount, outcome } = query;
      const amountNum = parseFloat(amount);

      if (isNaN(amountNum) || amountNum <= 0) {
        reply.status(400).send({ error: 'Invalid amount' });
        return;
      }

      const [shares, currentPrice] = await Promise.all([
        this.tradeService.estimateShares(marketId, amountNum, outcome === 'YES'),
        this.tradeService.getCurrentPrice(marketId),
      ]);

      reply.status(200).send({
        estimatedShares: shares,
        pricePerShare: amountNum / shares,
        currentPrice,
        totalCost: amountNum,
      });
    } catch (error) {
      this.handleError(error, reply);
    }
  }

  private handleError(error: unknown, reply: FastifyReply): void {
    if (error instanceof ZodError) {
      reply.status(400).send({
        error: 'Validation failed',
        details: error.errors,
      });
      return;
    }

    if (error instanceof InsufficientBalanceError) {
      reply.status(400).send({
        error: 'Insufficient balance',
        available: error.available,
        required: error.required,
      });
      return;
    }

    if (error instanceof MarketNotFoundError) {
      reply.status(404).send({
        error: 'Market not found or not open',
      });
      return;
    }

    if (error instanceof InvalidTradeError) {
      reply.status(400).send({
        error: error.message,
      });
      return;
    }

    console.error('[TradeController] Unexpected error:', error);
    reply.status(500).send({
      error: 'Internal server error',
    });
  }
}
