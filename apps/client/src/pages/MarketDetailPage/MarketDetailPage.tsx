import type { FC } from 'react';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Info
} from 'lucide-react';
import { Header } from '@/components/Header';
import { TradeModal } from '@/components/TradeModal';
import { usePolygramStore } from '@/store/usePolygramStore';
import { api } from '@/api/client';
import type { MarketData, PriceHistoryPoint } from '@/types';
import { formatNumber } from '@/helpers/format';
import { 
  Card, 
  TradeButton,
  LoadingSpinner,
  ErrorMessage 
} from '@/components/ui';

// Lazy load PriceChart (heavy dependency)
const PriceChart = lazy(() => import('@/components/PriceChart'));

export const MarketDetailPage: FC = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const { userBalance } = usePolygramStore();
  
  const [market, setMarket] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeOutcome, setTradeOutcome] = useState<'YES' | 'NO'>('YES');
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);

  useEffect(() => {
    if (marketId) {
      fetchMarketData();
      fetchPriceHistory();
    }
  }, [marketId]);

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMarket(marketId!);
      setMarket(data);
    } catch {
      setError('Failed to load market data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const history = await api.getMarketHistory(marketId!);
      setPriceHistory(history);
    } catch (err) {
      console.error('Failed to load price history:', err);
    }
  };

  const handleTrade = (outcome: 'YES' | 'NO') => {
    setTradeOutcome(outcome);
    setIsTradeModalOpen(true);
  };

  const handleTradeComplete = () => {
    setIsTradeModalOpen(false);
    fetchMarketData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
        <Header title="Рынок" showBackButton onBack={() => navigate('/')} />
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
        <Header title="Рынок" showBackButton onBack={() => navigate('/')} />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <ErrorMessage
            title={error ? 'Ошибка загрузки' : 'Рынок не найден'}
            message={error ? 'Не удалось загрузить данные рынка' : 'Запрашиваемый рынок не существует'}
            onRetry={fetchMarketData}
          />
        </div>
      </div>
    );
  }

  const yesPrice = market.qYes / (market.qYes + market.qNo);
  const noPrice = 1 - yesPrice;
  const yesPercent = Math.round(yesPrice * 100);
  const noPercent = Math.round(noPrice * 100);

  return (
    <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
      <Header 
        title="Детали рынка" 
        showBackButton 
        onBack={() => navigate('/')} 
        balance={userBalance}
      />

      <main className="relative z-10 pt-16 pb-32 px-4 max-w-md mx-auto">
        {/* Market Question Card */}
        <Card variant="glass" className="mb-4">
          <h1 className="text-xl font-bold text-white leading-tight mb-4">
            {market.question}
          </h1>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>До {new Date(market.expiresAt).toLocaleDateString('ru-RU')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{formatNumber(market.qYes + market.qNo)} TON Объём</span>
            </div>
          </div>
        </Card>

        {/* Price Display */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card 
            variant="glass" 
            padding="md" 
            radius="xl"
            className="border-l-4 border-l-[var(--app-success)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[var(--app-success)]" />
              <span className="text-xs font-bold text-slate-400 uppercase">Да</span>
            </div>
            <div className="text-2xl font-black text-white">{yesPercent}¢</div>
            <div className="text-xs text-slate-500">Вероятность</div>
          </Card>
          
          <Card 
            variant="glass" 
            padding="md" 
            radius="xl"
            className="border-l-4 border-l-[var(--app-danger)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-[var(--app-danger)]" />
              <span className="text-xs font-bold text-slate-400 uppercase">Нет</span>
            </div>
            <div className="text-2xl font-black text-white">{noPercent}¢</div>
            <div className="text-xs text-slate-500">Вероятность</div>
          </Card>
        </div>

        {/* Price Chart */}
        <Card variant="glass" className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            История цены
          </h3>
          <Suspense fallback={
            <div className="h-[120px] flex items-center justify-center text-xs text-white/20">
              Загрузка графика...
            </div>
          }>
            <PriceChart data={priceHistory} />
          </Suspense>
        </Card>

        {/* Market Info */}
        <Card variant="glass" className="mb-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[var(--app-primary)] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Об этом рынке</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {market.description || 'Этот рынок разрешится на основе проверенных источников в указанную дату окончания. Исход определяется консенсусом надежных источников данных.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Resolution Criteria */}
        <Card variant="glass">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Критерии разрешения
          </h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-[var(--app-primary)]">•</span>
              <span>Рынок разрешается при наступлении указанной даты</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--app-primary)]">•</span>
              <span>Исход определяется проверенными внешними источниками</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--app-primary)]">•</span>
              <span>В случае споров финальное решение принимает AI-оракул</span>
            </li>
          </ul>
        </Card>
      </main>

      {/* Fixed Trade Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b0e11]/80 backdrop-blur-xl border-t border-white/5 pt-4 pb-safe px-4">
        <div className="max-w-md mx-auto flex gap-3">
          <TradeButton 
            outcome="YES" 
            price={yesPercent}
            onClick={() => handleTrade('YES')}
          />
          <TradeButton 
            outcome="NO" 
            price={noPercent}
            onClick={() => handleTrade('NO')}
          />
        </div>
      </div>

      {/* Trade Modal */}
      <AnimatePresence>
        {isTradeModalOpen && (
          <TradeModal
            market={market}
            outcome={tradeOutcome}
            onClose={() => setIsTradeModalOpen(false)}
            onComplete={handleTradeComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
