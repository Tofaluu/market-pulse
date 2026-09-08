// Top toolbar with application branding, live streaming controls, undo/redo, view toggles, and universal stock search modal.
import { useState } from "preact/hooks";
import { APP_TITLE } from "../constants";
import { store } from "../state";
import { AddStockModal } from "./AddStockModal";
import { AiSettingsModal } from "./AiSettingsModal";

type ToolbarProps = {
  onAdd: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function Toolbar({ onAdd, onDelete, onUndo, onRedo }: ToolbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const canSingle = store.hasSingleSelection.value;
  const mode = store.viewMode.value;
  const isLive = store.isLive.value;
  const selectedCount = store.selectedCount.value;

  return (
    <>
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

          {/* Market Status (Open vs Closed) & Simulation Toggle */}
          <div class="flex items-center gap-2">
            <div
              class={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                store.isMarketOpen.value
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-400"
              }`}
              title={
                store.isMarketOpen.value
                  ? "US & Canadian exchanges are open (9:30 AM - 4:00 PM ET)"
                  : "Markets closed overnight/weekend. Official closing prices held."
              }
            >
              <span class="relative flex h-2 w-2">
                {store.isMarketOpen.value && isLive && (
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  class={`relative inline-flex h-2 w-2 rounded-full ${
                    store.isMarketOpen.value ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </span>
              <span>{store.isMarketOpen.value ? "MARKET OPEN" : "MARKET CLOSED"}</span>
            </div>

            <button
              type="button"
              onClick={() => store.toggleLive()}
              title={
                isLive
                  ? "Simulation active. Click to pause."
                  : "Simulation paused. Click to simulate live market ticks."
              }
              class={`flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-medium transition ${
                isLive
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <span>{isLive ? "⏸ Simulating" : "▶ Simulate"}</span>
            </button>
          </div>
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

          {/* Search & Add Stock Dialog Trigger */}
          <div class="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={!store.canAdd.value}
              title="Search & add any stock from global directory"
              class="flex h-7 items-center gap-1.5 rounded-lg border border-emerald-600/40 bg-emerald-600/15 px-3 text-xs font-semibold text-emerald-300 shadow-sm transition hover:bg-emerald-600/25 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600"
            >
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Stock</span>
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

          {/* View Mode Segmented Controls (Chart, Table, AI Analyst) */}
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

            <button
              type="button"
              onClick={() => store.setViewMode("ai")}
              disabled={!canSingle}
              class={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition ${
                mode === "ai" && canSingle
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-400 hover:text-violet-300 disabled:cursor-not-allowed disabled:text-zinc-650"
              }`}
            >
              <span>🤖</span>
              <span>AI Analyst</span>
            </button>
          </div>

          {/* AI Settings Trigger */}
          <button
            type="button"
            onClick={() => setIsAiSettingsOpen(true)}
            title="Configure Gemini API Key"
            class="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-400 hover:border-zinc-700 hover:text-white transition"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Universal Search & Add Modal */}
      <AddStockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />
    </>
  );
}
