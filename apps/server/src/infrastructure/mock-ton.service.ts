import { IMockTonService } from './interfaces/ton-service.interface.js';
import { TonService } from './ton.service.js';
import type { PrismaClient } from './prisma/index.js';
import { UserService } from '../modules/user/user.service.js';

/**
 * Mock TON Service for development and testing
 * Inherits core logic from TonService but overrides API interaction
 */
export class MockTonService extends TonService implements IMockTonService {
  constructor(
    userService: UserService,
    prisma: PrismaClient
  ) {
    // Pass empty strings for API key and wallet since they won't be used
    super('', '', userService, prisma);
    console.log('[MockTonService] Initialized (MOCK MODE)');
  }

  /**
   * Start simulated monitoring
   */
  startMonitoring(): void {
    console.log('[MockTonService] Simulated monitoring started');
    console.log('[MockTonService] Use /mock_deposit command in the bot to simulate deposits');
  }

  /**
   * No-op in mock mode to avoid hitting the real API
   */
  override async processNewTransactions(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Simulate a deposit for testing
   * Generates a valid fake txHash and processes the deposit using inherited logic
   */
  async simulateDeposit(userId: string, amount: number): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const txHash = `mock_${timestamp}_${random}`;

    console.log(`[MockTonService] Simulating deposit: +${amount} TON for user ${userId}`);

    const success = await this.handleDeposit(userId, amount, txHash);

    if (!success) {
      throw new Error('Failed to process mock deposit - check if user exists or if transaction is duplicate');
    }

    return txHash;
  }

  /**
   * Stop is a no-op since we don't start real polling
   */
  override stop(): void {
    console.log('[MockTonService] Monitoring stopped');
  }
}
