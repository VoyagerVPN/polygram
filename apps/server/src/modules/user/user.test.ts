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

  describe('GET /api/users/auth/payload', () => {
    it('should return auth payload', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/auth/payload'
      });

      // Should return 200 with payload
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('payload');
      expect(body).toHaveProperty('tempId');
    });
  });

  describe('POST /api/users/auth/verify', () => {
    it('should handle verification without payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/auth/verify',
        payload: {}
      });

      // Should return error (400) since no valid payload provided
      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/users/profile/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/profile/non-existent-id'
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
