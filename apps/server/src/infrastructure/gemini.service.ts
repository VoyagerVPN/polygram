import { GoogleGenAI } from '@google/genai';
import { NewsEntry } from './news.service.js';

export interface MarketProposal {
  question: string;
  description: string;
  expiresAt: string;
  liquidityB: number;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async synthesizeMarket(news: NewsEntry[]): Promise<MarketProposal | null> {
    const newsContext = news.slice(0, 5).map(n => `- ${n.title}: ${n.description || ''}`).join('\n');
    
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Анализируй новости и создай ОДИН рынок предсказаний для Polygram.\n\nНовости:\n${newsContext}`,
        config: {
          systemInstruction: "Ты — эксперт по рынкам предсказаний. Генерируй СТРОГИЙ JSON без markdown блоков.",
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              question: { type: "string" },
              description: { type: "string" },
              expiresAt: { type: "string" },
              liquidityB: { type: "number" }
            },
            required: ["question", "description", "expiresAt", "liquidityB"]
          }
        }
      });

      const text = response.text;
      if (!text) return null;
      
      return JSON.parse(text) as MarketProposal;
    } catch (err) {
      console.error('[GeminiService] Synthesis failed:', err);
      return null;
    }
  }
}
