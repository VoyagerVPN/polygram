import { BotService } from './bot.service.js';
import { NewsService } from './news.service.js';
import { AiService } from './ai.service.js';
import { MarketService } from '../modules/market/market.service.js';

export class AutomationService {
  private intervalId?: NodeJS.Timeout;

  constructor(
    private botService: BotService,
    private newsService: NewsService,
    private aiService: AiService,
    private marketService: MarketService
  ) {}

  start() {
    console.log('[Automation] Activity monitor started (8h cycle)');
    
    // 8 hours interval to stay within 100 req/month limit (CryptoPanic)
    this.intervalId = setInterval(() => {
      this.processCycle();
    }, 8 * 60 * 60 * 1000);
    
    return true;
  }

  async processCycle() {
    console.log('[Automation] Starting market generation cycle...');
    try {
      const news = await this.newsService.fetchLatestNews();
      if (news.length === 0) {
        console.warn('[Automation] No news fetched, skipping cycle.');
        return;
      }

      const proposal = await this.aiService.synthesizeMarket(news);

      if (proposal) {
        const marketId = await this.marketService.createFromProposal(proposal);
        await this.botService.notifyAdminOfProposal(marketId, proposal);
      }
    } catch (err) {
      console.error('[Automation] Cycle failed:', err);
    }
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
