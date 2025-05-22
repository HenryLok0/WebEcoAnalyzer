export function formatReport(reportData: any): string {
    // Convert the report data into a formatted string
    let formattedReport = "WebEcoAnalyzer Report\n";
    formattedReport += "======================\n\n";

    for (const [key, value] of Object.entries(reportData)) {
        formattedReport += `${key}: ${value}\n`;
    }

    return formattedReport;
}

export function calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return (part / total) * 100;
}

export function generateTimestamp(): string {
    return new Date().toISOString();
}