# MarketPulse 📈

<p align="center">
  <strong>A high-performance, real-time financial market analytics dashboard and equity research terminal.</strong>
  <br />
  Built with <strong>Preact</strong>, <strong>@preact/signals</strong>, <strong>TypeScript</strong>, <strong>Tailwind CSS v4</strong>, and <strong>Google Gemini 3.6 Flash</strong>.
</p>

<p align="center">
  <a href="https://tofaluu.github.io/market-pulse/">
    <img src="https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-10b981?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Preact-10.28-673ab8?style=flat-square&logo=preact&logoColor=white" alt="Preact" />
  <img src="https://img.shields.io/badge/Signals-Reactive_State-purple?style=flat-square" alt="Preact Signals" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.2-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Gemini_AI-3.6_Flash-4285f4?style=flat-square&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Vite-7.3-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Markets-NYSE_•_NASDAQ_•_TSX-amber?style=flat-square" alt="Markets Supported" />
</p>

---

## 🌟 Overview

**MarketPulse** is an institutional-grade, client-side financial analytics terminal designed for lightning-fast tracking, visualization, and equity research across North American stock exchanges (NYSE, NASDAQ, and TSX).

Combining **Preact Signals** for direct fine-grained DOM updates with **Google Gemini 3.6 Flash** and **Google Search Grounding**, MarketPulse enables users to fetch real-world market prices, explore historical valuations, track authentic exchange trading sessions, and generate forward-looking institutional equity research reports in real time.

