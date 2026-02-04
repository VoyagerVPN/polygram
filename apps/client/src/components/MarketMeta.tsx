import type { FC } from 'react';
import { Clock, Droplets } from 'lucide-react';
import { formatDistanceToNow } from '@/helpers/date';

interface MarketMetaProps {
  expiresAt: string;
  liquidity: number;
}

export const MarketMeta: FC<MarketMetaProps> = ({ expiresAt, liquidity }) => {
  const timeLeft = formatDistanceToNow(expiresAt);
  
  return (
    <div className="flex flex-wrap gap-2 items-center text-xs text-white/40 mb-5">
      <div className="flex items-center gap-1">
        <Clock size={14} />
        <span>Resolves {timeLeft}</span>
      </div>
      <span className="mx-1">•</span>
      <div className="flex items-center gap-1">
        <Droplets size={14} className="text-[#276bf5]" />
        <span>{liquidity.toFixed(0)} liquidity</span>
      </div>
    </div>
  );
};
