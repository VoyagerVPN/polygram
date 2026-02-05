import type { FC } from 'react';
import { useState } from 'react';
import { TrendingUp, Share2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { usePolygramStore } from '@/store/usePolygramStore';
import { Card, IconButton, TabButton } from '@/components/ui';

// Mock leaderboard data
const topTraders = [
  { rank: 2, username: '@AlexTON', profit: 842.10, avatar: 'https://i.pravatar.cc/100?img=11', winRate: 72 },
  { rank: 1, username: '@CryptoWhale', profit: 1240.50, avatar: 'https://i.pravatar.cc/100?img=12', winRate: 78, isFirst: true },
  { rank: 3, username: '@SolanaMasta', profit: 612.30, avatar: 'https://i.pravatar.cc/100?img=13', winRate: 68 },
];

const otherTraders = [
  { rank: 4, username: '@Trader_Pro', profit: 245.20, roi: 45, winRate: 70 },
  { rank: 5, username: '@MoonShot', profit: 198.50, roi: 38, winRate: 65 },
  { rank: 6, username: '@DiamondHands', profit: 156.80, roi: 32, winRate: 62 },
  { rank: 7, username: '@BullRun', profit: 134.40, roi: 28, winRate: 58 },
];

const periods = ['Daily', 'Weekly', 'All Time'] as const;

export const LeaderboardPage: FC = () => {
  const { userBalance } = usePolygramStore();
  const [activePeriod, setActivePeriod] = useState<typeof periods[number]>('Daily');

  const userRank = 124;
  const userProfit = 42.50;

  return (
    <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
      <Header title="Leaderboard" balance={userBalance} />
      
      <main className="relative z-10 pt-16 pb-36 px-4 max-w-md mx-auto">
        {/* Period Filter */}
        <div className="flex justify-center mb-10">
          <div className="flex p-1 bg-[#1c2631] border border-white/5 rounded-2xl">
            {periods.map((period) => (
              <TabButton
                key={period}
                isActive={activePeriod === period}
                onClick={() => setActivePeriod(period)}
                className="flex-initial px-6"
              >
                {period}
              </TabButton>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        <Card 
          variant="flat" 
          padding="lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between gap-2 pt-6 pb-12 px-6 mb-6"
        >
          {/* Rank 2 */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-4 group">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--app-silver)] bg-slate-800 p-0.5 shadow-[0_0_20px_rgba(148,163,184,0.2)]">
                <img className="w-full h-full object-cover rounded-full" src={topTraders[0].avatar} alt="" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--app-silver)] text-slate-900 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0b0e11]">
                2
              </div>
            </div>
            <p className="text-[11px] font-bold text-white mb-1 truncate w-20 text-center">{topTraders[0].username}</p>
            <p className="text-[10px] font-black text-[var(--app-success)]">+{topTraders[0].profit.toFixed(0)} TON</p>
          </div>

          {/* Rank 1 */}
          <div className="flex flex-col items-center flex-1 -mt-8 scale-110">
            <div className="relative mb-5">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-4 h-4 text-[var(--app-gold)]">👑</div>
              </div>
              <div className="w-20 h-20 rounded-full border-2 border-[var(--app-gold)] bg-slate-800 p-1 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                <img className="w-full h-full object-cover rounded-full" src={topTraders[1].avatar} alt="" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--app-gold)] text-slate-900 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0b0e11]">
                1
              </div>
            </div>
            <p className="text-sm font-black text-white mb-1 truncate w-24 text-center">{topTraders[1].username}</p>
            <p className="text-[11px] font-black text-[var(--app-success)]">+{topTraders[1].profit.toFixed(0)} TON</p>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--app-bronze)] bg-slate-800 p-0.5 shadow-[0_0_20px_rgba(168,162,158,0.2)]">
                <img className="w-full h-full object-cover rounded-full" src={topTraders[2].avatar} alt="" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--app-bronze)] text-slate-900 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0b0e11]">
                3
              </div>
            </div>
            <p className="text-[11px] font-bold text-white mb-1 truncate w-20 text-center">{topTraders[2].username}</p>
            <p className="text-[10px] font-black text-[var(--app-success)]">+{topTraders[2].profit.toFixed(0)} TON</p>
          </div>
        </Card>

        {/* Other Traders List */}
        <div className="space-y-3">
          {otherTraders.map((trader) => (
            <Card
              key={trader.rank}
              variant="flat"
              padding="md"
              radius="2xl"
              isInteractive
              className="flex items-center gap-4 h-20 px-5"
            >
              <span className="w-5 text-sm font-black text-slate-500 tabular-nums">{trader.rank}</span>
              <div className="w-12 h-12 rounded-full border border-white/10 p-0.5 overflow-hidden">
                <img 
                  className="w-full h-full object-cover rounded-full" 
                  src={`https://i.pravatar.cc/100?img=${trader.rank + 10}`} 
                  alt={trader.username}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate mb-1">{trader.username}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[var(--app-primary)] bg-[var(--app-primary)]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Tier 3
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 uppercase tracking-tighter">
                    <TrendingUp className="w-2.5 h-2.5 text-[var(--app-success)]" />
                    {trader.winRate}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[var(--app-success)] tabular-nums">+{trader.profit.toFixed(0)}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">TON</p>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* User Rank Card - Sticky Bottom above nav */}
      <div className="fixed bottom-[104px] left-4 right-4 z-[60] max-w-md mx-auto">
        <Card 
          variant="surface" 
          radius="3xl"
          className="px-5 py-4 flex items-center gap-4 border-[var(--app-primary)]/40 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center justify-center size-12 rounded-2xl bg-[var(--app-primary)]/20 border border-[var(--app-primary)]/30">
            <span className="text-xl font-black text-[var(--app-primary)] tabular-nums">{userRank}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-black text-white uppercase tracking-wider">Your Rank</p>
              <span className="text-[9px] font-black text-[var(--app-primary)] bg-[var(--app-primary)]/10 px-2 py-0.5 rounded-full uppercase">
                Top 12%
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">
              Profit: <span className="text-[var(--app-success)] font-black tabular-nums">+{userProfit.toFixed(1)} TON</span>
            </p>
          </div>
          <IconButton
            icon={<Share2 className="w-5 h-5 text-slate-400" />}
            aria-label="Поделиться"
            variant="secondary"
            size="md"
          />
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};
