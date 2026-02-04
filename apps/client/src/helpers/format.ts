/**
 * Number and string formatting utilities
 */

/**
 * Format a number with commas and fixed decimals
 */
export function formatNumber(value: number, decimals = 2): string {
  const validValue = isFinite(value) ? value : 0;
  return validValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number as currency
 */
export function formatCurrency(value: number, currency = 'TON'): string {
  const validValue = isFinite(value) ? value : 0;
  return `${validValue.toFixed(2)} ${currency}`;
}

/**
 * Format time left until a date
 */
export function formatTimeLeft(date: string | Date): string {
  const target = new Date(date);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Ended';
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  }
  if (diffHours > 0) {
    return `${diffHours}h`;
  }

  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffMinutes}m`;
}
