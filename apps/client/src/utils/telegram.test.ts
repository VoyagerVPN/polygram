import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTelegramUser,
  getInitData,
  isTelegramWebApp,
  ready,
  expand,
  close,
} from './telegram';

describe('Telegram Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTelegramUser', () => {
    it('should return user data when available', () => {
      const user = getTelegramUser();
      
      expect(user).not.toBeNull();
      expect(user?.id).toBe(123456);
      expect(user?.first_name).toBe('Test');
    });

    it('should return null when user is not available', () => {
      // Temporarily remove user
      const originalUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (window.Telegram?.WebApp?.initDataUnsafe) {
        window.Telegram.WebApp.initDataUnsafe.user = undefined;
      }

      const user = getTelegramUser();
      expect(user).toBeNull();

      // Restore
      if (window.Telegram?.WebApp?.initDataUnsafe) {
        window.Telegram.WebApp.initDataUnsafe.user = originalUser;
      }
    });
  });

  describe('getInitData', () => {
    it('should return init data string', () => {
      const initData = getInitData();
      expect(typeof initData).toBe('string');
    });

    it('should return empty string when not in Telegram', () => {
      const originalTg = window.Telegram;
      (window as any).Telegram = undefined;

      const initData = getInitData();
      expect(initData).toBe('');

      window.Telegram = originalTg;
    });
  });

  describe('isTelegramWebApp', () => {
    it('should return true when Telegram WebApp is available', () => {
      expect(isTelegramWebApp()).toBe(true);
    });

    it('should return false when Telegram WebApp is not available', () => {
      const originalTg = window.Telegram;
      (window as any).Telegram = undefined;

      expect(isTelegramWebApp()).toBe(false);

      window.Telegram = originalTg;
    });
  });

  describe('WebApp actions', () => {
    it('should call ready()', () => {
      ready();
      expect(window.Telegram?.WebApp?.ready).toHaveBeenCalled();
    });

    it('should call expand()', () => {
      expand();
      expect(window.Telegram?.WebApp?.expand).toHaveBeenCalled();
    });

    it('should call close()', () => {
      close();
      expect(window.Telegram?.WebApp?.close).toHaveBeenCalled();
    });
  });
});
