class StaticAnalyzer {
    analyze(code: string): string[] {
        const energyInefficientPatterns: string[] = [];

        // Example patterns to check for
        const patterns = [
            /setInterval\(/g, // Excessive use of setInterval
            /setTimeout\(/g,  // Excessive use of setTimeout
            /for\s*\(\s*let\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*\d+\s*;\s*\w+\+\+\s*\{/g // Inefficient loops
        ];

        patterns.forEach(pattern => {
            const matches = code.match(pattern);
            if (matches) {
                energyInefficientPatterns.push(`Found inefficient pattern: ${pattern}`);
            }
        });

        return energyInefficientPatterns;
    }
}