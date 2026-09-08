// Left-side stock watchlist sidebar with live search, sparklines, and price flashing.
import { formatPercentChange, formatPrice } from "../format";
import { store } from "../state";

type StockListProps = {
  onBackgroundClick: () => void;
};

export function StockList({ onBackgroundClick }: StockListProps) {
  const stocks = store.filteredStocks.value;
  const totalCount = store.stocks.value.length;
  const searchQuery = store.searchQuery.value;

  return (
    <aside
      class="flex h-full w-[310px] shrink-0 flex-col border-r border-zinc-800 bg-zinc-950"
      onClick={(event) => {
        if (event.currentTarget === event.target) onBackgroundClick();
      }}
    >
      {/* Search & Watchlist Header */}
      <div class="border-b border-zinc-850 p-3 bg-zinc-900/40">
        <div class="mb-2 flex items-center justify-between text-xs">
          <span class="font-semibold uppercase tracking-wider text-zinc-400">Watchlist</span>
          <span class="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
            {totalCount} stocks
          </span>
        </div>

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
      <div
        class="flex-1 overflow-y-auto p-2 space-y-1.5"
        onClick={(event) => {
          if (event.currentTarget === event.target) onBackgroundClick();
        }}
      >
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
            const flashClass =
              stock.flash === "up" ? "flash-up" : stock.flash === "down" ? "flash-down" : "";

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
                class={`group relative flex w-full flex-col rounded-xl border p-2.5 text-left transition-all ${flashClass} ${
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
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold tracking-tight text-white">{stock.symbol}</span>
                    <span class="max-w-[100px] truncate text-[11px] text-zinc-400">
                      {stock.name}
                    </span>
                  </div>

                  <div class="text-right">
                    <span
                      class={`text-xs font-semibold tabular-nums transition-colors ${
                        stock.flash === "up"
                          ? "text-emerald-400 font-bold"
                          : stock.flash === "down"
                          ? "text-rose-400 font-bold"
                          : "text-zinc-100"
                      }`}
                    >
                      {formatPrice(stock.price)}
                    </span>
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
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
