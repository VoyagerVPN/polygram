import { Telegraf, Markup } from 'telegraf';
import { MarketService, MarketData } from '../modules/market/market.service.js';
import { NewsService } from './news.service.js';
import { AiService } from './ai.service.js';
import { AutomationService } from './automation.service.js';

export class BotService {
  private bot: Telegraf;
  private automation?: AutomationService;
  private isAutomationRunning = false;

  constructor(
    token: string, 
    private marketService: MarketService,
    private newsService: NewsService,
    private aiService: AiService
  ) {
    this.bot = new Telegraf(token);
    this.setupCommands();
    this.setupActions();
  }

  setAutomation(automation: AutomationService) {
    this.automation = automation;
  }

  private setupCommands() {
    this.bot.start((ctx) => ctx.reply(
      '🤖 *Polygram Admin Bot*\n\n' +
      'Доступные команды:\n' +
      '/status - Статус системы\n' +
      '/generate - Сгенерировать рынок вручную\n' +
      '/autostart - Запустить авто-генерацию (8ч)\n' +
      '/autostop - Остановить авто-генерацию\n' +
      '/autostatus - Статус авто-генерации\n' +
      '/fetchnews - Получить новости\n' +
      '/markets - Список активных рынков',
      { parse_mode: 'Markdown' }
    ));
    
    this.bot.command('status', async (ctx) => {
      const markets = await this.marketService.getAllMarkets();
      const activeMarkets = markets.filter(m => m.status === 'OPEN');
      
      ctx.reply(
        `📊 *Статус Polygram*\n\n` +
        `✅ Сервер: онлайн\n` +
        `📈 Активных рынков: ${activeMarkets.length}\n` +
        `📊 Всего рынков: ${markets.length}\n` +
        `🤖 Авто-генерация: ${this.isAutomationRunning ? '✅ включена' : '⏸️ остановлена'}`,
        { parse_mode: 'Markdown' }
      );
    });

    this.bot.command('autostart', (ctx) => {
      if (!this.automation) {
        return ctx.reply('❌ Automation service not initialized');
      }
      if (this.isAutomationRunning) {
        return ctx.reply('⚠️ Авто-генерация уже запущена');
      }
      
      this.automation.start();
      this.isAutomationRunning = true;
      ctx.reply('✅ Авто-генерация запущена! (цикл: 8 часов)');
    });

    this.bot.command('autostop', (ctx) => {
      if (!this.automation) {
        return ctx.reply('❌ Automation service not initialized');
      }
      if (!this.isAutomationRunning) {
        return ctx.reply('⚠️ Авто-генерация уже остановлена');
      }
      
      this.automation.stop();
      this.isAutomationRunning = false;
      ctx.reply('⏸️ Авто-генерация остановлена');
    });

    this.bot.command('autostatus', (ctx) => {
      ctx.reply(
        `🤖 Статус авто-генерации: ${this.isAutomationRunning ? '✅ работает' : '⏸️ остановлена'}\n` +
        `📡 CryptoPanic API: ${process.env.CRYPTOPANIC_API_KEY ? '✅ настроен' : '❌ не настроен'}\n` +
        `🤖 OpenRouter AI: ${process.env.OPENROUTER_API_KEY ? '✅ настроен' : '❌ не настроен'}`
      );
    });

    this.bot.command('fetchnews', async (ctx) => {
      await ctx.reply('🔍 Запрашиваю новости с CryptoPanic...');
      try {
        const news = await this.newsService.fetchLatestNews();
        if (news.length === 0) {
          return ctx.reply('❌ Новости не найдены');
        }
        
        const headlines = news.slice(0, 5).map((n, i) => `${i + 1}. ${n.title}`).join('\n');
        ctx.reply(`📰 *Последние новости:*\n\n${headlines}`, { parse_mode: 'Markdown' });
      } catch (err) {
        ctx.reply('🔥 Ошибка при получении новостей');
      }
    });

    this.bot.command('markets', async (ctx) => {
      try {
        const markets = await this.marketService.getAllMarkets();
        const activeMarkets = markets
          .filter(m => m.status === 'OPEN')
          .slice(0, 10);
        
        if (activeMarkets.length === 0) {
          return ctx.reply('📭 Нет активных рынков');
        }
        
        const list = activeMarkets.map((m, i) => 
          `${i + 1}. ${m.question}\n   💰 Vol: ${m.b * 2} TON`
        ).join('\n\n');
        
        ctx.reply(`📈 *Активные рынки:*\n\n${list}`, { parse_mode: 'Markdown' });
      } catch (err) {
        ctx.reply('🔥 Ошибка при получении списка рынков');
      }
    });

    this.bot.command('generate', async (ctx) => {
      await ctx.reply('🔍 Запрашиваю новости и анализирую через OpenRouter ИИ...');
      
      try {
        const news = await this.newsService.fetchLatestNews();
        const proposal = await this.aiService.synthesizeMarket(news);

        if (!proposal) {
          return ctx.reply('❌ ИИ не смог сгенерировать рынок.');
        }

        const marketId = await this.marketService.createFromProposal(proposal);

        await ctx.reply(
          `🤖 **Предложение нового рынка:**\n\n` +
          `❓ **Вопрос:** ${proposal.question}\n` +
          `📝 **Описание:** ${proposal.description}\n` +
          `📅 **Истекает:** ${new Date(proposal.expiresAt).toLocaleDateString()}\n\n` +
          `Что делаем?`,
          Markup.inlineKeyboard([
            Markup.button.callback('✅ Одобрить', `approve_${marketId}`),
            Markup.button.callback('❌ Отклонить', `reject_${marketId}`)
          ])
        );
      } catch (err) {
        console.error('[Bot] Generation failed:', err);
        ctx.reply('🔥🔥 Ошибка при генерации рынка.');
      }
    });
  }

