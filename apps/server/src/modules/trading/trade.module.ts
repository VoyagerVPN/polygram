/**
 * Trade Module - Fastify Plugin
 * Following SOLID: Dependency Injection and Composition
 */

import { FastifyInstance } from 'fastify';
import type { PrismaClient as IPrismaClient } from '@prisma/client';
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
  fastify.post('/', controller.executeTrade.bind(controller));
  fastify.get('/estimate', controller.estimateTrade.bind(controller));
}
