import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { MarketModule } from '../modules/market/market.module.js';
import TradeModule from '../modules/trading/trade.module.js';
import { UserModule } from '../modules/user/user.module.js';
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
      findUnique: vi.fn().mockResolvedValue(null),
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
    $transaction: vi.fn(<T>(callback: (tx: unknown) => T) => callback({})),
  } as unknown as PrismaClient;
}

// Create mock UserService
function createMockUserService() {
  return {
    syncUser: vi.fn().mockResolvedValue({
      id: 'test-user-id',
      balance: 1000,
      tonAddress: 'test-address'
    }),
    getProfile: vi.fn().mockResolvedValue(null),
  } as unknown as UserService;
}

// Create mock AuthService
function createMockAuthService() {
  return {
    generatePayload: vi.fn().mockResolvedValue('test-payload'),
    verifyProof: vi.fn().mockResolvedValue(true),
  } as unknown as AuthService;
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
    service: { trade: vi.fn() } as unknown as import('../modules/market/market.service.js').MarketService,
  });

  await app.register(TradeModule, { 
    prefix: '/api/trades',
    prisma: mockPrisma,
  });

  await app.register(UserModule, { 
    prefix: '/api/users',
    service: createMockUserService(),
    auth: createMockAuthService(),
  });

  return app;
}

// Cleanup helper
export async function cleanupApp(app: FastifyInstance): Promise<void> {
  await app.close();
}
