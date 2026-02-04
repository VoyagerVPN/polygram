import { FastifyInstance } from 'fastify';
import { MarketService } from './market.service.js';
import { PrismaClient, PriceHistory } from '@prisma/client';
import { PRICE_HISTORY_CONFIG } from '../../core/constants.js';

export interface MarketModuleOptions {
  prisma: PrismaClient;
  service: MarketService;
}

export async function MarketModule(fastify: FastifyInstance, options: MarketModuleOptions) {
  const { prisma } = options;
  
  // GET /api/markets - List all markets
  fastify.get('/', async (request, reply) => {
    try {
      const markets = await prisma.market.findMany({
        orderBy: { createdAt: 'desc' }
      });
      console.log(`[API] Fetched ${markets.length} markets from DB`);
      return { markets };
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Database error' });
    }
  });

  // GET /api/markets/:id - Get market details
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const market = await prisma.market.findUnique({ where: { id } });
    if (!market) return reply.status(404).send({ error: 'Market not found' });
    
    return market;
  });

  // GET /api/markets/:id/history - Get price history
  fastify.get('/:id/history', async (request) => {
    const { id } = request.params as { id: string };
    const history = await prisma.priceHistory.findMany({
      where: { marketId: id },
      orderBy: { timestamp: 'asc' },
      take: PRICE_HISTORY_CONFIG.MAX_HISTORY_POINTS
    });
    return { 
      history: history.map((h: PriceHistory) => ({
        time: h.timestamp.toISOString().split('T')[0],
        value: h.priceYes
      }))
    };
  });
}
