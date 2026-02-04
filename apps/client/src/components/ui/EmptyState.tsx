import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'search' | 'sparkles';
  className?: string;
}

const icons = {
  search: Search,
  sparkles: Sparkles,
};

export const EmptyState: FC<EmptyStateProps> = ({ 
  title = 'No markets found',
  description = 'Check back later for new prediction markets',
  icon = 'sparkles',
  className = '' 
}) => {
  const Icon = icons[icon];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        p-12 text-center glass-card border-dashed border-white/10
        ${className}
      `}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
        <Icon className="w-8 h-8 text-white/30" />
      </div>
      <h3 className="text-white/60 font-semibold mb-1">{title}</h3>
      <p className="text-white/30 text-sm">{description}</p>
    </motion.div>
  );
};
