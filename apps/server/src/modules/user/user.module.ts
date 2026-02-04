import pkg from '../../infrastructure/prisma/index.js';
const { PrismaClient } = pkg;
import type { User } from '../../infrastructure/prisma/index.js';
import { FastifyInstance } from 'fastify';
import { UserService } from './user.service.js';
import { AuthService } from './auth.service.js';

// Temporary store for payloads (in production use Redis)
const payloadStore = new Map<string, string>();

export async function UserModule(fastify: FastifyInstance, options: { service: UserService, auth: AuthService }) {
  const { service, auth } = options;

  /**
   * 1. Request Auth Payload
   */
  fastify.get('/auth/payload', async () => {
    const payload = await auth.generatePayload();
    const tempId = Math.random().toString(36).substring(7);
    payloadStore.set(tempId, payload);
    
    return { payload, tempId };
  });

  /**
   * 2. Verify TON Proof and Login
   */
  fastify.post('/auth/verify', async (request, reply) => {
    const { payload, tempId, telegramId, username } = request.body as any;

    const expectedPayload = payloadStore.get(tempId);
    if (!expectedPayload) {
      return reply.status(400).send({ error: 'Payload expired or not found' });
    }

    const isValid = await auth.verifyProof(payload, expectedPayload);
    if (!isValid) {
      return reply.status(401).send({ error: 'Invalid wallet proof' });
    }

    // Success: Sync user in DB
    const user = await service.syncUser({
      telegramId: BigInt(telegramId),
      username,
      tonAddress: payload.address
    });

    payloadStore.delete(tempId);

    // In a real app, generate a JWT here
    return { 
      success: true, 
      user: {
        id: user.id,
        balance: user.balance,
        tonAddress: user.tonAddress
      }
    };
  });

  /**
   * 3. Get User Profile
   */
  fastify.get('/profile/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const profile = await service.getProfile(id);
    if (!profile) return reply.status(404).send({ error: 'User not found' });
    
    return profile;
  });

  /**
   * 4. Get Leaderboard (Top traders by balance + realized PnL)
   * Query params: period (all_time, weekly, daily) - currently supports all_time only
   */
  fastify.get('/leaderboard', async (request, reply) => {
    try {
      const { period = 'all_time' } = request.query as { period?: string };
      
      // Get top 20 users by balance
      const topUsers = await service.getLeaderboard(period, 20);
      
      return {
        period,
        users: topUsers.map((user, index: number) => ({
          rank: index + 1,
          id: user.id,
          username: user.username,
          balance: user.balance,
          totalTrades: user.transactions?.length || 0,
        }))
      };
    } catch (err) {
      console.error('[Leaderboard] Error:', err);
      return reply.status(500).send({ error: 'Failed to fetch leaderboard' });
    }
  });
}
