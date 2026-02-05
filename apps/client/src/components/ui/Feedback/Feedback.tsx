/**
 * Feedback Components - Loading, Error, Empty states
 * 
 * Design Philosophy:
 * - Clear visual communication of state
 * - Consistent styling across all feedback states
 * - Actionable when possible (retry buttons, etc.)
 */

import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Search, Package, Clock, TrendingUp } from 'lucide-react';
import { Button } from '../Button';

// ============================================================================
// Loading States
// ============================================================================

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className={`${sizes[size]} border-[var(--app-primary)] border-t-transparent rounded-full animate-spin ${className}`} />
  );
};

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingState: FC<LoadingStateProps> = ({ 
  message = 'Загрузка...',
  size = 'md',
  fullScreen = false 
}) => {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-[#0b0e11] z-50 flex items-center justify-center'
    : 'flex items-center justify-center py-16';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size={size} />
        <p className="text-slate-500 text-sm font-bold">{message}</p>
      </div>
    </div>
  );
};

export const PageLoader: FC = () => (
  <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// ============================================================================
// Error States
// ============================================================================

export interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ 
  title = 'Ошибка загрузки',
  message = 'Не удалось загрузить данные',
  onRetry,
  compact = false 
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <p className="text-red-400 text-sm font-bold flex-1">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="text-[11px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
          >
            Повторить
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-black text-white mb-2">{title}</h3>
      <p className="text-slate-500 text-sm text-center max-w-[240px] mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          Попробовать снова
        </Button>
      )}
    </motion.div>
  );
};

export const PageError: FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#0b0e11)] flex items-center justify-center">
    <ErrorMessage 
      title="Что-то пошло не так"
      message="Не удалось загрузить страницу"
      onRetry={onRetry}
    />
  </div>
);

// ============================================================================
// Empty States
// ============================================================================

export type EmptyIcon = 'search' | 'package' | 'clock' | 'chart' | 'wallet';

export interface EmptyStateProps {
  icon?: EmptyIcon | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const iconMap: Record<EmptyIcon, React.ElementType> = {
  search: Search,
  package: Package,
  clock: Clock,
  chart: TrendingUp,
  wallet: Search, // fallback
};

export const EmptyState: FC<EmptyStateProps> = ({ 
  icon = 'package',
  title,
  description,
  action 
}) => {
  const IconComponent = typeof icon === 'string' ? iconMap[icon as EmptyIcon] : null;

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-14 h-14 rounded-3xl bg-white/[0.03] flex items-center justify-center mb-5 border border-white/5">
        {IconComponent ? (
          <IconComponent className="w-7 h-7 text-slate-600" />
        ) : (
          <span className="text-slate-600">{icon}</span>
        )}
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-slate-600 text-sm max-w-[260px]">{description}</p>
      )}
      {action && (
        <div className="mt-6">{action}</div>
      )}
    </motion.div>
  );
};

// ============================================================================
// Skeleton Loading
// ============================================================================

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton: FC<SkeletonProps> = ({ 
  className = '',
  width,
  height,
  circle = false 
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div 
      className={`
        animate-pulse bg-white/[0.05] 
        ${circle ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
      style={style}
    />
  );
};

export const SkeletonCard: FC = () => (
  <div className="glass-card rounded-3xl p-6 space-y-4">
    <div className="flex gap-4">
      <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <div className="flex gap-3 pt-2">
      <Skeleton className="h-11 flex-1 rounded-2xl" />
      <Skeleton className="h-11 flex-1 rounded-2xl" />
    </div>
  </div>
);

export const SkeletonStat: FC = () => (
  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
    <Skeleton className="h-2 w-16 mb-3" />
    <Skeleton className="h-6 w-24" />
  </div>
);

// ============================================================================
// Status Badges
// ============================================================================

export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  size = 'sm' 
}) => {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-white/10 text-white border-white/10',
    success: 'bg-[var(--app-success)]/10 text-[var(--app-success)] border-[var(--app-success)]/20',
    danger: 'bg-[var(--app-danger)]/10 text-[var(--app-danger)] border-[var(--app-danger)]/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const sizes = {
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-1',
  };

  return (
    <span className={`
      inline-flex items-center rounded-md border
      font-black uppercase tracking-[0.15em]
      ${variants[variant]}
      ${sizes[size]}
    `}>
      {children}
    </span>
  );
};

export default {
  LoadingSpinner,
  LoadingState,
  PageLoader,
  ErrorMessage,
  PageError,
  EmptyState,
  Skeleton,
  SkeletonCard,
  SkeletonStat,
  Badge,
};
