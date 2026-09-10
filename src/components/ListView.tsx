// Single-stock table mode: historical market cap records, YoY metrics, and column sorting.
import { useState } from "preact/hooks";
import {
  changeArrow,
  formatMarketCapFromNumber,
  formatMarketCapFromString,
  formatPercentChange,
  formatPrice,
  formatSignedChange,
  formatVolume,
} from "../format";
import type { Stock } from "../stocks";
import { store } from "../state";

type ListViewProps = {
  stock: Stock;
};

type SortKey = "year" | "mcap" | "change";
type SortOrder = "asc" | "desc";

export function ListView({ stock }: ListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("year");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const isPositive = stock.change >= 0;

  // Compute YoY deltas
  const rows = stock.history.map((point, index) => {
    const prev = stock.history[index - 1];
    const change = prev ? point.mcap - prev.mcap : null;
    const pctChange = prev ? (change! / prev.mcap) * 100 : null;
    return {
      year: point.year,
      mcap: point.mcap,
      price: point.price,
      change,
      pctChange,
    };
  });

  const sortedRows = [...rows].sort((a, b) => {
    let diff = 0;
    if (sortKey === "year") diff = a.year - b.year;
    else if (sortKey === "mcap") diff = a.mcap - b.mcap;
    else if (sortKey === "change") diff = (a.change ?? 0) - (b.change ?? 0);
    return sortOrder === "asc" ? diff : -diff;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <div class="flex h-full min-h-0 flex-1 flex-col bg-zinc-950 p-6">
      {/* Header Info Banner */}
      <div class="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800/80 pb-5">
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
          </div>

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
                <span class="text-xs text-zinc-500">Live Today</span>
              </>
            )}
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

      {/* Financial Breakdown Table */}
      <div class="min-h-0 flex-1 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        <table class="w-full border-collapse text-left text-xs">
          <thead>
            <tr class="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
              <th
                class="cursor-pointer px-4 py-3 font-semibold hover:text-white transition"
                onClick={() => handleSort("year")}
              >
                <div class="flex items-center gap-1.5">
                  <span>Year</span>
                  {sortKey === "year" && (
                    <span class="text-emerald-400">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}
                </div>
              </th>
              <th
                class="cursor-pointer px-4 py-3 font-semibold hover:text-white transition text-right"
                onClick={() => handleSort("mcap")}
              >
                <div class="flex items-center justify-end gap-1.5">
                  <span>Market Cap</span>
                  {sortKey === "mcap" && (
                    <span class="text-emerald-400">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}
                </div>
              </th>
              <th class="px-4 py-3 font-semibold text-right">Avg Stock Price</th>
              <th
                class="cursor-pointer px-4 py-3 font-semibold hover:text-white transition text-right"
                onClick={() => handleSort("change")}
              >
                <div class="flex items-center justify-end gap-1.5">
                  <span>YoY Delta</span>
                  {sortKey === "change" && (
                    <span class="text-emerald-400">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}
                </div>
              </th>
              <th class="px-4 py-3 font-semibold text-right">YoY Growth (%)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800/60">
            {sortedRows.map((row) => {
              const hasChange = row.change !== null;
              const pos = (row.change ?? 0) >= 0;

              return (
                <tr key={row.year} class="hover:bg-zinc-800/40 transition-colors">
                  <td class="px-4 py-3 font-medium text-zinc-200">{row.year}</td>
                  <td class="px-4 py-3 text-right font-semibold text-zinc-100 tabular-nums">
                    {formatMarketCapFromNumber(row.mcap)}
                  </td>
                  <td class="px-4 py-3 text-right text-zinc-400 tabular-nums">
                    {row.price ? `$${row.price.toFixed(2)}` : "—"}
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums">
                    {hasChange ? (
                      <span
                        class={`inline-flex items-center gap-1 font-medium ${
                          pos ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        <span>{formatSignedChange(row.change!)} B</span>
                        <span>{changeArrow(row.change!)}</span>
                      </span>
                    ) : (
                      <span class="text-zinc-600">—</span>
                    )}
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums">
                    {row.pctChange !== null ? (
                      <span
                        class={`inline-block rounded px-1.5 py-0.5 font-medium ${
                          pos
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {formatPercentChange(row.pctChange)}
                      </span>
                    ) : (
                      <span class="text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
