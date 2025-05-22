"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageResourceAnalyzer = void 0;
class ImageResourceAnalyzer {
    /**
     * Analyzes image resources in a webpage
     * @param pageContent HTML content of the webpage
     * @returns Analysis results for image resources
     */
    analyze(pageContent) {
        const analysisResults = [];
        if (!pageContent || pageContent.trim() === '') {
            return [];
        }
        // Extract image tags
        const imgTagRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
        // Analyze different image types
        const images = [];
        const unoptimizedImages = [];
        const largeImages = [];
        let matches;
        while ((matches = imgTagRegex.exec(pageContent)) !== null) {
            if (matches[1]) {
                const imgSrc = matches[1];
                images.push(imgSrc);
                // Check if image has width and height attributes
                const hasWidthHeight = matches[0].includes('width=') && matches[0].includes('height=');
                if (!hasWidthHeight) {
                    unoptimizedImages.push(imgSrc);
                }
                // Check image format
                if (imgSrc.match(/\.(jpe?g|png|gif|bmp)$/i) && !imgSrc.includes('webp')) {
                    largeImages.push(imgSrc);
                }
            }
        }
        if (images.length > 0) {
            analysisResults.push({
                resourceType: 'image',
                category: 'external',
                count: images.length,
                totalSize: 0,
                impact: this.determineImpact(images.length),
                recommendation: images.length > 10
                    ? 'High number of images detected. Consider using image sprites or lazy loading for better performance.'
                    : ''
            });
        }
        if (unoptimizedImages.length > 0) {
            analysisResults.push({
                resourceType: 'image',
                category: 'external',
                count: unoptimizedImages.length,
                totalSize: 0,
                impact: this.determineImpact(unoptimizedImages.length),
                recommendation: 'Images without explicit width and height attributes cause layout shifts during page load. Add these attributes to all images.'
            });
        }
        if (largeImages.length > 0) {
            analysisResults.push({
                resourceType: 'image',
                category: 'external',
                count: largeImages.length,
                totalSize: 0,
                impact: largeImages.length > 5 ? 'high' : 'medium',
                recommendation: 'Consider using WebP or AVIF format for images which can reduce file size by up to 30% compared to JPEG/PNG.'
            });
        }
        // Check background images in CSS
        const bgImageRegex = /background(-image)?\s*:\s*url\(['"]?([^'")]+)['"]?\)/gi;
        const bgImages = [];
        while ((matches = bgImageRegex.exec(pageContent)) !== null) {
            if (matches[2]) {
                bgImages.push(matches[2]);
            }
        }
        if (bgImages.length > 3) {
            analysisResults.push({
                resourceType: 'image',
                category: 'external',
                count: bgImages.length,
                totalSize: 0,
                impact: bgImages.length > 7 ? 'high' : 'medium',
                recommendation: 'Multiple CSS background images detected. Consider combining them into CSS sprites or using modern CSS techniques like gradients where appropriate.'
            });
        }
        return analysisResults;
    }
    /**
     * Calculate a score (max 100) for the website based on image resource analysis
     * @param analysisResults The array of ResourceAnalysisResult
     * @returns number (0~100)
     */
    calculateScore(analysisResults) {
        let score = 100;
        for (const result of analysisResults) {
            // Penalty for too many images
            if (result.category === 'external' && result.resourceType === 'image') {
                if (result.count > 10)
                    score -= 10;
                if (result.count > 20)
                    score -= 10;
            }
            // Penalty for unoptimized images (missing width/height)
            if (result.recommendation &&
                result.recommendation.includes('width and height attributes')) {
                score -= 10;
            }
            // Penalty for large images not using modern formats
            if (result.recommendation &&
                result.recommendation.includes('WebP or AVIF')) {
                score -= 10;
            }
            // Penalty for too many background images
            if (result.recommendation &&
                result.recommendation.includes('background images')) {
                score -= 5;
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
     * Determine the impact level based on count
     */
    determineImpact(count) {
        if (count <= 5)
            return 'low';
        if (count <= 15)
            return 'medium';
        return 'high';
    }
}
exports.ImageResourceAnalyzer = ImageResourceAnalyzer;
