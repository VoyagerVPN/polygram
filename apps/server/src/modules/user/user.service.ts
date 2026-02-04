import pkg from '../../infrastructure/prisma/index.js';
const { PrismaClient } = pkg;
import type { User, Position, PrismaClient as IPrismaClient, Prisma } from '../../infrastructure/prisma/index.js';

export class UserService {
  constructor(private prisma: IPrismaClient) {}

  async findByTelegramId(telegramId: bigint): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { telegramId }
    });
  }

  async findByTonAddress(address: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { tonAddress: address }
    });
  }

  async syncUser(data: {
    telegramId: bigint;
    username?: string;
    tonAddress?: string;
  }): Promise<User> {
    return this.prisma.user.upsert({
      where: { telegramId: data.telegramId },
      update: {
        username: data.username,
        tonAddress: data.tonAddress,
      },
      create: {
        telegramId: data.telegramId,
        username: data.username,
        tonAddress: data.tonAddress,
        balance: 1000.0 // Default welcome balance for MVP
      }
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        positions: {
          include: {
            market: true
          }
        }
      }
    });

    if (!user) return null;

    // Calculate dynamic stats
    const totalInvested = user.positions.reduce((acc: number, p: Position) => acc + p.invested, 0);
    
    return {
      ...user,
      telegramId: user.telegramId.toString(), // Convert BigInt for JSON
      stats: {
        totalInvested,
        activePositions: user.positions.length
      }
    };
  }

  async getLeaderboard(period: string, limit: number = 20): Promise<Prisma.UserGetPayload<{
    include: { transactions: { select: { id: true } } }
  }>[]> {
    // For MVP: Simple ranking by balance
    // In production: Calculate based on realized PnL for the period
    
    const since = this.getPeriodStartDate(period);
    
    return this.prisma.user.findMany({
      where: since ? {
        createdAt: {
          gte: since
        }
      } : undefined,
      orderBy: {
        balance: 'desc'
      },
      take: limit,
      include: {
        transactions: {
          where: since ? {
            createdAt: {
              gte: since
            }
          } : undefined,
          select: {
            id: true
          }
        }
      }
    });
  }

  private getPeriodStartDate(period: string): Date | null {
    const now = new Date();
    
    switch (period) {
      case 'daily':
        return new Date(now.setDate(now.getDate() - 1));
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'all_time':
      default:
        return null;
    }
  }
}
