"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaScriptResourceAnalyzer = void 0;
class JavaScriptResourceAnalyzer {
    /**
     * Analyzes JavaScript resources in a webpage
     * @param pageContent HTML content of the webpage
     * @returns Analysis results for JavaScript resources
     */
    analyze(pageContent) {
        const analysisResults = [];
        if (!pageContent || pageContent.trim() === '') {
            return [];
        }
        // Extract script tags
        const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        const scriptSrcRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
        // Analyze inline scripts
        let matches;
        const inlineScripts = [];
        while ((matches = scriptTagRegex.exec(pageContent)) !== null) {
            if (matches[1] && matches[1].trim() !== '') {
                inlineScripts.push(matches[1]);
            }
        }
        if (inlineScripts.length > 0) {
            analysisResults.push({
                resourceType: 'javascript',
                category: 'inline',
                count: inlineScripts.length,
                totalSize: this.calculateTotalSize(inlineScripts),
                impact: this.determineImpact(inlineScripts.length),
                recommendation: inlineScripts.length > 3
                    ? 'Consider combining inline scripts into a single external file to improve caching'
                    : ''
            });
        }
        // Analyze external script sources
        scriptSrcRegex.lastIndex = 0;
        const externalScripts = [];
        while ((matches = scriptSrcRegex.exec(pageContent)) !== null) {
            if (matches[1]) {
                externalScripts.push(matches[1]);
            }
        }
        if (externalScripts.length > 0) {
            // Check for third-party scripts
            const thirdPartyScripts = externalScripts.filter(src => src.includes('http') && (typeof window === 'undefined' || !src.includes(window.location.hostname)));
            if (thirdPartyScripts.length > 0) {
                analysisResults.push({
                    resourceType: 'javascript',
                    category: 'third-party',
                    count: thirdPartyScripts.length,
                    totalSize: 0,
                    impact: this.determineImpact(thirdPartyScripts.length),
                    recommendation: thirdPartyScripts.length > 5
                        ? 'Reduce the number of third-party scripts to minimize network overhead and processing time'
                        : ''
                });
            }
            analysisResults.push({
                resourceType: 'javascript',
                category: 'external',
                count: externalScripts.length,
                totalSize: 0,
                impact: this.determineImpact(externalScripts.length),
                recommendation: externalScripts.length > 8
                    ? 'Consider bundling external scripts to reduce HTTP requests'
                    : ''
            });
        }
        return analysisResults;
    }
    /**
     * Calculate a score (max 100) for the website based on JavaScript resource analysis
     * @param analysisResults The array of ResourceAnalysisResult
     * @returns number (0~100)
     */
    calculateScore(analysisResults) {
        let score = 100;
        for (const result of analysisResults) {
            // Penalty for too many inline scripts
            if (result.category === 'inline' && result.resourceType === 'javascript') {
                if (result.count > 3)
                    score -= 10;
                if (result.count > 10)
                    score -= 10;
            }
            // Penalty for too many external scripts
            if (result.category === 'external' && result.resourceType === 'javascript') {
                if (result.count > 8)
                    score -= 10;
                if (result.count > 15)
                    score -= 10;
            }
            // Penalty for too many third-party scripts
            if (result.category === 'third-party' && result.resourceType === 'javascript') {
                if (result.count > 5)
                    score -= 10;
                if (result.count > 10)
                    score -= 10;
            }
        }
        // Ensure score is between 0 and 100
        if (score < 0)
            score = 0;
        if (score > 100)
            score = 100;
        return score;
    }
    /**
     * Calculate the total size of scripts in bytes
     */
    calculateTotalSize(scripts) {
        if (typeof Buffer !== 'undefined') {
            return scripts.reduce((total, script) => total + Buffer.byteLength(script, 'utf8'), 0);
        }
        if (typeof Blob !== 'undefined') {
            return scripts.reduce((total, script) => total + new Blob([script]).size, 0);
        }
        return scripts.reduce((total, script) => total + script.length, 0);
    }
    /**
     * Determine the impact level based on count
     */
    determineImpact(count) {
        if (count <= 3)
            return 'low';
        if (count <= 8)
            return 'medium';
        return 'high';
    }
}
exports.JavaScriptResourceAnalyzer = JavaScriptResourceAnalyzer;
