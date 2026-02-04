import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp, cleanupApp } from '../../test/helper.js';

describe('User API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await cleanupApp(app);
  });

  describe('GET /api/users/me', () => {
    it('should handle me endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me'
      });

      // Endpoint should exist
      expect(response.statusCode).not.toBe(404);
    });
  });

  describe('POST /api/users/auth/telegram', () => {
    it('should handle telegram auth', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/auth/telegram',
        payload: {}
      });

      // Should handle request (validation error or success)
      expect(response.statusCode).not.toBe(404);
    });
  });

  describe('GET /api/users/portfolio', () => {
    it('should handle portfolio endpoint', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/portfolio'
      });

      // Endpoint should exist
      expect(response.statusCode).not.toBe(404);
    });
  });
});
