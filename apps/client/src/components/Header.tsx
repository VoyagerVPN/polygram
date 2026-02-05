import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Wallet, ChevronLeft, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/helpers/format';
import { IconButton } from '@/components/ui';

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
      <div className="flex items-center justify-between px-4 py-2.5 max-w-md mx-auto">
        {/* Left: Logo or Back */}
        <div className="flex items-center gap-2 min-w-0">
          {shouldShowBack ? (
            <IconButton
              icon={<ChevronLeft className="w-6 h-6 text-white" />}
              aria-label="Назад"
              onClick={handleBack}
              size="md"
            />
          ) : (
            <div className="bg-primary/15 p-2 rounded-xl border border-primary/25 shrink-0">
              <BarChart3 className="w-5 h-5 text-[var(--tg-theme-button-color,#3390ec)]" />
            </div>
          )}
          <h1 className="text-[15px] font-bold tracking-tight text-white truncate">
            {title === 'Polygram' ? 'Полиграм' : title}
          </h1>
        </div>

        {/* Right: Balance & Connect */}
        <div className="flex items-center gap-2 shrink-0">
          {balance !== undefined && (
            <div className="bg-white/[0.03] border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 backdrop-blur-md">
              <Wallet className="w-3.5 h-3.5 text-[var(--tg-theme-button-color,#3390ec)]" />
              <span className="text-[11px] font-black text-white tabular-nums">
                {formatCurrency(balance)}
              </span>
            </div>
          )}
          <div className="scale-85 origin-right translate-x-1">
            <TonConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};
