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
                    totalSize: 0,
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
                totalSize: 0,
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

        // --- Optimization Recommendations ---

        // Recommend minifying CSS
        if (inlineStyles.length + externalStylesheets.length > 0) {
            analysisResults.push({
                resourceType: 'css',
                category: 'optimization',
                count: 1,
                totalSize: 0,
                impact: 'medium',
                recommendation: 'Minify CSS using tools like cssnano or CleanCSS to reduce file size and improve load speed.'
            });
        }

        // Recommend using critical CSS
        if (externalStylesheets.length > 2) {
            analysisResults.push({
                resourceType: 'css',
                category: 'optimization',
                count: 1,
                totalSize: 0,
                impact: 'medium',
                recommendation: 'Consider extracting and inlining critical CSS for above-the-fold content to speed up first paint.'
            });
        }

        // Recommend using CSS variables
        const cssVarRegex = /--[\w-]+\s*:/g;
        const cssVarMatches = pageContent.match(cssVarRegex) || [];
        if (cssVarMatches.length === 0 && (inlineStyles.length > 0 || externalStylesheets.length > 0)) {
            analysisResults.push({
                resourceType: 'css',
                category: 'optimization',
                count: 1,
                totalSize: 0,
                impact: 'low',
                recommendation: 'Use CSS custom properties (variables) for colors and spacing to improve maintainability and reduce duplication.'
            });
        }

        // Recommend reducing @import usage
        const cssImportRegex = /@import\s+url\(/gi;
        const cssImportMatches = pageContent.match(cssImportRegex) || [];
        if (cssImportMatches.length > 0) {
            analysisResults.push({
                resourceType: 'css',
                category: 'optimization',
                count: cssImportMatches.length,
                totalSize: 0,
                impact: cssImportMatches.length > 2 ? 'high' : 'medium',
                recommendation: 'Avoid excessive use of @import in CSS. Prefer combining stylesheets to reduce blocking requests.'
            });
        }

        // Recommend using modern CSS features
        if (externalStylesheets.length > 0 || inlineStyles.length > 0) {
            analysisResults.push({
                resourceType: 'css',
                category: 'optimization',
                count: 1,
                totalSize: 0,
                impact: 'low',
                recommendation: 'Consider using modern CSS features like flexbox and grid for layout to reduce reliance on heavy frameworks.'
            });
        }

        // Recommend reducing unused CSS
        if (inlineStyles.length + externalStylesheets.length > 0) {
            analysisResults.push({
                resourceType: 'css',
                category: 'optimization',
                count: 1,
                totalSize: 0,
                impact: 'medium',
                recommendation: 'Remove unused CSS with tools like PurgeCSS or UnCSS to reduce CSS size and improve efficiency.'
            });
        }

        // Recommend using font-display: swap
        const fontFaceRegex = /@font-face\s*{[^}]*}/gi;
        const fontFaceMatches = pageContent.match(fontFaceRegex) || [];
        if (fontFaceMatches.length > 0 && !/font-display\s*:\s*swap/.test(pageContent)) {
            analysisResults.push({
                resourceType: 'css',
                category: 'optimization',
                count: 1,
                totalSize: 0,
                impact: 'low',
                recommendation: 'Add `font-display: swap` to @font-face rules to improve text rendering speed and user experience.'
            });
        }

        return analysisResults;
    }

    /**
     * Calculate a score (max 100) for the website based on CSS resource analysis
     * @param analysisResults The array of ResourceAnalysisResult
     * @returns number (0~100)
     */
    public calculateScore(analysisResults: ResourceAnalysisResult[]): number {
        let score = 100;

        for (const result of analysisResults) {
            // Inline styles penalty
            if (result.category === 'inline') {
                if (result.count > 2) score -= 5;
                if (result.count > 10) score -= 10;
                if (result.count > 20) score -= 15;
            }
            // External stylesheets penalty
            if (result.category === 'external') {
                if (result.count > 4) score -= 10;
                if (result.count > 8) score -= 15;
            }
            // Third-party stylesheets penalty
            if (result.category === 'third-party') {
                if (result.count > 2) score -= 5;
                if (result.count > 5) score -= 10;
            }
            // Animation penalty
            if (result.recommendation && result.recommendation.includes('animations')) {
                score -= 5;
            }
            // Optimization recommendations penalty
            if (result.category === 'optimization') {
                if (result.impact === 'high') score -= 10;
                if (result.impact === 'medium') score -= 5;
                if (result.impact === 'low') score -= 2;
            }
        }

        // Ensure score is between 0 and 100
        if (score < 0) score = 0;
        if (score > 100) score = 100;
        return score;
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