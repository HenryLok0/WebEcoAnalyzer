"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTimestamp = exports.calculatePercentage = exports.formatReport = void 0;
function formatReport(reportData) {
    // Convert the report data into a formatted string
    let formattedReport = "WebEcoAnalyzer Report\n";
    formattedReport += "======================\n\n";
    for (const [key, value] of Object.entries(reportData)) {
        formattedReport += `${key}: ${value}\n`;
    }
    return formattedReport;
}
exports.formatReport = formatReport;
function calculatePercentage(part, total) {
    if (total === 0)
        return 0;
    return (part / total) * 100;
}
exports.calculatePercentage = calculatePercentage;
function generateTimestamp() {
    return new Date().toISOString();
}
exports.generateTimestamp = generateTimestamp;
