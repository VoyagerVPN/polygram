/**
 * Portfolio Page
 * Shows user portfolio with real data from API
 */

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  Clock,
  Package,
  TrendingUp,
  TrendingDown,
  Wallet,
  Gift,
  ArrowRightLeft
} from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { api } from '@/api/client';
import type { PortfolioData, PortfolioPosition, Transaction } from '@/types';
import { formatNumber } from '@/helpers/format';

const TRANSACTION_ICONS: Record<string, FC<{ className?: string }>> = {
  BUY_YES: TrendingUp,
  BUY_NO: TrendingDown,
  SELL_YES: ArrowRightLeft,
  SELL_NO: ArrowRightLeft,
  DEPOSIT: Wallet,
  WITHDRAW: Wallet,
  WIN_PAYOUT: Gift,
};

const TRANSACTION_COLORS: Record<string, string> = {
  BUY_YES: 'text-[var(--app-success)]',
  BUY_NO: 'text-[var(--app-danger)]',
  SELL_YES: 'text-[var(--app-primary)]',
  SELL_NO: 'text-[var(--app-primary)]',
  DEPOSIT: 'text-[var(--app-success)]',
  WITHDRAW: 'text-[var(--app-danger)]',
  WIN_PAYOUT: 'text-yellow-400',
};

const TRANSACTION_LABELS: Record<string, string> = {
  BUY_YES: 'Buy YES',
  BUY_NO: 'Buy NO',
  SELL_YES: 'Sell YES',
  SELL_NO: 'Sell NO',
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdraw',
  WIN_PAYOUT: 'Win Payout',
};

