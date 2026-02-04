/**
 * Application constants
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

// Market Configuration
export const DEFAULT_LIQUIDITY_B = 150;
export const DEFAULT_USER_BALANCE = 1000;

// UI Configuration
export const MARKET_REFRESH_INTERVAL = 30000; // 30 seconds
export const WS_RECONNECT_DELAY = 5000; // 5 seconds
export const MAX_WS_RECONNECT_ATTEMPTS = 5;

// Color Palette
export const COLORS = {
  yes: '#2ecc71',
  yesBg: 'rgba(9, 133, 81, 0.1)',
  yesBorder: 'rgba(46, 204, 113, 0.2)',
  no: '#e74c3c',
  noBg: 'rgba(207, 32, 47, 0.1)',
  noBorder: 'rgba(231, 76, 60, 0.2)',
  accent: '#276bf5',
  chart: '#2ecc71',
  chartTop: 'rgba(46, 204, 113, 0.2)',
  chartBottom: 'rgba(46, 204, 113, 0.0)',
} as const;

// Animation Configuration
export const ANIMATION = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
} as const;
