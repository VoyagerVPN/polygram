/**
 * Market Detail Page
 * Shows detailed market information with trading functionality
 */

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  AlertCircle,
  Info
} from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { PriceChart } from '@/components/PriceChart';
import { TradeModal } from '@/components/TradeModal';
import { usePolygramStore } from '@/store/usePolygramStore';
import { api } from '@/api/client';
import type { MarketData } from '@/types';
import { formatNumber, formatTimeLeft } from '@/helpers/format';

export const MarketDetailPage: FC = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const { userBalance } = usePolygramStore();
  
  const [market, setMarket] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeOutcome, setTradeOutcome] = useState<'YES' | 'NO'>('YES');
  const [priceHistory, setPriceHistory] = useState<{ timestamp: string; price: number }[]>([]);

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
    } catch (err) {
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
    fetchMarketData(); // Refresh market data after trade
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
        <Header title="Market" showBackButton onBack={() => navigate('/')} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-[var(--app-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
        <Header title="Market" showBackButton onBack={() => navigate('/')} />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-slate-400 text-center">{error || 'Market not found'}</p>
          <button 
            onClick={fetchMarketData}
            className="mt-4 px-6 py-2 bg-[var(--app-primary)] rounded-xl text-white font-bold"
          >
            Retry
          </button>
        </div>
        <BottomNav />
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
        title="Market Details" 
        showBackButton 
        onBack={() => navigate('/')} 
        balance={userBalance}
      />

      <main className="relative z-10 pt-16 pb-32 px-4 max-w-md mx-auto">
        {/* Market Question Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 mb-4"
        >
          <h1 className="text-xl font-bold text-white leading-tight mb-4">
            {market.question}
          </h1>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Ends {formatTimeLeft(market.expiresAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{formatNumber(market.qYes + market.qNo)} TON Vol</span>
            </div>
          </div>
        </motion.section>

        {/* Price Display */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <div className="glass-card rounded-xl p-4 border-l-4 border-[var(--app-success)]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[var(--app-success)]" />
              <span className="text-xs font-bold text-slate-400 uppercase">Yes</span>
            </div>
            <div className="text-2xl font-black text-white">{yesPercent}¢</div>
            <div className="text-xs text-slate-500">Probability</div>
          </div>
          
          <div className="glass-card rounded-xl p-4 border-l-4 border-[var(--app-danger)]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-[var(--app-danger)]" />
              <span className="text-xs font-bold text-slate-400 uppercase">No</span>
            </div>
            <div className="text-2xl font-black text-white">{noPercent}¢</div>
            <div className="text-xs text-slate-500">Probability</div>
          </div>
        </motion.section>

        {/* Price Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4 mb-4"
        >
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Price History
          </h3>
          <PriceChart data={priceHistory.map(p => ({ time: p.timestamp, value: p.price }))} />
        </motion.section>

        {/* Market Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 mb-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[var(--app-primary)] mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white mb-2">About this market</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {market.description || 'This market will resolve based on verified sources at the specified end date. The outcome is determined by consensus from reliable data sources.'}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Resolution Criteria */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5"
        >
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Resolution Criteria
          </h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-[var(--app-primary)]">•</span>
              <span>Market resolves when the specified date is reached</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--app-primary)]">•</span>
              <span>Outcome determined by verified external data sources</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--app-primary)]">•</span>
              <span>In case of disputes, AI oracle makes final decision</span>
            </li>
          </ul>
        </motion.section>
      </main>

      {/* Fixed Trade Buttons */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-[88px] left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="glass-card rounded-2xl p-4 flex gap-3">
          <motion.button
            className="flex-1 bg-[var(--app-success)] text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(11,218,94,0.3)]"
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTrade('YES')}
          >
            <TrendingUp className="w-4 h-4" />
            Buy Yes {yesPercent}¢
          </motion.button>
          <motion.button
            className="flex-1 bg-[var(--app-danger)] text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,59,48,0.3)]"
            whileTap={{ scale: 0.98 }}
            onClick={() => handleTrade('NO')}
          >
            <TrendingDown className="w-4 h-4" />
            Buy No {noPercent}¢
          </motion.button>
        </div>
      </motion.div>

      <BottomNav />

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
