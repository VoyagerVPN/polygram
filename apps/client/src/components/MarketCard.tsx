import type { FC } from 'react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Database } from 'lucide-react';
import { useLMSR } from '@/hooks/useLMSR';
import { formatNumber } from '@/helpers/format';
import type { MarketCardProps } from '@/types';
import { MarketCard as Card, Badge, PredictionButton } from '@/components/ui';

export const MarketCard: FC<MarketCardProps> = ({ market, onTrade }) => {
  const navigate = useNavigate();
  const { percentYes, percentNo, isValid } = useLMSR({
    qYes: market.qYes,
    qNo: market.qNo,
    b: market.b,
  });

  const handleTrade = useCallback((e: React.MouseEvent, isYes: boolean) => {
    e.stopPropagation();
    onTrade(market.id, isYes);
  }, [market.id, onTrade]);

  const handleCardClick = useCallback(() => {
    navigate(`/market/${market.id}`);
  }, [market.id, navigate]);

  if (!market?.id) return null;

  const volume = market.qYes + market.qNo;
  const isOpen = market.status === 'OPEN';

  return (
    <Card onClick={handleCardClick}>
      {/* Header: Image & Title */}
      <div className="flex gap-4 mb-5">
        {market.imageUrl && (
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-800 overflow-hidden border border-white/10 shadow-2xl">
            <img 
              alt={market.question} 
              className="w-full h-full object-cover" 
              src={market.imageUrl} 
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant={isOpen ? 'info' : 'default'}>
              {isOpen ? 'Активный' : market.status}
            </Badge>
          </div>
          <h4 className="font-bold text-[16px] leading-tight text-white line-clamp-2">
            {market.question}
          </h4>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3 mb-5">
        <div className="flex justify-between text-[11px] font-black uppercase tracking-wider mb-1">
          <span className="text-[var(--app-success)] drop-shadow-[0_0_8px_var(--color-app-success-glow)]">
            {percentYes}% Да
          </span>
          <span className="text-[var(--app-danger)] drop-shadow-[0_0_8px_var(--color-app-danger-glow)]">
            {percentNo}% Нет
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex p-[1px]">
          <div 
            className="h-full bg-gradient-to-r from-[var(--app-success)] to-emerald-400 rounded-full shadow-[0_0_12px_var(--color-app-success-glow)] transition-all duration-500"
            style={{ width: `${percentYes}%` }}
          />
        </div>
        
        {/* Meta */}
        <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest pt-1 px-0.5">
          <span className="flex items-center gap-1.5">
            <Database className="w-3 h-3 opacity-70" />
            {formatNumber(volume)} TON Объём
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 opacity-70" />
            До {new Date(market.expiresAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3.5">
        <PredictionButton
          outcome="YES"
          onClick={(e) => handleTrade(e, true)}
          disabled={!isValid || !isOpen}
        />
        <PredictionButton
          outcome="NO"
          onClick={(e) => handleTrade(e, false)}
          disabled={!isValid || !isOpen}
        />
      </div>
    </Card>
  );
};
