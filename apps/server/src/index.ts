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
import { PrismaClient } from '@prisma/client';
import { NewsService } from './infrastructure/news.service.js';
import { AiService } from './infrastructure/ai.service.js';
import { AutomationService } from './infrastructure/automation.service.js';
import { WsService } from './infrastructure/ws.service.js';
import { UserModule } from './modules/user/user.module.js';
import { AuthService } from './modules/user/auth.service.js';
import { UserService as UserServiceImpl } from './modules/user/user.service.js';
import { ResolutionService } from './infrastructure/resolution.service.js';
import { TonService } from './infrastructure/ton.service.js';
import TradeModule from './modules/trading/trade.module.js';
import PortfolioModule from './modules/portfolio/portfolio.module.js';
import { authMiddleware } from './modules/user/auth.middleware.js';

console.log('[DEBUG] Environment check:');
console.log('- DATABASE_URL:', !!process.env.DATABASE_URL);
console.log('- BOT_TOKEN:', !!process.env.BOT_TOKEN);
console.log('- OPENROUTER_API_KEY:', !!process.env.OPENROUTER_API_KEY);
console.log('- CRYPTOPANIC_API_KEY:', !!process.env.CRYPTOPANIC_API_KEY);

const fastify = Fastify({
  logger: true,
  routerOptions: {
    ignoreTrailingSlash: true
  }
});

fastify.get('/', async () => {
  return { status: 'ok', service: 'polygram-server' };
});

// Setup DI Layer
const prisma = new PrismaClient();
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

const tonService = new TonService(
  process.env.TONAPI_KEY || '',
  process.env.APP_WALLET || '',
  userService,
  prisma
);

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
fastify.get('/ws', { websocket: true }, (socket, req) => {
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
await fastify.register(async (instance, opts) => {
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

const start = async () => {
  try {
    const address = await fastify.listen({ port: 3001, host: '0.0.0.0' });
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
