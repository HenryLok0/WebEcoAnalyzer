"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recommendations = void 0;
class Recommendations {
    generateRecommendations(metrics) {
        const recommendations = [];
        // Example recommendation for image optimization
        if (metrics.imageSize && metrics.imageSize > 1000) {
            recommendations.push({
                message: "Consider compressing images to reduce load time and energy consumption.",
                impact: "high"
            });
        }
        // Example recommendation for JavaScript optimization
        if (metrics.jsExecutionTime && metrics.jsExecutionTime > 200) {
            recommendations.push({
                message: "Minimize JavaScript execution time by reducing the number of scripts or optimizing existing code.",
                impact: "medium"
            });
        }
        // Additional recommendations can be added here based on other metrics
        // ...
        return recommendations;
    }
    /**
     * Calculate a score (max 100) for the website based on recommendations.
     * More high/medium impact recommendations result in a lower score.
     * @param recommendations The array of Recommendation
     * @returns number (0~100)
     */
    calculateScore(recommendations) {
        let score = 100;
        for (const rec of recommendations) {
            if (rec.impact === "high")
                score -= 15;
            if (rec.impact === "medium")
                score -= 7;
            if (rec.impact === "low")
                score -= 3;
        }
        if (score < 0)
            score = 0;
        if (score > 100)
            score = 100;
        return score;
    }
}
exports.Recommendations = Recommendations;
