import { EnergyEstimator } from '../src/analyzer/energyEstimator';
import { PerformanceMetrics } from '../src/types';

describe('EnergyEstimator', () => {
  const estimator = new EnergyEstimator();

  it('should estimate energy consumption accurately', () => {
    const metrics: PerformanceMetrics = {
      cpuTime: 100,
      memoryUsage: 50 * 1024 * 1024, // 50 MB
      networkRequests: 15,
      jsExecutionTime: 250,
      imageSize: 1500
    };
    const breakdown = estimator.estimateEnergyConsumption(metrics);
    expect(breakdown.cpu).toBeCloseTo(0.1, 1);
    expect(breakdown.network).toBeCloseTo(0.15, 1);
    expect(breakdown.memory).toBeCloseTo(0.25, 1);
    expect(estimator.calculateScore(breakdown)).toBe(60);
  });
});