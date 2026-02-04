/**
 * Portfolio Module - Fastify Plugin
 * Following SOLID: Dependency Injection and Composition
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PortfolioController } from './portfolio.controller.js';
import { PortfolioService } from './portfolio.service.js';

interface PortfolioModuleOptions {
  prisma: PrismaClient;
}

export default async function PortfolioModule(
  fastify: FastifyInstance,
  options: PortfolioModuleOptions
): Promise<void> {
  const { prisma } = options;

  // Dependency Injection
  const service = new PortfolioService(prisma);
  const controller = new PortfolioController(service);

  // Routes
  fastify.get('/', async (request, reply) => {
    await controller.getPortfolio(request, reply);
  });

  fastify.get('/positions', async (request, reply) => {
    await controller.getPositions(request, reply);
  });

  fastify.get('/transactions', async (request, reply) => {
    await controller.getTransactions(request, reply);
  });
}
