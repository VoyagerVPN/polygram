/**
 * Server-wide constants
 * Centralized configuration for easy maintenance
 */

// LMSR (Logarithmic Market Scoring Rule) Configuration
export const LMSR_CONFIG = {
  DEFAULT_LIQUIDITY_B: 150,
  MAX_ITERATIONS: 50,
  PRECISION: 0.0001, // 0.01% precision for binary search
} as const;

// Trading Configuration
export const TRADING_CONFIG = {
  MAX_TRADE_AMOUNT: 10000, // Maximum 10k TON per trade
  MIN_TRADE_AMOUNT: 0.01,  // Minimum trade amount
  DEFAULT_USER_BALANCE: 1000, // Welcome bonus for new users
} as const;

// TON Service Configuration
export const TON_CONFIG = {
  POLLING_INTERVAL_MS: 30000, // 30 seconds
  TRANSACTIONS_PER_FETCH: 20,
  NANO_TON_CONVERSION: 1e9,
  DEPOSIT_COMMENT_PREFIX: 'dep_',
} as const;

// Resolution Service Configuration
export const RESOLUTION_CONFIG = {
  CHECK_INTERVAL_MS: 600000, // 10 minutes
} as const;

// Automation Configuration
export const AUTOMATION_CONFIG = {
  CYCLE_INTERVAL_MS: 8 * 60 * 60 * 1000, // 8 hours
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  PAYLOAD_EXPIRY_SECONDS: 600, // 10 minutes
  PAYLOAD_BYTES_LENGTH: 32,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  NEWS_CACHE_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// News Service Configuration
export const NEWS_CONFIG = {
  FETCH_TIMEOUT_MS: 10000, // 10 seconds timeout for API calls
} as const;

// Price History Configuration
export const PRICE_HISTORY_CONFIG = {
  MAX_HISTORY_POINTS: 100,
} as const;
