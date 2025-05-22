import { StaticAnalyzer } from '../src/analyzer/staticAnalyzer';
import { PerformanceCollector } from '../src/analyzer/performanceCollector';

describe('StaticAnalyzer', () => {
    let staticAnalyzer: StaticAnalyzer;

    beforeEach(() => {
        staticAnalyzer = new StaticAnalyzer();
    });

    test('should identify energy-inefficient patterns', () => {
        const codeSample = `
            function inefficientFunction() {
                setInterval(() => {
                    console.log('This runs too often');
                }, 100);
            }
        `;
        const result = staticAnalyzer.analyze(codeSample);
        expect(result).toContain('Energy inefficient pattern: excessive use of timers');
    });
});

describe('PerformanceCollector', () => {
    let performanceCollector: PerformanceCollector;

    beforeEach(() => {
        performanceCollector = new PerformanceCollector();
    });

    test('should collect performance metrics', async () => {
        const metrics = await performanceCollector.collectMetrics('https://example.com');
        expect(metrics).toHaveProperty('cpuTime');
        expect(metrics).toHaveProperty('memoryUsage');
        expect(metrics.cpuTime).toBeGreaterThan(0);
    });
});