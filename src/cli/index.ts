import { StaticAnalyzer } from '../analyzer/staticAnalyzer';
import { PerformanceCollector } from '../analyzer/performanceCollector';
import { EnergyEstimator } from '../analyzer/energyEstimator';
import { Recommendations } from '../analyzer/recommendations';
import { JavaScriptResourceAnalyzer } from '../analyzer/JavaScriptResourceAnalyzer';
import { CssResourceAnalyzer } from '../analyzer/CssResourceAnalyzer';
import { ImageResourceAnalyzer } from '../analyzer/ImageResourceAnalyzer';
import { PerformanceMetrics, Recommendation, ResourceAnalysisResult } from '../types';
import fetch from 'node-fetch';
import * as fs from 'fs';

interface EnergyBreakdown {
    cpu: number;
    network: number;
    memory: number;
}

export async function run(args: string[] = process.argv.slice(2)): Promise<number> {
    // CLI flags
    const exportJson = args.includes('--json');
    const useLogScale = args.includes('--log-scale');
    const watch = args.includes('--watch');
    const community = args.includes('--community');
    const thresholdIdx = args.indexOf('--threshold');
    const threshold = thresholdIdx !== -1 && args[thresholdIdx + 1] ? parseInt(args[thresholdIdx + 1]) : null;

    if (args.includes('--help') || args.length === 0) {
        showHelp();
        return 0;
    }

    let url = args.find(arg => arg.startsWith('http'));
    if (!url && args[0] === 'analyze' && args[1] && args[1].startsWith('http')) {
        url = args[1];
    }
    if (!url) {
        console.error('Invalid command. Use --help for help.');
        return 1;
    }

    if (watch) {
        console.log('Watch mode enabled. Press Ctrl+C to stop.');
        const interval = setInterval(() => analyzeWebsite(url!, exportJson, useLogScale, community), 5 * 60 * 1000);
        process.on('SIGINT', () => clearInterval(interval));
        await analyzeWebsite(url, exportJson, useLogScale, community);
        return 0;
    }

    const totalScore = await analyzeWebsite(url, exportJson, useLogScale, community);
    if (threshold !== null && typeof totalScore === 'number' && totalScore < threshold) {
        console.error(`Total score ${totalScore} is below threshold ${threshold}`);
        return 1;
    }
    return 0;
}

