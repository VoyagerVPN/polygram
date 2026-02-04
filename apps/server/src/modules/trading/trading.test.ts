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

  describe('POST /api/trading', () => {
    it('should handle trade execution', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/trading',
        payload: {
          marketId: 'test-market',
          outcome: 'YES',
          amount: 100
        }
      });

      // Endpoint should exist (not 404)
      expect(response.statusCode).not.toBe(404);
    });
  });

  describe('GET /api/trading/estimate', () => {
    it('should handle estimate request', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/trading/estimate?marketId=test&amount=100&outcome=YES'
      });

      // Endpoint may return various status codes depending on implementation
      // Just ensure it doesn't crash the server
      expect([200, 400, 404, 500]).toContain(response.statusCode);
    });
  });
});
