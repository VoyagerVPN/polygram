import type { FC } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, User, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  icon: typeof BarChart3;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'markets', icon: BarChart3, label: 'Markets', path: '/' },
  { id: 'leaderboard', icon: Trophy, label: 'Top', path: '/leaderboard' },
  { id: 'portfolio', icon: PieChart, label: 'Portfolio', path: '/portfolio' },
  { id: 'menu', icon: User, label: 'Menu', path: '/menu' },
];

export const BottomNav: FC = () => {
  const location = useLocation();
  const activeTab = navItems.find(item => item.path === location.pathname)?.id || 'markets';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] nav-blur">
      <div className="max-w-md mx-auto flex justify-around items-center px-4 pb-safe pt-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 relative ${
                isActive ? 'text-[var(--tg-theme-button-color,#3390ec)]' : 'text-white/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white/5 rounded-2xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon 
                size={24} 
                className={`relative z-10 transition-colors duration-200 ${
                  isActive ? 'fill-current' : ''
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="relative z-10 text-[10px] font-semibold transition-colors duration-200">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
