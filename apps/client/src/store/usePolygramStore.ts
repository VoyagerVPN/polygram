import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PolygramState } from '@/types';
import type { MarketState } from '@polygram/shared';

export const usePolygramStore = create<PolygramState>()(
  devtools(
    (set) => ({
      // Initial state
      markets: [],
      user: null,
      userBalance: 2450.0, // Mock based on design
      positions: [],
      achievements: [],
      isLoading: false,
      error: null,

      // Actions
      setMarkets: (markets) => 
        set({ markets, error: null }, false, 'setMarkets'),

      updateMarket: (id: string, newState: Partial<MarketState>) => 
        set(
          (state) => ({
            markets: state.markets.map((m) =>
              m.id === id ? { ...m, ...newState } : m
            ),
          }),
          false,
          'updateMarket'
        ),

      setUser: (user) => 
        set({ user }, false, 'setUser'),

      setPositions: (positions) => 
        set({ positions }, false, 'setPositions'),

      setAchievements: (achievements) => 
        set({ achievements }, false, 'setAchievements'),

      setBalance: (userBalance) => 
        set({ userBalance }, false, 'setBalance'),

      setLoading: (isLoading) => 
        set({ isLoading }, false, 'setLoading'),

      setError: (error) => 
        set({ error, isLoading: false }, false, 'setError'),
    }),
    { name: 'PolygramStore' }
  )
);
