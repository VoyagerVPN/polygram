/**
 * TON Service Interface
 * Defines the contract for TON blockchain interactions
 * Following SOLID: Interface Segregation & Dependency Inversion
 */

export interface ITonService {
  /**
   * Start monitoring for incoming transactions
   */
  startMonitoring(): void;

  /**
   * Stop monitoring and cleanup resources
   */
  stop(): void;

  /**
   * Process new transactions manually (for testing or forced sync)
   */
  processNewTransactions(): Promise<void>;
}

/**
 * Extended interface for mock implementations
 * Adds simulation capabilities for testing
 */
export interface IMockTonService extends ITonService {
  /**
   * Simulate a deposit for testing purposes
   * @param userId - Target user ID
   * @param amount - Amount in TON
   * @returns The generated mock transaction hash
   */
  simulateDeposit(userId: string, amount: number): Promise<string>;
}
