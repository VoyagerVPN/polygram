import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock, TrendingUp, Database } from 'lucide-react';
import { usePolygramStore } from '@/store/usePolygramStore';
import { useMarkets } from '@/hooks/useMarkets';
import { useRealtime } from '@/hooks/useRealtime';
import { formatNumber } from '@/helpers/format';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { MarketCard } from '@/components/MarketCard';
import { 
  Card, 
  Badge, 
  TradeButton,
  FilterChip,
  SkeletonCard,
  EmptyState,
  ErrorMessage 
} from '@/components/ui';

// Filter tabs configuration
const filterTabs = [
  { id: 'trending', label: 'В тренде', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'closing', label: 'Завершаются', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'volume', label: 'Объём', icon: <TrendingUp className="w-3.5 h-3.5" /> },
] as const;

export const IndexPage: FC = () => {
  const navigate = useNavigate();
  const { userBalance } = usePolygramStore();
  const { markets, isLoading, error, refetch } = useMarkets();
  const [activeFilter, setActiveFilter] = useState<string>('trending');
  
  useRealtime();

  const handleTrade = (marketId: string, isYes: boolean) => {
    // Navigate to market detail for trading
    navigate(`/market/${marketId}?trade=${isYes ? 'yes' : 'no'}`);
  };

  const featured = markets.length > 0 ? markets[0] : null;
  const volume = featured ? featured.qYes + featured.qNo : 0;

  return (
    <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
      <Header balance={userBalance} />
      
      <main className="relative z-10 pt-16 pb-28 px-4 max-w-md mx-auto">
        {/* Featured Market */}
        {featured && (
          <Card 
            variant="glass" 
            padding="none" 
            radius="3xl"
            className="overflow-hidden cursor-pointer mb-8 shadow-2xl border-white/10"
            onClick={() => navigate(`/market/${featured.id}`)}
          >
            {/* Featured Image */}
            <div className="relative w-full aspect-[21/10] overflow-hidden">
              <img 
                src={featured.imageUrl || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800'} 
                alt="Featured"
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e11] via-[#0b0e11]/40 to-transparent" />
              <div className="absolute top-4 left-5">
                <Badge variant="info" size="md">
                  В тренде
                </Badge>
              </div>
            </div>
            
            {/* Featured Content */}
            <div className="p-6 space-y-5 -mt-8 relative z-10">
              <h3 className="text-2xl font-black leading-tight text-white tracking-tight drop-shadow-md">
                {featured.question}
              </h3>
              
              {/* Trade Buttons */}
              <div className="flex gap-3">
                <TradeButton 
                  outcome="YES"
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleTrade(featured.id, true);
                  }}
                />
                <TradeButton 
                  outcome="NO"
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleTrade(featured.id, false);
                  }}
                />
              </div>
              
              {/* Meta */}
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-2">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 opacity-60" />
                  <span>{formatNumber(volume)} TON Объём</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 opacity-60" />
                  <span>До {new Date(featured.expiresAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2.5 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide mb-2">
          {filterTabs.map((tab) => (
            <FilterChip
              key={tab.id}
              isActive={activeFilter === tab.id}
              leftIcon={tab.icon}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </FilterChip>
          ))}
        </div>

        {/* Markets Section */}
        <section>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="text-[14px] font-black uppercase tracking-[0.15em] text-slate-500">
              Активные рынки
            </h2>
            <Badge>{markets.length}</Badge>
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
            <ErrorMessage 
              message="Ошибка загрузки рынков" 
              onRetry={refetch}
              compact 
            />
          )}

          {/* Empty State */}
          {!isLoading && !error && markets.length === 0 && (
            <EmptyState
              icon="search"
              title="Рынков не найдено"
              description="Новые рынки предсказаний появятся здесь в ближайшее время"
            />
          )}

          {/* Markets List */}
          <div className="space-y-4">
            {markets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onTrade={handleTrade}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};
