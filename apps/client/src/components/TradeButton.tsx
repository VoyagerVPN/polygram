import type { FC } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '@/constants';
import type { TradeButtonProps } from '@/types';

const styles = {
  yes: {
    base: `bg-[${COLORS.yesBg}] text-[${COLORS.yes}] border-[${COLORS.yesBorder}]`,
    hover: `hover:bg-[#098551]/20`,
    active: `bg-[${COLORS.yes}]/5`,
  },
  no: {
    base: `bg-[${COLORS.noBg}] text-[${COLORS.no}] border-[${COLORS.noBorder}]`,
    hover: `hover:bg-[#cf202f]/20`,
    active: `bg-[${COLORS.no}]/5`,
  },
};

export const TradeButton: FC<TradeButtonProps> = ({ 
  type, 
  percentage, 
  onClick,
  disabled = false 
}) => {
  const isYes = type === 'yes';
  const style = styles[type];
  
  // Ensure percentage is valid
  const validPercentage = isFinite(percentage) && percentage >= 0 && percentage <= 100
    ? percentage 
    : 50;

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative overflow-hidden
        px-4 py-3 rounded-xl font-bold transition-all
        border ${style.base} ${style.hover}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <div className="flex justify-between items-center relative z-10">
        <span className="uppercase tracking-wider text-sm">
          {isYes ? 'Yes' : 'No'}
        </span>
        <span className="text-lg font-black tabular-nums">
          {validPercentage}%
        </span>
      </div>
      
      {/* Active state overlay */}
      <motion.div
        className={`absolute inset-0 ${style.active} translate-y-full group-active:translate-y-0 transition-transform`}
      />
    </motion.button>
  );
};
