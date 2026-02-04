import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
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
    it('should return list of markets', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/markets'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('should return markets with correct structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/markets'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      // Check if response is array
      expect(Array.isArray(body)).toBe(true);
      
      // If markets exist, check structure
      if (body.length > 0) {
        const market = body[0];
        expect(market).toHaveProperty('id');
        expect(market).toHaveProperty('question');
        expect(market).toHaveProperty('status');
      }
    });
  });

  describe('GET /api/markets/:id', () => {
    it('should return 404 for non-existent market', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/markets/non-existent-id'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should validate market ID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/markets/invalid-id-123'
      });

      // Should either return 404 or 400 depending on implementation
      expect([400, 404]).toContain(response.statusCode);
    });
  });

  describe('POST /api/markets', () => {
    it('should reject invalid market data', async () => {
      const invalidData = {
        // Missing required fields
        description: 'Test description'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/markets',
        payload: invalidData
      });

      expect(response.statusCode).toBe(400);
    });

    it('should require authentication for creating markets', async () => {
      const marketData = {
        question: 'Will it rain tomorrow?',
        description: 'Test market',
        closeDate: new Date(Date.now() + 86400000).toISOString()
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/markets',
        payload: marketData
      });

      // Should require auth (401) or validation error (400)
      expect([400, 401, 403]).toContain(response.statusCode);
    });
  });
});
