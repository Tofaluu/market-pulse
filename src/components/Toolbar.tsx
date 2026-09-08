// Top toolbar with application branding, live streaming controls, undo/redo, and view toggles.
import { useState } from "preact/hooks";
import { APP_TITLE } from "../constants";
import { store } from "../state";

type ToolbarProps = {
  onAdd: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function Toolbar({ onAdd, onDelete, onUndo, onRedo }: ToolbarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const canSingle = store.hasSingleSelection.value;
  const mode = store.viewMode.value;
  const isLive = store.isLive.value;
  const available = store.availableStocks();
  const selectedCount = store.selectedCount.value;

  return (
    <header class="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 backdrop-blur-md">
      {/* Brand & Market Status */}
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span class="text-base font-bold tracking-tight text-white">{APP_TITLE}</span>
          <span class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400">
            PRO
          </span>
        </div>

        <div class="h-4 w-[1px] bg-zinc-800" />

        {/* Live Market Simulation Status & Toggle */}
        <button
          type="button"
          onClick={() => store.toggleLive()}
          title={isLive ? "Pause live market stream" : "Resume live market stream"}
          class={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
            isLive
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          }`}
        >
          <span class="relative flex h-2 w-2">
            {isLive && (
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              class={`relative inline-flex h-2 w-2 rounded-full ${
                isLive ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </span>
          <span>{isLive ? "LIVE" : "PAUSED"}</span>
        </button>
      </div>

      {/* Middle & Right Controls */}
      <div class="flex items-center gap-2">
        {/* Undo / Redo buttons */}
        <div class="flex items-center rounded-lg border border-zinc-800 bg-zinc-950/60 p-0.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!store.canUndo.value}
            title="Undo last action (Shift+U)"
            class="flex h-7 w-8 items-center justify-center rounded text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600 disabled:hover:bg-transparent"
          >
            ↩
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!store.canRedo.value}
            title="Redo action (Shift+R)"
            class="flex h-7 w-8 items-center justify-center rounded text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600 disabled:hover:bg-transparent"
          >
            ↪
          </button>
        </div>

        <div class="h-4 w-[1px] bg-zinc-800" />

        {/* Add Stock Dropdown & Del Button */}
        <div class="relative">
          <div class="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowAddMenu(!showAddMenu)}
              disabled={!store.canAdd.value}
              class="flex h-7 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 text-xs font-medium text-zinc-200 shadow-sm transition hover:bg-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600"
            >
              <span>+ Add</span>
              <svg class="h-3 w-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onAdd}
              disabled={!store.canAdd.value}
              title="Add random stock (Shift+A)"
              class="flex h-7 items-center rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-700"
            >
              🎲
            </button>
          </div>

          {/* Add Stock Menu Dropdown */}
          {showAddMenu && (
            <div
              class="absolute right-0 top-9 w-64 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl ring-1 ring-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div class="mb-2 flex items-center justify-between px-2 pt-1">
                <span class="text-xs font-semibold text-zinc-400">Available Tickers</span>
                <button
                  type="button"
                  onClick={() => setShowAddMenu(false)}
                  class="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              </div>
              <div class="max-h-56 overflow-y-auto space-y-1">
                {available.length === 0 ? (
                  <div class="px-2 py-3 text-center text-xs text-zinc-500">
                    All available stocks are in your watchlist!
                  </div>
                ) : (
                  available.map((stock) => (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={() => {
                        store.addStockBySymbol(stock.symbol);
                        setShowAddMenu(false);
                      }}
                      class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition hover:bg-zinc-800"
                    >
                      <div>
                        <span class="font-bold text-zinc-200">{stock.symbol}</span>
                        <span class="ml-1.5 text-zinc-400">{stock.name}</span>
                      </div>
                      <span class="text-zinc-300">${stock.price.toFixed(2)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onDelete}
          disabled={!store.canDelete.value}
          title="Delete selected stocks (Shift+D or Delete)"
          class="flex h-7 items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 text-xs font-medium text-zinc-300 transition hover:border-rose-900/50 hover:bg-rose-950/30 hover:text-rose-400 disabled:cursor-not-allowed disabled:border-zinc-850 disabled:bg-zinc-950/40 disabled:text-zinc-600"
        >
          <span>Delete</span>
          {selectedCount > 0 && (
            <span class="rounded bg-rose-500/20 px-1 py-0.2 text-[10px] font-semibold text-rose-300">
              {selectedCount}
            </span>
          )}
        </button>

        <div class="h-4 w-[1px] bg-zinc-800" />

        {/* View Mode Segmented Controls */}
        <div class="flex items-center rounded-lg border border-zinc-800 bg-zinc-950/80 p-0.5">
          <button
            type="button"
            onClick={() => store.setViewMode("chart")}
            disabled={!canSingle}
            class={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition ${
              mode === "chart" && canSingle
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-400 hover:text-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-650"
            }`}
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <span>Chart</span>
          </button>

          <button
            type="button"
            onClick={() => store.setViewMode("list")}
            disabled={!canSingle}
            class={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition ${
              mode === "list" && canSingle
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-400 hover:text-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-650"
            }`}
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>Table</span>
          </button>
        </div>
      </div>
    </header>
  );
}
