import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { marketModule } from '../modules/market/market.module.js';
import { tradingModule } from '../modules/trading/trade.module.js';
import { userModule } from '../modules/user/user.module.js';

// Test helper to create a fastify instance without starting the server
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Disable logging in tests
  });

  // Register CORS
  await app.register(import('@fastify/cors'), {
    origin: true,
    credentials: true,
  });

  // Register modules
  await app.register(marketModule, { prefix: '/api/markets' });
  await app.register(tradingModule, { prefix: '/api/trading' });
  await app.register(userModule, { prefix: '/api/users' });

  return app;
}

// Cleanup helper
export async function cleanupApp(app: FastifyInstance): Promise<void> {
  await app.close();
}
