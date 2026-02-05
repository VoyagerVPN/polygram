import type { FC } from 'react';
import { 
  History, Trophy, Users, Wallet, Receipt, Bell, 
  Globe, DollarSign, Moon, BookOpen, BarChart3, Headphones,
  ChevronRight, Share2, Star, FileText
} from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { usePolygramStore } from '@/store/usePolygramStore';
import { Card, IconButton, Badge } from '@/components/ui';

interface MenuItem {
  label: string;
  icon: typeof History;
  desc: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "Activity & Growth",
    items: [
      { label: "My Activity", icon: History, desc: "Detailed trade history and results" },
      { label: "Achievements", icon: Trophy, desc: "Unlock badges and earn multipliers" },
      { label: "Referral Program", icon: Users, desc: "Earn 10% from friend's commissions", badge: "New" },
    ]
  },
  {
    title: "Wallet & Security",
    items: [
      { label: "Wallet Settings", icon: Wallet, desc: "Security, private keys and TON setup" },
      { label: "Transaction History", icon: Receipt, desc: "Internal transfers and deposits" },
      { label: "Notifications", icon: Bell, desc: "Price alerts and market outcomes" },
    ]
  },
  {
    title: "Preferences",
    items: [
      { label: "Language", icon: Globe, desc: "English (US)" },
      { label: "Currency Display", icon: DollarSign, desc: "Show values in USD or TON" },
      { label: "Theme", icon: Moon, desc: "Switch between Dark and AMOLED" },
    ]
  },
  {
    title: "Information",
    items: [
      { label: "Polygram Wiki", icon: BookOpen, desc: "Learn how markets resolve" },
      { label: "Platform Statistics", icon: BarChart3, desc: "Total TVL and volume data" },
      { label: "Support Chat", icon: Headphones, desc: "24/7 Support via Telegram" },
    ]
  }
];

export const MenuPage: FC = () => {
  const { userBalance } = usePolygramStore();

  return (
    <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)]">
      <Header title="Menu" balance={userBalance} />
      
      <main className="relative z-10 pt-16 pb-28 px-4 max-w-md mx-auto">
        {/* Profile Summary Card */}
        <Card 
          variant="surface" 
          radius="3xl"
          padding="xl"
          className="mb-8 overflow-hidden"
        >
          <div className="relative flex flex-col items-center">
            {/* Avatar with Halo Effect */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[var(--app-primary)] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="w-24 h-24 rounded-full border-2 border-[var(--app-primary)] p-1.5 bg-[#0b0e11] relative">
                <img 
                  className="w-full h-full rounded-full object-cover grayscale-[0.2]" 
                  src="https://i.pravatar.cc/200?img=33" 
                  alt="Profile"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-[var(--app-primary)] text-white p-1.5 rounded-full border-2 border-[#0b0e11] shadow-xl">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            {/* Profile Info */}
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">Alex.ton</h2>
            <div className="flex items-center gap-2 mb-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              <span>UQCv...4n2</span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span className="text-[var(--app-primary)]">PRO TIER</span>
            </div>

            {/* Tier Progress */}
            <div className="w-full space-y-3 bg-black/30 p-5 rounded-3xl border border-white/5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Next Tier Progress</span>
                <span className="text-white">82%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--app-primary)] shadow-[0_0_15px_rgba(50,137,236,0.4)] transition-all duration-1000"
                  style={{ width: '82%' }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-medium text-center">
                Trade <span className="text-white font-bold">150 TON</span> more to unlock Elite Tier
              </p>
            </div>
          </div>
        </Card>

        {/* Menu Sections */}
        <div className="space-y-10">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2 flex items-center justify-between">
                <span>{section.title}</span>
                <div className="h-px bg-white/5 flex-1 ml-4" />
              </h3>
              
              <div className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.label}
                      variant="flat"
                      padding="md"
                      radius="2xl"
                      isInteractive
                      className="w-full flex items-center gap-5 px-5 text-left group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[var(--app-primary)]/10 flex items-center justify-center shrink-0 border border-[var(--app-primary)]/10 shadow-inner group-hover:bg-[var(--app-primary)]/20 transition-colors">
                        <Icon className="w-6 h-6 text-[var(--app-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-[15px] font-black text-white">
                            {item.label}
                          </p>
                          {item.badge && (
                            <Badge variant="success" size="sm">{item.badge}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate opacity-80">
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-8 pb-4 flex flex-col items-center gap-4">
          <div className="flex gap-6">
            <IconButton
              icon={<Share2 className="w-5 h-5 text-slate-400" />}
              aria-label="Поделиться"
              variant="secondary"
              size="lg"
            />
            <IconButton
              icon={<Star className="w-5 h-5 text-slate-400" />}
              aria-label="Избранное"
              variant="secondary"
              size="lg"
            />
            <IconButton
              icon={<FileText className="w-5 h-5 text-slate-400" />}
              aria-label="Документы"
              variant="secondary"
              size="lg"
            />
          </div>
          <p className="text-[10px] text-[var(--tg-theme-hint-color,#7a8b99)]/60 font-medium uppercase tracking-widest">
            Polygram Markets v1.2.4
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
