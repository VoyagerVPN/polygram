/**
 * Telegram WebApp utilities
 * Uses @telegram-apps/sdk-react for all Telegram Mini Apps interactions
 */

import {
  initDataUser,
  initDataRaw,
  miniAppReady,
  expandViewport,
  closeMiniApp,
  isMiniAppSupported,
} from '@telegram-apps/sdk-react';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function getTelegramUser(): TelegramUser | null {
  const user = initDataUser();
  if (!user) return null;
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    language_code: user.language_code,
  };
}

export function getInitData(): string {
  return initDataRaw() ?? '';
}

export function isTelegramWebApp(): boolean {
  return isMiniAppSupported();
}

export function ready(): void {
  if (isMiniAppSupported()) {
    miniAppReady();
  }
}

export function expand(): void {
  // Only expand if Mini App is supported and mounted
  // This prevents errors in test environment
  try {
    expandViewport();
  } catch {
    // Silently ignore errors in non-Telegram environments
  }
}

export function close(): void {
  // Only close if Mini App is supported
  // This prevents errors in test environment
  try {
    closeMiniApp();
  } catch {
    // Silently ignore errors in non-Telegram environments
  }
}
