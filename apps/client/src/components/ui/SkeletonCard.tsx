import type { FC } from 'react';

export const SkeletonCard: FC = () => {
  return (
    <div className="liquid-glass-card p-4 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
      
      {/* Meta */}
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      
      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-12 rounded-2xl" />
        <div className="skeleton h-12 rounded-2xl" />
      </div>
    </div>
  );
};
