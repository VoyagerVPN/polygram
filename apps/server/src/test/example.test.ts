import { describe, it, expect } from 'vitest';

describe('Server Example', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
