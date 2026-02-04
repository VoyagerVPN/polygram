import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { resetPrismaMocks } from './mocks/prisma.mock.js';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NODE_ENV = 'test';
process.env.BOT_TOKEN = 'test-bot-token';
process.env.ADMIN_CHAT_ID = '123456789';

// Mock Prisma
vi.mock('../infrastructure/prisma-market.repository.js', () => ({
  PrismaMarketRepository: class MockPrismaMarketRepository {
    constructor() {}
    async findAll() { return []; }
    async findById() { return null; }
  }
}));

// Reset mocks before each test
beforeEach(() => {
  resetPrismaMocks();
});

beforeAll(async () => {
  // Global setup if needed
});

afterAll(async () => {
  // Global cleanup
});
