import type { FC } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, TrendingUp, Database, History } from 'lucide-react';
import { usePolygramStore } from '@/store/usePolygramStore';
import { useMarkets } from '@/hooks/useMarkets';
import { useRealtime } from '@/hooks/useRealtime';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { MarketCard } from '@/components/MarketCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

// Filter tabs
const filterTabs = [
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'closing', label: 'Closing Soon', icon: Clock },
  { id: 'volume', label: 'High Volume', icon: TrendingUp },
];

// Featured market (mock data based on design)
const featuredMarket = {
  id: 'eth-5000',
  question: 'Will ETH reach $5,000 by end of year?',
  imageUrl: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&auto=format&fit=crop',
  yesPercent: 65,
  noPercent: 35,
  volume: 1200000,
  endsIn: '2d',
  isFeatured: true,
};

export const IndexPage: FC = () => {
  const { userBalance } = usePolygramStore();
  const { markets, isLoading, error, refetch } = useMarkets();
  const [activeFilter, setActiveFilter] = useState('trending');
  
  // Real-time updates
  useRealtime();

  const handleTrade = (marketId: string, isYes: boolean) => {
    console.log('Trade:', { marketId, isYes });
  };

  return (
    <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
      {/* Gradient Background */}
      <div className="gradient-bg" />
      
      {/* Header */}
      <Header balance={userBalance} />
      
      {/* Main Content */}
      <main className="relative z-10 pt-16 pb-28 px-4 max-w-md mx-auto">
        {/* Featured Market Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden cursor-pointer mb-6"
        >
          {/* Featured Image */}
          <div 
            className="relative w-full aspect-[21/9] bg-cover bg-center"
            style={{ backgroundImage: `url('${featuredMarket.imageUrl}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e11] via-transparent to-transparent opacity-60" />
            <div className="absolute top-3 left-4 flex gap-2">
              <span className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                Featured
              </span>
            </div>
          </div>
          
          {/* Featured Content */}
          <div className="p-5 space-y-4">
            <h3 className="text-xl font-bold leading-tight text-white tracking-tight">
              {featuredMarket.question}
            </h3>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="text-[var(--app-success)]">{featuredMarket.yesPercent}% Yes</span>
                <span className="text-[var(--app-danger)]">{featuredMarket.noPercent}% No</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-[var(--app-success)] shadow-[0_0_12px_rgba(11,218,94,0.4)]" 
                  style={{ width: `${featuredMarket.yesPercent}%` }}
                />
              </div>
            </div>
            
            {/* Trade Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <motion.button 
                className="btn-yes h-12"
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); handleTrade(featuredMarket.id, true); }}
              >
                Yes
              </motion.button>
              <motion.button 
                className="btn-no h-12"
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); handleTrade(featuredMarket.id, false); }}
              >
                No
              </motion.button>
            </div>
            
            {/* Meta Info */}
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium pt-1">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 opacity-50" />
                <span>${(featuredMarket.volume / 1000000).toFixed(1)}M Vol</span>
              </div>
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 opacity-50" />
                <span>Ends in {featuredMarket.endsIn}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2.5 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide mb-2"
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6 text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-[0_8px_16px_rgba(255,255,255,0.1)]' 
                    : 'bg-[#1c2631] border border-white/5 text-slate-400 hover:text-slate-300'
                }`}
              >
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Markets Section */}
        <section>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header">Active Markets</h2>
            <span className="text-xs text-white/40">
              {markets.length} markets
            </span>
          </div>

          {/* Loading State */}
          {isLoading && markets.length === 0 && (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <ErrorMessage message={error} onRetry={refetch} />
          )}

          {/* Empty State */}
          {!isLoading && !error && markets.length === 0 && (
            <EmptyState
              title="No active markets"
              description="New prediction markets will appear here soon"
              icon="search"
            />
          )}

          {/* Markets List */}
          <div className="space-y-4">
            {markets.map((market, index) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MarketCard
                  market={market}
                  onTrade={handleTrade}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
