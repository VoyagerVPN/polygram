import { PrismaClient, User } from '@prisma/client';

export class UserService {
  constructor(private prisma: PrismaClient) {}

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
    const totalInvested = user.positions.reduce((acc, p) => acc + p.invested, 0);
    
    return {
      ...user,
      telegramId: user.telegramId.toString(), // Convert BigInt for JSON
      stats: {
        totalInvested,
        activePositions: user.positions.length
      }
    };
  }
}
