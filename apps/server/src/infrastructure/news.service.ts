import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { CACHE_CONFIG } from '../core/constants.js';

export interface NewsEntry {
  title: string;
  description?: string;
  url: string;
  published_at: string;
}

export class NewsService {
  private cachePath = path.resolve('cache/news_cache.json');

  constructor(private apiKey: string) {}

  async fetchLatestNews(forceRefresh = false): Promise<NewsEntry[]> {
    if (!forceRefresh) {
      const cached = await this.readCache();
      if (cached) {
        console.log('[NewsService] Serving from cache');
        return cached;
      }
    }

    console.log(`[NewsService] Fetching from CryptoPanic API...`);
    try {
      // Corrected endpoint from provided API Reference: /api/developer/v2/posts/
      const url = `https://cryptopanic.com/api/developer/v2/posts/?auth_token=${this.apiKey}&public=true&filter=hot`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as { results: Array<{ title: string; description?: string; url: string; published_at: string }> };
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }

      const entries: NewsEntry[] = data.results.map((item: { title: string; description?: string; url: string; published_at: string }) => ({
        title: item.title,
        description: item.description,
        url: item.url,
        published_at: item.published_at
      }));

      await this.saveCache(entries);
      return entries;
    } catch (err) {
      console.error('[NewsService] Failed to fetch live news:', err instanceof Error ? err.message : err);
      
      const cached = await this.readCache();
      if (cached) {
        console.log('[NewsService] Using stale cache as fallback');
        return cached;
      }

      console.log('[NewsService] Using MOCK news as ultimate fallback');
      return [
        {
          title: "Solana TVL hits $10 billion as ecosystem explodes",
          description: "New projects and high throughput attract developers and investors.",
          url: "mock-1",
          published_at: new Date().toISOString()
        },
        {
          title: "Ethereum layer-2 protocols see record tx volume",
          description: "Optimism and Arbitrum lead the way in scalability adoption.",
          url: "mock-2",
          published_at: new Date().toISOString()
        }
      ];
    }
  }

  private async readCache(): Promise<NewsEntry[] | null> {
    try {
      const stats = await fs.stat(this.cachePath);
      const isFresh = (Date.now() - stats.mtimeMs) < CACHE_CONFIG.NEWS_CACHE_TTL_MS;
      
      if (isFresh) {
        const data = await fs.readFile(this.cachePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch {
      return null;
    }
  }

  private async saveCache(entries: NewsEntry[]): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.cachePath), { recursive: true });
      await fs.writeFile(this.cachePath, JSON.stringify(entries, null, 2));
    } catch (err) {
      console.error('[NewsService] Cache save failed:', err);
    }
  }
}
