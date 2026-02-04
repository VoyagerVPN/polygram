import { FastifyInstance } from 'fastify';
import { MarketService } from './market.service.js';
import { PrismaClient } from '@prisma/client';

export interface MarketModuleOptions {
  prisma: PrismaClient;
  service: MarketService;
}

export async function MarketModule(fastify: FastifyInstance, options: MarketModuleOptions) {
  const { prisma, service } = options;
  
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

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const market = await prisma.market.findUnique({ where: { id } });
    if (!market) return reply.status(404).send({ error: 'Market not found' });
    
    return market;
  });

  fastify.post('/:id/trade', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { userId, amount, isYes } = request.body as { userId: string, amount: number; isYes: boolean };
    
    await service.trade(id, userId, amount, isYes);
    return { success: true };
  });

  fastify.get('/:id/history', async (request) => {
    const { id } = request.params as { id: string };
    const history = await prisma.priceHistory.findMany({
      where: { marketId: id },
      orderBy: { timestamp: 'asc' },
      take: 100
    });
    return { 
      history: history.map((h: any) => ({
        time: h.timestamp.toISOString().split('T')[0],
        value: h.priceYes
      }))
    };
  });
}
