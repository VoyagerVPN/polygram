import { IMockTonService } from './interfaces/ton-service.interface.js';
import type { PrismaClient } from './prisma/index.js';
import { UserService } from '../modules/user/user.service.js';
import { TON_CONFIG } from '../core/constants.js';

/**
 * Mock TON Service for development and testing
 * Simulates blockchain interactions without real API calls
 */
export class MockTonService implements IMockTonService {
  private intervalId?: NodeJS.Timeout;
  private isMonitoring = false;

  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaClient
  ) {
    console.log('[MockTonService] Initialized (MOCK MODE)');
  }

  /**
   * Start simulated monitoring
   * In mock mode, this just logs and sets a flag
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('[MockTonService] Already monitoring');
      return;
    }

    this.isMonitoring = true;
    console.log('[MockTonService] Simulated monitoring started');
    console.log('[MockTonService] Use /mock_deposit command to simulate deposits');

    // Mock doesn't need real polling, but we keep the interval for consistency
    this.intervalId = setInterval(() => {
      // No-op in mock mode - deposits are triggered manually
    }, TON_CONFIG.POLLING_INTERVAL_MS);
  }

  /**
   * Stop monitoring and cleanup
   */
  stop(): void {
    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log('[MockTonService] Monitoring stopped');
  }

  /**
   * No-op in mock mode
   */
  async processNewTransactions(): Promise<void> {
    // In mock mode, transactions are processed immediately via simulateDeposit
    console.log('[MockTonService] processNewTransactions called (no-op in mock mode)');
  }

  /**
   * Simulate a deposit for testing
   * Generates a valid fake txHash and processes the deposit
   */
  async simulateDeposit(userId: string, amount: number): Promise<string> {
    // Generate realistic-looking mock txHash
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const txHash = `mock_${timestamp}_${random}`;

    console.log(`[MockTonService] Simulating deposit: +${amount} TON for user ${userId}`);

    const success = await this.handleDeposit(userId, amount, txHash);

    if (!success) {
      throw new Error('Failed to process mock deposit - user not found or duplicate');
    }

    console.log(`[MockTonService] Deposit successful: tx=${txHash}`);
    return txHash;
  }

  /**
   * Handle deposit with idempotency check
   * Same logic as real TonService but without blockchain interaction
   */
  private async handleDeposit(
    userId: string,
    amount: number,
    txHash: string
  ): Promise<boolean> {
    try {
      // 1. Check if this transaction was already processed (idempotency)
      const existingTx = await this.prisma.transaction.findUnique({
        where: { txHash }
      });

      if (existingTx) {
        console.log(
          `[MockTonService] Transaction ${txHash.slice(0, 16)}... already processed, skipping`
        );
        return false;
      }

      // 2. Validate user exists
      const user = await this.userService.getProfile(userId);
      if (!user) {
        console.warn(`[MockTonService] User ${userId} not found for deposit ${txHash}`);
        return false;
      }

      // 3. Get TransactionType enum from prisma
      const { TransactionType } = await import('./prisma/index.js');

      // 4. Process deposit in transaction: update balance + record transaction
      await this.prisma.$transaction([
        // Update user balance
        this.prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: amount } }
        }),
        // Record transaction with txHash for idempotency
        this.prisma.transaction.create({
          data: {
            userId,
            type: TransactionType.DEPOSIT,
            amount,
            txHash
          }
        })
      ]);

      console.log(
        `[MockTonService] Deposit processed successfully: +${amount} TON for user ${userId}`
      );
      return true;
    } catch (err) {
      console.error(`[MockTonService] Failed to process deposit ${txHash}:`, err);
      return false;
    }
  }
}