  private setupActions() {
    this.bot.action(/approve_(.*)/, async (ctx) => {
      const marketId = ctx.match[1];
      await this.marketService.approveMarket(marketId);
      await ctx.editMessageText('✅ Рынок одобрен и опубликован!');
    });

    this.bot.action(/reject_(.*)/, async (ctx) => {
      const marketId = ctx.match[1];
      // Set status to CLOSED or just leave it PENDING
      await ctx.editMessageText('❌ Предложение рынка отклонено.');
    });
  }

  async notifyAdminOfProposal(marketId: string, proposal: { question: string; description: string; expiresAt: Date }) {
    const adminId = process.env.ADMIN_CHAT_ID;
    if (!adminId) {
      console.warn('[Bot] ADMIN_CHAT_ID not set. Cannot send automated proposal.');
      return;
    }

    try {
      await this.bot.telegram.sendMessage(
        adminId,
        `🤖 **Автоматическое предложение рынка:**\n\n` +
        `❓ **Вопрос:** ${proposal.question}\n` +
        `📝 **Описание:** ${proposal.description}\n` +
        `📅 **Истекает:** ${new Date(proposal.expiresAt).toLocaleDateString()}\n\n` +
        `Что делаем?`,
        Markup.inlineKeyboard([
          Markup.button.callback('✅ Одобрить', `approve_${marketId}`),
          Markup.button.callback('❌ Отклонить', `reject_${marketId}`)
        ])
      );
    } catch (err) {
      console.error('[Bot] Failed to notify admin:', err);
    }
  }

  async broadcastMessage(message: string) {
    const adminId = process.env.ADMIN_CHAT_ID;
    if (!adminId) {
      console.warn('[Bot] ADMIN_CHAT_ID not set. Cannot broadcast message.');
      return;
    }

    try {
      await this.bot.telegram.sendMessage(adminId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('[Bot] Failed to broadcast message:', err);
    }
  }

  async launch() {
    try {
      await this.bot.launch();
      console.log('Telegram Bot launched successfully');
    } catch (err) {
      if (err instanceof Error && err.message.includes('409')) {
        console.warn('Bot conflict: Another instance is running. Skipping bot start.');
      } else {
        throw err;
      }
    }
    
    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}
