import { LMSRCalculator, MarketState } from '@polygram/shared';
import { UserService } from '../user/user.service.js';

export interface MarketProposal {
  question: string;
  description: string;
  expiresAt: Date;
  liquidityB: number;
}

export interface MarketData extends MarketState {
  id: string;
  question: string;
  status: string;
  b: number;
}

export interface IMarketRepository {
  findById(id: string): Promise<MarketState | null>;
  findAll(): Promise<MarketData[]>;
  updateState(id: string, newState: MarketState): Promise<void>;
  createPending(proposal: MarketProposal): Promise<string>;
  setStatus(id: string, status: 'OPEN' | 'PENDING' | 'CLOSED'): Promise<void>;
}

export class MarketService {
  constructor(
    private repository: IMarketRepository,
    private userService: UserService
  ) {}

  async createFromProposal(proposal: MarketProposal): Promise<string> {
    return this.repository.createPending(proposal);
  }

  async approveMarket(id: string): Promise<void> {
    await this.repository.setStatus(id, 'OPEN');
  }

  async getAllMarkets(): Promise<MarketData[]> {
    return this.repository.findAll();
  }

  async getMarketPrice(id: string): Promise<number> {
    const state = await this.repository.findById(id);
    if (!state) throw new Error('Market not found');
    return LMSRCalculator.calculatePrice(state);
  }
}
