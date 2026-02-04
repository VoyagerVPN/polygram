/**
 * Trade Module - Fastify Plugin
 * Following SOLID: Dependency Injection and Composition
 */

import { FastifyInstance } from 'fastify';
import pkg from '../../infrastructure/prisma/index.js';
const { PrismaClient } = pkg;
import type { PrismaClient as IPrismaClient } from '../../infrastructure/prisma/index.js';
import { TradeController } from './trade.controller.js';
import { TradeService } from './trade.service.js';
import { PrismaTradeRepository } from './prisma-trade.repository.js';

interface TradeModuleOptions {
  prisma: IPrismaClient;
}

export default async function TradeModule(
  fastify: FastifyInstance,
  options: TradeModuleOptions
): Promise<void> {
  const { prisma } = options;

  // Dependency Injection
  const repository = new PrismaTradeRepository(prisma);
  const service = new TradeService(repository);
  const controller = new TradeController(service);

  // Routes
  fastify.post('/', async (request, reply) => {
    await controller.executeTrade(request, reply);
  });

  fastify.get('/estimate', async (request, reply) => {
    await controller.estimateTrade(
      request as Parameters<typeof controller.estimateTrade>[0],
      reply
    );
  });
}
