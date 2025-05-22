import { ResourceAnalysisResult } from '../types';

export class JavaScriptResourceAnalyzer {
    /**
     * Analyzes JavaScript resources in a webpage
     * @param pageContent HTML content of the webpage
     * @returns Analysis results for JavaScript resources
     */
    analyze(pageContent: string): ResourceAnalysisResult[] {
        const analysisResults: ResourceAnalysisResult[] = [];
        
        if (!pageContent || pageContent.trim() === '') {
            return [];
        }

        // Extract script tags
        const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        const scriptSrcRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
        
        // Analyze inline scripts
        let matches;
        const inlineScripts: string[] = [];
        
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
        const externalScripts: string[] = [];
        
        while ((matches = scriptSrcRegex.exec(pageContent)) !== null) {
            if (matches[1]) {
                externalScripts.push(matches[1]);
            }
        }
        
        if (externalScripts.length > 0) {
            // Check for third-party scripts
            const thirdPartyScripts = externalScripts.filter(src => 
                src.includes('http') && !src.includes(window.location.hostname));
            
            if (thirdPartyScripts.length > 0) {
                analysisResults.push({
                    resourceType: 'javascript',
                    category: 'third-party',
                    count: thirdPartyScripts.length,
                    totalSize: 0, // Actual size would require fetching the resources
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
                totalSize: 0, // Would require fetching the resources
                impact: this.determineImpact(externalScripts.length),
                recommendation: externalScripts.length > 8 
                    ? 'Consider bundling external scripts to reduce HTTP requests'
                    : ''
            });
        }
        
        return analysisResults;
    }
    
    /**
     * Calculate the total size of scripts in bytes
     */
    private calculateTotalSize(scripts: string[]): number {
        return scripts.reduce((total, script) => total + new Blob([script]).size, 0);
    }
    
    /**
     * Determine the impact level based on count
     */
    private determineImpact(count: number): 'low' | 'medium' | 'high' {
        if (count <= 3) return 'low';
        if (count <= 8) return 'medium';
        return 'high';
    }
}