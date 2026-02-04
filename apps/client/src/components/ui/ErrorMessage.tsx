import type { FC } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ 
  message, 
  onRetry,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-6 rounded-2xl bg-red-500/10 border border-red-500/20
        flex flex-col items-center gap-3 text-center
        ${className}
      `}
    >
      <AlertCircle className="w-10 h-10 text-red-400" />
      <div>
        <h3 className="text-white font-semibold mb-1">Something went wrong</h3>
        <p className="text-white/50 text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 
                     text-white text-sm font-medium transition-colors
                     flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </motion.div>
  );
};
