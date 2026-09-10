// Single-stock authentic real-time financial chart powered by TradingView.
// Connects directly to real exchange feeds (NYSE, NASDAQ, TSX) across all timeframes.
import { useEffect, useRef } from "preact/hooks";
import {
  formatMarketCapFromString,
  formatPercentChange,
  formatPrice,
  formatSignedChange,
  formatVolume,
} from "../format";
import { store } from "../state";
import type { Stock } from "../stocks";

type ChartViewProps = {
  stock: Stock;
};

/**
 * Maps ticker symbols to their appropriate exchange prefixes for TradingView.
 * Ensures Canadian TSX equities/ETFs (like XEQT, SHOP, RY) resolve to TSX.
 */
export function getTradingViewSymbol(symbol: string, sector?: string): string {
  const clean = symbol.trim().toUpperCase();

  if (clean.endsWith(".TO")) {
    return `TSX:${clean.replace(".TO", "")}`;
  }

  const TSX_EQUITIES = [
    "XEQT", "VEQT", "VFV", "XIC", "ZEB", "VDY", "XIU", "ZSP", "XAW", "VIU", "VEE",
    "SHOP", "RY", "TD", "BNS", "BMO", "CM", "ENB", "TRP", "CNQ", "SU", "CP", "CNR",
    "CSU", "ATD", "BCE", "T", "MFC", "SLF", "POW", "WCN", "GFL", "NTR", "ABX", "AEM"
  ];

  if (TSX_EQUITIES.includes(clean)) {
    return `TSX:${clean}`;
  }

  if (sector && (sector.includes("Canadian") || sector.includes("TSX"))) {
    return `TSX:${clean}`;
  }

  return clean;
}

export function ChartView({ stock }: ChartViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPositive = stock.change >= 0;

  // Mount official TradingView Advanced Real-Time Chart Widget
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widgetWrapper = document.createElement("div");
    widgetWrapper.className = "tradingview-widget-container";
    widgetWrapper.style.width = "100%";
    widgetWrapper.style.height = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.width = "100%";
    widgetDiv.style.height = "100%";
    widgetWrapper.appendChild(widgetDiv);

    const tvSymbol = getTradingViewSymbol(stock.symbol, stock.sector);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "D",
      timezone: "America/New_York",
      theme: "dark",
      style: "3", // 3 = Sleek Area chart with gradient fill
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: false,
      calendar: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      backgroundColor: "rgba(9, 9, 11, 1)",
      gridColor: "rgba(39, 39, 42, 0.35)",
      withdateranges: true, // Native 1D, 5D, 1M, 3M, 6M, YTD, 1Y, 5Y, ALL date ranges
      details: false,
      hotlist: false,
      support_host: "https://www.tradingview.com",
    });

    widgetWrapper.appendChild(script);
    container.appendChild(widgetWrapper);

    return () => {
      container.innerHTML = "";
    };
  }, [stock.symbol, stock.sector]);

  return (
    <div class="flex h-full min-h-0 flex-1 flex-col bg-zinc-950 p-6 overflow-hidden">
      {/* Header Info Banner */}
      <div class="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800/80 pb-4 shrink-0">
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-2xl font-bold tracking-tight text-white">{stock.name}</h2>
            <span class="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
              {stock.symbol}
            </span>
            {stock.sector && (
              <span class="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {stock.sector}
              </span>
            )}
            <span class="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
              <span class="relative flex h-1.5 w-1.5">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>Authentic Exchange Feed</span>
            </span>
          </div>

          {/* Large Hero Price Display */}
          <div class="mt-2 flex items-baseline gap-3">
            {store.isSyncing(stock.symbol) ? (
              <div class="flex items-center gap-2.5">
                <span class="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-violet-400 animate-pulse">
                  <svg class="h-5 w-5 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing live price...
                </span>
                <span class="text-xs text-zinc-500">Querying real-time quote</span>
              </div>
            ) : (
              <>
                <span class="text-3xl font-extrabold tracking-tight text-white tabular-nums">
                  {formatPrice(stock.price)}
                </span>
                <div
                  class={`flex items-center gap-1 text-sm font-semibold tabular-nums ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  <span>
                    {formatSignedChange(stock.change)} ({formatPercentChange(stock.percentChange)})
                  </span>
                  <span>{isPositive ? "↑" : "↓"}</span>
                </div>
                <span class="text-xs text-zinc-500">
                  {store.isMarketOpen.value
                    ? "Live Market Session"
                    : "Market Closed"}
                </span>
              </>
            )}
            <button
              type="button"
              onClick={() => store.setViewMode("ai")}
              class="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 hover:text-white transition"
            >
              <span>🤖</span>
              <span>AI Research & Live Check</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div class="grid grid-cols-2 gap-x-6 gap-y-1 rounded-xl border border-zinc-850 bg-zinc-900/50 p-3 text-xs sm:grid-cols-4">
          <div>
            <div class="text-zinc-500">Market Cap</div>
            <div class="font-semibold text-zinc-200">{formatMarketCapFromString(stock.mcap)}</div>
          </div>
          <div>
            <div class="text-zinc-500">Day Range</div>
            <div class="font-semibold text-zinc-200">
              ${stock.dayLow.toFixed(2)} - ${stock.dayHigh.toFixed(2)}
            </div>
          </div>
          <div>
            <div class="text-zinc-500">Volume</div>
            <div class="font-semibold text-zinc-200">{formatVolume(stock.volume)}</div>
          </div>
          <div>
            <div class="text-zinc-500">P/E Ratio</div>
            <div class="font-semibold text-zinc-200">{stock.peRatio ?? "N/A"}</div>
          </div>
        </div>
      </div>

      {/* Official TradingView Interactive Chart Container */}
      <div
        ref={containerRef}
        class="relative min-h-[380px] flex-1 rounded-xl border border-zinc-800/80 bg-zinc-950 overflow-hidden shadow-2xl"
      />
    </div>
  );
}
