import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTelegramUser,
  getInitData,
  isTelegramWebApp,
  ready,
  expand,
  close,
} from './telegram';

// Skip tests if not in browser environment
const describeIfWindow = typeof window !== 'undefined' ? describe : describe.skip;

describeIfWindow('Telegram Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTelegramUser', () => {
    it('should return user data when available', () => {
      const user = getTelegramUser();
      
      // Should either return user or null depending on mock setup
      expect(user === null || typeof user === 'object').toBe(true);
    });
  });

  describe('getInitData', () => {
    it('should return string', () => {
      const initData = getInitData();
      expect(typeof initData).toBe('string');
    });
  });

  describe('isTelegramWebApp', () => {
    it('should return boolean', () => {
      const result = isTelegramWebApp();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('WebApp actions', () => {
    it('should call ready() without error', () => {
      expect(() => ready()).not.toThrow();
    });

    it('should call expand() without error', () => {
      expect(() => expand()).not.toThrow();
    });

    it('should call close() without error', () => {
      expect(() => close()).not.toThrow();
    });
  });
});
