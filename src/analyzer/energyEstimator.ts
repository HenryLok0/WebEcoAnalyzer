import { PerformanceMetrics } from '../types';

export class EnergyEstimator {
    estimateEnergyConsumption(metrics: PerformanceMetrics): number {
        const { cpuTime, memoryUsage, networkRequests } = metrics;

        // Simple heuristic for energy estimation
        const energyConsumption = (cpuTime * 0.5) + (memoryUsage * 0.2) + (networkRequests * 0.1);
        
        return energyConsumption;
    }

    /**
     * Calculate a score (max 100) for the website based on estimated energy consumption.
     * Lower energy consumption results in a higher score.
     * @param energyConsumption The estimated energy consumption value
     * @returns number (0~100)
     */
    public calculateScore(energyConsumption: number): number {
        // Define thresholds for scoring
        // You can adjust these thresholds based on your requirements
        if (energyConsumption <= 10) return 100;
        if (energyConsumption <= 20) return 80;
        if (energyConsumption <= 40) return 60;
        if (energyConsumption <= 60) return 40;
        if (energyConsumption <= 80) return 20;
        return 0;
    }
}