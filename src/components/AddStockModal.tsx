import { useMemo, useState } from "preact/hooks";
import { formatPrice } from "../format";
import { store } from "../state";
import { GLOBAL_TICKER_DIRECTORY, type TickerInfo } from "../tickerDatabase";
import { hasGeminiApiKey, searchAndResolveStockWithAI } from "../services/gemini";

type AddStockModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SectorCategory = "All" | "🇨🇦 Canada" | "Tech" | "Finance" | "Consumer" | "ETFs" | "Growth";

export function AddStockModal({ isOpen, onClose }: AddStockModalProps) {
  if (!isOpen) return null;

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SectorCategory>("All");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);

  const currentSymbols = useMemo(
    () => new Set(store.stocks.value.map((s) => s.symbol.toUpperCase())),
    [store.stocks.value]
  );

  const cleanQuery = query.trim().toUpperCase();

  // Filter tickers from directory
  const filteredTickers = useMemo(() => {
    return GLOBAL_TICKER_DIRECTORY.filter((t) => {
      // Category filter
      if (selectedCategory === "🇨🇦 Canada" && !t.sector.includes("Canadian") && !t.name.includes("TSX") && !t.symbol.includes(".TO")) {
        return false;
      }
      if (selectedCategory === "Tech" && !t.sector.includes("Semi") && !t.sector.includes("Tech") && !t.sector.includes("Software") && !t.sector.includes("AI") && !t.sector.includes("Internet")) {
        return false;
      }
      if (selectedCategory === "Finance" && !t.sector.includes("Bank") && !t.sector.includes("Payment") && !t.sector.includes("Finance") && !t.sector.includes("Crypto")) {
        return false;
      }
      if (selectedCategory === "Consumer" && !t.sector.includes("Retail") && !t.sector.includes("Consumer") && !t.sector.includes("Beverage") && !t.sector.includes("Entertainment")) {
        return false;
      }
      if (selectedCategory === "ETFs" && !t.sector.includes("ETF") && !t.sector.includes("Index")) {
        return false;
      }
      if (selectedCategory === "Growth" && !t.sector.includes("Disruptive") && !t.sector.includes("Gaming") && !t.sector.includes("Treasury") && !t.sector.includes("Mobility")) {
        return false;
      }

      // Query filter
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.sector.toLowerCase().includes(q)
      );
    });
  }, [query, selectedCategory]);

  const exactMatch = GLOBAL_TICKER_DIRECTORY.find((t) => t.symbol === cleanQuery);
  const isAlreadyInWatchlist = currentSymbols.has(cleanQuery);

  const handleAddTicker = (ticker: TickerInfo) => {
    store.addStockBySymbol(ticker.symbol);
    onClose();
  };

  const handleAiSearchAndAdd = async () => {
    const term = query.trim();
    if (!term || isAiSearching) return;

    if (!hasGeminiApiKey()) {
      setAiSearchError("Please configure your Gemini API Key in Settings to search global exchanges.");
      return;
    }

    setIsAiSearching(true);
    setAiSearchError(null);

    try {
      const resolved = await searchAndResolveStockWithAI(term);
      store.addVerifiedStock(resolved);
      onClose();
    } catch (err: any) {
      setAiSearchError(err.message || `Could not find a publicly traded stock or ETF for "${term}".`);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      if (filteredTickers.length > 0 && !currentSymbols.has(filteredTickers[0].symbol)) {
        handleAddTicker(filteredTickers[0]);
      } else if (query.trim() && !isAlreadyInWatchlist) {
        handleAiSearchAndAdd();
      }
    }
  };

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        class="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Modal Header */}
        <div class="border-b border-zinc-800 p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-white">Add Stock to Watchlist</h3>
                <p class="text-xs text-zinc-400">
                  Search from global equities or enter any custom ticker
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              class="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          {/* Search Input Box */}
          <div class="relative mt-4">
            <input
              type="text"
              autoFocus
              value={query}
              onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
              placeholder="Search ticker (e.g. XEQT, SHOP, SPY, AAPL) or company name..."
              class="w-full rounded-xl border border-zinc-750 bg-zinc-950 px-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            />
            <svg
              class="absolute left-3.5 top-3 h-4 w-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                class="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>

          {/* Sector Category Filter Tabs */}
          <div class="mt-3 flex flex-wrap gap-1.5 text-xs">
            {(["All", "🇨🇦 Canada", "Tech", "Finance", "Consumer", "ETFs", "Growth"] as SectorCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  class={`rounded-lg px-2.5 py-1 font-medium transition ${
                    selectedCategory === cat
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* Results List */}
        <div class="flex-1 overflow-y-auto p-4 space-y-2">
          {/* AI Global Asset Search for any non-directory company or ticker */}
          {cleanQuery && !exactMatch && (
            <div class="mb-3 rounded-xl border border-violet-500/30 bg-violet-950/20 p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="rounded bg-violet-500/20 px-2 py-0.5 text-xs font-bold text-violet-300 shrink-0">
                      AI Global Search
                    </span>
                    <span class="text-xs font-bold text-zinc-100 truncate">
                      "{query.trim()}"
                    </span>
                  </div>
                  <p class="mt-1 text-[11px] text-zinc-400">
                    Search all NYSE, NASDAQ & TSX listings with Gemini AI to identify this company, its real ticker & live price.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAiSearchAndAdd}
                  disabled={isAiSearching}
                  class="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-violet-900/30 hover:from-violet-500 hover:to-indigo-500 transition active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {isAiSearching ? (
                    <>
                      <svg class="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Searching AI...</span>
                    </>
                  ) : (
                    <>
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <span>Find & Add</span>
                    </>
                  )}
                </button>
              </div>

              {aiSearchError && (
                <div class="mt-2.5 flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-1.5 text-xs text-rose-300">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  <span>{aiSearchError}</span>
                </div>
              )}
            </div>
          )}

          {filteredTickers.length === 0 && !cleanQuery ? (
            <div class="py-8 text-center text-xs text-zinc-500">
              Type any stock symbol or company name above to begin searching.
            </div>
          ) : (
            filteredTickers.map((ticker) => {
              const inWatchlist = currentSymbols.has(ticker.symbol);
              const watchlistStock = store.stocks.value.find(
                (s) => s.symbol.toUpperCase() === ticker.symbol.toUpperCase()
              );
              return (
                <div
                  key={ticker.symbol}
                  class="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3 hover:border-zinc-700 hover:bg-zinc-850/60 transition"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-12 items-center justify-center rounded-lg bg-zinc-850 font-bold text-xs text-white">
                      {ticker.symbol}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-zinc-100">{ticker.name}</div>
                      <div class="text-[11px] text-zinc-400">{ticker.sector}</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    {inWatchlist && watchlistStock ? (
                      <div class="text-right">
                        <div class="text-xs font-bold text-zinc-200">
                          {formatPrice(watchlistStock.price)}
                        </div>
                        <div
                          class={`text-[10px] font-semibold ${
                            watchlistStock.change >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {watchlistStock.change >= 0 ? "+" : ""}
                          {watchlistStock.change.toFixed(2)} ({watchlistStock.percentChange.toFixed(2)}%)
                        </div>
                      </div>
                    ) : (
                      <div class="text-right">
                        <div class="text-xs font-semibold text-zinc-500 tabular-nums">
                          —
                        </div>
                        <div class="text-[10px] text-zinc-500 font-medium">
                          Syncs on add
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAddTicker(ticker)}
                      disabled={inWatchlist}
                      class={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        inWatchlist
                          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                          : "bg-zinc-800 text-white hover:bg-emerald-600 hover:text-white"
                      }`}
                    >
                      {inWatchlist ? "Added" : "+ Add"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Quick Picks */}
        <div class="border-t border-zinc-800 bg-zinc-950/60 p-3 px-5 text-xs">
          <div class="flex items-center gap-2 text-zinc-400">
            <span class="font-semibold text-zinc-300">Quick Picks:</span>
            <div class="flex flex-wrap gap-1.5">
              {["XEQT", "VEQT", "VFV", "SHOP", "RY", "TD", "SPY", "QQQ", "COIN"].map((sym) => {
                const added = currentSymbols.has(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      if (!added) {
                        store.addStockBySymbol(sym);
                        onClose();
                      }
                    }}
                    disabled={added}
                    class={`rounded px-2 py-0.5 text-[11px] font-medium transition ${
                      added
                        ? "bg-zinc-850 text-zinc-600 cursor-not-allowed"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