async function analyzeWebsite(
    targetUrl: string,
    exportJson: boolean = false,
    useLogScale: boolean = false,
    community: boolean = false
): Promise<number | undefined> {
    const staticAnalyzer = new StaticAnalyzer();
    const performanceCollector = new PerformanceCollector();
    const energyEstimator = new EnergyEstimator();
    const recommendations = new Recommendations();
    const jsResourceAnalyzer = new JavaScriptResourceAnalyzer();
    const cssResourceAnalyzer = new CssResourceAnalyzer();
    const imageResourceAnalyzer = new ImageResourceAnalyzer();

    console.log(`Analyzing energy efficiency of ${targetUrl}...`);

    try {
        console.log("Fetching webpage content...");
        const pageContent = await fetchWebPageContent(targetUrl);

        if (!pageContent || pageContent.trim() === '') {
            console.error('Failed to fetch webpage content. Analysis aborted.');
            return;
        }

        // Static analysis
        console.log("Performing static code analysis...");
        const codeAnalysisResults = staticAnalyzer.analyze(pageContent);
        const staticScore = staticAnalyzer.calculateScore(codeAnalysisResults);

        // JavaScript resources
        console.log("Analyzing JavaScript resources...");
        const jsResourceResults = jsResourceAnalyzer.analyze(pageContent);
        const jsScore = jsResourceAnalyzer.calculateScore(jsResourceResults);

        // CSS resources
        console.log("Analyzing CSS resources...");
        const cssResourceResults = cssResourceAnalyzer.analyze(pageContent);
        const cssScore = cssResourceAnalyzer.calculateScore(cssResourceResults);

        // Image resources
        console.log("Analyzing image resources...");
        const imageResourceResults = await imageResourceAnalyzer.analyze(pageContent, targetUrl);
        const imgScore = imageResourceAnalyzer.calculateScore(imageResourceResults);

        // Performance metrics
        console.log("Collecting performance metrics...");
        const performanceMetrics = await performanceCollector.collectMetrics(targetUrl);
        const perfScore = performanceCollector.calculateScore(performanceMetrics);

        // Energy consumption (breakdown)
        console.log("Estimating energy consumption...");
        const energyBreakdown = energyEstimator.estimateEnergyConsumption(performanceMetrics);
        const totalWh = energyBreakdown.cpu + energyBreakdown.network + energyBreakdown.memory;
        const averageWh = 1.5;
        const percentVsAvg = (((totalWh - averageWh) / averageWh) * 100).toFixed(1);
        const energyScore = energyEstimator.calculateScore(energyBreakdown);

        // Recommendations
        console.log("Generating optimization recommendations...");
        const recommendationsList = recommendations.generateRecommendations(performanceMetrics);
        const resourceRecommendations = generateResourceRecommendations([
            ...jsResourceResults,
            ...cssResourceResults,
            ...imageResourceResults
        ]);
        const allRecommendations = [...recommendationsList, ...resourceRecommendations];
        const consolidatedRecommendations = consolidateRecommendations(allRecommendations);

        // Prioritize recommendations by impact
        consolidatedRecommendations.sort((a, b) => impactRank(a.impact) - impactRank(b.impact));

        // Calculate total score (average)
        const scores = [
            staticScore,
            jsScore,
            cssScore,
            perfScore,
            energyScore
        ];
        if (imageResourceResults.length > 0) {
            scores.push(imgScore);
        }
        const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

        const resourceBreakdown = getResourceSizeBreakdown(
            jsResourceResults,
            cssResourceResults,
            imageResourceResults,
            performanceMetrics
        );

        // Validation warnings
        const warnings = validateMetrics(performanceMetrics, imageResourceResults);
        if (warnings.length > 0) {
            console.log('\n[Validation Warnings]');
            warnings.forEach(w => console.log(w));
        }

        // Output results
        console.log('\n===== Analysis Results =====');
        console.log(`Website: ${targetUrl}`);
        console.log('----------------------------');

        // Static code analysis section
        console.log('\n[Static Code Analysis]');
        if (codeAnalysisResults.length === 0) {
            console.log('No obvious energy efficiency issues detected.');
        } else {
            codeAnalysisResults.forEach((result, index) => {
                console.log(`${index + 1}. ${result}`);
            });
        }
        console.log(`Static Code Analysis Score: ${staticScore}/100`);

        // JavaScript resources section
        console.log('\n[JavaScript Resource Analysis]');
        if (jsResourceResults.length === 0) {
            console.log('No JavaScript resources detected.');
        } else {
            displayResourceResults(jsResourceResults);
        }
        console.log(`JavaScript Resource Score: ${jsScore}/100`);

        // CSS resources section
        console.log('\n[CSS Resource Analysis]');
        if (cssResourceResults.length === 0) {
            console.log('No CSS resources detected.');
        } else {
            displayResourceResults(cssResourceResults);
        }
        console.log(`CSS Resource Score: ${cssScore}/100`);

        // Image resources section
        console.log('\n[Image Resource Analysis]');
        if (imageResourceResults.length === 0) {
            console.log('No image resources detected.');
        } else {
            displayResourceResults(imageResourceResults);
        }
        console.log(`Image Resource Score: ${imgScore}/100`);

        // Performance metrics section
        console.log('\n[Performance Metrics]');
        console.log(`• CPU Time: ${performanceMetrics.cpuTime} ms`);
        console.log(`• Memory Usage: ${(performanceMetrics.memoryUsage / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`• Network Requests: ${performanceMetrics.networkRequests}`);
        if (performanceMetrics.jsExecutionTime !== undefined) {
            console.log(`• JavaScript Execution Time: ${performanceMetrics.jsExecutionTime} ms`);
        }
        if (performanceMetrics.imageSize !== undefined) {
            console.log(`• Image Size: ${performanceMetrics.imageSize} KB`);
        }
        console.log(`Performance Score: ${perfScore}/100`);

        // Energy consumption section
        console.log('\n[Energy Consumption Assessment]');
        console.log(`Estimated Energy Consumption: ${totalWh.toFixed(2)} Wh (CPU: ${energyBreakdown.cpu.toFixed(2)} Wh, Network: ${energyBreakdown.network.toFixed(2)} Wh, Memory: ${energyBreakdown.memory.toFixed(2)} Wh)`);
        console.log(`Energy Consumption Score: ${energyScore}/100`);
        console.log(`Compared to average website: ${percentVsAvg}% ${parseFloat(percentVsAvg) > 0 ? 'higher' : 'lower'}`);
        console.log('Note: Lower energy consumption is better. Score is based on estimated CPU, memory, and network usage.');
        console.log('Scoring: 100 (<=1.5Wh), 80 (<=2Wh), 60 (<=3Wh), 40 (<=4Wh), 20 (<=5Wh), 0 (>5Wh)');

        // Resource size breakdown (JSON, Chart.js config, ASCII chart)
        console.log('\nResource Size Breakdown (KB):');
        console.log(JSON.stringify(resourceBreakdown, null, 2));
        console.log('\nChart.js Config:');
        console.log(getChartJsConfig(resourceBreakdown));
        printAsciiBarChart(resourceBreakdown, useLogScale);

        // Recommendations section
        console.log('\n[Optimization Recommendations]');
        if (consolidatedRecommendations.length === 0) {
            console.log('No optimization recommendations generated.');
        } else {
            consolidatedRecommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec.message} (Impact: ${rec.impact})`);
            });
        }

        // Community tips
        if (community) {
            const tips = await fetchCommunityTips();
            if (tips.length > 0) {
                console.log('\n[Community Tips]');
                tips.forEach((tip, idx) => console.log(`${idx + 1}. ${tip}`));
            }
        }

        const barLength = 40;
        const filledLength = Math.round((totalScore / 100) * barLength);
        const bar = '▓'.repeat(filledLength) + '▒'.repeat(barLength - filledLength);
        console.log(`\n===== TOTAL WEBSITE SCORE: ${totalScore}/100 =====`);
        console.log(`[${bar}]`);
        console.log('\n===== Analysis Complete =====');

        // Export JSON report if requested
        if (exportJson) {
            const output: any = {
                url: targetUrl,
                staticAnalysis: codeAnalysisResults,
                staticScore,
                jsResourceResults,
                jsScore,
                cssResourceResults,
                cssScore,
                imageResourceResults,
                imgScore,
                performanceMetrics,
                perfScore,
                energyBreakdown,
                totalWh,
                energyScore,
                recommendations: consolidatedRecommendations,
                totalScore,
                resourceBreakdown,
                chartJsConfig: JSON.parse(getChartJsConfig(resourceBreakdown))
            };
            if (community) {
                output.communityTips = await fetchCommunityTips();
            }
            fs.writeFileSync('webecoanalyzer-report.json', JSON.stringify(output, null, 2));
            // Save to history
            let history: any[] = [];
            if (fs.existsSync('history.json')) {
                history = JSON.parse(fs.readFileSync('history.json', 'utf-8'));
            }
            history.push({ timestamp: new Date().toISOString(), ...output });
            fs.writeFileSync('history.json', JSON.stringify(history, null, 2));
            console.log('Analysis exported to webecoanalyzer-report.json and history.json');
        }

        return totalScore;
    } catch (error) {
        console.error('Error occurred during analysis:', error);
    }
}

