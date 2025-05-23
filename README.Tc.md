# WebEcoAnalyzer

[English README](./README.md)

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green?logo=node.js)](https://nodejs.org/)
[![MIT License](https://img.shields.io/github/license/HenryLok0/WebEcoAnalyzer?color=blue)](https://github.com/HenryLok0/WebEcoAnalyzer/blob/main/LICENSE)
[![Repo Size](https://img.shields.io/github/repo-size/HenryLok0/WebEcoAnalyzer?style=flat-square&logo=github)](https://github.com/HenryLok0/WebEcoAnalyzer)
[![Code Size](https://img.shields.io/github/languages/code-size/HenryLok0/WebEcoAnalyzer?style=flat-square&logo=github)](https://github.com/HenryLok0/WebEcoAnalyzer)

**WebEcoAnalyzer** 是一款開源 CLI 工具，協助網頁開發者分析並優化網站的能源效率，提供具體可行的建議，幫助降低網頁應用的能源足跡。

---

## 特色功能

- **靜態程式碼分析**  
  偵測網站原始碼中不節能的模式，如長時間計時器、inline style、大型 JavaScript 函式庫，並提供優化建議。

- **資源分析**  
  分析 JavaScript、CSS、圖片等資源。辨識 inline script/style 及未最佳化圖片，建議合併、壓縮、使用現代格式。

- **效能指標收集**  
  透過瀏覽器自動化收集 CPU 時間、記憶體用量、網路請求數、JavaScript 執行時間、圖片總大小等。

- **能源消耗估算**  
  以瓦時（Wh）估算能源消耗，並細分 CPU、網路、記憶體。與平均網站（每次載入 1.5 Wh）做基準比較。

- **具體優化建議**  
  產生優先排序的建議，附上程式碼片段與預估節省量，協助提升能源效率與效能。

- **視覺化與報告**  
  產生詳細報告，包含靜態程式碼、資源、效能、能源等分數。支援 ASCII 長條圖與 Chart.js 配置。

- **CI/CD 整合**  
  支援自動化能源檢查，可設定分數門檻，強制符合標準。

- **即時監控**  
  提供 `--watch` 模式，定時重新分析並追蹤歷史紀錄。

- **彈性輸出**  
  支援 JSON 報告與詳細主控台輸出，並有驗證警告。

- **可擴充架構**  
  模組化設計，方便整合外部 API 與社群回饋。

---

## 快速開始

### 先決條件

- Node.js（14 版以上）
- npm（Node 套件管理器）

### 安裝

```sh
git clone https://github.com/HenryLok0/WebEcoAnalyzer
cd WebEcoAnalyzer
npm install
```

---

## 指令列用法

```
WebEcoAnalyzer - 網站能源效率分析工具
GitHub: https://github.com/HenryLok0/WebEcoAnalyzer

用法:
  npm run analyze -- <url> [--json] [--log-scale] [--threshold <score>] [--watch] [--community]
  npm run analyze -- --help

參數說明:
  --json         以 JSON 產生分析報告 (webecoanalyzer-report.json)
  --log-scale    ASCII 長條圖使用對數刻度
  --threshold N  若總分 < N 則以 code 1 結束（CI/CD 用）
  --watch        每 5 分鐘重新分析（即時監控）
  --community    顯示 X（Twitter）社群建議
  --help         顯示說明

範例:
  npm run analyze -- https://example.com --threshold 80
  npm run analyze -- https://example.com --json --watch
  npm run analyze -- https://example.com --community

評分與指標:
- 能源消耗以 Wh（CPU、網路、記憶體）估算，並與平均網站（1.5 Wh）比較。
- 靜態程式碼、JS、CSS、圖片、效能、能源皆有分數。
- 建議依影響力排序（高 > 中 > 低），並去重。
- 資源大小以 ASCII 長條圖與 Chart.js 呈現。
- 支援 CI/CD 與即時監控。
```

---

## 範例輸出

```
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
3. optimization css: 1 (Impact: medium)
   Recommendation: Minify CSS using tools like cssnano or CleanCSS to reduce file size and improve load speed.
4. optimization css: 1 (Impact: low)
   Recommendation: Consider using modern CSS features like flexbox and grid for layout to reduce reliance on heavy frameworks.
5. optimization css: 1 (Impact: medium)
   Recommendation: Remove unused CSS with tools like PurgeCSS or UnCSS to reduce CSS size and improve efficiency.
CSS Resource Score: 73/100

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
1. It is recommended to use [ImageOptim](https://imageoptim.com/) or [TinyPNG](https://tinypng.com/) to compress images. (Impact: high)
2. Minimize JavaScript execution time by reducing the number of scripts or optimizing existing code. (Impact: medium)
3. [CSS] It is recommended to merge multiple inline styles into a single external stylesheet to improve caching efficiency (Impact: medium)
4. [CSS] Too many CSS animations will increase CPU load and power consumption. It is recommended to reduce or optimize animations. (Impact: medium)
5. [CSS] Minify CSS using tools like cssnano or CleanCSS to reduce file size and improve load speed. (Impact: medium)
6. [CSS] Remove unused CSS with tools like PurgeCSS or UnCSS to reduce CSS size and improve efficiency. (Impact: medium)
7. [IMAGE] Consider using WebP or AVIF format for images which can reduce file size by up to 30% compared to JPEG/PNG. (Impact: medium)
8. [CSS] Consider using modern CSS features like flexbox and grid for layout to reduce reliance on heavy frameworks. (Impact: low)

===== TOTAL WEBSITE SCORE: 90/100 =====

[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒]

===== Analysis Complete =====
```

## 貢獻

歡迎貢獻！請參閱 [CONTRIBUTING.md](CONTRIBUTING.md) 了解行為準則與 Pull Request 流程。

## 授權

本專案採用 MIT 授權，詳見 [LICENSE](LICENSE)。

## 致謝

- 靈感來自永續網頁開發的需求。
- 感謝所有貢獻者與開源社群的支持。
```
