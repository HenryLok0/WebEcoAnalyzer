"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMetrics = exports.run = void 0;
const staticAnalyzer_1 = require("../analyzer/staticAnalyzer");
const performanceCollector_1 = require("../analyzer/performanceCollector");
const energyEstimator_1 = require("../analyzer/energyEstimator");
const recommendations_1 = require("../analyzer/recommendations");
const JavaScriptResourceAnalyzer_1 = require("../analyzer/JavaScriptResourceAnalyzer");
const CssResourceAnalyzer_1 = require("../analyzer/CssResourceAnalyzer");
const ImageResourceAnalyzer_1 = require("../analyzer/ImageResourceAnalyzer");
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs = __importStar(require("fs"));
function run(args = process.argv.slice(2)) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const interval = setInterval(() => analyzeWebsite(url, exportJson, useLogScale, community), 5 * 60 * 1000);
            process.on('SIGINT', () => clearInterval(interval));
            yield analyzeWebsite(url, exportJson, useLogScale, community);
            return 0;
        }
        const totalScore = yield analyzeWebsite(url, exportJson, useLogScale, community);
        if (threshold !== null && typeof totalScore === 'number' && totalScore < threshold) {
            console.error(`Total score ${totalScore} is below threshold ${threshold}`);
            return 1;
        }
        return 0;
    });
}
exports.run = run;
function analyzeWebsite(targetUrl, exportJson = false, useLogScale = false, community = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const staticAnalyzer = new staticAnalyzer_1.StaticAnalyzer();
        const performanceCollector = new performanceCollector_1.PerformanceCollector();
        const energyEstimator = new energyEstimator_1.EnergyEstimator();
        const recommendations = new recommendations_1.Recommendations();
        const jsResourceAnalyzer = new JavaScriptResourceAnalyzer_1.JavaScriptResourceAnalyzer();
        const cssResourceAnalyzer = new CssResourceAnalyzer_1.CssResourceAnalyzer();
        const imageResourceAnalyzer = new ImageResourceAnalyzer_1.ImageResourceAnalyzer();
        console.log(`Analyzing energy efficiency of ${targetUrl}...`);
        try {
            console.log("Fetching webpage content...");
            const pageContent = yield fetchWebPageContent(targetUrl);
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
            const imageResourceResults = yield imageResourceAnalyzer.analyze(pageContent, targetUrl);
            const imgScore = imageResourceAnalyzer.calculateScore(imageResourceResults);
            // Performance metrics
            console.log("Collecting performance metrics...");
            const performanceMetrics = yield performanceCollector.collectMetrics(targetUrl);
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
            const scores = [staticScore, jsScore, cssScore, imgScore, perfScore, energyScore];
            const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            // Resource size breakdown for visualization (修正：傳入 performanceMetrics)
            const resourceBreakdown = getResourceSizeBreakdown(jsResourceResults, cssResourceResults, imageResourceResults, performanceMetrics);
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
            }
            else {
                codeAnalysisResults.forEach((result, index) => {
                    console.log(`${index + 1}. ${result}`);
                });
            }
            console.log(`Static Code Analysis Score: ${staticScore}/100`);
            // JavaScript resources section
            console.log('\n[JavaScript Resource Analysis]');
            if (jsResourceResults.length === 0) {
                console.log('No JavaScript resources detected.');
            }
            else {
                displayResourceResults(jsResourceResults);
            }
            console.log(`JavaScript Resource Score: ${jsScore}/100`);
            // CSS resources section
            console.log('\n[CSS Resource Analysis]');
            if (cssResourceResults.length === 0) {
                console.log('No CSS resources detected.');
            }
            else {
                displayResourceResults(cssResourceResults);
            }
            console.log(`CSS Resource Score: ${cssScore}/100`);
            // Image resources section
            console.log('\n[Image Resource Analysis]');
            if (imageResourceResults.length === 0) {
                console.log('No image resources detected.');
            }
            else {
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
            }
            else {
                consolidatedRecommendations.forEach((rec, index) => {
                    console.log(`${index + 1}. ${rec.message} (Impact: ${rec.impact})`);
                });
            }
            // Community tips
            if (community) {
                const tips = yield fetchCommunityTips();
                if (tips.length > 0) {
                    console.log('\n[Community Tips]');
                    tips.forEach((tip, idx) => console.log(`${idx + 1}. ${tip}`));
                }
            }
            // Total score
            console.log(`\n===== TOTAL WEBSITE SCORE: ${totalScore}/100 =====`);
            console.log('\n===== Analysis Complete =====');
            // Export JSON report if requested
            if (exportJson) {
                const output = {
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
                    output.communityTips = yield fetchCommunityTips();
                }
                fs.writeFileSync('webecoanalyzer-report.json', JSON.stringify(output, null, 2));
                // Save to history
                let history = [];
                if (fs.existsSync('history.json')) {
                    history = JSON.parse(fs.readFileSync('history.json', 'utf-8'));
                }
                history.push(Object.assign({ timestamp: new Date().toISOString() }, output));
                fs.writeFileSync('history.json', JSON.stringify(history, null, 2));
                console.log('Analysis exported to webecoanalyzer-report.json and history.json');
            }
            return totalScore;
        }
        catch (error) {
            console.error('Error occurred during analysis:', error);
        }
    });
}
function displayResourceResults(results) {
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
function generateResourceRecommendations(resourceResults) {
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
function consolidateRecommendations(recommendations) {
    const unique = {};
    for (const rec of recommendations) {
        // Normalize by removing [TYPE] prefix for deduplication
        const key = rec.message.replace(/\[.*?\]/, '').trim();
        if (!unique[key] || impactRank(rec.impact) < impactRank(unique[key].impact)) {
            unique[key] = Object.assign(Object.assign({}, rec), { message: rec.message });
        }
    }
    return Object.values(unique);
}
function impactRank(impact) {
    return impact === 'high' ? 0 : impact === 'medium' ? 1 : 2;
}
function getResourceSizeBreakdown(jsResults, cssResults, imgResults, performanceMetrics) {
    const jsSize = jsResults.reduce((sum, r) => sum + r.totalSize, 0);
    const cssSize = cssResults.reduce((sum, r) => sum + r.totalSize, 0);
    const imgSize = imgResults.reduce((sum, r) => sum + r.totalSize, 0);
    return {
        JavaScript: +(jsSize / 1024).toFixed(2),
        CSS: +(cssSize / 1024).toFixed(2),
        Images: +(imgSize / 1024).toFixed(2)
    };
}
function printAsciiBarChart(breakdown, useLogScale = false) {
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
function getChartJsConfig(breakdown) {
    return JSON.stringify({
        type: 'bar',
        data: {
            labels: Object.keys(breakdown),
            datasets: [{
                    label: 'Resource Size (KB)',
                    data: Object.values(breakdown),
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56']
                }]
        },
        options: {
            title: { display: true, text: 'Resource Size Distribution' },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Size (KB)' } } }
        }
    }, null, 2);
}
function validateMetrics(performanceMetrics, imageResults) {
    const warnings = [];
    if (performanceMetrics.imageSize && imageResults.length === 0) {
        warnings.push('Inconsistency: Image size reported in performance metrics but no images detected.');
    }
    return warnings;
}
exports.validateMetrics = validateMetrics;
function fetchWebPageContent(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield (0, node_fetch_1.default)(url);
            return yield response.text();
        }
        catch (error) {
            console.error('Error occurred while fetching webpage content:', error);
            return '';
        }
    });
}
// Placeholder for community tips (simulate X API)
function fetchCommunityTips() {
    return __awaiter(this, void 0, void 0, function* () {
        return [
            'Tip from @GreenWebFdn: Use lazy-loading for images to save energy.',
            'Tip: Prefer system fonts to reduce font file downloads.'
        ];
    });
}
function showHelp() {
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
