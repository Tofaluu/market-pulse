// Instruction and multi-select overview panels.
import { MULTI_SELECT_TEXT, WELCOME_TEXT } from "../constants";
import { formatPercentChange, formatPrice } from "../format";
import { store } from "../state";

type InstructionsProps = {
  multi: boolean;
};

export function Instructions({ multi }: InstructionsProps) {
  const selectedSymbols = Array.from(store.selectedSymbols.value);
  const selectedStocks = store.stocks.value.filter((s) =>
    store.isSelected(s.symbol)
  );

  if (multi) {
    return (
      <div class="flex h-full flex-col items-center justify-center p-8 text-center">
        <div class="max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white">
            {selectedSymbols.length} Stocks Selected
          </h3>
          <p class="mt-2 text-xs leading-relaxed text-zinc-400">
            {MULTI_SELECT_TEXT.title}
          </p>

          {/* Selected Tickers Preview Chips */}
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            {selectedStocks.map((s) => (
              <div
                key={s.symbol}
                class="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs"
              >
                <span class="font-bold text-white">{s.symbol}</span>
                <span class="text-zinc-400">{formatPrice(s.price)}</span>
                <span
                  class={`text-[11px] font-medium ${
                    s.change >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {formatPercentChange(s.percentChange)}
                </span>
              </div>
            ))}
          </div>

          <div class="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => store.deleteSelectedStocks()}
              class="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 transition"
            >
              Delete Selected ({selectedSymbols.length})
            </button>
            <button
              type="button"
              onClick={() => store.clearSelection()}
              class="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-750 transition"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="flex h-full flex-col items-center justify-center p-8">
      <div class="max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>

        <h2 class="text-2xl font-bold tracking-tight text-white">{WELCOME_TEXT.title}</h2>
        <p class="mt-2 text-sm text-zinc-400 leading-relaxed">{WELCOME_TEXT.subtitle}</p>

        <div class="mt-6 space-y-3">
          <div class="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Key Features
          </div>
          <div class="grid grid-cols-1 gap-2 text-xs text-zinc-300">
            {WELCOME_TEXT.supported.map((item) => (
              <div key={item} class="flex items-center gap-2 rounded-lg bg-zinc-850/60 p-2 border border-zinc-800/80">
                <span class="text-emerald-400">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div class="mt-6">
          <div class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Keyboard Shortcuts
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            {WELCOME_TEXT.shortcuts.map((sc) => {
              const [key, desc] = sc.split(" - ");
              return (
                <div key={sc} class="flex items-center justify-between rounded-md bg-zinc-850/40 px-2.5 py-1.5 border border-zinc-800">
                  <kbd class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-300">
                    {key}
                  </kbd>
                  <span class="text-zinc-400 text-[11px] truncate max-w-[120px]">{desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {store.stocks.value.length > 0 && (
          <div class="mt-6 pt-4 border-t border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => store.clickStock(store.stocks.value[0].symbol, false)}
              class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition"
            >
              <span>View {store.stocks.value[0].symbol} Live Analytics</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
