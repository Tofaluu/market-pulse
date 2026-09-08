# MarketPulse 📈

[![Preact](https://img.shields.io/badge/Preact-10.28-673ab8?style=flat-square&logo=preact&logoColor=white)](https://preactjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GitHub Pages](https://img.shields.io/badge/Deployed_With-GitHub_Pages-222222?style=flat-square&logo=github&logoColor=white)](https://pages.github.com/)

A high-performance, real-time financial market analytics dashboard and stock tracking platform built with **Preact**, **@preact/signals**, **Tailwind CSS v4**, and **TypeScript**.

Featuring real-time simulated market streaming, interactive custom SVG vector charts with hover crosshairs and tooltips, a comprehensive Command Pattern undo/redo engine, and an ultra-fast fintech terminal UI.

---

## ⚡ Key Engineering Highlights

- **Fine-Grained Reactivity with `@preact/signals`**: State updates (such as real-time price ticks and selection deltas) bind directly to DOM nodes without triggering full virtual DOM subtree re-renders.
- **Real-Time Market Streaming Engine**: Features a Brownian motion random walk generator that simulates live market price ticks, intraday volume bursts, day high/low adjustments, and visual flash highlights (green on uptick, red on downtick).
- **Custom Interactive SVG Charting**: Built from scratch without heavy chart library bloat. Supports dynamic resizing via `ResizeObserver`, smooth linear gradient area fills, mouse-tracking crosshairs, interactive value tooltips, and timeframe switching (`1D Live Intraday`, `1Y`, `5Y`, `ALL`).
- **Command Pattern Undo/Redo Architecture**: Implements a dedicated command stack (`execute`, `undo`, `redo`) that cleanly tracks user-initiated actions (adding, deleting, and selecting stocks) while allowing streaming price ticks to flow freely in the background.
- **Instant Search & Ticker Filter**: Client-side instant filtering across symbols, company names, and market sectors.
- **Embedded Sparklines**: Dynamic vector mini-trendlines rendered directly within each watchlist card for quick market scanning.
- **Full Keyboard Accessibility**: Complete shortcut mapping (`Shift-A`, `Shift-D`, `Shift-C`, `Shift-U`, `Shift-R`) with smart input focus collision prevention.

---

## 🖥️ UI & Feature Breakdown

| Feature | Description |
| :--- | :--- |
| **Live Watchlist** | Displays active stocks with live prices, tick animations, percent change badges, and SVG sparklines. |
| **Interactive Chart** | Responsive SVG line chart with hover crosshairs, exact price badges, and gradient fills. |
| **Historical Table** | Yearly market cap and stock price history with YoY growth calculations and column sorting. |
| **Simulation Controls** | Toggle streaming on/off (`LIVE` / `PAUSED`), adjust tick frequency, and inspect market tick timestamps. |
| **Ticker Directory** | Add from a wide universe of top global tech leaders (NVDA, AAPL, MSFT, GOOG, AMZN, META, TSM, TSLA, AVGO, AMD, NFLX, PLTR, and more). |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Shift + A` | Add random stock to watchlist |
| `Shift + D` | Delete selected stocks |
| `Shift + C` | Clear all selections |
| `Shift + U` | Undo last user action |
| `Shift + R` | Redo action |

---

## 🛠️ Tech Stack & Architecture

```
market-pulse/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── src/
│   ├── components/
│   │   ├── ChartView.tsx       # Interactive SVG chart, crosshairs & tooltips
│   │   ├── Instructions.tsx    # Welcome guides & multi-select summary
│   │   ├── ListView.tsx        # Financial data table with sorting & YoY metrics
│   │   ├── StatusBar.tsx       # Market status, streaming clock & stats
│   │   ├── StockDetails.tsx    # Responsive detail view router
│   │   ├── StockList.tsx       # Watchlist sidebar with search & sparklines
│   │   └── Toolbar.tsx         # Top navigation, brand & live feed toggles
│   ├── constants.ts            # Application constants and configuration
│   ├── format.ts               # Currency, percentage, and volume formatters
│   ├── state.ts                # Centralized Preact Signals store & simulation
│   ├── stocks.ts               # Market records & data generators
│   ├── styles.css              # Tailwind CSS styles & tick keyframe animations
│   ├── undo.ts                 # Command pattern history manager
│   ├── App.tsx                 # Root layout & shortcut listener
│   └── main.tsx                # Application bootstrap
├── index.html                  # HTML entry point with SVG favicon & meta
├── package.json
├── tsconfig.json
└── vite.config.ts              # Vite bundler configuration with relative base
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/market-pulse.git
   cd market-pulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🌐 Deploying to GitHub Pages & Custom Domain

### GitHub Pages (Automated via GitHub Actions)
1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/market-pulse.git
   git push -u origin main
   ```
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Every push to `main` will automatically trigger the included `.github/workflows/deploy.yml` workflow, building and publishing the site to `https://<your-username>.github.io/market-pulse/`.

### Custom Domain
To bind a custom domain (e.g., `marketpulse.dev` or `stocks.yourname.com`):
1. In your domain registrar (Namecheap, Cloudflare, Google Domains, Porkbun, etc.), add a **CNAME** record pointing to `<your-username>.github.io`.
2. In GitHub repository **Settings** > **Pages** > **Custom domain**, enter your domain name and check **Enforce HTTPS**.
3. The build is configured with `base: "./"` which handles custom root domains seamlessly out of the box!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
