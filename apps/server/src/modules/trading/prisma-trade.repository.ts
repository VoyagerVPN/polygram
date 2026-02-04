/**
 * Prisma Trade Repository Implementation
 * Following SOLID: Concrete implementation of ITradeRepository
 */

import { PrismaClient, TransactionType } from '@prisma/client';
import { MarketState } from '@polygram/shared';
import { TradeExecution, TradeResult } from './trade.dto.js';
import { ITradeRepository } from './trade.repository.interface.js';

export class PrismaTradeRepository implements ITradeRepository {
  constructor(private prisma: PrismaClient) {}

  async getUserBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });
    return user?.balance ?? 0;
  }

  async getMarketState(marketId: string): Promise<MarketState | null> {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
      select: { qYes: true, qNo: true, liquidityB: true, status: true },
    });

    if (!market || market.status !== 'OPEN') {
      return null;
    }

    return {
      qYes: market.qYes,
      qNo: market.qNo,
      b: market.liquidityB,
    };
  }

  async getPosition(userId: string, marketId: string): Promise<{
    sharesYes: number;
    sharesNo: number;
    invested: number;
  } | null> {
    const position = await this.prisma.position.findUnique({
      where: { userId_marketId: { userId, marketId } },
      select: { sharesYes: true, sharesNo: true, invested: true },
    });
    return position;
  }

  async executeTrade(
    execution: TradeExecution,
    marketState: MarketState,
    sharesReceived: number
  ): Promise<TradeResult> {
    const { userId, marketId, outcome, amount } = execution;
    const isYes = outcome === 'YES';

    return this.prisma.$transaction(async (tx) => {
      // 1. Update user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } },
        select: { balance: true },
      });

      // 2. Update market state
      const updatedMarket = await tx.market.update({
        where: { id: marketId },
        data: {
          qYes: marketState.qYes,
          qNo: marketState.qNo,
        },
        select: { qYes: true, qNo: true },
      });

      // 3. Upsert position
      await tx.position.upsert({
        where: { userId_marketId: { userId, marketId } },
        update: {
          sharesYes: { increment: isYes ? sharesReceived : 0 },
          sharesNo: { increment: !isYes ? sharesReceived : 0 },
          invested: { increment: amount },
        },
        create: {
          userId,
          marketId,
          sharesYes: isYes ? sharesReceived : 0,
          sharesNo: !isYes ? sharesReceived : 0,
          invested: amount,
        },
      });

      // 4. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          marketId,
          type: isYes ? TransactionType.BUY_YES : TransactionType.BUY_NO,
          amount,
          price: amount / sharesReceived,
          shares: sharesReceived,
        },
      });

      return {
        transactionId: transaction.id,
        sharesReceived,
        pricePerShare: amount / sharesReceived,
        totalCost: amount,
        newBalance: updatedUser.balance,
        marketState: {
          qYes: updatedMarket.qYes,
          qNo: updatedMarket.qNo,
        },
      };
    });
  }

  async recordPriceHistory(marketId: string, priceYes: number): Promise<void> {
    await this.prisma.priceHistory.create({
      data: {
        marketId,
        priceYes,
      },
    });
  }
}
