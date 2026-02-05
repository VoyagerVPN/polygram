import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight,
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
import { 
  Card,
  Button,
  TabButton,
  PositionCard,
  EmptyState,
  LoadingSpinner,
  ErrorMessage
} from '@/components/ui';

const TRANSACTION_ICONS: Record<string, typeof TrendingUp> = {
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
  BUY_YES: 'Покупка ДА',
  BUY_NO: 'Покупка НЕТ',
  SELL_YES: 'Продажа ДА',
  SELL_NO: 'Продажа НЕТ',
  DEPOSIT: 'Пополнение',
  WITHDRAW: 'Вывод',
  WIN_PAYOUT: 'Выигрыш',
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
        <Header title="Портфель" />
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
        <Header title="Портфель" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <ErrorMessage
            title="Ошибка загрузки"
            message="Не удалось загрузить данные портфеля"
            onRetry={fetchPortfolioData}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
      <Header title="Портфель" />
      
      <main className="relative z-10 pt-16 pb-28 px-4 max-w-md mx-auto">
        {/* Portfolio Summary Card */}
        <Card 
          variant="glass" 
          className="mb-8 border-white/10"
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5">
                Общий баланс
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-black tracking-tight text-white tabular-nums">
                  {formatNumber(portfolio?.totalBalance || 0)}
                </h2>
                <span className="text-[var(--app-primary)] text-sm font-black tracking-tighter">TON</span>
              </div>
              <p className="text-[11px] text-slate-600 font-bold mt-2">
                ≈ ${formatNumber((portfolio?.totalBalance || 0) * 5.2)} USD
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5">
                P&L
              </p>
              <div className={`font-black text-2xl tabular-nums drop-shadow-sm ${isPositive ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]'}`}>
                {isPositive ? '+' : ''}{formatNumber(totalPnL)}
              </div>
              <div className={`text-[10px] font-black uppercase tracking-wider mt-1 ${isPositive ? 'text-[var(--app-success)]/80' : 'text-[var(--app-danger)]/80'}`}>
                {isPositive ? '+' : ''}{portfolio?.unrealizedPnL ? ((portfolio.unrealizedPnL / (portfolio.investedAmount || 1)) * 100).toFixed(2) : '0.00'}%
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="white" 
              leftIcon={<ArrowDownRight className="w-4 h-4" />}
            >
              Пополнить
            </Button>
            <Button 
              variant="secondary"
              leftIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Вывести
            </Button>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10 px-1">
          <Card variant="flat" padding="md" radius="2xl">
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
              В игре
            </p>
            <p className="text-lg font-black text-white tabular-nums">
              {formatNumber(portfolio?.investedAmount || 0)} <span className="text-[10px] opacity-40 italic">TON</span>
            </p>
          </Card>
          <Card variant="flat" padding="md" radius="2xl">
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
              Винрейт
            </p>
            <p className="text-lg font-black text-white tabular-nums">
              {portfolio?.winRate || 0}%
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-white/[0.03] p-1 rounded-2xl border border-white/5">
          <TabButton
            isActive={activeTab === 'positions'}
            count={positions.length}
            onClick={() => setActiveTab('positions')}
          >
            Позиции
          </TabButton>
          <TabButton
            isActive={activeTab === 'history'}
            count={transactions.length}
            onClick={() => setActiveTab('history')}
          >
            История
          </TabButton>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'positions' ? (
            <div key="positions" className="space-y-4">
              {positions.length === 0 ? (
                <EmptyState
                  icon="package"
                  title="Активных позиций нет"
                  description="Ваши сделки появятся здесь"
                />
              ) : (
                positions.map((position) => (
                  <PositionCard 
                    key={position.id}
                    outcome={position.sharesYes > 0 ? 'YES' : 'NO'}
                    isPositive={position.unrealizedPnL >= 0}
                  >
                    <PositionContent position={position} />
                  </PositionCard>
                ))
              )}
            </div>
          ) : (
            <TransactionHistoryList transactions={transactions} />
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
};

// Position Card Content Component
interface PositionContentProps {
  position: PortfolioPosition;
}

const PositionContent: FC<PositionContentProps> = ({ position }) => {
  const hasYesPosition = position.sharesYes > 0;
  const isPositive = position.unrealizedPnL >= 0;

  return (
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
              {hasYesPosition ? 'Позиция ДА' : 'Позиция НЕТ'}
            </span>
          </div>
          <h4 className="text-base font-bold leading-snug text-white hover:text-[var(--app-primary)] transition-colors line-clamp-2">
            {position.market.question}
          </h4>
          <p className="text-[10px] text-slate-500 mt-1">
            Завершается {new Date(position.market.expiresAt).toLocaleDateString('ru-RU')}
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
            Нереализованный P&L
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
            Инвестировано
          </p>
          <p className="text-xs font-bold text-slate-200 tabular-nums">
            {formatNumber(position.invested)} <span className="text-[8px] text-slate-500">TON</span>
          </p>
        </div>
        <div className="bg-[#1c2631]/60 rounded-xl p-3">
          <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1.5">
            Тек. Стоимость
          </p>
          <p className="text-xs font-bold text-[var(--app-primary)] tabular-nums">
            {formatNumber(position.currentValue)} <span className="text-[8px] opacity-70">TON</span>
          </p>
        </div>
        <div className="bg-[#1c2631]/60 rounded-xl p-3">
          <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1.5">
            Доли
          </p>
          <p className="text-xs font-bold text-white tabular-nums">
            {formatNumber(hasYesPosition ? position.sharesYes : position.sharesNo)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Transaction History Component
interface TransactionHistoryListProps {
  transactions: Transaction[];
}

const TransactionHistoryList: FC<TransactionHistoryListProps> = ({ transactions }) => {
  return (
    <div className="space-y-3">
      {transactions.length === 0 ? (
        <EmptyState
          icon="clock"
          title="История транзакций пуста"
          description="Здесь появится ваша торговая активность"
        />
      ) : (
        transactions.map((tx) => {
          const Icon = TRANSACTION_ICONS[tx.type] || ArrowRightLeft;
          const colorClass = TRANSACTION_COLORS[tx.type] || 'text-slate-400';
          const label = TRANSACTION_LABELS[tx.type] || tx.type;
          const isPositive = ['WIN_PAYOUT', 'DEPOSIT', 'SELL_YES', 'SELL_NO'].includes(tx.type);

          return (
            <div
              key={tx.id}
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
                    {formatNumber(tx.shares)} долей
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
