import { StaticAnalyzer } from '../analyzer/staticAnalyzer';
import { PerformanceCollector } from '../analyzer/performanceCollector';
import { EnergyEstimator } from '../analyzer/energyEstimator';
import { Recommendations } from '../analyzer/recommendations';
import { JavaScriptResourceAnalyzer } from '../analyzer/JavaScriptResourceAnalyzer';
import { CssResourceAnalyzer } from '../analyzer/CssResourceAnalyzer';
import { ImageResourceAnalyzer } from '../analyzer/ImageResourceAnalyzer';
import { PerformanceMetrics, Recommendation, ResourceAnalysisResult } from '../types';

export async function run(args: string[] = process.argv.slice(2)): Promise<number> {
    try {
        // Check if help command
        if (args.includes('--help') || args.length === 0) {
            showHelp();
            return 0;
        }

        // Check if there's a target URL
        // Handle case when URL is passed directly
        const url = args[0];
        if (url && url.startsWith('http')) {
            await analyzeWebsite(url);
            return 0;
        }

        // Handle 'analyze URL' format
        if (args[0] === 'analyze' && args[1] && args[1].startsWith('http')) {
            await analyzeWebsite(args[1]);
            return 0;
        }

        // Invalid command
        console.error('Invalid command. Use --help for help.');
        return 1;
    } catch (error) {
        console.error('Error occurred during execution:', error);
        return 1;
    }
}

async function analyzeWebsite(targetUrl: string): Promise<void> {
    // Initialize all analyzers
    const staticAnalyzer = new StaticAnalyzer();
    const performanceCollector = new PerformanceCollector();
    const energyEstimator = new EnergyEstimator();
    const recommendations = new Recommendations();
    const jsResourceAnalyzer = new JavaScriptResourceAnalyzer();
    const cssResourceAnalyzer = new CssResourceAnalyzer();
    const imageResourceAnalyzer = new ImageResourceAnalyzer();

    console.log(`Analyzing energy efficiency of ${targetUrl}...`);

    try {
        // For static analysis, we need to fetch the webpage content instead of passing the URL directly
        console.log("Fetching webpage content...");
        const pageContent = await fetchWebPageContent(targetUrl);

        // Perform static analysis
        console.log("Performing static code analysis...");
        const codeAnalysisResults = staticAnalyzer.analyze(pageContent);

        // Analyze JavaScript resources
        console.log("Analyzing JavaScript resources...");
        const jsResourceResults = jsResourceAnalyzer.analyze(pageContent);

        // Analyze CSS resources
        console.log("Analyzing CSS resources...");
        const cssResourceResults = cssResourceAnalyzer.analyze(pageContent);

        // Analyze Image resources
        console.log("Analyzing Image resources...");
        const imageResourceResults = imageResourceAnalyzer.analyze(pageContent);

        // Collect performance metrics
        console.log("Collecting performance metrics...");
        const performanceMetrics = await performanceCollector.collectMetrics(targetUrl);

        // Estimate energy consumption
        console.log("Estimating energy consumption...");
        const energyConsumption = energyEstimator.estimateEnergyConsumption(performanceMetrics);

        // Generate recommendations
        console.log("Generating optimization recommendations...");
        const recommendationsList = recommendations.generateRecommendations(performanceMetrics);

        // Add resource-specific recommendations
        const resourceRecommendations = generateResourceRecommendations([
            ...jsResourceResults,
            ...cssResourceResults,
            ...imageResourceResults
        ]);

        // Combine recommendations
        const allRecommendations = [...recommendationsList, ...resourceRecommendations];

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

        // JavaScript resources section
        console.log('\n【JavaScript Resource Analysis】');
        if (jsResourceResults.length === 0) {
            console.log('No JavaScript resources detected.');
        } else {
            displayResourceResults(jsResourceResults);
        }

        // CSS resources section
        console.log('\n【CSS Resource Analysis】');
        if (cssResourceResults.length === 0) {
            console.log('No CSS resources detected.');
        } else {
            displayResourceResults(cssResourceResults);
        }

        // Image resources section
        console.log('\n【Image Resource Analysis】');
        if (imageResourceResults.length === 0) {
            console.log('No Image resources detected.');
        } else {
            displayResourceResults(imageResourceResults);
        }

        // Performance metrics section
        console.log('\n【Performance Metrics】');
        console.log(`• CPU Time: ${performanceMetrics.cpuTime}ms`);
        console.log(`• Memory Usage: ${(performanceMetrics.memoryUsage / (1024 * 1024)).toFixed(2)}MB`);
        console.log(`• Network Requests: ${performanceMetrics.networkRequests}`);
        if (performanceMetrics.jsExecutionTime) {
            console.log(`• JavaScript Execution Time: ${performanceMetrics.jsExecutionTime}ms`);
        }
        if (performanceMetrics.imageSize) {
            console.log(`• Image Size: ${performanceMetrics.imageSize}KB`);
        }

        // Energy consumption section
        console.log('\n【Energy Consumption Assessment】');
        console.log(`Estimated Energy Consumption Index: ${energyConsumption.toFixed(2)}`);

        // Recommendations section
        console.log('\n【Optimization Recommendations】');
        if (allRecommendations.length === 0) {
            console.log('No optimization recommendations generated.');
        } else {
            // Sort recommendations by impact
            allRecommendations
                .sort((a, b) => {
                    const impactOrder = { high: 0, medium: 1, low: 2 };
                    return impactOrder[a.impact] - impactOrder[b.impact];
                })
                .forEach((rec, index) => {
                    console.log(`${index + 1}. ${rec.message} (Impact Level: ${rec.impact})`);
                });
        }

        console.log('\n===== Analysis Complete =====');
    } catch (error) {
        console.error('Error occurred during analysis:', error);
    }
}

// Helper function to display resource analysis results
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

// Helper function to generate recommendations from resource analysis results
function generateResourceRecommendations(resourceResults: ResourceAnalysisResult[]): Recommendation[] {
    return resourceResults
        .filter(result => result.recommendation && result.recommendation.trim() !== '')
        .map(result => ({
            message: `[${result.resourceType.toUpperCase()}] ${result.recommendation}`,
            impact: result.impact
        }));
}

// Implement webpage content fetching function
async function fetchWebPageContent(url: string): Promise<string> {
    try {
        // Use Puppeteer to fetch page content
        // Here we use a simple simulation instead of actual fetching
        console.log(`Simulating webpage content fetch: ${url}`);

        // In an actual implementation, we should use puppeteer or other tools to fetch the HTML and JS of the page
        // Assume this is the fetched page content
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Sample Page</title>
                    <script>
                        setInterval(function() {
                            console.log('Test');
                        }, 100);
                        
                        setTimeout(function() {
                            console.log('Delayed action');
                        }, 5000);
                        
                        for(let i = 0; i < 1000; i++) {
                            // Inefficient loop
                        }
                    </script>
                    <style>
                        body {
                            animation: fadeIn 2s;
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Sample Page for Testing</h1>
                    <img src="example.jpg" alt="Example Image">
                    <img src="large-image.png" alt="Large Image">
                </body>
            </html>
        `;
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

// If this file is run directly, execute the run function
if (require.main === module) {
    run().then(exitCode => {
        process.exit(exitCode);
    });
}