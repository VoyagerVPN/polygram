import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { vi } from 'vitest';
import { MarketModule } from '../modules/market/market.module.js';
import TradeModule from '../modules/trading/trade.module.js';
import { UserModule } from '../modules/user/user.module.js';
import { TradeService } from '../modules/trading/trade.service.js';
import { UserService } from '../modules/user/user.service.js';
import { AuthService } from '../modules/user/auth.service.js';

// Create mock Prisma client
function createMockPrisma() {
  return {
    market: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
    },
    trade: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    priceHistory: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    portfolio: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn((callback: any) => callback({})),
  } as any;
}

// Test helper to create a fastify instance without starting the server
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Disable logging in tests
  });

  const mockPrisma = createMockPrisma();

  // Register CORS
  await app.register(import('@fastify/cors'), {
    origin: true,
    credentials: true,
  });

  // Register modules with mock dependencies
  await app.register(MarketModule, { 
    prefix: '/api/markets',
    prisma: mockPrisma,
    service: { trade: vi.fn() } as any,
  });

  await app.register(TradeModule, { 
    prefix: '/api/trading',
    prisma: mockPrisma,
  });

  await app.register(UserModule, { 
    prefix: '/api/users',
    service: { findById: vi.fn() } as any,
    auth: { verifyToken: vi.fn() } as any,
  });

  return app;
}

// Cleanup helper
export async function cleanupApp(app: FastifyInstance): Promise<void> {
  await app.close();
}
