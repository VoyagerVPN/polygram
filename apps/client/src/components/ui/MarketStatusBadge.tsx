import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { MarketStatus, Outcome } from '@/types';

interface MarketStatusBadgeProps {
  status: MarketStatus;
  outcome?: Outcome;
}

const statusConfig: Record<string, { icon: typeof Clock; text: string; color: string; bgColor: string }> = {
  OPEN: {
    icon: Clock,
    text: 'Live',
    color: '#34c759',
    bgColor: 'rgba(52, 199, 89, 0.15)',
  },
  CLOSED: {
    icon: XCircle,
    text: 'Closed',
    color: '#ff9500',
    bgColor: 'rgba(255, 149, 0, 0.15)',
  },
  RESOLVED: {
    icon: CheckCircle2,
    text: 'Resolved',
    color: '#3390ec',
    bgColor: 'rgba(51, 144, 236, 0.15)',
  },
  // Fallback for lowercase
  open: {
    icon: Clock,
    text: 'Live',
    color: '#34c759',
    bgColor: 'rgba(52, 199, 89, 0.15)',
  },
  closed: {
    icon: XCircle,
    text: 'Closed',
    color: '#ff9500',
    bgColor: 'rgba(255, 149, 0, 0.15)',
  },
  resolved: {
    icon: CheckCircle2,
    text: 'Resolved',
    color: '#3390ec',
    bgColor: 'rgba(51, 144, 236, 0.15)',
  },
};

export const MarketStatusBadge: FC<MarketStatusBadgeProps> = ({ status, outcome }) => {
  // Normalize status to uppercase
  const normalizedStatus = (status || 'OPEN').toString().toUpperCase();
  const config = statusConfig[normalizedStatus] || statusConfig['OPEN'];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ 
        backgroundColor: config.bgColor,
        color: config.color,
      }}
    >
      <Icon size={12} />
      <span>
        {normalizedStatus === 'RESOLVED' && outcome 
          ? `${outcome === 'YES' ? 'Yes' : 'No'} Won` 
          : config.text}
      </span>
    </motion.div>
  );
};
