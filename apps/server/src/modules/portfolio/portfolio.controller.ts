/**
 * Portfolio Controller - HTTP Layer
 * Following SOLID: Single Responsibility - handles HTTP only
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { IPortfolioService } from './portfolio.service.js';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
  };
}

export class PortfolioController {
  constructor(private service: IPortfolioService) {}

  async getPortfolio(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = (request as AuthenticatedRequest).user.id;
      const data = await this.service.getPortfolioData(userId);
      reply.status(200).send(data);
    } catch (error) {
      console.error('[Portfolio] Failed to get portfolio:', error);
      reply.status(500).send({ error: 'Failed to fetch portfolio' });
    }
  }

  async getPositions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = (request as AuthenticatedRequest).user.id;
      const positions = await this.service.getPositions(userId);
      reply.status(200).send(positions);
    } catch (error) {
      console.error('[Portfolio] Failed to get positions:', error);
      reply.status(500).send({ error: 'Failed to fetch positions' });
    }
  }

  async getTransactions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = (request as AuthenticatedRequest).user.id;
      const transactions = await this.service.getTransactions(userId);
      reply.status(200).send(transactions);
    } catch (error) {
      console.error('[Portfolio] Failed to get transactions:', error);
      reply.status(500).send({ error: 'Failed to fetch transactions' });
    }
  }
}
