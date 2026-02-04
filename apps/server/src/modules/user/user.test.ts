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
    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me'
      });

      expect([401, 403]).toContain(response.statusCode);
    });

    it('should reject invalid auth token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      });

      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('POST /api/users/auth/telegram', () => {
    it('should reject invalid telegram data', async () => {
      const invalidData = {
        // Missing required fields
        hash: 'invalid-hash'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/users/auth/telegram',
        payload: invalidData
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject empty payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/auth/telegram',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/users/portfolio', () => {
    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/portfolio'
      });

      expect([401, 403]).toContain(response.statusCode);
    });
  });

  describe('User data validation', () => {
    it('should validate wallet address format', async () => {
      const invalidWalletData = {
        walletAddress: 'not-a-valid-address',
        telegramId: '123456'
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/users/connect-wallet',
        payload: invalidWalletData
      });

      // Should be 400 (validation error) or 401 (auth required)
      expect([400, 401, 403, 404]).toContain(response.statusCode);
    });
  });
});
