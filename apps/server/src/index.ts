import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { MarketModule } from './modules/market/market.module.js';
import { BotService } from './infrastructure/bot.service.js';
import { MarketService } from './modules/market/market.service.js';
import { PrismaMarketRepository } from './infrastructure/prisma-market.repository.js';
import { PrismaClient } from './infrastructure/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { NewsService } from './infrastructure/news.service.js';
import { AiService } from './infrastructure/ai.service.js';
import { AutomationService } from './infrastructure/automation.service.js';
import { WsService } from './infrastructure/ws.service.js';
import { UserModule } from './modules/user/user.module.js';
import { AuthService } from './modules/user/auth.service.js';
import { UserService as UserServiceImpl } from './modules/user/user.service.js';
import { ResolutionService } from './infrastructure/resolution.service.js';
import { TonService } from './infrastructure/ton.service.js';
import { MockTonService } from './infrastructure/mock-ton.service.js';
import { ITonService, IMockTonService } from './infrastructure/interfaces/ton-service.interface.js';
import TradeModule from './modules/trading/trade.module.js';
import PortfolioModule from './modules/portfolio/portfolio.module.js';
import { authMiddleware } from './modules/user/auth.middleware.js';

// Environment check
console.log('[DEBUG] Environment check:');
console.log('- DATABASE_URL:', !!process.env.DATABASE_URL);
console.log('- BOT_TOKEN:', !!process.env.BOT_TOKEN);
console.log('- OPENROUTER_API_KEY:', !!process.env.OPENROUTER_API_KEY);
console.log('- CRYPTOPANIC_API_KEY:', !!process.env.CRYPTOPANIC_API_KEY);
console.log('- USE_MOCK_TON:', process.env.USE_MOCK_TON === 'true' ? '✅ ENABLED' : '❌ disabled');

const fastify = Fastify({
  logger: true,
  routerOptions: {
    ignoreTrailingSlash: true
  }
});

// Health check endpoint
fastify.get('/health', async () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'connected',
      bot: 'initialized'
    }
  };
});

// Root endpoint
fastify.get('/', async () => {
  return { 
    status: 'ok', 
    service: 'polygram-server',
    version: '1.0.0',
    healthCheck: '/health'
  };
});

// Setup DI Layer
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Decorate fastify with prisma for global access (DRY)
fastify.decorate('prisma', prisma);

const repository = new PrismaMarketRepository(prisma);
const userService = new UserServiceImpl(prisma);
const marketService = new MarketService(repository, userService);
const authService = new AuthService();

const newsService = new NewsService(process.env.CRYPTOPANIC_API_KEY || '');
const aiService = new AiService(process.env.OPENROUTER_API_KEY || '');

const bot = new BotService(
  process.env.BOT_TOKEN || '', 
  marketService,
  newsService,
  aiService
);

const automation = new AutomationService(
  bot,
  newsService,
  aiService,
  marketService
);

// Link automation to bot for manual control
bot.setAutomation(automation);

const resolutionService = new ResolutionService(
  prisma,
  marketService,
  aiService,
  newsService,
  bot
);

// Choose between real and mock TON service
const useMockTon = process.env.USE_MOCK_TON === 'true';
let tonService: ITonService;
let mockTonService: IMockTonService | undefined;

if (useMockTon) {
  console.log('[Server] Using MOCK TON Service');
  mockTonService = new MockTonService(userService, prisma);
  tonService = mockTonService;
  bot.setMockTonService(mockTonService);
} else {
  console.log('[Server] Using REAL TON Service');
  tonService = new TonService(
    process.env.TONAPI_KEY || '',
    process.env.APP_WALLET || '',
    userService,
    prisma
  );
}

// Register Plugins
await fastify.register(cors, { 
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});
await fastify.register(websocket);

// Rate Limiting: 100 requests per minute per IP
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: (req, context) => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Please try again in ${context.after}`,
    retryAfter: context.after
  })
});

// WebSocket Route
fastify.get('/ws', { websocket: true }, (socket, _req) => {
  console.log('[WS] Client connected');
  WsService.registerClient(socket);
});

// Database connection check
try {
  await prisma.$connect();
  console.log('Successfully connected to PostgreSQL via Prisma');
} catch (err) {
  console.error('SERVER FATAL: Could not connect to database:', err);
  process.exit(1);
}

// Register Modules (SOLID: Each module is responsible for its domain)
await fastify.register(MarketModule, { 
  prefix: '/api/markets',
  prisma,
  service: marketService
});

await fastify.register(UserModule, {
  prefix: '/api/users',
  service: userService,
  auth: authService
});

// Register authenticated modules
await fastify.register(async (instance, _opts) => {
  // Add auth middleware to all routes in this prefix
  instance.addHook('preHandler', authMiddleware);
  
  // Trade Module
  await instance.register(TradeModule, {
    prefix: '/trades',
    prisma,
  });
  
  // Portfolio Module
  await instance.register(PortfolioModule, {
    prefix: '/portfolio',
    prisma,
  });
}, { prefix: '/api' });

/**
 * Graceful shutdown handler
 * Ensures all resources are properly closed before exit
 */
const shutdown = async (signal: string) => {
  console.log(`\n[Server] ${signal} received, starting graceful shutdown...`);
  
  try {
    // Stop all interval-based services
    console.log('[Server] Stopping ResolutionService...');
    resolutionService.stop();
    
    console.log('[Server] Stopping TonService...');
    tonService.stop();
    
    console.log('[Server] Stopping Bot...');
    await bot.stop();
    
    console.log('[Server] Closing Fastify...');
    await fastify.close();
    
    console.log('[Server] Disconnecting Prisma...');
    await prisma.$disconnect();
    
    console.log('[Server] Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    console.error('[Server] Error during shutdown:', err);
    process.exit(1);
  }
};

// Register shutdown handlers
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    const address = await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`SERVER IS LIVE: ${address}`);

    // Launch Telegram Bot (manual commands only)
    bot.launch().catch(err => console.error('[Bot] Launch failed:', err));
    
    // NOTE: Automation is disabled by default. Use /autostart command to enable.
    // automation.start();

    // Start New Services
    resolutionService.start();
    tonService.startMonitoring();

    console.log('✅ POLYGRAM BACKEND STARTED SUCCESSFULLY');
  } catch (err) {
    console.error('❌ SERVER FAILED TO START:', err);
    process.exit(1);
  }
};

start();