🔗 **Live Application:** [https://tofaluu.github.io/market-pulse/](https://tofaluu.github.io/market-pulse/)

---

## ⚡ Core Engineering Highlights

### 🤖 Gemini AI Research & Live Grounding Engine
- **Search-Grounded Price Verification**: Queries real-time trading quotes from public financial feeds across NYSE, NASDAQ, and the Toronto Stock Exchange (TSX) using Google Search Grounding.
- **Batch AI Synchronization**: Refresh an entire portfolio of stocks simultaneously with a single click (**"✨ Sync All"**), automatically updating 1D intraday curves and 2026 valuation benchmarks.
- **Institutional Equity Research**: Instant generation of structured analyst overviews:
  - **Business & Fund Model**: Revenue drivers, margins, and ETF asset allocation breakdowns (e.g., `XEQT`, `VEQT`).
  - **Growth Catalysts & Trajectory**: Bull/bear scenarios and forward 2–5 year tailwinds.
  - **Risk & Headwind Analysis**: Macroeconomic, regulatory, and competitive threat audits.
  - **Interactive Financial Q&A**: Real-time contextual answering for any custom asset question.

### ⏱️ Real-World Market Schedule & Exchange Session Tracking
- **Exchange Hours Detection**: Accurately tracks Eastern Time (ET) regular trading sessions (Mon–Fri, 9:30 AM – 4:00 PM ET).
- **Official Closing Price Integrity**: Holds authentic exchange closing prices outside market hours with zero synthetic drift.
- **Dynamic Session Badges**: Displays real-time status badges in the top toolbar and bottom status bar indicating whether NYSE, NASDAQ, and TSX markets are currently active or closed.

### 🇨🇦 First-Class Canadian (TSX) & US Equities Support
- Native multi-currency formatting (`CAD` vs `USD`).
- Curated presets for top Canadian index ETFs (`XEQT`, `VEQT`, `VFV`) and TSX powerhouses (`SHOP`, `RY`, `TD`, `BNS`, `ENB`, `CSU`, `ATD`).
- Universal procedurally generated equity engine for *any* custom ticker symbol worldwide.

### 📊 Zero-Dependency Responsive SVG Vector Charting
- High-performance, hand-crafted SVG rendering pipeline with zero external graphing library overhead.
- Dynamic responsive container tracking via `ResizeObserver`.
- Smooth area gradient fills, mouse-tracking crosshair guides, interactive data tooltips, and timeframe toggling (`1D Intraday`, `1Y`, `5Y`, `ALL`).
- Sparkline vector trends embedded directly inside every watchlist card.

### 💾 Robust Client-Side Persistence & Command Pattern History
- Watchlist customizations, added stocks, deleted entries, and verified live prices persist automatically in browser `localStorage`.
- Comprehensive Command Pattern (`execute`, `undo`, `redo`) isolates user changes from background market ticks, enabling seamless keyboard-driven `Shift+U` (undo) and `Shift+R` (redo).

---

## 🖥️ Feature Tour

| Feature | Capabilities |
| :--- | :--- |
| **Real-Time Watchlist** | Monitor unlimited stocks with live price updates, intraday sparklines, and directional price flash animations. |
| **Batch AI Sync** | Single-click real-time price synchronization for your entire watchlist powered by Gemini AI with Google Search. |
| **Dynamic Vector Chart** | Interactive SVG charting with hover crosshairs, exact price pill tooltips, volume statistics, and multi-timeframe toggling. |
| **Fundamental Table** | Multi-year valuation history, Market Cap vs. Share Price metrics, and Year-over-Year (YoY) growth calculations. |
| **AI Analyst Suite** | Executive overviews, past week news & price drivers, forward catalysts, risk audits, and interactive freeform analyst Q&A. |
| **Global Directory** | Instant search and addition across 80+ prominent stocks and ETFs or any custom ticker with procedural profile generation. |
| **Market Status Indicator** | Real-time badge tracking whether North American exchanges are currently open or closed. |

---

## ⌨️ Keyboard Shortcuts

MarketPulse is built for keyboard-first efficiency:

| Shortcut | Action |
| :--- | :--- |
| `Shift + A` | Add a random stock to your watchlist |
| `Shift + D` | Delete currently selected stocks |
| `Shift + C` | Clear active selection |
| `Shift + U` | Undo last user action |
| `Shift + R` | Redo last undone action |

*Shortcuts are intelligently disabled while typing inside search inputs or modal dialogs.*

---

## 🛠️ Architecture & Tech Stack

```
market-pulse/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Actions Pages deployment
├── src/
│   ├── components/
│   │   ├── AddStockModal.tsx   # Searchable stock directory & ticker generator
│   │   ├── AiAnalystView.tsx   # AI research suite & custom financial Q&A
│   │   ├── AiSettingsModal.tsx # Secure client-side Gemini API key management
│   │   ├── ChartView.tsx       # Zero-dependency SVG vector chart & crosshairs
│   │   ├── Instructions.tsx    # Welcome overview & multi-stock summary
│   │   ├── ListView.tsx        # Financial valuation table with YoY growth
│   │   ├── StatusBar.tsx       # Market clock, active feed status & tick counters
│   │   ├── StockDetails.tsx    # Responsive detail routing engine
│   │   ├── StockList.tsx       # Watchlist sidebar with search & sparklines
│   │   └── Toolbar.tsx         # Top application header & market status badge
│   ├── services/
│   │   └── gemini.ts           # Gemini 3.6 Flash + Google Search Grounding service
│   ├── constants.ts            # Application configuration & default text
│   ├── format.ts               # Currency, percent change, and volume formatters
│   ├── state.ts                # Centralized Preact Signals store & market schedule
│   ├── stocks.ts               # Seed data records & realistic 2026 market baselines
│   ├── tickerDatabase.ts       # Global ticker directory & procedural stock factory
│   ├── undo.ts                 # Command Pattern undo/redo stack
│   ├── App.tsx                 # Root layout & global shortcut handler
│   └── main.tsx                # Client bootstrap
├── index.html                  # HTML5 entry with modern meta & favicon
├── package.json
├── tsconfig.json
└── vite.config.ts              # Vite configuration with relative base paths
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tofaluu/market-pulse.git
   cd market-pulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🔑 AI Features Setup (Optional)

To enable live Google Search price lookups and AI equity research:
1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. In MarketPulse, click the **⚙️** (Settings) button in the top right.
3. Paste your API key and click **Save Key**.

> [!NOTE]
> **Privacy First**: Your API key is stored strictly within your browser's `localStorage` and communicates directly with Google's API endpoints. It is never transmitted to or logged on any intermediate server.

---

## 🌐 Deployment & Custom Domains

MarketPulse is built as a serverless single-page application (SPA) preconfigured for automated deployment on **GitHub Pages**:

- **Automated CI/CD**: Pushing to `main` triggers `.github/workflows/deploy.yml`, which compiles the TypeScript assets and deploys the static bundle to GitHub Pages.
- **Custom Domains**: Configured with relative base paths (`base: "./"`), allowing you to point any custom apex domain or subdomain via CNAME without broken asset paths.

---

<p align="center">
  Crafted by <strong>Thomas Liu</strong> • 2026
</p>
