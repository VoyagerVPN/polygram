/**
 * Button - Unified Button Component
 * 
 * Design Philosophy:
 * - Consistent sizing and spacing across all variants
 * - Clear visual hierarchy through color and elevation
 * - Meaningful interaction states (hover, active, disabled, loading)
 * - Accessible by default
 */

import type { FC, ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export type ButtonVariant = 
  | 'primary'      // Main action (CTA)
  | 'secondary'    // Secondary action
  | 'outline'      // Low emphasis action
  | 'ghost'        // Minimal emphasis
  | 'danger'       // Destructive action
  | 'success'      // Positive action (Yes/Confirm)
  | 'white';       // High contrast on dark backgrounds

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 
  'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  /** Custom tap animation scale */
  tapScale?: number;
}

// ============================================================================
// Design Tokens
// ============================================================================

const variants: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--app-primary)] text-white
    hover:bg-[var(--app-primary)]/90
    active:bg-[var(--app-primary)]/80
    shadow-lg shadow-[var(--app-primary)]/25
    disabled:shadow-none
  `,
  secondary: `
    bg-white/[0.08] text-white
    border border-white/10
    hover:bg-white/[0.12] hover:border-white/15
    active:bg-white/[0.06]
  `,
  outline: `
    bg-transparent text-white
    border border-white/20
    hover:bg-white/5 hover:border-white/30
    active:bg-white/10
  `,
  ghost: `
    bg-transparent text-slate-400
    hover:bg-white/5 hover:text-white
    active:bg-white/10
  `,
  danger: `
    bg-[var(--app-danger)] text-white
    hover:bg-[var(--app-danger)]/90
    active:bg-[var(--app-danger)]/80
    shadow-lg shadow-[var(--app-danger)]/25
    disabled:shadow-none
  `,
  success: `
    bg-[var(--app-success)] text-white
    hover:bg-[var(--app-success)]/90
    active:bg-[var(--app-success)]/80
    shadow-lg shadow-[var(--app-success)]/25
    disabled:shadow-none
  `,
  white: `
    bg-white text-black
    hover:bg-white/90
    active:bg-white/80
    shadow-lg shadow-white/20
    disabled:shadow-none
  `,
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[12px] gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-[13px] gap-2 rounded-xl',
  lg: 'h-13 px-6 text-[14px] gap-2 rounded-2xl',
  xl: 'h-14 px-8 text-[15px] gap-2.5 rounded-2xl',
};

const baseStyles = `
  inline-flex items-center justify-center
  font-black uppercase tracking-wider
  transition-all duration-200 ease-out
  disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black
`;

// ============================================================================
// Component
// ============================================================================

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  tapScale = 0.96,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const classes = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <>
      {isLoading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </>
  );

  return (
    <motion.button
      className={classes}
      disabled={disabled || isLoading}
      whileTap={{ scale: disabled || isLoading ? 1 : tapScale }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {content}
    </motion.button>
  );
};

// ============================================================================
// Specialized Button Components
// ============================================================================

/**
 * TradeButton - For YES/NO trading actions (filled style)
 */
export interface TradeButtonProps extends Omit<ButtonProps, 'variant'> {
  outcome: 'YES' | 'NO';
  price?: number;
}

export const TradeButton: FC<TradeButtonProps> = ({
  outcome,
  price,
  children,
  className = '',
  ...props
}) => {
  const isYes = outcome === 'YES';
  const colorVar = isYes ? 'var(--app-success)' : 'var(--app-danger)';
  
  return (
    <motion.button
      className={`
        relative flex-1 h-14 px-4 rounded-2xl
        font-black text-[13px] uppercase tracking-wider
        flex items-center justify-center gap-2
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        backgroundColor: `${colorVar}`,
        color: 'white',
        boxShadow: `0 8px 32px ${colorVar}40`,
      }}
      whileTap={{ scale: props.disabled ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {children || (
        <>
          <span>{isYes ? 'Купить Да' : 'Купить Нет'}</span>
          {price !== undefined && (
            <span className="opacity-80">{price}¢</span>
          )}
        </>
      )}
    </motion.button>
  );
};

/**
 * PredictionButton - Outlined style for YES/NO (used in cards)
 */
export interface PredictionButtonProps extends Omit<ButtonProps, 'variant'> {
  outcome: 'YES' | 'NO';
}

export const PredictionButton: FC<PredictionButtonProps> = ({
  outcome,
  children,
  className = '',
  ...props
}) => {
  const isYes = outcome === 'YES';
  const colorVar = isYes ? 'var(--app-success)' : 'var(--app-danger)';
  
  return (
    <motion.button
      className={`
        flex-1 h-11 rounded-2xl
        font-black text-[13px] uppercase tracking-wider
        flex items-center justify-center
        transition-all duration-200
        border disabled:opacity-40 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        backgroundColor: `${colorVar}15`,
        color: colorVar,
        borderColor: `${colorVar}25`,
      }}
      whileHover={{ 
        backgroundColor: `${colorVar}25`,
        borderColor: `${colorVar}35`,
      }}
      whileTap={{ scale: props.disabled ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {children || (isYes ? 'Да' : 'Нет')}
    </motion.button>
  );
};

/**
 * IconButton - Circular button with icon only
 */
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton: FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };

  const classes = `
    ${baseStyles}
    ${variants[variant]}
    ${sizeClasses[size]}
    rounded-xl
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.button
      className={classes}
      whileTap={{ scale: props.disabled ? 1 : 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {icon}
    </motion.button>
  );
};

/**
 * TabButton - For tab navigation
 */
export interface TabButtonProps extends Omit<ButtonProps, 'variant'> {
  isActive: boolean;
  count?: number;
}

export const TabButton: FC<TabButtonProps> = ({
  isActive,
  count,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        flex-1 py-3 px-4
        text-[11px] font-black uppercase tracking-widest
        rounded-xl transition-all duration-200
        flex items-center justify-center gap-2
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        ${isActive 
          ? 'bg-white text-black shadow-lg' 
          : 'text-slate-500 hover:text-slate-300'
        }
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={`
          px-1.5 py-0.5 rounded-md text-[9px]
          ${isActive ? 'bg-black/10' : 'bg-white/10'}
        `}>
          {count}
        </span>
      )}
    </button>
  );
};

/**
 * FilterChip - For filter buttons
 */
export interface FilterChipProps extends Omit<ButtonProps, 'variant' | 'fullWidth'> {
  isActive: boolean;
}

export const FilterChip: FC<FilterChipProps> = ({
  isActive,
  leftIcon,
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      className={`
        flex h-11 shrink-0 items-center justify-center gap-2
        rounded-2xl px-5
        text-[13px] font-black whitespace-nowrap
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        disabled:opacity-40
        ${isActive 
          ? 'bg-white text-black shadow-[0_12px_24px_rgba(255,255,255,0.15)]' 
          : 'bg-white/[0.03] border border-white/5 text-slate-400 hover:text-slate-200'
        }
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      whileTap={{ scale: props.disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {leftIcon && (
        <span className={isActive ? 'text-blue-600' : 'opacity-60'}>
          {leftIcon}
        </span>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
