// Dedicated AI Analyst tab with live web search price checking and equity research capabilities.
import { useState } from "preact/hooks";
import { formatPercentChange, formatPrice, formatSignedChange } from "../format";
import {
  analyzeCompanyWithAI,
  fetchLivePriceWithAI,
  getGeminiApiKey,
  type AnalysisTopic,
  type LivePriceResult,
} from "../services/gemini";
import { store } from "../state";
import type { Stock } from "../stocks";
import { AiSettingsModal } from "./AiSettingsModal";

type AiAnalystViewProps = {
  stock: Stock;
};

export function AiAnalystView({ stock }: AiAnalystViewProps) {
  const [activeTopic, setActiveTopic] = useState<AnalysisTopic | null>(null);
  const [analysisText, setAnalysisText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveResult, setLiveResult] = useState<LivePriceResult | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const hasApiKey = Boolean(getGeminiApiKey());

  const handleFetchPrice = async () => {
    if (!hasApiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await fetchLivePriceWithAI(stock.symbol, stock.name);
      setLiveResult(result);
      store.updateStockPrice(
        stock.symbol,
        result.price,
        result.change,
        result.percentChange
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch live price via AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysis = async (topic: AnalysisTopic, question?: string) => {
    if (!hasApiKey) {
      setIsSettingsOpen(true);
      return;
    }

    setActiveTopic(topic);
    setIsLoading(true);
    setErrorMsg(null);
    setAnalysisText("");

    try {
      const result = await analyzeCompanyWithAI(
        stock.symbol,
        stock.name,
        topic,
        question
      );
      setAnalysisText(result);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate AI analysis");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="flex h-full min-h-0 flex-1 flex-col bg-zinc-950 p-6 overflow-y-auto">
      {/* Header Banner */}
      <div class="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-2xl font-bold tracking-tight text-white">{stock.name}</h2>
            <span class="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
              {stock.symbol}
            </span>
            <span class="rounded-md bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 text-xs font-medium text-violet-300">
              Gemini 3.6 AI Analyst
            </span>
          </div>

          <div class="mt-2 flex items-baseline gap-3">
            <span class="text-3xl font-extrabold tracking-tight text-white tabular-nums">
              {formatPrice(stock.price)}
            </span>
            <div
              class={`flex items-center gap-1 text-sm font-semibold tabular-nums ${
                stock.change >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <span>
                {formatSignedChange(stock.change)} ({formatPercentChange(stock.percentChange)})
              </span>
              <span>{stock.change >= 0 ? "↑" : "↓"}</span>
            </div>
            {liveResult && (
              <span class="text-xs text-emerald-400">
                • Verified live at {liveResult.timestamp}
              </span>
            )}
          </div>
        </div>

        {/* Live Price Fetch Button & AI Settings */}
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFetchPrice}
            disabled={isLoading}
            class="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-900/30 hover:from-violet-500 hover:to-indigo-500 transition active:scale-95 disabled:opacity-50"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{isLoading ? "Querying Web..." : "Query Real-World Live Price"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure Gemini API Key"
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Live Search Price Result Banner */}
      {liveResult && (
        <div class="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span class="text-xs font-bold text-emerald-300">
                Live Market Quote Verified: {formatPrice(liveResult.price)} {liveResult.currency}
              </span>
            </div>
            <span class="text-[11px] text-zinc-400">Fetched via Google Search</span>
          </div>
          <p class="mt-1.5 text-xs text-zinc-300">{liveResult.sourceText}</p>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div class="mb-5 rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-xs text-rose-300">
          <div class="flex items-center justify-between">
            <span>⚠️ {errorMsg}</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              class="font-semibold underline hover:text-white"
            >
              Open AI Settings
            </button>
          </div>
        </div>
      )}

      {/* Quick Research Actions Grid */}
      <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => handleRunAnalysis("summary")}
          disabled={isLoading}
          class={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
            activeTopic === "summary"
              ? "border-violet-500 bg-violet-950/30 ring-1 ring-violet-500/50"
              : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-850/60"
          }`}
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">🏢</span>
            <span class="text-xs font-bold text-white">Company & Moat Overview</span>
          </div>
          <p class="mt-1.5 text-[11px] text-zinc-400">
            Core business model, competitive advantages, and market positioning.
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleRunAnalysis("trajectory")}
          disabled={isLoading}
          class={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
            activeTopic === "trajectory"
              ? "border-violet-500 bg-violet-950/30 ring-1 ring-violet-500/50"
              : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-850/60"
          }`}
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">🚀</span>
            <span class="text-xs font-bold text-white">Future Trajectory & Catalysts</span>
          </div>
          <p class="mt-1.5 text-[11px] text-zinc-400">
            Growth tailwinds, bull/bear cases, and 2-5 year potential roadmap.
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleRunAnalysis("risks")}
          disabled={isLoading}
          class={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
            activeTopic === "risks"
              ? "border-violet-500 bg-violet-950/30 ring-1 ring-violet-500/50"
              : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-850/60"
          }`}
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">⚠️</span>
            <span class="text-xs font-bold text-white">Key Risks & Headwinds</span>
          </div>
          <p class="mt-1.5 text-[11px] text-zinc-400">
            Macro exposure, valuation risks, and industry challenges.
          </p>
        </button>
      </div>

      {/* Custom Question Prompt Bar */}
      <div class="mb-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customQuestion.trim()) {
              handleRunAnalysis("custom", customQuestion);
            }
          }}
          class="flex gap-2"
        >
          <input
            type="text"
            value={customQuestion}
            onInput={(e) => setCustomQuestion((e.target as HTMLInputElement).value)}
            placeholder={`Ask AI anything about ${stock.symbol} (e.g. Is XEQT good for long-term holding?)...`}
            class="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            type="submit"
            disabled={isLoading || !customQuestion.trim()}
            class="rounded-xl bg-zinc-800 px-5 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition disabled:opacity-50"
          >
            Ask AI
          </button>
        </form>
      </div>

      {/* Analysis Output Container */}
      <div class="min-h-[220px] flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        {isLoading ? (
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mb-3" />
            <span class="text-xs font-medium text-zinc-300">
              Gemini 3.6 is analyzing {stock.symbol}...
            </span>
            <span class="text-[11px] text-zinc-500 mt-1">
              Synthesizing financial reports & market trends
            </span>
          </div>
        ) : analysisText ? (
          <div class="prose prose-invert max-w-none text-xs leading-relaxed space-y-3">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span class="font-bold text-sm text-zinc-100 uppercase tracking-wider">
                {activeTopic === "summary"
                  ? "Executive Overview"
                  : activeTopic === "trajectory"
                  ? "Trajectory & Catalyst Report"
                  : activeTopic === "risks"
                  ? "Risk Assessment"
                  : customQuestion}
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(analysisText)}
                class="text-[11px] text-zinc-400 hover:text-white"
              >
                📋 Copy Text
              </button>
            </div>
            <div class="whitespace-pre-wrap text-zinc-300 font-sans text-xs leading-relaxed">
              {analysisText}
            </div>
          </div>
        ) : (
          <div class="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
            <div class="text-3xl mb-2">🤖</div>
            <p class="text-xs">
              Select one of the research modules above or click <strong>Query Real-World Live Price</strong> to begin.
            </p>
            {!hasApiKey && (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                class="mt-3 rounded-lg bg-violet-600/20 border border-violet-500/30 px-3 py-1.5 text-xs text-violet-300 hover:bg-violet-600/30 transition"
              >
                + Configure Gemini API Key to enable AI features
              </button>
            )}
          </div>
        )}
      </div>

      <AiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
