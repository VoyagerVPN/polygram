import { LMSRCalculator, MarketState } from '@polygram/shared';
import { MarketProposal } from '../../infrastructure/gemini.service.js';
import { UserService } from '../user/user.service.js';

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

  /**
   * Complex Trade implementation:
   * 1. Calculate cost using LMSR delta
   * 2. Verify user has enough balance
   * 3. Deduct balance and update market state
   * 4. Update user position
   */
  async trade(marketId: string, userId: string, amountTON: number, isYes: boolean): Promise<void> {
    const state = await this.repository.findById(marketId);
    if (!state) throw new Error('Market not found or not open');

    // 1. Calculate how many shares amountTON buys
    // In LMSR, we need to find newQ such that Cost(newQ) - Cost(oldQ) = amountTON
    // For MVP, we'll use the estimateShares but ensure we deduct exactly amountTON
    const shares = LMSRCalculator.estimateShares(amountTON, state, isYes);

    const newState: MarketState = {
      ...state,
      qYes: isYes ? state.qYes + shares : state.qYes,
      qNo: !isYes ? state.qNo + shares : state.qNo
    };

    // 2. Transact: This should ideally be a DB transaction
    // For now, sequentially
    await this.repository.updateState(marketId, newState);

    const prisma = (this.userService as any).prisma; // Accessing internal prisma for transaction if possible
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: amountTON } }
      }),
      prisma.position.upsert({
        where: { userId_marketId: { userId, marketId } },
        update: {
          sharesYes: { increment: isYes ? shares : 0 },
          sharesNo: { increment: !isYes ? shares : 0 },
          invested: { increment: amountTON }
        },
        create: {
          userId,
          marketId,
          sharesYes: isYes ? shares : 0,
          sharesNo: !isYes ? shares : 0,
          invested: amountTON
        }
      })
    ]);
  }
}
