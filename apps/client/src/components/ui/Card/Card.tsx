/**
 * Card - Unified Card Component System
 * 
 * Design Philosophy:
 * - Glassmorphism for primary cards (elevated content)
 * - Flat panels for secondary content
 * - Consistent padding and border radius
 * - Hierarchical elevation through shadows and borders
 */

import type { FC, ReactNode, HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export type CardVariant = 
  | 'glass'      // Primary glassmorphism card
  | 'flat'       // Secondary flat panel
  | 'surface'    // Surface background card
  | 'outlined';  // Minimal outlined card

export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type CardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface BaseCardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: CardRadius;
  children: ReactNode;
  className?: string;
  isInteractive?: boolean;
}

type MotionCardProps = BaseCardProps & Omit<HTMLMotionProps<'div'>, keyof BaseCardProps>;
type DivCardProps = BaseCardProps & Omit<HTMLAttributes<HTMLDivElement>, keyof BaseCardProps>;

export type CardProps = MotionCardProps | DivCardProps;

// ============================================================================
// Design Tokens
// ============================================================================

const variants: Record<CardVariant, string> = {
  glass: `
    bg-white/[0.03]
    backdrop-blur-xl
    border border-white/10
    shadow-[0_8px_32px_rgba(0,0,0,0.37)]
  `,
  flat: `
    bg-[#1c2631]/80
    border border-white/[0.08]
    backdrop-blur-md
  `,
  surface: `
    bg-[#161C26]
    border border-white/[0.08]
    shadow-[0_4px_16px_rgba(0,0,0,0.15)]
  `,
  outlined: `
    bg-transparent
    border border-white/10
  `,
};

const paddings: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
  xl: 'p-6',
};

const radii: Record<CardRadius, string> = {
  none: '',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  '2xl': 'rounded-[2rem]',
  '3xl': 'rounded-[2.5rem]',
};

const interactiveStyles = `
  cursor-pointer
  transition-all duration-300
  hover:bg-white/[0.06]
  hover:border-white/15
  active:scale-[0.98]
`;

// ============================================================================
// Base Card
// ============================================================================

export const Card: FC<CardProps> = ({
  variant = 'glass',
  padding = 'lg',
  radius = '3xl',
  children,
  className = '',
  isInteractive = false,
  ...props
}) => {
  const classes = `
    ${variants[variant]}
    ${paddings[padding]}
    ${radii[radius]}
    ${isInteractive ? interactiveStyles : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Check if motion props are present
  const hasMotionProps = 'initial' in props || 'animate' in props || 'whileTap' in props;

  if (hasMotionProps) {
    return (
      <motion.div
        className={classes}
        {...(props as HTMLMotionProps<'div'>)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} {...(props as HTMLAttributes<HTMLDivElement>)}>
      {children}
    </div>
  );
};

// ============================================================================
// Specialized Card Components
// ============================================================================

/**
 * MarketCard - Card specifically for market listings
 */
export interface MarketCardProps extends Omit<MotionCardProps, 'variant'> {
  onClick?: () => void;
}

export const MarketCard: FC<MarketCardProps> = ({
  children,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      className={`
        ${variants.glass}
        ${paddings.lg}
        ${radii['3xl']}
        relative overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * StatCard - For displaying statistics/numbers
 */
export interface StatCardProps extends Omit<DivCardProps, 'variant'> {
  label: string;
  value: ReactNode;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: FC<StatCardProps> = ({
  label,
  value,
  suffix,
  trend,
  trendValue,
  className = '',
  ...props
}) => {
  const trendColors = {
    up: 'text-[var(--app-success)]',
    down: 'text-[var(--app-danger)]',
    neutral: 'text-slate-500',
  };

  return (
    <div
      className={`
        ${variants.flat}
        ${paddings.md}
        ${radii['2xl']}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-white tabular-nums">
          {value}
        </span>
        {suffix && (
          <span className="text-[10px] text-slate-500 italic">{suffix}</span>
        )}
      </div>
      {trend && trendValue && (
        <p className={`text-[10px] font-bold mt-1 ${trendColors[trend]}`}>
          {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
        </p>
      )}
    </div>
  );
};

/**
 * PriceCard - For displaying YES/NO prices
 */
export interface PriceCardProps extends Omit<DivCardProps, 'variant' | 'children'> {
  outcome: 'YES' | 'NO';
  price: number;
  label?: string;
}

export const PriceCard: FC<PriceCardProps> = ({
  outcome,
  price,
  label,
  className = '',
  ...props
}) => {
  const isYes = outcome === 'YES';
  const colorVar = isYes ? 'var(--app-success)' : 'var(--app-danger)';


  return (
    <div
      className={`
        ${variants.glass}
        ${paddings.md}
        ${radii.xl}
        border-l-4
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{ borderLeftColor: colorVar }}
      {...props}
    >
      <div className="flex items-center gap-2 mb-1">
        <div style={{ color: colorVar }}>
          {/* Icon will be passed from parent or we can use dynamic import */}
          <span className="text-xs font-bold uppercase text-slate-400">
            {label || outcome === 'YES' ? 'Да' : 'Нет'}
          </span>
        </div>
      </div>
      <div className="text-2xl font-black text-white">{price}¢</div>
      <div className="text-xs text-slate-500">Вероятность</div>
    </div>
  );
};

// Fix typo
/**
 * PositionCard - For portfolio positions
 */
export interface PositionCardProps extends Omit<MotionCardProps, 'variant'> {
  outcome: 'YES' | 'NO';
  isPositive: boolean;
}

export const PositionCard: FC<PositionCardProps> = ({
  outcome,
  children,
  className = '',
  ...props
}) => {
  const colorVar = outcome === 'YES' ? 'var(--app-success)' : 'var(--app-danger)';

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-3xl
        bg-gradient-to-br from-[#1c2631] to-[#161C26]
        border border-white/5 shadow-2xl
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      {...props}
    >
      {/* Left accent bar */}
      <div 
        className="absolute top-0 left-0 w-1 h-full shadow-[0_0_15px_rgba(50,137,236,0.5)]"
        style={{ backgroundColor: colorVar }}
      />
      {children}
    </motion.div>
  );
};

/**
 * EmptyStateCard - For empty states
 */
export interface EmptyStateCardProps extends Omit<DivCardProps, 'variant' | 'children'> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyStateCard: FC<EmptyStateCardProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        text-center py-16 px-4
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {icon && (
        <div className="text-slate-700 mb-5 opacity-40">
          {icon}
        </div>
      )}
      <p className="text-slate-500 font-bold text-sm">{title}</p>
      {description && (
        <p className="text-slate-700 font-medium text-xs mt-2">{description}</p>
      )}
      {action && (
        <div className="mt-6">{action}</div>
      )}
    </div>
  );
};

export default Card;
