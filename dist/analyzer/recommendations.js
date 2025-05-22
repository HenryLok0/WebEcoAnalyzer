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
}
exports.Recommendations = Recommendations;
