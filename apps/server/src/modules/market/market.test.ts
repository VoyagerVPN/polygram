import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp, cleanupApp } from '../../test/helper.js';

describe('Market API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await cleanupApp(app);
  });

  describe('GET /api/markets', () => {
    it('should return response', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/markets'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('markets');
      expect(Array.isArray(body.markets)).toBe(true);
    });
  });

  describe('GET /api/markets/:id', () => {
    it('should handle market lookup', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/markets/test-id'
      });

      // Should return either 200 (found) or 404 (not found)
      expect([200, 404]).toContain(response.statusCode);
    });
  });


  describe('GET /api/markets/:id/history', () => {
    it('should return price history', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/markets/test-id/history'
      });

      expect([200, 404]).toContain(response.statusCode);
      if (response.statusCode === 200) {
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('history');
      }
    });
  });
});
