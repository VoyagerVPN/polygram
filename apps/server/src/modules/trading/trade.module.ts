/**
 * Trade Module - Fastify Plugin
 * Following SOLID: Dependency Injection and Composition
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { TradeController } from './trade.controller.js';
import { TradeService } from './trade.service.js';
import { PrismaTradeRepository } from './prisma-trade.repository.js';

interface TradeModuleOptions {
  prisma: PrismaClient;
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
