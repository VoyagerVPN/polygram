import { PrismaClient, MarketStatus, Outcome } from '@prisma/client';
import { MarketService } from '../modules/market/market.service.js';
import { AiService } from './ai.service.js';
import { NewsService, NewsEntry } from './news.service.js';
import { BotService } from './bot.service.js';

export class ResolutionService {
  constructor(
    private prisma: PrismaClient,
    private marketService: MarketService,
    private aiService: AiService,
    private newsService: NewsService,
    private bot: BotService
  ) {}

  /**
   * Main loop to find and resolve expired markets
   */
  async checkAndResolveMarkets() {
    const expiredMarkets = await this.prisma.market.findMany({
      where: {
        status: 'OPEN',
        expiresAt: { lte: new Date() }
      }
    });

    if (expiredMarkets.length > 0) {
      console.log(`[Resolution] Found ${expiredMarkets.length} expired markets to resolve.`);
    }

    for (const market of expiredMarkets) {
      await this.resolveMarket(market.id);
    }
  }

  async resolveMarket(marketId: string) {
    try {
      const market = await this.prisma.market.findUnique({
        where: { id: marketId }
      });
      if (!market || market.status !== 'OPEN') return;

      console.log(`[Resolution] Resolving market: "${market.question}"`);

      // 1. Fetch relevant news for the market period
      const news = await this.newsService.fetchLatestNews();
      const newsContext = news.slice(0, 10).map(n => n.title).join('\n');

      // 2. Ask AI to judge the outcome
      const verdict = await this.aiService.resolveMarket(market.question, newsContext);
      
      if (verdict === 'YES' || verdict === 'NO') {
        await this.settleMarket(marketId, verdict);
        
        // Notify via Bot
        await this.bot.broadcastMessage(`🏁 *Market Resolved!*\n\n"${market.question}"\n\nOutcome: *${verdict}*`);
      } else {
        console.warn(`[Resolution] AI could not determine outcome for "${market.question}". Retrying later.`);
      }
    } catch (err) {
      console.error(`[Resolution] Failed to resolve market ${marketId}:`, err);
    }
  }

  private async settleMarket(marketId: string, outcome: Outcome) {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
      include: { 
        positions: {
          include: { user: true }
        }
      }
    });
    if (!market) return;

    // Calculate payouts
    // In LMSR, usually winners get 1 unit per share
    await this.prisma.$transaction(async (tx) => {
      for (const position of market.positions) {
        let payout = 0;
        if (outcome === 'YES') {
          payout = position.sharesYes; // 1 share = 1 TON (simplified)
        } else {
          payout = position.sharesNo;
        }

        if (payout > 0) {
          await tx.user.update({
            where: { id: position.userId },
            data: { balance: { increment: payout } }
          });
        }
      }

      await tx.market.update({
        where: { id: marketId },
        data: {
          status: 'CLOSED',
          outcome,
          resolvedAt: new Date(),
          resolvedBy: 'AI'
        }
      });
    });

    console.log(`[Resolution] Settle complete for ${marketId}. Outcome: ${outcome}`);
  }

  start() {
    console.log('[Resolution] Scheduler started.');
    setInterval(() => this.checkAndResolveMarkets(), 600000); // Check every 10 mins
  }
}
