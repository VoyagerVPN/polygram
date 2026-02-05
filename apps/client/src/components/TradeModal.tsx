/**
 * Trade Modal Component
 * Allows users to buy YES/NO shares with amount input
 */

import type { FC } from 'react';
import { useState, useEffect, useOptimistic, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, AlertCircle, Check } from 'lucide-react';
import { usePolygramStore } from '@/store/usePolygramStore';
import { api } from '@/api/client';
import type { MarketData } from '@/types';
import { Button, IconButton } from '@/components/ui';

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
  const colorVar = isYes ? 'var(--app-success)' : 'var(--app-danger)';

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
      setError('Введите корректную сумму');
      return;
    }
    if (numAmount > userBalance) {
      setError('Недостаточно средств');
      return;
    }
    if (numAmount < 1) {
      setError('Минимальная сделка — 1 TON');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    const numAmount = parseFloat(amount);
    setStep('processing');
    
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
        setError(err instanceof Error ? err.message : 'Ошибка сделки');
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ 
                backgroundColor: colorVar,
                boxShadow: `0 8px 32px ${colorVar}40`
              }}
            >
              {isYes ? (
                <TrendingUp className="w-6 h-6 text-white" />
              ) : (
                <TrendingDown className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                Купить {isYes ? 'ДА' : 'НЕТ'}
              </h3>
              <p className="text-[11px] text-slate-500 font-bold truncate max-w-[200px] mt-0.5">
                {market.question}
              </p>
            </div>
          </div>
          {step !== 'processing' && step !== 'success' && (
            <IconButton
              icon={<X className="w-5 h-5 text-slate-400" />}
              aria-label="Закрыть"
              onClick={onClose}
              variant="secondary"
            />
          )}
        </div>

        {/* Content based on step */}
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Amount Input */}
              <div className="bg-white/[0.02] rounded-3xl p-6 border border-white/5 shadow-inner">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Сумма</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxClick}
                    className="text-[10px] text-[var(--app-primary)]"
                  >
                    МАКС
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-4xl font-black text-white placeholder-slate-800 outline-none tabular-nums"
                    autoFocus
                  />
                  <span className="text-lg font-black text-slate-500 italic pb-1">TON</span>
                </div>
                <div className="text-[11px] text-slate-600 font-bold mt-4 flex items-center gap-1.5 px-1">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  Баланс: {optimisticBalance.toFixed(2)} TON
                </div>
              </div>

              {/* Preset Amounts */}
              <div className="flex gap-2.5">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    className={`flex-1 py-3 rounded-2xl text-[12px] font-black transition-all ${
                      parseFloat(amount) === preset
                        ? 'bg-white text-black shadow-lg shadow-white/5 scale-[1.05] z-10'
                        : 'bg-white/[0.03] text-slate-500 border border-white/5 hover:bg-white/5'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Estimate */}
              {estimate && parseFloat(amount) > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/[0.02] rounded-2xl p-5 border border-white/5 space-y-3.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-bold">Вы получите</span>
                    <span 
                      className="text-lg font-black drop-shadow-[0_0_10px_currentColor]"
                      style={{ color: colorVar }}
                    >
                      {estimate.estimatedShares.toFixed(4)} {isYes ? 'ДА' : 'НЕТ'}
                    </span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-600">Средняя цена</span>
                    <span className="text-slate-400 tabular-nums">{estimate.pricePerShare.toFixed(4)} TON</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-600">Текущая вероятность</span>
                    <span className="text-slate-400 tabular-nums">{Math.round(estimate.currentPrice * 100)}%</span>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Review Button */}
              <Button
                fullWidth
                size="xl"
                onClick={handleReview}
                disabled={!amount || parseFloat(amount) <= 0}
                style={{ backgroundColor: colorVar }}
                className="text-white shadow-2xl"
              >
                Проверить сделку
              </Button>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="bg-white/[0.02] rounded-3xl p-6 border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-slate-500 font-bold">Выбор</span>
                  <span 
                    className="font-black text-lg"
                    style={{ color: colorVar }}
                  >
                    {isYes ? 'ДА' : 'НЕТ'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-slate-500 font-bold">Сумма</span>
                  <span className="font-black text-white text-lg">{parseFloat(amount).toFixed(2)} TON</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-slate-500 font-bold">Доля</span>
                  <span className="font-black text-white">
                    {estimate?.estimatedShares.toFixed(4)} {isYes ? 'ДА' : 'НЕТ'}
                  </span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-slate-500 font-bold">Новый баланс</span>
                  <span className="font-black text-slate-400">
                    {(optimisticBalance - parseFloat(amount)).toFixed(2)} TON
                  </span>
                </div>
              </div>

              {/* Confirm Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setStep('input')}
                >
                  Назад
                </Button>
                <Button
                  fullWidth
                  onClick={handleConfirm}
                  style={{ backgroundColor: colorVar }}
                  className="text-white shadow-2xl"
                >
                  Подтвердить
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 flex flex-col items-center"
            >
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                <div 
                  className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: colorVar, borderTopColor: 'transparent' }}
                />
              </div>
              <p className="text-white font-black text-lg">Обработка сделки...</p>
              <p className="text-[11px] text-slate-500 font-bold mt-2 uppercase tracking-widest">Пожалуйста, подождите</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center"
            >
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-12"
                style={{ 
                  backgroundColor: colorVar,
                  boxShadow: `0 8px 32px ${colorVar}60`
                }}
              >
                <Check className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-black text-white mb-2 tracking-tight">Сделка совершена!</h4>
              <p className="text-sm text-slate-500 font-bold mb-10 max-w-[240px]">
                Вы купили {estimate?.estimatedShares.toFixed(4)} долей в исходе {isYes ? 'ДА' : 'НЕТ'}
              </p>
              <Button 
                variant="white" 
                size="lg"
                onClick={handleSuccessClose}
                className="px-12"
              >
                Готово
              </Button>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mb-6 border border-red-500/30">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h4 className="text-2xl font-black text-white mb-2">Ошибка</h4>
              <p className="text-sm text-slate-500 font-bold mb-10 max-w-[240px]">{error}</p>
              <div className="flex gap-4 w-full">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setStep('input')}
                >
                  Повторить
                </Button>
                <Button
                  variant="white"
                  fullWidth
                  onClick={onClose}
                >
                  Закрыть
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
