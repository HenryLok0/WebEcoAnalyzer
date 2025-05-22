# WebEcoAnalyzer

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green?logo=node.js)](https://nodejs.org/)
[![MIT License](https://img.shields.io/github/license/HenryLok0/WebEcoAnalyzer?color=blue)](https://github.com/HenryLok0/WebEcoAnalyzer/blob/main/LICENSE)

[![Repo Size](https://img.shields.io/github/repo-size/HenryLok0/WebEcoAnalyzer?style=flat-square&logo=github)](https://github.com/HenryLok0/WebEcoAnalyzer)
[![Code Size](https://img.shields.io/github/languages/code-size/HenryLok0/WebEcoAnalyzer?style=flat-square&logo=github)](https://github.com/HenryLok0/WebEcoAnalyzer)

WebEcoAnalyzer is an open-source CLI tool designed to help web developers analyze and optimize their websites for energy efficiency. The tool focuses on reducing the energy footprint of web applications by providing audits and actionable recommendations.

## Features

- **Static Code Analysis**: Scans website code to identify known energy-inefficient patterns.
- **Performance Metrics Collection**: Utilizes browser automation tools to collect performance metrics such as CPU time and memory usage.
- **Energy Consumption Estimation**: Estimates energy use based on collected performance metrics.
- **Actionable Recommendations**: Provides specific suggestions for improving energy efficiency, such as optimizing images and minimizing JavaScript.
- **CI/CD Integration**: Integrates with CI/CD pipelines for automated energy efficiency checks.
- **Reporting**: Generates detailed reports with scores to help developers understand impacts.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/HenryLok0/WebEcoAnalyzer
   ```
2. Navigate to the project directory:
   ```sh
   cd WebEcoAnalyzer
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

### Usage

To run the tool, use the command line interface:

```sh
npm run analyze -- <your-website-url>
```

Replace `<your-website-url>` with the URL of the website you want to analyze.

#### Example Output

```sh
@HenryLok0 ➜ /workspaces/WebEcoAnalyzer (main) $ npm run analyze -- https://www.google.com/

> webecoanalyzer@1.0.0 analyze
> npm run build && node dist/cli/index.js https://www.google.com/

> webecoanalyzer@1.0.0 build
> tsc

Analyzing energy efficiency of https://www.google.com/...
Fetching webpage content...
Performing static code analysis...
Analyzing JavaScript resources...
Analyzing CSS resources...
Analyzing Image resources...
Collecting performance metrics...
Estimating energy consumption...
Generating optimization recommendations...

===== Analysis Results =====
Website: https://www.google.com/
----------------------------

【Static Code Analysis】
1. Using long-duration setTimeout (may cause memory leak), time interval: 0ms
2. Found unoptimized images (missing size attributes), found 1 instances
3. Using inline styles (increases HTML size), found 9 instances
Static Code Analysis Score: 80/100

【JavaScript Resource Analysis】
1. inline javascript: 6 (Impact: medium)
   Total size: 11.52KB
   Recommendation: Consider combining inline scripts into a single external file to improve caching
JavaScript Resource Score: 90/100

【CSS Resource Analysis】
1. inline css: 3 (Impact: medium)
   Total size: 1.76KB
   Recommendation: It is recommended to merge multiple inline styles into a single external stylesheet to improve caching efficiency
2. inline css: 9 (Impact: medium)
   Total size: 0.24KB
   Recommendation: Too many inline styles will bloat the HTML and make it hard to maintain. It is recommended to use CSS classes instead.
CSS Resource Score: 90/100

【Image Resource Analysis】
1. external image: 1 (Impact: low)
2. external image: 1 (Impact: medium)
   Recommendation: Consider using WebP or AVIF format for images which can reduce file size by up to 30% compared to JPEG/PNG.
Image Resource Score: 90/100

【Performance Metrics】
• CPU Time: 100ms
• Memory Usage: 47.68MB
• Network Requests: 15
• JavaScript Execution Time: 250ms
• Image Size: 1500KB
Performance Score: 100/100

【Energy Consumption Assessment】
Estimated Energy Consumption Index: 10000051.50
Energy Consumption Score: 0/100

【Optimization Recommendations】
1. Consider compressing images to reduce load time and energy consumption. (Impact Level: high)
2. Minimize JavaScript execution time by reducing the number of scripts or optimizing existing code. (Impact Level: medium)
3. [JAVASCRIPT] Consider combining inline scripts into a single external file to improve caching (Impact Level: medium)
4. [CSS] It is recommended to merge multiple inline styles into a single external stylesheet to improve caching efficiency (Impact Level: medium)
5. [CSS] Too many inline styles will bloat the HTML and make it hard to maintain. It is recommended to use CSS classes instead. (Impact Level: medium)
6. [IMAGE] Consider using WebP or AVIF format for images which can reduce file size by up to 30% compared to JPEG/PNG. (Impact Level: medium)

===== TOTAL WEBSITE SCORE: 71/100 =====

===== Analysis Complete =====
```

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the need for sustainable web development practices.
- Thanks to the contributors and the open-source community for their support.
