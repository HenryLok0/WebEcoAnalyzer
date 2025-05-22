"use strict";
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
exports.run = void 0;
const staticAnalyzer_1 = require("../analyzer/staticAnalyzer");
const performanceCollector_1 = require("../analyzer/performanceCollector");
const energyEstimator_1 = require("../analyzer/energyEstimator");
const recommendations_1 = require("../analyzer/recommendations");
const JavaScriptResourceAnalyzer_1 = require("../analyzer/JavaScriptResourceAnalyzer");
const CssResourceAnalyzer_1 = require("../analyzer/CssResourceAnalyzer");
const ImageResourceAnalyzer_1 = require("../analyzer/ImageResourceAnalyzer");
const node_fetch_1 = __importDefault(require("node-fetch"));
function run(args = process.argv.slice(2)) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (args.includes('--help') || args.length === 0) {
                showHelp();
                return 0;
            }
            const url = args[0];
            if (url && url.startsWith('http')) {
                yield analyzeWebsite(url);
                return 0;
            }
            if (args[0] === 'analyze' && args[1] && args[1].startsWith('http')) {
                yield analyzeWebsite(args[1]);
                return 0;
            }
            console.error('Invalid command. Use --help for help.');
            return 1;
        }
        catch (error) {
            console.error('Error occurred during execution:', error);
            return 1;
        }
    });
}
exports.run = run;
function analyzeWebsite(targetUrl) {
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
            // Test if the page content is empty
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
            console.log("Analyzing Image resources...");
            const imageResourceResults = imageResourceAnalyzer.analyze(pageContent);
            const imgScore = imageResourceAnalyzer.calculateScore(imageResourceResults);
            // Performance metrics
            console.log("Collecting performance metrics...");
            const performanceMetrics = yield performanceCollector.collectMetrics(targetUrl);
            const perfScore = performanceCollector.calculateScore(performanceMetrics);
            // Energy consumption
            console.log("Estimating energy consumption...");
            const energyConsumption = energyEstimator.estimateEnergyConsumption(performanceMetrics);
            const energyScore = energyEstimator.calculateScore(energyConsumption);
            // Recommendations
            console.log("Generating optimization recommendations...");
            const recommendationsList = recommendations.generateRecommendations(performanceMetrics);
            const resourceRecommendations = generateResourceRecommendations([
                ...jsResourceResults,
                ...cssResourceResults,
                ...imageResourceResults
            ]);
            const allRecommendations = [...recommendationsList, ...resourceRecommendations];
            const recScore = recommendations.calculateScore(allRecommendations);
            // Calculate total score (average)
            const scores = [staticScore, jsScore, cssScore, imgScore, perfScore, energyScore, recScore];
            const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            // Output results
            console.log('\n===== Analysis Results =====');
            console.log(`Website: ${targetUrl}`);
            console.log('----------------------------');
            // Static code analysis section
            console.log('\n【Static Code Analysis】');
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
            console.log('\n【JavaScript Resource Analysis】');
            if (jsResourceResults.length === 0) {
                console.log('No JavaScript resources detected.');
            }
            else {
                displayResourceResults(jsResourceResults);
            }
            console.log(`JavaScript Resource Score: ${jsScore}/100`);
            // CSS resources section
            console.log('\n【CSS Resource Analysis】');
            if (cssResourceResults.length === 0) {
                console.log('No CSS resources detected.');
            }
            else {
                displayResourceResults(cssResourceResults);
            }
            console.log(`CSS Resource Score: ${cssScore}/100`);
            // Image resources section
            console.log('\n【Image Resource Analysis】');
            if (imageResourceResults.length === 0) {
                console.log('No Image resources detected.');
            }
            else {
                displayResourceResults(imageResourceResults);
            }
            console.log(`Image Resource Score: ${imgScore}/100`);
            // Performance metrics section
            console.log('\n【Performance Metrics】');
            console.log(`• CPU Time: ${performanceMetrics.cpuTime}ms`);
            console.log(`• Memory Usage: ${(performanceMetrics.memoryUsage / (1024 * 1024)).toFixed(2)}MB`);
            console.log(`• Network Requests: ${performanceMetrics.networkRequests}`);
            if (performanceMetrics.jsExecutionTime !== undefined) {
                console.log(`• JavaScript Execution Time: ${performanceMetrics.jsExecutionTime}ms`);
            }
            if (performanceMetrics.imageSize !== undefined) {
                console.log(`• Image Size: ${performanceMetrics.imageSize}KB`);
            }
            console.log(`Performance Score: ${perfScore}/100`);
            // Energy consumption section
            console.log('\n【Energy Consumption Assessment】');
            console.log(`Estimated Energy Consumption Index: ${energyConsumption.toFixed(2)}`);
            console.log(`Energy Consumption Score: ${energyScore}/100`);
            // Recommendations section
            console.log('\n【Optimization Recommendations】');
            if (allRecommendations.length === 0) {
                console.log('No optimization recommendations generated.');
            }
            else {
                allRecommendations
                    .sort((a, b) => {
                    const impactOrder = { high: 0, medium: 1, low: 2 };
                    return impactOrder[a.impact] - impactOrder[b.impact];
                })
                    .forEach((rec, index) => {
                    console.log(`${index + 1}. ${rec.message} (Impact Level: ${rec.impact})`);
                });
            }
            // Total score
            console.log(`\n===== TOTAL WEBSITE SCORE: ${totalScore}/100 =====`);
            console.log('\n===== Analysis Complete =====');
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
            console.log(`   Total size: ${(result.totalSize / 1024).toFixed(2)}KB`);
        }
        if (result.recommendation) {
            console.log(`   Recommendation: ${result.recommendation}`);
        }
    });
}
function generateResourceRecommendations(resourceResults) {
    return resourceResults
        .filter(result => result.recommendation && result.recommendation.trim() !== '')
        .map(result => ({
        message: `[${result.resourceType.toUpperCase()}] ${result.recommendation}`,
        impact: result.impact
    }));
}
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
function showHelp() {
    console.log(`
WebEcoAnalyzer - Website Energy Efficiency Analysis Tool

Usage:
  npm run analyze -- <your-website-url>    Analyze the energy efficiency of the specified website
  npm run analyze -- --help                Show help information

Example:
  npm run analyze -- https://example.com
`);
}
if (require.main === module) {
    run().then(exitCode => {
        process.exit(exitCode);
    });
}
