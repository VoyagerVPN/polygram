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
 * Verifies HMAC signature with BOT_TOKEN
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
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

    // Verify HMAC signature
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      console.error('[Auth] BOT_TOKEN not configured');
      reply.status(500).send({ error: 'Server configuration error' });
      return;
    }

    const isValid = verifyTelegramWebAppData(initData, botToken);
    if (!isValid) {
      console.warn('[Auth] Invalid HMAC signature');
      reply.status(401).send({ error: 'Invalid signature' });
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
 * Based on Telegram documentation: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  
  if (!hash) return false;
  
  params.delete('hash');
  
  // Sort parameters alphabetically and join with \n
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Create secret key: HMAC_SHA256("WebAppData", bot_token)
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  // Compute hash: HMAC_SHA256(secret_key, data_check_string)
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    // Buffer lengths mismatch
    return false;
  }
}
