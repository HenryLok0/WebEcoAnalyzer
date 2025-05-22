import { StaticAnalyzer } from '../analyzer/staticAnalyzer';
import { PerformanceCollector } from '../analyzer/performanceCollector';
import { EnergyEstimator } from '../analyzer/energyEstimator';
import { Recommendations } from '../analyzer/recommendations';
import { JavaScriptResourceAnalyzer } from '../analyzer/JavaScriptResourceAnalyzer';
import { CssResourceAnalyzer } from '../analyzer/CssResourceAnalyzer';
import { ImageResourceAnalyzer } from '../analyzer/ImageResourceAnalyzer';
import { PerformanceMetrics, Recommendation, ResourceAnalysisResult } from '../types';
import fetch from 'node-fetch';

export async function run(args: string[] = process.argv.slice(2)): Promise<number> {
    try {
        if (args.includes('--help') || args.length === 0) {
            showHelp();
            return 0;
        }

        const url = args[0];
        if (url && url.startsWith('http')) {
            await analyzeWebsite(url);
            return 0;
        }

        if (args[0] === 'analyze' && args[1] && args[1].startsWith('http')) {
            await analyzeWebsite(args[1]);
            return 0;
        }

        console.error('Invalid command. Use --help for help.');
        return 1;
    } catch (error) {
        console.error('Error occurred during execution:', error);
        return 1;
    }
}

async function analyzeWebsite(targetUrl: string): Promise<void> {
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
        const performanceMetrics = await performanceCollector.collectMetrics(targetUrl);
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
        } else {
            codeAnalysisResults.forEach((result, index) => {
                console.log(`${index + 1}. ${result}`);
            });
        }
        console.log(`Static Code Analysis Score: ${staticScore}/100`);

        // JavaScript resources section
        console.log('\n【JavaScript Resource Analysis】');
        if (jsResourceResults.length === 0) {
            console.log('No JavaScript resources detected.');
        } else {
            displayResourceResults(jsResourceResults);
        }
        console.log(`JavaScript Resource Score: ${jsScore}/100`);

        // CSS resources section
        console.log('\n【CSS Resource Analysis】');
        if (cssResourceResults.length === 0) {
            console.log('No CSS resources detected.');
        } else {
            displayResourceResults(cssResourceResults);
        }
        console.log(`CSS Resource Score: ${cssScore}/100`);

        // Image resources section
        console.log('\n【Image Resource Analysis】');
        if (imageResourceResults.length === 0) {
            console.log('No Image resources detected.');
        } else {
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
        } else {
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
    } catch (error) {
        console.error('Error occurred during analysis:', error);
    }
}

function displayResourceResults(results: ResourceAnalysisResult[]): void {
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

function generateResourceRecommendations(resourceResults: ResourceAnalysisResult[]): Recommendation[] {
    return resourceResults
        .filter(result => result.recommendation && result.recommendation.trim() !== '')
        .map(result => ({
            message: `[${result.resourceType.toUpperCase()}] ${result.recommendation}`,
            impact: result.impact
        }));
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

function showHelp(): void {
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