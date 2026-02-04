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
 * Format a percentage value
 */
export function formatPercentage(value: number, decimals = 0): string {
  const validValue = isFinite(value) && value >= 0 && value <= 100 
    ? value 
    : 0;
  return `${validValue.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format a large number with k/m/b suffix
 */
export function formatCompactNumber(value: number): string {
  const validValue = isFinite(value) ? value : 0;
  
  if (validValue >= 1e9) {
    return `${(validValue / 1e9).toFixed(1)}B`;
  }
  if (validValue >= 1e6) {
    return `${(validValue / 1e6).toFixed(1)}M`;
  }
  if (validValue >= 1e3) {
    return `${(validValue / 1e3).toFixed(1)}K`;
  }
  return validValue.toFixed(0);
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
