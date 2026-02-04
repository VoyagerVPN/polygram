import axios from 'axios';
import { UserService } from '../modules/user/user.service.js';

export class TonService {
  private readonly apiKey: string;
  private readonly appWallet: string;
  private readonly baseUrl = 'https://tonapi.io/v2';

  constructor(apiKey: string, appWallet: string, private userService: UserService) {
    this.apiKey = apiKey;
    this.appWallet = appWallet;
  }

  /**
   * Monitor incoming transactions to the app wallet
   * In a real production environment, this would be a persistent SSE connection 
   * or a webhook listener. For MVP, we'll implement the logic to process transactions.
   */
  async processNewTransactions() {
    try {
      // Fetch last 10 transactions
      const response = await axios.get(`${this.baseUrl}/accounts/${this.appWallet}/transactions`, {
        params: { limit: 20 },
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });

      const transactions = response.data.transactions;

      for (const tx of transactions) {
        if (!tx.in_msg || !tx.success) continue;

        const amount = tx.in_msg.value / 1e9; // Convert nanoTON to TON
        const comment = tx.in_msg.decoded_body?.text; // Memo/Comment

        if (comment && comment.startsWith('dep_')) {
          const userId = comment.replace('dep_', '');
          await this.handleDeposit(userId, amount, tx.hash);
        }
      }
    } catch (err) {
      console.error('[TonService] Failed to fetch transactions:', err);
    }
  }

  private async handleDeposit(userId: string, amount: number, txHash: string) {
    // 1. Check if this transaction was already processed (idempotency)
    // For MVP, we'll just check if user exists and add balance
    const user = await this.userService.getProfile(userId);
    if (!user) return;

    console.log(`[TonService] Processing deposit for user ${userId}: ${amount} TON (tx: ${txHash})`);
    
    // Add balance to user
    const prisma = (this.userService as any).prisma;
    await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } }
    });
  }

  /**
   * Start the monitoring loop
   */
  startMonitoring() {
    console.log('[TonService] Starting transaction monitoring for', this.appWallet);
    setInterval(() => this.processNewTransactions(), 30000); // Poll every 30s for MVP
  }
}
