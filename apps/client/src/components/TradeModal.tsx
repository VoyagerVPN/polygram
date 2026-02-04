/**
 * Trade Modal Component
 * Allows users to buy YES/NO shares with amount input
 */

import type { FC } from 'react';
import { useState, useEffect, useOptimistic, startTransition } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, AlertCircle, Check } from 'lucide-react';
import { usePolygramStore } from '@/store/usePolygramStore';
import { api } from '@/api/client';
import type { MarketData } from '@/types';

interface TradeModalProps {
  market: MarketData;
  outcome: 'YES' | 'NO';
  onClose: () => void;
  onComplete: () => void;
}

type TradeStep = 'input' | 'confirm' | 'processing' | 'success' | 'error';

const PRESET_AMOUNTS = [10, 50, 100, 500];

export const TradeModal: FC<TradeModalProps> = ({
  market,
  outcome,
  onClose,
  onComplete,
}) => {
  const { userBalance, setBalance } = usePolygramStore();
  const [amount, setAmount] = useState<string>('');
  const [step, setStep] = useState<TradeStep>('input');
  
  // React 19 Optimistic UI
  const [optimisticBalance, addOptimisticBalance] = useOptimistic(
    userBalance,
    (state, tradeAmount: number) => state - tradeAmount
  );

  const [estimate, setEstimate] = useState<{
    estimatedShares: number;
    pricePerShare: number;
    currentPrice: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setTransactionId] = useState<string | null>(null);

  const isYes = outcome === 'YES';
  const colorClass = isYes ? 'text-[var(--app-success)]' : 'text-[var(--app-danger)]';
  const bgClass = isYes ? 'bg-[var(--app-success)]' : 'bg-[var(--app-danger)]';

  // Fetch estimate when amount changes
  useEffect(() => {
    const fetchEstimate = async () => {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setEstimate(null);
        return;
      }

      try {
        const data = await api.estimateTrade(market.id, numAmount, outcome);
        setEstimate(data);
      } catch (err) {
        console.error('Failed to estimate trade:', err);
      }
    };

    const timeout = setTimeout(fetchEstimate, 300);
    return () => clearTimeout(timeout);
  }, [amount, market.id, outcome]);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(value)) return;
    
    const numValue = parseFloat(value);
    if (value && !isNaN(numValue) && numValue > userBalance) {
      setAmount(userBalance.toString());
    } else {
      setAmount(value);
    }
    setError(null);
  };

  const handlePresetClick = (preset: number) => {
    const newAmount = Math.min(preset, userBalance);
    setAmount(newAmount.toString());
  };

  const handleMaxClick = () => {
    setAmount(userBalance.toString());
  };

  const handleReview = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (numAmount > userBalance) {
      setError('Insufficient balance');
      return;
    }
    if (numAmount < 1) {
      setError('Minimum trade is 1 TON');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    const numAmount = parseFloat(amount);
    setStep('processing');
    
    // React 19 startTransition to wrap optimistic updates
    startTransition(async () => {
      addOptimisticBalance(numAmount);
      
      try {
        const result = await api.executeTrade({
          marketId: market.id,
          outcome,
          amount: numAmount,
        });

        setTransactionId(result.transactionId);
        setBalance(result.newBalance);
        setStep('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Trade failed');
        setStep('error');
      }
    });
  };

  const handleSuccessClose = () => {
    onComplete();
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'processing') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [step, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={step !== 'processing' ? onClose : undefined}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-[#161C26] rounded-t-3xl sm:rounded-3xl p-6 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}>
              {isYes ? (
                <TrendingUp className="w-5 h-5 text-white" />
              ) : (
                <TrendingDown className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Buy {outcome}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">
                {market.question}
              </p>
            </div>
          </div>
          {step !== 'processing' && step !== 'success' && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Content based on step */}
        {step === 'input' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Amount Input */}
            <div className="bg-[#1c2631] rounded-2xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Amount</span>
                <button 
                  onClick={handleMaxClick}
                  className="text-xs text-[var(--app-primary)] font-bold"
                >
                  MAX
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-3xl font-black text-white placeholder-slate-600 outline-none"
                  autoFocus
                />
                <span className="text-lg font-bold text-slate-400">TON</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Balance: {optimisticBalance.toFixed(2)} TON
              </div>
            </div>

            {/* Preset Amounts */}
            <div className="flex gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                    parseFloat(amount) === preset
                      ? 'bg-[var(--app-primary)] text-white'
                      : 'bg-[#1c2631] text-slate-400 hover:bg-[#252f3a]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Estimate */}
            {estimate && parseFloat(amount) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1c2631]/50 rounded-xl p-4 border border-white/5"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400">You'll receive</span>
                  <span className={`text-lg font-black ${colorClass}`}>
                    {estimate.estimatedShares.toFixed(4)} {outcome}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Avg price per share</span>
                  <span>{estimate.pricePerShare.toFixed(4)} TON</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                  <span>Current probability</span>
                  <span>{Math.round(estimate.currentPrice * 100)}%</span>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Review Button */}
            <motion.button
              className={`w-full ${bgClass} text-white py-4 rounded-2xl font-black text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              whileTap={{ scale: 0.98 }}
              onClick={handleReview}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Review Trade
            </motion.button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="bg-[#1c2631] rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Buying</span>
                <span className={`font-bold ${colorClass}`}>{outcome}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Amount</span>
                <span className="font-bold text-white">{parseFloat(amount).toFixed(2)} TON</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Est. shares</span>
                <span className="font-bold text-white">
                  {estimate?.estimatedShares.toFixed(4)} {outcome}
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">New balance</span>
                <span className="font-bold text-white">
                  {(optimisticBalance - parseFloat(amount)).toFixed(2)} TON
                </span>
              </div>
            </div>

            {/* Confirm Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex-1 py-4 rounded-2xl font-bold text-sm bg-[#1c2631] text-slate-300 hover:bg-[#252f3a] transition-colors"
              >
                Back
              </button>
              <motion.button
                className={`flex-1 ${bgClass} text-white py-4 rounded-2xl font-black text-sm shadow-lg`}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
              >
                Confirm Trade
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <div className="py-12 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[var(--app-primary)] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-bold">Processing trade...</p>
            <p className="text-xs text-slate-400 mt-2">Please wait</p>
          </div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 flex flex-col items-center text-center"
          >
            <div className={`w-16 h-16 ${bgClass} rounded-full flex items-center justify-center mb-4`}>
              <Check className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Trade Complete!</h4>
            <p className="text-sm text-slate-400 mb-6">
              You bought {estimate?.estimatedShares.toFixed(4)} {outcome} shares
            </p>
            <motion.button
              className="bg-[var(--app-primary)] text-white px-8 py-3 rounded-2xl font-bold text-sm"
              whileTap={{ scale: 0.98 }}
              onClick={handleSuccessClose}
            >
              Done
            </motion.button>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Trade Failed</h4>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="bg-[#1c2631] text-white px-6 py-3 rounded-2xl font-bold text-sm"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="bg-[var(--app-primary)] text-white px-6 py-3 rounded-2xl font-bold text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
