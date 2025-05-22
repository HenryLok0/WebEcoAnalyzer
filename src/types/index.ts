export interface PerformanceMetrics {
    cpuTime: number; // in milliseconds
    memoryUsage: number; // in bytes
    networkRequests: number;
    imageSize?: number; // in KB
    jsExecutionTime?: number; // in milliseconds
}

export interface Recommendation {
    message: string;
    impact: 'low' | 'medium' | 'high';
    suggestedAction?: string;
}

export interface ResourceAnalysisResult {
    resourceType: 'javascript' | 'css' | 'image' | 'font' | 'video' | 'other';
    category: 'inline' | 'external' | 'third-party';
    count: number;
    totalSize: number;
    impact: 'low' | 'medium' | 'high';
    recommendation: string;
}