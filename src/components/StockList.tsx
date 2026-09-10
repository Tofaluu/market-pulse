import { useState } from "preact/hooks";
import { formatPercentChange, formatPrice } from "../format";
import { store } from "../state";
import { hasGeminiApiKey } from "../services/gemini";
import { AiSettingsModal } from "./AiSettingsModal";

export function StockList() {
  const stocks = store.filteredStocks.value;
  const totalCount = store.stocks.value.length;
  const searchQuery = store.searchQuery.value;

  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const isSyncing = store.isSyncingAll.value;
  const syncMessage = store.syncMessage.value;

  const handleSyncAll = () => {
    if (!hasGeminiApiKey()) {
      setIsAiSettingsOpen(true);
      return;
    }
    if (store.stocks.value.length === 0) return;
    store.syncAllStocks();
  };

  return (
    <aside class="flex h-full w-[310px] shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Search & Watchlist Header */}
      <div class="border-b border-zinc-850 p-3 bg-zinc-900/40">
        <div class="mb-2 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="font-semibold uppercase tracking-wider text-zinc-400">Watchlist</span>
            <span class="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-medium text-zinc-400">
              {totalCount}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing || totalCount === 0}
            title={
              hasGeminiApiKey()
                ? "Refresh all stock prices using Gemini AI & Google Search"
                : "Set Gemini API Key to fetch live real-world prices"
            }
            class="flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[11px] font-medium text-violet-300 hover:bg-violet-500/25 transition disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <svg class="h-3 w-3 animate-spin text-violet-300" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Sync All</span>
              </>
            )}
          </button>
        </div>

        {syncMessage && (
          <div class="mb-2 rounded border border-violet-500/30 bg-violet-950/40 px-2 py-1 text-[10px] font-medium text-violet-200 animate-in fade-in">
            {syncMessage}
          </div>
        )}

        {/* Live Filter Input */}
        <div class="relative">
          <input
            type="text"
            value={searchQuery}
            onInput={(e) => store.setSearchQuery((e.target as HTMLInputElement).value)}
            placeholder="Search by symbol or name..."
            class="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-1.5 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
          />
          <svg
            class="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => store.setSearchQuery("")}
              class="absolute right-2 top-1.5 text-xs text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Stock Cards List */}
      <div class="flex-1 overflow-y-auto p-2 space-y-1.5">
        {stocks.length === 0 ? (
          <div class="p-6 text-center text-xs text-zinc-500">
            {totalCount === 0
              ? "Your watchlist is empty. Click '+ Add' to monitor stocks."
              : "No stocks match your search."}
          </div>
        ) : (
          stocks.map((stock) => {
            const selected = store.isSelected(stock.symbol);
            const isPositive = stock.change >= 0;

            // Generate miniature SVG sparkline from intraday prices
            const sparkPoints = stock.intraday || [];
            const prices = sparkPoints.map((p) => p.price);
            const minP = Math.min(...prices);
            const maxP = Math.max(...prices);
            const sparkW = 60;
            const sparkH = 22;
            const polylinePoints = prices
              .map((p, idx) => {
                const x = (idx / Math.max(1, prices.length - 1)) * sparkW;
                const range = maxP - minP || 1;
                const y = sparkH - ((p - minP) / range) * (sparkH - 4) - 2;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(" ");

            return (
              <button
                key={stock.symbol}
                type="button"
                class={`group relative flex w-full flex-col rounded-xl border p-2.5 text-left transition-all ${
                  selected
                    ? "border-emerald-500/50 bg-zinc-850/90 shadow-md ring-1 ring-emerald-500/20"
                    : "border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-850/60"
                }`}
                onClick={(event) => {
                  store.clickStock(stock.symbol, event.shiftKey);
                  event.stopPropagation();
                }}
              >
                {/* Top Row: Symbol, Name & Price */}
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="font-bold tracking-tight text-white shrink-0">{stock.symbol}</span>
                    <span class="rounded bg-zinc-800/80 px-1 py-0.2 text-[9px] font-semibold text-zinc-400 shrink-0">
                      {stock.currency || "USD"}
                    </span>
                    <span class="truncate text-[11px] text-zinc-400">
                      {stock.name}
                    </span>
                  </div>

                  <div class="text-right">
                    {store.isSyncing(stock.symbol) ? (
                      <span class="inline-flex items-center gap-1 text-[11px] font-medium text-violet-400 animate-pulse">
                        <svg class="h-2.5 w-2.5 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Syncing...</span>
                      </span>
                    ) : (
                      <span
                        class={`text-xs font-bold tabular-nums ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {formatPrice(stock.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Sparkline & Change Badge */}
                <div class="mt-2 flex items-center justify-between">
                  {/* Inline Sparkline */}
                  <svg width={sparkW} height={sparkH} class="overflow-visible">
                    <polyline
                      fill="none"
                      stroke={isPositive ? "#10b981" : "#f43f5e"}
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      points={polylinePoints}
                    />
                  </svg>

                  {/* Change badge */}
                  {store.isSyncing(stock.symbol) ? (
                    <div class="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-violet-300 bg-violet-500/15">
                      Syncing...
                    </div>
                  ) : (
                    <div
                      class={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
                        isPositive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      <span>{formatPercentChange(stock.percentChange)}</span>
                      <span>{isPositive ? "↑" : "↓"}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />
    </aside>
  );
}
