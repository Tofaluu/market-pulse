// Bottom status bar displaying selected stock live price, market clock, and list metrics.
import { formatPercentChange, formatPrice, formatSignedChange } from "../format";
import { store } from "../state";

export function StatusBar() {
  const selected = store.selectedStock.value;
  const lastTick = store.lastMarketUpdate.value;
  const isLive = store.isLive.value;

  return (
    <footer class="flex h-8 shrink-0 items-center justify-between border-t border-zinc-850 bg-zinc-950 px-4 text-xs text-zinc-400">
      {/* Selected Stock Live Indicator */}
      <div class="flex items-center gap-2">
        {selected ? (
          <div class="flex items-center gap-1.5 font-medium">
            <span class="text-zinc-200">{selected.name}</span>
            <span class="text-zinc-500">({selected.symbol})</span>
            <span class="text-white font-semibold tabular-nums">{formatPrice(selected.price)}</span>
            <span
              class={`tabular-nums ${
                selected.change >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatSignedChange(selected.change)} ({formatPercentChange(selected.percentChange)})
            </span>
          </div>
        ) : (
          <span class="text-zinc-500">No stock selected</span>
        )}
      </div>

      {/* Streaming Clock & Market Feed Info */}
      <div class="hidden items-center gap-2 md:flex text-[11px] text-zinc-500">
        <span class={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
        <span>{isLive ? "Feed Streaming" : "Feed Paused"}</span>
        <span>•</span>
        <span>Tick: {lastTick}</span>
      </div>

      {/* Portfolio Status Label */}
      <div class="font-medium text-zinc-400">{store.statusLabel.value}</div>
    </footer>
  );
}
