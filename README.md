# WebEcoAnalyzer

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green?logo=node.js)](https://nodejs.org/)
[![MIT License](https://img.shields.io/github/license/HenryLok0/WebEcoAnalyzer?color=blue)](https://github.com/HenryLok0/WebEcoAnalyzer/blob/main/LICENSE)
[![Repo Size](https://img.shields.io/github/repo-size/HenryLok0/WebEcoAnalyzer?style=flat-square&logo=github)](https://github.com/HenryLok0/WebEcoAnalyzer)
[![Code Size](https://img.shields.io/github/languages/code-size/HenryLok0/WebEcoAnalyzer?style=flat-square&logo=github)](https://github.com/HenryLok0/WebEcoAnalyzer)

WebEcoAnalyzer is an open-source CLI tool for web developers to analyze and optimize websites for energy efficiency. It provides actionable audits and recommendations to help reduce the energy footprint of web applications.

---

## Features

- **Static Code Analysis**  
  Detects energy-inefficient patterns in website source code, such as long-duration timers, inline styles, and large JavaScript libraries. Offers insights for code optimization.

- **Resource Analysis**  
  Analyzes JavaScript, CSS, and image resources. Identifies inline scripts/styles and unoptimized images. Recommends bundling, compression, and modern formats.

- **Performance Metrics Collection**  
  Uses browser automation to gather CPU time, memory usage, network requests, JavaScript execution time, and total image size.

- **Energy Consumption Estimation**  
  Estimates energy usage in watt-hours (Wh) with a breakdown of CPU, network, and memory. Benchmarks against an average website (1.5 Wh per page load).

- **Actionable Recommendations**  
  Generates prioritized recommendations with code snippets and estimated savings to improve energy efficiency and performance.

- **Visualization and Reporting**  
  Produces detailed reports with scores for static code, resources, performance, and energy. Includes ASCII bar charts and Chart.js configs for visualization.

- **CI/CD Integration**  
  Supports automated energy efficiency checks in CI/CD pipelines. Allows setting score thresholds to enforce standards.

- **Real-Time Monitoring**  
  Offers a `--watch` mode for periodic re-analysis and historical tracking.

- **Flexible Output Options**  
  Supports JSON report generation and detailed console output. Includes validation warnings for inconsistencies.

- **Extensibility**  
  Modular architecture allows integration with external APIs and community feedback.

---

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation

```sh
git clone https://github.com/HenryLok0/WebEcoAnalyzer
cd WebEcoAnalyzer
npm install
```

---

## Command Line Usage

```
WebEcoAnalyzer - Website Energy Efficiency Analysis Tool
GitHub: https://github.com/HenryLok0/WebEcoAnalyzer

Usage:
  npm run analyze -- <url> [--json] [--log-scale] [--threshold <score>] [--watch] [--community]
  npm run analyze -- --help

Flags:
  --json         Output analysis as JSON report (webecoanalyzer-report.json)
  --log-scale    Use logarithmic scale for ASCII bar chart
  --threshold N  Exit with code 1 if total score < N (for CI/CD)
  --watch        Re-analyze every 5 minutes (real-time monitoring)
  --community    Show community tips from X (Twitter)
  --help         Show this help message

Examples:
  npm run analyze -- https://example.com --threshold 80
  npm run analyze -- https://example.com --json --watch
  npm run analyze -- https://example.com --community

Scoring and Metrics:
- Energy consumption is estimated in Wh (CPU, Network, Memory) and benchmarked against an average website (1.5 Wh).
- Scores are calculated for static code, JS, CSS, images, performance, and energy.
- Recommendations are prioritized by impact (high > medium > low) and deduplicated.
- Resource size breakdown is visualized as ASCII bar chart and Chart.js config.
- Supports CI/CD integration and real-time monitoring.
```

---

## Example Output

```
Analyzing energy efficiency of https://www.wikipedia.org/...
Fetching webpage content...
Performing static code analysis...
Analyzing JavaScript resources...
Analyzing CSS resources...
Analyzing image resources...
Collecting performance metrics...
Estimating energy consumption...
Generating optimization recommendations...

Analyzing energy efficiency of https://www.wikipedia.org/...
Fetching webpage content...
Performing static code analysis...
Analyzing JavaScript resources...
Analyzing CSS resources...
Analyzing image resources...
[ImageAnalyzer] https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png size: 15829
Collecting performance metrics...
Estimating energy consumption...
Generating optimization recommendations...

===== Analysis Results =====
Website: https://www.wikipedia.org/
----------------------------

[Static Code Analysis]
1. Using long-duration setTimeout (may cause memory leak), time interval: 1000ms
2. Found unoptimized images (missing size attributes), found 1 instances
3. Too many CSS animations or transitions (7 instances), may increase CPU load
Static Code Analysis Score: 75/100

[JavaScript Resource Analysis]
1. inline javascript: 2 (Impact: low)
   Total size: 1.64 KB
2. external javascript: 2 (Impact: low)
JavaScript Resource Score: 100/100

[CSS Resource Analysis]
1. inline css: 3 (Impact: medium)
   Total size: 40.77 KB
   Recommendation: It is recommended to merge multiple inline styles into a single external stylesheet to improve caching efficiency
2. inline css: 7 (Impact: medium)
   Recommendation: Too many CSS animations will increase CPU load and power consumption. It is recommended to reduce or optimize animations.
CSS Resource Score: 85/100

[Image Resource Analysis]
1. external image: 1 (Impact: low)
   Total size: 15.46 KB
2. external image: 1 (Impact: medium)
   Recommendation: Consider using WebP or AVIF format for images which can reduce file size by up to 30% compared to JPEG/PNG.
Image Resource Score: 90/100

[Performance Metrics]
• CPU Time: 100 ms
• Memory Usage: 47.68 MB
• Network Requests: 15
• JavaScript Execution Time: 250 ms
• Image Size: 1500 KB
Performance Score: 100/100

[Energy Consumption Assessment]
Estimated Energy Consumption: 0.39 Wh (CPU: 0.00 Wh, Network: 0.15 Wh, Memory: 0.24 Wh)
Energy Consumption Score: 100/100
Compared to average website: -74.1% lower
Note: Lower energy consumption is better. Score is based on estimated CPU, memory, and network usage.
Scoring: 100 (<=1.5Wh), 80 (<=2Wh), 60 (<=3Wh), 40 (<=4Wh), 20 (<=5Wh), 0 (>5Wh)

Resource Size Breakdown (KB):
{
  "JavaScript": 1.64,
  "CSS": 40.77,
  "Images": 15.46
}

Chart.js Config:
{
  "type": "bar",
  "data": {
    "labels": [
      "JavaScript",
      "CSS",
      "Images"
    ],
    "datasets": [
      {
        "label": "Resource Size (KB)",
        "data": [
          1.64,
          40.77,
          15.46
        ],
        "backgroundColor": [
          "#36A2EB",
          "#FF6384",
          "#FFCE56"
        ]
      }
    ]
  },
  "options": {
    "title": {
      "display": true,
      "text": "Resource Size Distribution"
    },
    "scales": {
      "y": {
        "beginAtZero": true,
        "title": {
          "display": true,
          "text": "Size (KB)"
        }
      }
    }
  }
}
JavaScript | ██ 1.64 KB
CSS        | ████████████████████████████████████████ 40.77 KB
Images     | ███████████████ 15.46 KB

[Optimization Recommendations]
1. Consider compressing images to reduce load time and energy consumption. (Impact: high)
2. Minimize JavaScript execution time by reducing the number of scripts or optimizing existing code. (Impact: medium)
3. [CSS] It is recommended to merge multiple inline styles into a single external stylesheet to improve caching efficiency (Impact: medium)
4. [CSS] Too many CSS animations will increase CPU load and power consumption. It is recommended to reduce or optimize animations. (Impact: medium)
5. [IMAGE] Consider using WebP or AVIF format for images which can reduce file size by up to 30% compared to JPEG/PNG. (Impact: medium)

===== TOTAL WEBSITE SCORE: 92/100 =====

===== Analysis Complete =====
```

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the need for sustainable web development practices.
- Thanks to the contributors and the open-source community for their support.
