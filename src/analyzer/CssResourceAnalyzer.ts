import { ResourceAnalysisResult } from '../types';

export class CssResourceAnalyzer {
    /**
     * Analyze CSS resources in a web page
     * @param pageContent The HTML content of the web page
     * @returns Array of CSS resource analysis results
     */
    analyze(pageContent: string): ResourceAnalysisResult[] {
        const analysisResults: ResourceAnalysisResult[] = [];

        if (!pageContent || pageContent.trim() === '') {
            return [];
        }

        // Capture <style> tags
        const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        const linkStylesheetRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;

        // Analyze inline styles
        let matches;
        const inlineStyles: string[] = [];
        while ((matches = styleTagRegex.exec(pageContent)) !== null) {
            if (matches[1] && matches[1].trim() !== '') {
                inlineStyles.push(matches[1]);
            }
        }
        if (inlineStyles.length > 0) {
            analysisResults.push({
                resourceType: 'css',
                category: 'inline',
                count: inlineStyles.length,
                totalSize: this.calculateTotalSize(inlineStyles),
                impact: this.determineImpact(inlineStyles.length),
                recommendation: inlineStyles.length > 2
                    ? 'It is recommended to merge multiple inline styles into a single external stylesheet to improve caching efficiency'
                    : ''
            });
        }

        // Analyze external stylesheets
        linkStylesheetRegex.lastIndex = 0;
        const externalStylesheets: string[] = [];
        while ((matches = linkStylesheetRegex.exec(pageContent)) !== null) {
            if (matches[1]) {
                externalStylesheets.push(matches[1]);
            }
        }
        if (externalStylesheets.length > 0) {
            // Determine third-party stylesheets
            const thirdPartyStylesheets = externalStylesheets.filter(src =>
                src.startsWith('http') && typeof window !== 'undefined'
                    ? !src.includes(window.location.hostname)
                    : true // If there is no window object, default to third-party
            );
            if (thirdPartyStylesheets.length > 0) {
                analysisResults.push({
                    resourceType: 'css',
                    category: 'third-party',
                    count: thirdPartyStylesheets.length,
                    totalSize: 0, // Actual size needs to be fetched separately
                    impact: this.determineImpact(thirdPartyStylesheets.length),
                    recommendation: thirdPartyStylesheets.length > 3
                        ? 'Reduce the number of third-party stylesheets to lower network load'
                        : ''
                });
            }
            analysisResults.push({
                resourceType: 'css',
                category: 'external',
                count: externalStylesheets.length,
                totalSize: 0, // Actual size needs to be fetched separately
                impact: this.determineImpact(externalStylesheets.length),
                recommendation: externalStylesheets.length > 4
                    ? 'It is recommended to merge external stylesheets to reduce HTTP requests'
                    : ''
            });
        }

        // Analyze inline style attributes
        const inlineStyleAttrRegex = /style=["']([^"']+)["']/gi;
        const inlineStyleAttrs: string[] = [];
        while ((matches = inlineStyleAttrRegex.exec(pageContent)) !== null) {
            if (matches[1]) {
                inlineStyleAttrs.push(matches[1]);
            }
        }
        if (inlineStyleAttrs.length > 5) {
            analysisResults.push({
                resourceType: 'css',
                category: 'inline',
                count: inlineStyleAttrs.length,
                totalSize: this.calculateTotalSize(inlineStyleAttrs),
                impact: inlineStyleAttrs.length > 20 ? 'high' : 'medium',
                recommendation: 'Too many inline styles will bloat the HTML and make it hard to maintain. It is recommended to use CSS classes instead.'
            });
        }

        // Check for CSS animations and transitions
        const cssAnimationRegex = /@keyframes\s+\w+|animation\s*:|transition\s*:/gi;
        const cssAnimationMatches = pageContent.match(cssAnimationRegex) || [];
        if (cssAnimationMatches.length > 5) {
            analysisResults.push({
                resourceType: 'css',
                category: 'inline',
                count: cssAnimationMatches.length,
                totalSize: 0,
                impact: cssAnimationMatches.length > 10 ? 'high' : 'medium',
                recommendation: 'Too many CSS animations will increase CPU load and power consumption. It is recommended to reduce or optimize animations.'
            });
        }

        return analysisResults;
    }

    /**
     * Calculate the total size (bytes) of CSS strings
     */
    private calculateTotalSize(styles: string[]): number {
        // No Blob in Node.js, use Buffer instead
        if (typeof Buffer !== 'undefined') {
            return styles.reduce((total, style) => total + Buffer.byteLength(style, 'utf8'), 0);
        }
        // If Blob exists (browser), use Blob
        if (typeof Blob !== 'undefined') {
            return styles.reduce((total, style) => total + new Blob([style]).size, 0);
        }
        // fallback
        return styles.reduce((total, style) => total + style.length, 0);
    }

    /**
     * Determine impact level based on count
     */
    private determineImpact(count: number): 'low' | 'medium' | 'high' {
        if (count <= 2) return 'low';
        if (count <= 5) return 'medium';
        return 'high';
    }
}