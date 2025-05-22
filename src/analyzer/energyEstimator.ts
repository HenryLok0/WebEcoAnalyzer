import { PerformanceMetrics } from '../types';

export interface EnergyBreakdown {
    cpu: number;      // Wh
    network: number;  // Wh
    memory: number;   // Wh
}

export class EnergyEstimator {
    estimateEnergyConsumption(metrics: PerformanceMetrics): EnergyBreakdown {
        // Example model, adjust coefficients as needed
        const cpuWh = (metrics.cpuTime / 1000) * 0.001; // 1ms CPU = 0.001 Wh
        const networkWh = metrics.networkRequests * 0.01; // 0.01 Wh per request
        const memoryWh = (metrics.memoryUsage / (1024 * 1024)) * 0.005; // 0.005 Wh per MB
        return { cpu: cpuWh, network: networkWh, memory: memoryWh };
    }

    /**
     * Calculate a score (max 100) for the website based on estimated energy consumption.
     * Lower energy consumption results in a higher score.
     * @param breakdown The estimated energy breakdown
     * @returns number (0~100)
     */
    public calculateScore(breakdown: EnergyBreakdown): number {
        const totalWh = breakdown.cpu + breakdown.network + breakdown.memory;
        if (totalWh <= 1.5) return 100;
        if (totalWh <= 2) return 80;
        if (totalWh <= 3) return 60;
        if (totalWh <= 4) return 40;
        if (totalWh <= 5) return 20;
        return 0;
    }
}

export function estimateCarbonFootprint(wh: number, carbonIntensity = 0.475): number {
    // wh: watt-hour, carbonIntensity: kgCO2/kWh
    return wh * carbonIntensity * 1000; // gCO2
}