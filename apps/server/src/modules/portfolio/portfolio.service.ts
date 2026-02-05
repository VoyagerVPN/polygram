/**
 * Portfolio Service - Business Logic Layer
 * Following SOLID: Single Responsibility - handles portfolio calculations
 */

import type { Prisma, PrismaClient as IPrismaClient } from '@prisma/client';
import { LMSRCalculator, MarketState } from '@polygram/shared';

export interface PortfolioData {
  totalBalance: number;
  availableBalance: number;
  investedAmount: number;
  unrealizedPnL: number;
  winRate: number;
  totalTrades: number;
}

export interface PortfolioPosition {
  id: string;
  marketId: string;
  market: {
    question: string;
    status: string;
    expiresAt: Date;
  };
  sharesYes: number;
  sharesNo: number;
  invested: number;
  currentValue: number;
  unrealizedPnL: number;
  pnlPercent: number;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  marketId?: string;
  marketQuestion?: string;
  price?: number;
  shares?: number;
  createdAt: Date;
}

export interface IPortfolioService {
  getPortfolioData(userId: string): Promise<PortfolioData>;
  getPositions(userId: string): Promise<PortfolioPosition[]>;
  getTransactions(userId: string): Promise<Transaction[]>;
}

export class PortfolioService implements IPortfolioService {
  constructor(private prisma: IPrismaClient) {}

  async getPortfolioData(userId: string): Promise<PortfolioData> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        positions: {
          include: { market: true },
        },
        transactions: true,
      },
    });

    if (!user) {
      // Return default empty data instead of throwing error
      return {
        totalBalance: 0,
        availableBalance: 0,
        investedAmount: 0,
        unrealizedPnL: 0,
        winRate: 0,
        totalTrades: 0,
      };
    }

    // Calculate invested amount
    const investedAmount = user.positions.reduce((sum: number, pos: typeof user.positions[0]) => sum + pos.invested, 0);

    // Calculate current value of positions
    let currentValue = 0;
    for (const position of user.positions) {
      if (position.market.status === 'OPEN') {
        const marketState: MarketState = {
          qYes: position.market.qYes,
          qNo: position.market.qNo,
          b: position.market.liquidityB,
        };
        const yesPrice = LMSRCalculator.calculatePrice(marketState);
        const positionValue = position.sharesYes * yesPrice + position.sharesNo * (1 - yesPrice);
        currentValue += positionValue;
      }
    }

    // Calculate win rate from closed positions
    const closedTrades = user.transactions.filter(
      (t: typeof user.transactions[0]) => ['WIN_PAYOUT', 'SELL_YES', 'SELL_NO'].includes(t.type)
    );
    const winningTrades = closedTrades.filter((t: typeof user.transactions[0]) => t.amount > 0).length;
    const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

    return {
      totalBalance: user.balance + currentValue,
      availableBalance: user.balance,
      investedAmount,
      unrealizedPnL: currentValue - investedAmount,
      winRate: Math.round(winRate * 100) / 100,
      totalTrades: user.transactions.length,
    };
  }

  async getPositions(userId: string): Promise<PortfolioPosition[]> {
    const positions = await this.prisma.position.findMany({
      where: { userId },
      include: { market: true },
      orderBy: { createdAt: 'desc' },
    });

    return positions.map((position: typeof positions[0]) => {
      const marketState: MarketState = {
        qYes: position.market.qYes,
        qNo: position.market.qNo,
        b: position.market.liquidityB,
      };

      const yesPrice = LMSRCalculator.calculatePrice(marketState);
      const currentValue = position.sharesYes * yesPrice + position.sharesNo * (1 - yesPrice);
      const unrealizedPnL = currentValue - position.invested;
      const pnlPercent = position.invested > 0 ? (unrealizedPnL / position.invested) * 100 : 0;

      return {
        id: position.id,
        marketId: position.marketId,
        market: {
          question: position.market.question,
          status: position.market.status,
          expiresAt: position.market.expiresAt,
        },
        sharesYes: position.sharesYes,
        sharesNo: position.sharesNo,
        invested: position.invested,
        currentValue: Math.round(currentValue * 10000) / 10000,
        unrealizedPnL: Math.round(unrealizedPnL * 10000) / 10000,
        pnlPercent: Math.round(pnlPercent * 100) / 100,
      };
    });
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: { market: { select: { question: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    type TransactionWithMarket = Prisma.TransactionGetPayload<{
      include: { market: { select: { question: true } } }
    }>;

    return (transactions as TransactionWithMarket[]).map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      marketId: tx.marketId || undefined,
      marketQuestion: tx.market?.question,
      price: tx.price || undefined,
      shares: tx.shares || undefined,
      createdAt: tx.createdAt,
    }));
  }
}
