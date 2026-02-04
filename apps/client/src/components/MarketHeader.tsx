import type { FC } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Info } from 'lucide-react';

interface MarketHeaderProps {
  question: string;
  showChart: boolean;
  onToggleChart: () => void;
}

export const MarketHeader: FC<MarketHeaderProps> = ({
  question,
  showChart,
  onToggleChart,
}) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-bold leading-tight pr-6 text-white">
        {question || 'Unknown Question'}
      </h3>
      <div className="flex gap-2 shrink-0">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleChart}
          className={`
            p-1.5 rounded-lg transition-colors
            ${showChart ? 'bg-[#276bf5] text-white' : 'text-white/20 hover:text-white/40'}
          `}
          aria-label={showChart ? 'Hide chart' : 'Show chart'}
        >
          <BarChart3 size={18} />
        </motion.button>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="text-white/20 cursor-help p-1.5 hover:text-white/40 transition-colors"
          title="Market information"
        >
          <Info size={18} />
        </motion.div>
      </div>
    </div>
  );
};
