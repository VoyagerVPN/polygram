/**
 * Authentication Middleware
 * Validates Telegram WebApp initData
 */

import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import crypto from 'crypto';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    telegramId: bigint;
    username?: string;
  };
}

/**
 * Validates Telegram WebApp initData
 * In production, this should verify HMAC signature
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // For MVP: Parse initData from header
    // In production: Verify HMAC signature with BOT_TOKEN
    const initData = request.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      // For development, allow mock user
      if (process.env.NODE_ENV === 'development') {
        (request as AuthenticatedRequest).user = {
          id: 'mock-user-id',
          telegramId: BigInt(123456789),
          username: 'dev_user',
        };
        return;
      }
      reply.status(401).send({ error: 'Missing authentication' });
      return;
    }

    // Parse user data from initData
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    
    if (!userJson) {
      reply.status(401).send({ error: 'Invalid authentication data' });
      return;
    }

    const userData = JSON.parse(userJson);
    
    // TODO: Verify HMAC signature in production
    // const isValid = verifyTelegramWebAppData(initData, process.env.BOT_TOKEN!);
    // if (!isValid) {
    //   reply.status(401).send({ error: 'Invalid signature' });
    //   return;
    // }

    // Get or create user from database
    const prisma = (request.server as any).prisma;
    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(userData.id) },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(userData.id),
          username: userData.username || `user_${userData.id}`,
        },
      });
    }

    (request as AuthenticatedRequest).user = {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username || undefined,
    };
  } catch (error) {
    console.error('[Auth] Authentication failed:', error);
    reply.status(401).send({ error: 'Authentication failed' });
  }
}

/**
 * Verify Telegram WebApp data signature
 */
function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  
  if (!hash) return false;
  
  params.delete('hash');
  
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return computedHash === hash;
}
