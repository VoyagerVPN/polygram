import type { Market, PrismaClient as IPrismaClient, MarketStatus as IMarketStatus } from './prisma/index.js';
import { MarketState } from '@polygram/shared';
import { IMarketRepository, MarketData } from '../modules/market/market.service.js';
import { MarketProposal } from '../infrastructure/ai.service.js';
import { WsService } from './ws.service.js';

export class PrismaMarketRepository implements IMarketRepository {
  constructor(private prisma: IPrismaClient) {}

  async findById(id: string): Promise<MarketState | null> {
    const market = await this.prisma.market.findUnique({
      where: { id }
    });

    if (!market || market.status !== 'OPEN') return null;

    return {
      qYes: market.qYes,
      qNo: market.qNo,
      b: market.liquidityB
    };
  }

  async findAll(): Promise<MarketData[]> {
    const markets = await this.prisma.market.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return markets.map((m: Market) => ({
      id: m.id,
      question: m.question,
      status: m.status,
      qYes: m.qYes,
      qNo: m.qNo,
      b: m.liquidityB
    }));
  }

  async updateState(id: string, newState: MarketState): Promise<void> {
    await this.prisma.market.update({
      where: { id },
      data: {
        qYes: newState.qYes,
        qNo: newState.qNo,
        liquidityB: newState.b
      }
    });

    // Also log price history for charts
    const priceYes = Math.exp(newState.qYes / newState.b) / 
                    (Math.exp(newState.qYes / newState.b) + Math.exp(newState.qNo / newState.b));

    await this.prisma.priceHistory.create({
      data: {
        marketId: id,
        priceYes
      }
    });

    // Notify all connected clients via WebSocket
    WsService.broadcastMarketUpdate(id, {
      qYes: newState.qYes,
      qNo: newState.qNo
    });
  }

  async createPending(proposal: MarketProposal): Promise<string> {
    const market = await this.prisma.market.create({
      data: {
        question: proposal.question,
        description: proposal.description,
        expiresAt: new Date(proposal.expiresAt),
        liquidityB: proposal.liquidityB,
        status: 'PENDING'
      }
    });
    return market.id;
  }

  async setStatus(id: string, status: 'OPEN' | 'PENDING' | 'CLOSED'): Promise<void> {
    await this.prisma.market.update({
      where: { id },
      data: { status: status as IMarketStatus }
    });
  }
}
