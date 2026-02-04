import axios from 'axios';
import pkg from './prisma/index.js';
const { PrismaClient, TransactionType } = pkg;
import type { PrismaClient as IPrismaClient } from './prisma/index.js';
import { UserService } from '../modules/user/user.service.js';
import { TON_CONFIG } from '../core/constants.js';
import { ITonService } from './interfaces/ton-service.interface.js';

export class TonService implements ITonService {
  private readonly apiKey: string;
  private readonly appWallet: string;
  private readonly baseUrl = 'https://tonapi.io/v2';
  private readonly prisma: IPrismaClient;
  private intervalId?: NodeJS.Timeout;

  constructor(
    apiKey: string, 
    appWallet: string, 
    private userService: UserService,
    prisma: IPrismaClient
  ) {
    this.apiKey = apiKey;
    this.appWallet = appWallet;
    this.prisma = prisma;
  }

  /**
   * Monitor incoming transactions to the app wallet
   * In a real production environment, this would be a persistent SSE connection 
   * or a webhook listener. For MVP, we'll implement the logic to process transactions.
   */
  async processNewTransactions() {
    try {
      // Fetch last 20 transactions
      const response = await axios.get(`${this.baseUrl}/accounts/${this.appWallet}/transactions`, {
        params: { limit: TON_CONFIG.TRANSACTIONS_PER_FETCH },
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });

      const transactions = response.data.transactions;
      let processedCount = 0;
      let skippedCount = 0;

      for (const tx of transactions) {
        if (!tx.in_msg || !tx.success) continue;

        const amount = tx.in_msg.value / TON_CONFIG.NANO_TON_CONVERSION; // Convert nanoTON to TON
        const comment = tx.in_msg.decoded_body?.text; // Memo/Comment
        const txHash = tx.hash;

        if (comment && comment.startsWith(TON_CONFIG.DEPOSIT_COMMENT_PREFIX)) {
          const userId = comment.replace(TON_CONFIG.DEPOSIT_COMMENT_PREFIX, '');
          const isNew = await this.handleDeposit(userId, amount, txHash);
          if (isNew) processedCount++;
          else skippedCount++;
        }
      }

      if (processedCount > 0 || skippedCount > 0) {
        console.log(`[TonService] Processed: ${processedCount}, Skipped (already processed): ${skippedCount}`);
      }
    } catch (err) {
      console.error('[TonService] Failed to fetch transactions:', err);
    }
  }

  /**
   * Handle deposit with idempotency check
   * @returns true if deposit was processed, false if already existed
   */
  private async handleDeposit(userId: string, amount: number, txHash: string): Promise<boolean> {
    try {
      // 1. Check if this transaction was already processed (idempotency)
      const existingTx = await this.prisma.transaction.findUnique({
        where: { txHash }
      });

      if (existingTx) {
        console.log(`[TonService] Transaction ${txHash.slice(0, 16)}... already processed, skipping`);
        return false;
      }

      // 2. Validate user exists
      const user = await this.userService.getProfile(userId);
      if (!user) {
        console.warn(`[TonService] User ${userId} not found for deposit ${txHash}`);
        return false;
      }

      console.log(`[TonService] Processing deposit for user ${userId}: ${amount} TON (tx: ${txHash.slice(0, 16)}...)`);

      // 3. Process deposit in transaction: update balance + record transaction
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
            txHash,
          }
        })
      ]);

      console.log(`[TonService] Deposit processed successfully: +${amount} TON for user ${userId}`);
      return true;
    } catch (err) {
      console.error(`[TonService] Failed to process deposit ${txHash}:`, err);
      return false;
    }
  }

  /**
   * Start the monitoring loop
   */
  startMonitoring() {
    console.log('[TonService] Starting transaction monitoring for', this.appWallet);
    // Poll every 30 seconds for MVP
    this.intervalId = setInterval(() => this.processNewTransactions(), TON_CONFIG.POLLING_INTERVAL_MS);
    // Initial check
    this.processNewTransactions();
  }

  /**
   * Stop monitoring and cleanup resources
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log('[TonService] Monitoring stopped');
  }
}
