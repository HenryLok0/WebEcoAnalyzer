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
   ```
   git clone https://github.com/HenryLok0/WebEcoAnalyzer
   ```
2. Navigate to the project directory:
   ```
   cd WebEcoAnalyzer
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Usage

To run the tool, use the command line interface:

```
npm run analyze -- <your-website-url>
```

Replace `<your-website-url>` with the URL of the website you want to analyze.

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the need for sustainable web development practices.
- Thanks to the contributors and the open-source community for their support.