function displayResourceResults(results: ResourceAnalysisResult[]): void {
    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.category} ${result.resourceType}: ${result.count} (Impact: ${result.impact})`);
        if (result.totalSize > 0) {
            console.log(`   Total size: ${(result.totalSize / 1024).toFixed(2)} KB`);
        }
        if (result.recommendation) {
            console.log(`   Recommendation: ${result.recommendation}`);
        }
    });
}

function generateResourceRecommendations(resourceResults: ResourceAnalysisResult[]): Recommendation[] {
    return resourceResults
        .filter(result => result.recommendation && result.recommendation.trim() !== '')
        .map(result => {
            let message = `[${result.resourceType.toUpperCase()}] ${result.recommendation}`;
            if (result.resourceType === 'css' && result.count > 100) {
                message += '\n   Example: Move <style>body { color: black; }</style> to external.css: body { color: black; }';
            }
            return { message, impact: result.impact };
        });
}

function consolidateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const unique: { [msg: string]: Recommendation } = {};
    for (const rec of recommendations) {
        // Normalize by removing [TYPE] prefix for deduplication
        const key = rec.message.replace(/\[.*?\]/, '').trim();
        if (!unique[key] || impactRank(rec.impact) < impactRank(unique[key].impact)) {
            unique[key] = { ...rec, message: rec.message };
        }
    }
    return Object.values(unique);
}

function impactRank(impact: 'low' | 'medium' | 'high'): number {
    return impact === 'high' ? 0 : impact === 'medium' ? 1 : 2;
}

function getResourceSizeBreakdown(
    jsResults: ResourceAnalysisResult[],
    cssResults: ResourceAnalysisResult[],
    imgResults: ResourceAnalysisResult[],
    performanceMetrics?: PerformanceMetrics
): { [key: string]: number } {
    const jsSize = jsResults.reduce((sum, r) => sum + r.totalSize, 0);
    const cssSize = cssResults.reduce((sum, r) => sum + r.totalSize, 0);
    const imgSize = imgResults.reduce((sum, r) => sum + r.totalSize, 0);

    return {
        JavaScript: +(jsSize / 1024).toFixed(2),
        CSS: +(cssSize / 1024).toFixed(2),
        Images: +(imgSize / 1024).toFixed(2)
    };
}

function printAsciiBarChart(breakdown: { [key: string]: number }, useLogScale: boolean = false) {
    const maxLabel = Math.max(...Object.values(breakdown));
    const scale = useLogScale
        ? 40 / Math.log(maxLabel + 1)
        : 40 / (maxLabel || 1);
    Object.entries(breakdown).forEach(([label, value]) => {
        const scaledValue = useLogScale ? Math.log(value + 1) : value;
        const bar = '█'.repeat(Math.round(scaledValue * scale));
        console.log(`${label.padEnd(10)} | ${bar} ${value} KB`);
    });
}

function getChartJsConfig(breakdown: { [key: string]: number }): string {
    const colorPalette = [
        '#36A2EB', // blue
        '#FF6384', // red
        '#FFCE56', // yellow
        '#4BC0C0', // teal
        '#9966FF', // purple
        '#FF9F40', // orange
        '#C9CBCF'  // gray
    ];
    const labels = Object.keys(breakdown);
    return JSON.stringify({
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Resource Size (KB)',
                data: Object.values(breakdown),
                backgroundColor: labels.map((_, i) => colorPalette[i % colorPalette.length])
            }]
        },
        options: {
            title: { display: true, text: 'Resource Size Distribution' },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Size (KB)' } } }
        }
    }, null, 2);
}

function validateMetrics(
    performanceMetrics: PerformanceMetrics,
    imageResults: ResourceAnalysisResult[]
): string[] {
    const warnings: string[] = [];
    if (performanceMetrics.imageSize && imageResults.length === 0) {
        warnings.push('Inconsistency: Image size reported in performance metrics but no images detected.');
    }
    return warnings;
}

async function fetchWebPageContent(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (error) {
        console.error('Error occurred while fetching webpage content:', error);
        return '';
    }
}

// Placeholder for community tips (simulate X API)
async function fetchCommunityTips(): Promise<string[]> {
    return [
        'Tip from @GreenWebFdn: Use lazy-loading for images to save energy.',
        'Tip: Prefer system fonts to reduce font file downloads.'
    ];
}

function showHelp(): void {
    console.log(`
