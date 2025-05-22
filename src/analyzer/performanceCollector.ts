import { PerformanceMetrics } from '../types';

export class PerformanceCollector {
    async collectMetrics(url: string): Promise<PerformanceMetrics> {
        // Use browser automation tool to collect performance metrics
        // Example: Puppeteer or Playwright can be used here

        // Placeholder for actual implementation
        const metrics: PerformanceMetrics = {
            cpuTime: 100, // Replace with actual CPU time
            memoryUsage: 50000000, // Replace with actual memory usage
            networkRequests: 15, // Replace with actual number of network requests
            imageSize: 1500, // Sample value for testing
            jsExecutionTime: 250 // Sample value for testing
        };

        // Simulate asynchronous operation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(metrics);
            }, 1000);
        });
    }

    /**
     * Calculate a score (max 100) for the website based on performance metrics.
     * Lower resource usage results in a higher score.
     * @param metrics The collected performance metrics
     * @returns number (0~100)
     */
    public calculateScore(metrics: PerformanceMetrics): number {
        let score = 100;

        // CPU time penalty
        if (metrics.cpuTime > 200) score -= 10;
        if (metrics.cpuTime > 500) score -= 10;

        // Memory usage penalty (in bytes)
        if (metrics.memoryUsage > 100000000) score -= 10;
        if (metrics.memoryUsage > 200000000) score -= 10;

        // Network requests penalty
        if (metrics.networkRequests > 20) score -= 10;
        if (metrics.networkRequests > 40) score -= 10;

        // Image size penalty (in KB)
        if (typeof metrics.imageSize === 'number' && metrics.imageSize > 2000) score -= 10;
        if (typeof metrics.imageSize === 'number' && metrics.imageSize > 5000) score -= 10;

        // JS execution time penalty (in ms)
        if (typeof metrics.jsExecutionTime === 'number' && metrics.jsExecutionTime > 500) score -= 10;
        if (typeof metrics.jsExecutionTime === 'number' && metrics.jsExecutionTime > 1000) score -= 10;

        // Ensure score is between 0 and 100
        if (score < 0) score = 0;
        if (score > 100) score = 100;
        return score;
    }
}