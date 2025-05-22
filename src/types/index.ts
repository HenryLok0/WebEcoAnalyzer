interface PerformanceMetrics {
    cpuTime: number; // in milliseconds
    memoryUsage: number; // in bytes
    networkRequests: number;
}

interface Recommendation {
    message: string;
    impact: 'low' | 'medium' | 'high';
    suggestedAction: string;
}