WebEcoAnalyzer - Website Energy Efficiency Analysis Tool
GitHub: https://github.com/HenryLok0/WebEcoAnalyzer

Usage:
  npm run analyze -- <url> [--json] [--log-scale] [--threshold <score>] [--watch] [--community]
  npm run analyze -- --help

Flags:
  --json         Output analysis as JSON report (webecoanalyzer-report.json)
  --log-scale    Use logarithmic scale for ASCII bar chart
  --threshold N  Exit with code 1 if total score < N (for CI/CD)
  --watch        Re-analyze every 5 minutes (real-time monitoring)
  --community    Show community tips from X (Twitter)
  --help         Show this help message

Examples:
  npm run analyze -- https://example.com --threshold 80
  npm run analyze -- https://example.com --json --watch
  npm run analyze -- https://example.com --community

Scoring and Metrics:
- Energy consumption is estimated in Wh (CPU, Network, Memory) and benchmarked against an average website (1.5 Wh).
- Scores are calculated for static code, JS, CSS, images, performance, and energy.
- Recommendations are prioritized by impact (high > medium > low) and deduplicated.
- Resource size breakdown is visualized as ASCII bar chart and Chart.js config.
- Supports CI/CD integration and real-time monitoring.
`);
}

if (require.main === module) {
    run().then(exitCode => {
        process.exit(exitCode);
    });
}

export { validateMetrics };