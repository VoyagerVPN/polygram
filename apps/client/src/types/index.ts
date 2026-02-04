/**
 * Application type definitions
 */

import type { MarketState } from '@polygram/shared';

// Market Types
export interface MarketData extends MarketState {
  id: string;
  question: string;
  description?: string;
  imageUrl?: string;
  expiresAt: string;
  createdAt: string;
  status: MarketStatus;
  outcome?: Outcome;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type MarketStatus = 'PENDING' | 'OPEN' | 'RESOLVING' | 'CLOSED' | 'RESOLVED';
export type Outcome = 'YES' | 'NO';
export type UserRole = 'USER' | 'PRO';

export interface User {
  id: string;
  telegramId: string;
  username?: string;
  tonAddress?: string;
  avatarUrl?: string;
  balance: number;
  role: UserRole;
  referralCode: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  multiplier: number;
  unlockedAt?: string;
}

export interface Position {
  id: string;
  marketId: string;
  sharesYes: number;
  sharesNo: number;
  invested: number;
  unrealizedPnL?: number;
}

// API Response Types
export interface MarketsResponse {
  markets: MarketData[];
  total: number;
}

export interface MarketHistoryResponse {
  history: PriceHistoryPoint[];
}

export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
}

// WebSocket Types
export interface WSMessage {
  type: WSMessageType;
  marketId: string;
  qYes: number;
  qNo: number;
  timestamp: string;
}

export type WSMessageType = 'MARKET_UPDATE' | 'MARKET_RESOLVED' | 'PING';

// UI Types
export interface TradeButtonProps {
  type: 'yes' | 'no';
  percentage: number;
  onClick: () => void;
  disabled?: boolean;
}

export interface MarketCardProps {
  market: MarketData;
  onTrade: (marketId: string, isYes: boolean) => void;
}

export interface HeaderProps {
  balance: number;
  currency?: string;
}

// Store Types
export interface PolygramState {
  // Markets
  markets: MarketData[];
  isLoading: boolean;
  error: string | null;
  
  // User Data
  user: User | null;
  userBalance: number;
  positions: Position[];
  achievements: Achievement[];
  
  // Actions
  setMarkets: (markets: MarketData[]) => void;
  updateMarket: (id: string, newState: Partial<MarketState>) => void;
  setBalance: (balance: number) => void;
  setUser: (user: User | null) => void;
  setPositions: (positions: Position[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Trading Types
export interface TradeRequest {
  marketId: string;
  outcome: 'YES' | 'NO';
  amount: number;
}

export interface TradeResponse {
  success: boolean;
  transactionId: string;
  sharesReceived: number;
  price: number;
  newBalance: number;
}

export interface PortfolioData {
  totalBalance: number;
  availableBalance: number;
  investedAmount: number;
  unrealizedPnL: number;
  winRate: number;
  totalTrades: number;
}

export interface PortfolioPosition {
  id: string;
  marketId: string;
  market: {
    question: string;
    status: MarketStatus;
    expiresAt: string;
  };
  sharesYes: number;
  sharesNo: number;
  invested: number;
  currentValue: number;
  unrealizedPnL: number;
  pnlPercent: number;
}

// Transaction Type
export interface Transaction {
  id: string;
  type: 'BUY_YES' | 'BUY_NO' | 'SELL_YES' | 'SELL_NO' | 'DEPOSIT' | 'WITHDRAW' | 'WIN_PAYOUT';
  amount: number;
  marketId?: string;
  marketQuestion?: string;
  price?: number;
  shares?: number;
  createdAt: string;
}

