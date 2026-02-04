import { Telegraf, Markup, Context } from 'telegraf';
import { MarketService } from '../modules/market/market.service.js';
import { NewsService } from './news.service.js';
import { AiService } from './ai.service.js';
import { AutomationService } from './automation.service.js';
import { IMockTonService } from './interfaces/ton-service.interface.js';

export class BotService {
  private bot: Telegraf;
  private automation?: AutomationService;
  private isAutomationRunning = false;
  private mockTonService?: IMockTonService;

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

  /**
   * Set the mock TON service for /mock_deposit command
   */
  setMockTonService(service: IMockTonService) {
    this.mockTonService = service;
  }

  setAutomation(automation: AutomationService) {
    this.automation = automation;
  }

  private setupCommands() {
    this.bot.start((ctx) => {
      this.logCommand(ctx, 'start');
      ctx.reply(
        '🤖 *Polygram Admin Bot*\n\n' +
        'Доступные команды:\n' +
        '/status - Статус системы\n' +
        '/generate - Сгенерировать рынок вручную\n' +
        '/autostart - Запустить авто-генерацию (8ч)\n' +
        '/autostop - Остановить авто-генерацию\n' +
        '/autostatus - Статус авто-генерации\n' +
        '/fetchnews - Получить новости\n' +
        '/markets - Список активных рынков\n' +
        '/mock_deposit <userId> <amount> - Симулировать депозит (admin only)',
        { parse_mode: 'Markdown' }
      );
    });
    
    this.bot.command('status', async (ctx) => {
      this.logCommand(ctx, 'status');
      try {
        const markets = await this.marketService.getAllMarkets();
        const activeMarkets = markets.filter(m => m.status === 'OPEN');
        
        ctx.reply(
          `📊 *Статус Polygram*\n\n` +
          `✅ Сервер: онлайн\n` +
          `📈 Активных рынков: ${activeMarkets.length}\n` +
          `📊 Всего рынков: ${markets.length}\n` +
          `🤖 Авто-генерация: ${this.isAutomationRunning ? '✅ включена' : '⏸️ остановлена'}\n` +
          `💰 Mock TON: ${this.mockTonService ? '✅ доступен' : '❌ недоступен'}`,
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        this.logCommand(ctx, 'status', err instanceof Error ? err : new Error(String(err)));
        ctx.reply('🔥 Ошибка при получении статуса');
      }
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
      this.logCommand(ctx, 'fetchnews');
      await ctx.reply('🔍 Запрашиваю новости с CryptoPanic...');
      try {
        const news = await this.newsService.fetchLatestNews();
        if (news.length === 0) {
          return ctx.reply('❌ Новости не найдены');
        }
        
        const headlines = news.slice(0, 5).map((n, i) => `${i + 1}. ${n.title}`).join('\n');
        ctx.reply(`📰 *Последние новости:*\n\n${headlines}`, { parse_mode: 'Markdown' });
      } catch (err) {
        this.logCommand(ctx, 'fetchnews', err instanceof Error ? err : new Error(String(err)));
        ctx.reply('🔥 Ошибка при получении новостей: ' + (err instanceof Error ? err.message : String(err)));
      }
    });

    this.bot.command('markets', async (ctx) => {
      this.logCommand(ctx, 'markets');
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
        this.logCommand(ctx, 'markets', err instanceof Error ? err : new Error(String(err)));
        ctx.reply('🔥 Ошибка при получении списка рынков');
      }
    });

    this.bot.command('generate', async (ctx) => {
      this.logCommand(ctx, 'generate');
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
        this.logCommand(ctx, 'generate', err instanceof Error ? err : new Error(String(err)));
        ctx.reply('🔥🔥 Ошибка при генерации рынка: ' + (err instanceof Error ? err.message : String(err)));
      }
    });

    // Mock deposit command - admin only
    this.bot.command('mock_deposit', async (ctx) => {
      this.logCommand(ctx, 'mock_deposit');
      
      // Check admin access
      const adminId = process.env.ADMIN_CHAT_ID;
      const userId = ctx.from?.id.toString();
      if (!adminId || userId !== adminId) {
        return ctx.reply('❌ Эта команда доступна только администратору');
      }

      // Check mock service availability
      if (!this.mockTonService) {
        return ctx.reply('❌ Mock TON сервис не доступен. Убедитесь что USE_MOCK_TON=true');
      }

      // Parse arguments
      const args = ctx.message.text.split(' ').slice(1);
      if (args.length !== 2) {
        return ctx.reply('❌ Использование: /mock_deposit <userId> <amount>\nПример: /mock_deposit abc123 100');
      }

      const [targetUserId, amountStr] = args;
      const amount = parseFloat(amountStr);

      if (isNaN(amount) || amount <= 0) {
        return ctx.reply('❌ Сумма должна быть положительным числом');
      }

      try {
        await ctx.reply(`💰 Симулирую депозит ${amount} TON для пользователя ${targetUserId}...`);
        const txHash = await this.mockTonService.simulateDeposit(targetUserId, amount);
        
        ctx.reply(
          `✅ *Депозит успешно обработан!*\n\n` +
          `👤 Пользователь: ${targetUserId}\n` +
          `💵 Сумма: ${amount} TON\n` +
          `🔗 Транзакция: \`${txHash}\``,
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        this.logCommand(ctx, 'mock_deposit', err instanceof Error ? err : new Error(String(err)));
        ctx.reply('🔥 Ошибка при обработке депозита: ' + (err instanceof Error ? err.message : String(err)));
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
      // const marketId = ctx.match[1]; // Reserved for future use
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

  /**
   * Structured logging for bot commands
   */
  private logCommand(ctx: Context, command: string, error?: Error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: 'BotService',
      command,
      userId: ctx.from?.id,
      username: ctx.from?.username,
      chatId: ctx.chat?.id,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        : undefined
    };
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Stop the bot gracefully
   */
  async stop(): Promise<void> {
    console.log('[BotService] Stopping bot...');
    await this.bot.stop();
    console.log('[BotService] Bot stopped');
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
  }
}
