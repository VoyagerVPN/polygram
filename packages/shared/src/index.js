/**
 * LMSR (Logarithmic Market Scoring Rule) Core Mathematics
 * Following SOLID: This module has a single responsibility of calculating market states.
 */
export class LMSRCalculator {
    /**
     * Calculate the cost for a given set of shares
     * C = b * ln(exp(q1/b) + exp(q2/b))
     */
    static calculateCost(state) {
        const { qYes, qNo, b } = state;
        return b * Math.log(Math.exp(qYes / b) + Math.exp(qNo / b));
    }
    /**
     * Calculate the price for YES shares
     * P(yes) = exp(qYes/b) / (exp(qYes/b) + exp(qNo/b))
     */
    static calculatePrice(state) {
        const { qYes, qNo, b } = state;
        const expYes = Math.exp(qYes / b);
        const expNo = Math.exp(qNo / b);
        return expYes / (expYes + expNo);
    }
    /**
     * Calculate how many shares a user gets for a given amount of TON
     * This requires solving for the new Q. For simplicity in MVP, we might use numerical estimation
     * or a fixed-step approach if the exact inverse is too complex for simple UI.
     */
    static estimateShares(amount, currentState, _isYes) {
        // Simplified version for the document logic provided in Project_map.md
        // For a more precise version, we'd use a search algorithm for new Q
        // where calculateCost(newQ) - calculateCost(oldQ) == amount
        // Placeholder for iterative solver or simplified LMSR swap
        return amount / this.calculatePrice(currentState);
    }
}
export const DEFAULT_LIQUIDITY_B = 150;
