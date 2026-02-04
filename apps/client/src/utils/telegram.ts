/**
 * Telegram WebApp utilities
 */

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function getTelegramUser(): TelegramUser | null {
  const tg = window.Telegram?.WebApp;
  if (!tg?.initDataUnsafe?.user) return null;
  return tg.initDataUnsafe.user as TelegramUser;
}

export function getInitData(): string {
  return window.Telegram?.WebApp?.initData || '';
}

export function isTelegramWebApp(): boolean {
  return !!window.Telegram?.WebApp;
}

export function ready(): void {
  window.Telegram?.WebApp?.ready();
}

export function expand(): void {
  window.Telegram?.WebApp?.expand();
}

export function close(): void {
  window.Telegram?.WebApp?.close();
}