export const PortfolioPage: FC = () => {
  
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [portfolioData, positionsData, transactionsData] = await Promise.all([
        api.getPortfolio(),
        api.getPositions(),
        api.getTransactions(),
      ]);
      
      setPortfolio(portfolioData);
      setPositions(positionsData);
      setTransactions(transactionsData);
    } catch (err) {
      setError('Failed to load portfolio data');
      console.error('Portfolio fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPnL = portfolio?.unrealizedPnL || 0;
  const isPositive = totalPnL >= 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
        <Header title="Portfolio" />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-[var(--app-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
        <Header title="Portfolio" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-slate-400 text-center mb-4">{error}</p>
          <button 
            onClick={fetchPortfolioData}
            className="px-6 py-2 bg-[var(--app-primary)] rounded-xl text-white font-bold"
          >
            Retry
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
      <Header title="Portfolio" />
      
      <main className="relative z-10 pt-16 pb-28 px-4 max-w-md mx-auto">
        {/* Portfolio Summary Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flat-card rounded-2xl p-6 mb-6"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
                Total Portfolio
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black tracking-tight text-white tabular-nums">
                  {formatNumber(portfolio?.totalBalance || 0)}
                </h2>
                <span className="text-[var(--app-primary)] text-sm font-black">TON</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                ≈ ${formatNumber((portfolio?.totalBalance || 0) * 5.2)} USD
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
                P&L
              </p>
              <div className={`font-black text-xl tabular-nums ${isPositive ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'}`}>
                {isPositive ? '+' : ''}{formatNumber(totalPnL)} TON
              </div>
              <div className={`text-[10px] font-black uppercase tracking-wider ${isPositive ? 'text-[var(--app-success)]/80' : 'text-[var(--app-danger)]/80'}`}>
                {isPositive ? '+' : ''}{portfolio?.unrealizedPnL ? ((portfolio.unrealizedPnL / (portfolio.investedAmount || 1)) * 100).toFixed(2) : '0.00'}%
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.button 
              className="bg-[var(--app-primary)] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(50,137,236,0.3)] transition-all opacity-50 cursor-not-allowed"
              whileTap={{ scale: 0.96 }}
              disabled
            >
              <ArrowDownRight className="w-4 h-4" />
              Deposit
            </motion.button>
            <motion.button 
              className="bg-[#1c2631] border border-white/5 text-slate-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-700/50 transition-all opacity-50 cursor-not-allowed"
              whileTap={{ scale: 0.96 }}
              disabled
            >
              <ArrowUpRight className="w-4 h-4" />
              Send
            </motion.button>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="flat-card rounded-2xl p-4 border-white/5">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 opacity-70">
              Active Stakes
            </p>
            <p className="text-lg font-black text-white tabular-nums">
              {formatNumber(portfolio?.investedAmount || 0)} TON
            </p>
          </div>
          <div className="flat-card rounded-2xl p-4 border-white/5">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 opacity-70">
              Win Rate
            </p>
            <p className="text-lg font-black text-white tabular-nums">
              {portfolio?.winRate || 0}%
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex mb-4"
        >
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'positions' 
                ? 'text-white border-b-2 border-[var(--app-primary)]' 
                : 'text-slate-500'
            }`}
          >
            Positions ({positions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'history' 
                ? 'text-white border-b-2 border-[var(--app-primary)]' 
                : 'text-slate-500'
            }`}
          >
            History ({transactions.length})
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'positions' ? (
            <motion.div
              key="positions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {positions.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">No active positions</p>
                  <p className="text-slate-600 text-xs mt-1">Start trading to see your positions here</p>
                </div>
              ) : (
                positions.map((position, index) => (
                  <PositionCard key={position.id} position={position} index={index} />
                ))
              )}
            </motion.div>
          ) : (
            <TransactionHistoryList transactions={transactions} />
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
};

// Position Card Component
interface PositionCardProps {
  position: PortfolioPosition;
  index: number;
}

const PositionCard: FC<PositionCardProps> = ({ position, index }) => {
  const hasYesPosition = position.sharesYes > 0;
  const isPositive = position.unrealizedPnL >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c2631] to-[#161C26] border border-white/5 shadow-2xl"
    >
      {/* Left accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full shadow-[0_0_15px_rgba(50,137,236,0.5)] ${
        hasYesPosition ? 'bg-[var(--app-success)]' : 'bg-[var(--app-danger)]'
      }`} />
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`flex size-1.5 rounded-full animate-pulse ${
                hasYesPosition ? 'bg-[var(--app-success)]' : 'bg-[var(--app-danger)]'
              }`} />
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                hasYesPosition ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'
              }`}>
                {hasYesPosition ? 'YES Position' : 'NO Position'}
              </span>
            </div>
            <h4 className="text-base font-bold leading-snug text-white group-hover:text-[var(--app-primary)] transition-colors line-clamp-2">
              {position.market.question}
            </h4>
            <p className="text-[10px] text-slate-500 mt-1">
              Ends {new Date(position.market.expiresAt).toLocaleDateString()}
            </p>
          </div>
          <div className={`text-right px-3 py-2.5 rounded-2xl border backdrop-blur-md ${
            isPositive 
              ? 'bg-[var(--app-success)]/5 border-[var(--app-success)]/10' 
              : 'bg-[var(--app-danger)]/5 border-[var(--app-danger)]/10'
          }`}>
            <p className={`text-[8px] uppercase font-black tracking-tighter leading-none mb-1.5 ${
              isPositive ? 'text-[var(--app-success)]/60' : 'text-[var(--app-danger)]/60'
            }`}>
              Unrealized P&L
            </p>
            <p className={`text-base font-black leading-none tabular-nums ${
              isPositive ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'
            }`}>
              {isPositive ? '+' : ''}{formatNumber(position.unrealizedPnL)} <span className="text-[9px]">TON</span>
            </p>
            <p className={`text-[9px] font-bold mt-1 ${
              isPositive ? 'text-[var(--app-success)]/80' : 'text-[var(--app-danger)]/80'
            }`}>
              {isPositive ? '+' : ''}{position.pnlPercent.toFixed(2)}%
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2.5 p-2 bg-black/30 rounded-2xl border border-white/5">
          <div className="bg-[#1c2631]/60 rounded-xl p-3">
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1.5">
              Invested
            </p>
            <p className="text-xs font-bold text-slate-200 tabular-nums">
              {formatNumber(position.invested)} <span className="text-[8px] text-slate-500">TON</span>
            </p>
          </div>
          <div className="bg-[#1c2631]/60 rounded-xl p-3">
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1.5">
              Current Value
            </p>
            <p className="text-xs font-bold text-[var(--app-primary)] tabular-nums">
              {formatNumber(position.currentValue)} <span className="text-[8px] opacity-70">TON</span>
            </p>
          </div>
          <div className="bg-[#1c2631]/60 rounded-xl p-3">
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1.5">
              Shares
            </p>
            <p className="text-xs font-bold text-white tabular-nums">
              {formatNumber(hasYesPosition ? position.sharesYes : position.sharesNo)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Transaction History Component
interface TransactionHistoryListProps {
  transactions: Transaction[];
}

const TransactionHistoryList: FC<TransactionHistoryListProps> = ({ transactions }) => {
  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-3"
    >
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No transactions yet</p>
          <p className="text-slate-600 text-xs mt-1">Your trading activity will appear here</p>
        </div>
      ) : (
        transactions.map((tx, index) => {
          const Icon = TRANSACTION_ICONS[tx.type] || ArrowRightLeft;
          const colorClass = TRANSACTION_COLORS[tx.type] || 'text-slate-400';
          const label = TRANSACTION_LABELS[tx.type] || tx.type;
          const isPositive = ['WIN_PAYOUT', 'DEPOSIT', 'SELL_YES', 'SELL_NO'].includes(tx.type);

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-[#1c2631]/50 border border-white/5"
            >
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{label}</p>
                {tx.marketQuestion && (
                  <p className="text-xs text-slate-500 truncate">{tx.marketQuestion}</p>
                )}
                <p className="text-[10px] text-slate-600">
                  {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold tabular-nums ${isPositive ? 'text-[var(--app-success)]' : 'text-white'}`}>
                  {isPositive ? '+' : '-'}{formatNumber(Math.abs(tx.amount))} TON
                </p>
                {tx.shares && (
                  <p className="text-[10px] text-slate-500">
                    {formatNumber(tx.shares)} shares
                  </p>
                )}
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
};
