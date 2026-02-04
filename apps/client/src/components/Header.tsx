import type { FC } from 'react';
import { motion } from 'framer-motion';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Wallet, ChevronLeft, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency } from '@/helpers/format';

interface HeaderProps {
  balance?: number;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Header: FC<HeaderProps> = ({ 
  balance, 
  title = 'Polygram', 
  showBackButton = false,
  onBack 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Auto-detect if we should show back button based on location
  const isHome = location.pathname === '/';
  const shouldShowBack = showBackButton || !isHome;
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-50 header-blur safe-top">
      <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
        {/* Left: Logo or Back */}
        <div className="flex items-center gap-2.5">
          {shouldShowBack ? (
            <motion.button 
              onClick={handleBack}
              className="flex items-center justify-center -ml-2 p-1 active:opacity-60"
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-7 h-7 text-white" />
            </motion.button>
          ) : (
            <motion.div 
              className="bg-primary/10 p-1.5 rounded-lg border border-primary/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-[22px] h-[22px] text-[var(--tg-theme-button-color,#3390ec)]" />
            </motion.div>
          )}
          <h1 className="text-base font-semibold tracking-tight text-white">{title}</h1>
        </div>

        {/* Right: Balance & Connect */}
        <div className="flex items-center gap-3">
          {balance !== undefined && (
            <motion.div 
              className="bg-[var(--tg-theme-section-bg-color,#151b21)] border border-[var(--tg-theme-hint-color,#232A35)] rounded-full px-3 py-1.5 flex items-center gap-1.5"
              whileHover={{ scale: 1.02 }}
            >
              <Wallet className="w-4 h-4 text-[var(--tg-theme-button-color,#3390ec)]" />
              <span className="text-xs font-bold text-white tabular-nums">
                {formatCurrency(balance)} TON
              </span>
            </motion.div>
          )}
          <div className="scale-90 origin-right">
            <TonConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};
