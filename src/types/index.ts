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

export type ResourceAnalysisResult = {
    resourceType: 'css' | 'javascript' | 'image';
    category: 'inline' | 'external' | 'third-party' | 'optimization'; // ←加上 'optimization'
    count: number;
    totalSize: number;
    impact: 'low' | 'medium' | 'high';
    recommendation: string;
};

// 新增 EnergyBreakdown 型別
export interface EnergyBreakdown {
    cpu: number;      // Wh
    network: number;  // Wh
    memory: number;   // Wh
}