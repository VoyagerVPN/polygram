import { FC, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLMSR } from '@/hooks/useLMSR';
import { formatNumber, formatTimeLeft } from '@/helpers/format';
import type { MarketCardProps } from '@/types';
import { TrendingUp, TrendingDown, Clock, Database } from 'lucide-react';

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onClick={handleCardClick}
      className="glass-card rounded-2xl p-5 mb-4 relative cursor-pointer hover:border-white/10 transition-colors"
    >
      {/* Market Image & Title */}
      <div className="flex gap-4 mb-4">
        {market.imageUrl && (
          <div className="w-14 h-14 shrink-0 rounded-xl bg-slate-800 overflow-hidden border border-white/5 shadow-lg">
            <img alt={market.question} className="w-full h-full object-cover" src={market.imageUrl} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[15px] leading-snug text-white/90 line-clamp-2">
            {market.question}
          </h4>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeLeft(market.expiresAt)}
            </span>
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
              <Database className="w-3 h-3" />
              {formatNumber(volume)} TON
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2.5 mb-4">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
          <motion.div 
            className="h-full bg-[var(--app-success)] shadow-[0_0_8px_rgba(11,218,94,0.3)]" 
            style={{ width: `${percentYes}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${percentYes}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
          <span className="text-[var(--app-success)]/80 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {percentYes}% Yes
          </span>
          <span className="text-[var(--app-danger)]/80 flex items-center gap-1">
            {percentNo}% No
            <TrendingDown className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Trade Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={(e) => handleTrade(e, true)}
          disabled={!isValid || market.status !== 'OPEN'}
          className="flex-1 bg-[var(--app-success)]/10 hover:bg-[var(--app-success)]/20 text-[var(--app-success)] py-2.5 rounded-xl text-xs font-bold border border-[var(--app-success)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Yes
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={(e) => handleTrade(e, false)}
          disabled={!isValid || market.status !== 'OPEN'}
          className="flex-1 bg-[var(--app-danger)]/10 hover:bg-[var(--app-danger)]/20 text-[var(--app-danger)] py-2.5 rounded-xl text-xs font-bold border border-[var(--app-danger)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <TrendingDown className="w-3.5 h-3.5" />
          No
        </motion.button>
      </div>
    </motion.div>
  );
};
