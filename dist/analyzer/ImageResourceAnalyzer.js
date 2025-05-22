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
exports.ImageResourceAnalyzer = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class ImageResourceAnalyzer {
    /**
     * Analyzes image resources in a webpage and fetches their actual sizes.
     * @param pageContent HTML content of the webpage
     * @param baseUrl The base URL of the webpage (for resolving relative image URLs)
     * @returns Analysis results for image resources
     */
    analyze(pageContent, baseUrl) {
        return __awaiter(this, void 0, void 0, function* () {
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
            // Fetch image sizes (HEAD requests)
            let totalImageSize = 0;
            for (const imgUrl of images) {
                try {
                    let fullUrl = imgUrl;
                    if (!/^https?:\/\//i.test(imgUrl) && baseUrl) {
                        fullUrl = new URL(imgUrl, baseUrl).href;
                    }
                    if (!/^https?:\/\//i.test(fullUrl)) {
                        console.log(`[ImageAnalyzer] Skip non-http url: ${imgUrl}`);
                        continue;
                    }
                    const res = yield (0, node_fetch_1.default)(fullUrl, { method: 'HEAD', redirect: 'follow' });
                    let size = res.headers.get('content-length');
                    if (!size) {
                        // fallback GET
                        const getRes = yield (0, node_fetch_1.default)(fullUrl, { redirect: 'follow' });
                        const buffer = yield getRes.arrayBuffer();
                        size = buffer.byteLength.toString();
                        console.log(`[ImageAnalyzer] Fallback GET for ${fullUrl}, size: ${size}`);
                    }
                    if (size) {
                        totalImageSize += parseInt(size, 10);
                        console.log(`[ImageAnalyzer] ${fullUrl} size: ${size}`);
                    }
                    else {
                        console.log(`[ImageAnalyzer] ${fullUrl} no content-length and GET failed`);
                    }
                }
                catch (e) {
                    console.log(`[ImageAnalyzer] Error fetching ${imgUrl}:`, e);
                }
            }
            if (images.length > 0) {
                analysisResults.push({
                    resourceType: 'image',
                    category: 'external',
                    count: images.length,
                    totalSize: totalImageSize,
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
        });
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
