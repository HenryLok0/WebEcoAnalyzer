"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateCarbonFootprint = exports.EnergyEstimator = void 0;
class EnergyEstimator {
    estimateEnergyConsumption(metrics) {
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
    calculateScore(breakdown) {
        const totalWh = breakdown.cpu + breakdown.network + breakdown.memory;
        if (totalWh <= 1.5)
            return 100;
        if (totalWh <= 2)
            return 80;
        if (totalWh <= 3)
            return 60;
        if (totalWh <= 4)
            return 40;
        if (totalWh <= 5)
            return 20;
        return 0;
    }
}
exports.EnergyEstimator = EnergyEstimator;
function estimateCarbonFootprint(wh, carbonIntensity = 0.475) {
    // wh: watt-hour, carbonIntensity: kgCO2/kWh
    return wh * carbonIntensity * 1000; // gCO2
}
exports.estimateCarbonFootprint = estimateCarbonFootprint;
