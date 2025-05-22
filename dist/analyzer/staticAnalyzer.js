"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticAnalyzer = void 0;
class StaticAnalyzer {
    analyze(code) {
        const energyInefficientPatterns = [];
        if (!code || code.trim() === '') {
            return ['No code to analyze'];
        }
        const patterns = [
            { regex: /setInterval\s*\(\s*[^,]*,\s*([0-9]+)\s*\)/g, message: 'Using too frequent setInterval (interval less than 1000ms)', threshold: 1000 },
            { regex: /setTimeout\s*\(\s*[^,]*,\s*([0-9]+)\s*\)/g, message: 'Using long-duration setTimeout (may cause memory leak)', threshold: 10000 },
            { regex: /for\s*\(\s*let\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*\d+\s*;\s*\w+\+\+\s*\)/g, message: 'Detected potentially inefficient loop' },
            { regex: /<img[^>]+src\s*=\s*['"][^'"]+['"][^>]*>/g, message: 'Found unoptimized images (missing size attributes)' },
            { regex: /document\.write\(/g, message: 'Using document.write (blocks page rendering)' },
            { regex: /style\s*=\s*['"][^'"]*['"][^>]*/g, message: 'Using inline styles (increases HTML size)' }
        ];
        for (const pattern of patterns) {
            let matches;
            if (pattern.regex.toString().includes('setInterval') || pattern.regex.toString().includes('setTimeout')) {
                pattern.regex.lastIndex = 0;
                while ((matches = pattern.regex.exec(code)) !== null) {
                    const interval = parseInt(matches[1], 10);
                    if (pattern.threshold && interval < pattern.threshold) {
                        energyInefficientPatterns.push(`${pattern.message}, time interval: ${interval}ms`);
                    }
                }
            }
            else {
                pattern.regex.lastIndex = 0;
                matches = code.match(pattern.regex);
                if (matches && matches.length > 0) {
                    energyInefficientPatterns.push(`${pattern.message}, found ${matches.length} instances`);
                }
            }
        }
        const cssAnimationPattern = /@keyframes\s+\w+|animation\s*:|transition\s*:/g;
        const cssAnimationMatches = code.match(cssAnimationPattern);
        if (cssAnimationMatches && cssAnimationMatches.length > 5) {
            energyInefficientPatterns.push(`Too many CSS animations or transitions (${cssAnimationMatches.length} instances), may increase CPU load`);
        }
        const jsLibraryPattern = /jquery|react|angular|vue|gsap|three\.js/gi;
        const jsLibraryMatches = code.match(jsLibraryPattern);
        if (jsLibraryMatches && jsLibraryMatches.length > 0) {
            energyInefficientPatterns.push(`Using large JavaScript libraries: ${Array.from(new Set(jsLibraryMatches)).join(', ')}`);
        }
        return energyInefficientPatterns;
    }
}
exports.StaticAnalyzer = StaticAnalyzer;
