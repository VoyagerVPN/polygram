import OpenAI from 'openai';
import { NewsEntry } from './news.service.js';

export interface MarketProposal {
  question: string;
  description: string;
  expiresAt: string;
  liquidityB: number;
}

export class AiService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/polygram', // Required by OpenRouter
        'X-Title': 'Polygram Prediction Markets',
      }
    });
  }

  async synthesizeMarket(news: NewsEntry[]): Promise<MarketProposal | null> {
    const newsContext = news.slice(0, 5).map(n => `- ${n.title}: ${n.description || ''}`).join('\n');
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: `Ты — эксперт по рынкам предсказаний. Сегодняшняя дата: ${today}.
Анализируй новости и разработай ОДИН актуальный бинарный рынок. 
Используй ТОЛЬКО текущие события. Выдай СТРОГО один объект JSON (не массив).`
          },
          {
            role: 'user',
            content: `Новости:\n${newsContext}\n\nСгенерируй JSON объект (не массив!):
{
  "question": "Вопрос о будущем событии",
  "description": "Критерии разрешения рынка",
  "expiresAt": "Дата завершения в ISO формате (должна быть позже чем ${today}, обычно +7-14 дней)",
  "liquidityB": 150
}`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const text = completion.choices[0]?.message?.content;
      console.log('[AiService] AI Raw Response:', text);
      
      if (!text) return null;

      // Extract JSON (object or array)
      const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (!jsonMatch) {
         console.error('[AiService] No JSON found in response');
         return null;
      }

      let parsed = JSON.parse(jsonMatch[0]);
      
      // If AI returned an array, take the first element
      if (Array.isArray(parsed)) {
        parsed = parsed[0];
      }

      if (!parsed) return null;
      
      return {
        question: parsed.question || parsed.title || 'Unknown Question',
        description: parsed.description || parsed.details || 'No description provided',
        expiresAt: parsed.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        liquidityB: Number(parsed.liquidityB) || 150
      };
    } catch (err) {
      console.error('[AiService] Synthesis failed:', err);
      return null;
    }
  }

  async resolveMarket(question: string, context: string): Promise<'YES' | 'NO' | 'UNKNOWN'> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: `Ты — судья на рынке предсказаний. 
Твоя задача: на основе предоставленного контекста новостей определить, свершилось ли событие.
Отвечай СТРОГО одним словом: YES, NO или UNKNOWN.`
          },
          {
            role: 'user',
            content: `Вопрос: ${question}\n\nКонтекст новостей:\n${context}`
          }
        ]
      });

      const response = completion.choices[0]?.message?.content?.trim().toUpperCase();
      if (response === 'YES' || response === 'NO') return response;
      return 'UNKNOWN';
    } catch (err) {
      console.error('[AiService] Resolution failed:', err);
      return 'UNKNOWN';
    }
  }
}
