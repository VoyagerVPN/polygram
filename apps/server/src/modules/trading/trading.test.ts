import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp, cleanupApp } from '../../test/helper.js';

describe('Trading API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await cleanupApp(app);
  });

  describe('GET /api/trading/positions', () => {
    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/trading/positions'
      });

      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('POST /api/trading/orders', () => {
    it('should reject invalid order data', async () => {
      const invalidOrder = {
        // Missing required fields
        amount: -100 // Negative amount
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/trading/orders',
        payload: invalidOrder
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject order without authentication', async () => {
      const orderData = {
        marketId: 'test-market-id',
        outcome: 'YES',
        amount: 100
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/trading/orders',
        payload: orderData
      });

      expect([401, 403]).toContain(response.statusCode);
    });

    it('should validate outcome values', async () => {
      const invalidOrder = {
        marketId: 'test-market-id',
        outcome: 'INVALID_OUTCOME',
        amount: 100
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/trading/orders',
        payload: invalidOrder
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/trading/history', () => {
    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/trading/history'
      });

      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('Trade validation', () => {
    it('should reject zero amount trades', async () => {
      const orderData = {
        marketId: 'test-market-id',
        outcome: 'YES',
        amount: 0
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/trading/orders',
        payload: orderData
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject very large amounts', async () => {
      const orderData = {
        marketId: 'test-market-id',
        outcome: 'YES',
        amount: 1000000000000 // Unrealistically large
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/trading/orders',
        payload: orderData
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
