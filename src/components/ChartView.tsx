// Single-stock interactive SVG chart with hover crosshairs, tooltips, gradients, and timeframe toggles.
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { formatMarketCapFromString, formatPercentChange, formatPrice, formatSignedChange, formatVolume } from "../format";
import { store, type Timeframe } from "../state";
import type { Stock } from "../stocks";

type ChartViewProps = {
  stock: Stock;
};

const MIN_CHART_HEIGHT = 260;

export function ChartView({ stock }: ChartViewProps) {
  const chartWrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 800, height: 380 });
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  const timeframe = store.chartTimeframe.value;
  const metric = store.chartMetric.value;
  const isPositive = stock.change >= 0;

  // Track rendered chart container dimensions
  useEffect(() => {
    const chartEl = chartWrapRef.current;
    if (!chartEl) return;

    const updateSize = () => {
      const width = Math.floor(chartEl.clientWidth);
      const height = Math.floor(chartEl.clientHeight);
      if (width <= 0 || height <= 0) return;
      setSize({ width, height: Math.max(MIN_CHART_HEIGHT, height) });
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(chartEl);
    updateSize();
    return () => observer.disconnect();
  }, []);

  // Compute points and SVG geometry
  const chart = useMemo(() => {
    // Select series based on timeframe and metric
    let dataPoints: { label: string; value: number }[] = [];

    if (timeframe === "1D") {
      dataPoints = (stock.intraday || []).map((p) => ({
        label: p.time,
        value: p.price,
      }));
    } else {
      let filteredHistory = stock.history;
      if (timeframe === "1Y") {
        filteredHistory = stock.history.slice(-2);
      } else if (timeframe === "5Y") {
        filteredHistory = stock.history.slice(-5);
      }

      dataPoints = filteredHistory.map((h) => ({
        label: String(h.year),
        value: metric === "mcap" ? h.mcap : (h.price ?? h.mcap * 0.05),
      }));
    }

    if (dataPoints.length === 0) {
      dataPoints = [{ label: "Now", value: stock.price }];
    }

    const values = dataPoints.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valSpread = maxVal - minVal || 1;
    const padding = valSpread * 0.08;
    const minY = Math.max(0, minVal - padding);
    const maxY = maxVal + padding;

    const left = 75;
    const right = 30;
    const top = 25;
    const bottom = 45;
    const w = size.width;
    const h = size.height;
    const plotW = Math.max(100, w - left - right);
    const plotH = Math.max(80, h - top - bottom);

    const tickCount = 5;
    const ticks = Array.from({ length: tickCount }, (_, i) => {
      const ratio = i / (tickCount - 1);
      return minY + (maxY - minY) * ratio;
    });

    const toX = (index: number) =>
      left + (index * plotW) / Math.max(1, dataPoints.length - 1);
    const toY = (value: number) => {
      const ratio = (value - minY) / Math.max(1e-6, maxY - minY);
      return top + plotH - ratio * plotH;
    };

    const points = dataPoints.map((entry, index) => ({
      x: toX(index),
      y: toY(entry.value),
      label: entry.label,
      value: entry.value,
    }));

    const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

    // Area polygon under curve
    const areaPolygon = points.length > 0
      ? `${left},${top + plotH} ${polyline} ${points[points.length - 1].x.toFixed(1)},${top + plotH}`
      : "";

    return {
      left,
      right,
      top,
      bottom,
      w,
      h,
      plotW,
      plotH,
      minY,
      maxY,
      ticks,
      points,
      polyline,
      areaPolygon,
    };
  }, [size, stock, timeframe, metric]);

  // Handle interactive hover over SVG chart
  const handleMouseMove = (event: MouseEvent) => {
    if (!chartWrapRef.current || chart.points.length === 0) return;
    const rect = chartWrapRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;

    // Find closest point by X coordinate
    let closest = chart.points[0];
    let minDiff = Math.abs(mouseX - closest.x);

    for (const pt of chart.points) {
      const diff = Math.abs(mouseX - pt.x);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    }

    setHoveredPoint(closest);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const strokeColor = isPositive ? "#10b981" : "#f43f5e";
  const gradientId = `grad-${stock.symbol}`;

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

          {/* Large Hero Price Display */}
          <div class="mt-2 flex items-baseline gap-3">
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
                : "Market Closed (Previous Close Held)"}
            </span>
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

      {/* Chart Controls Bar */}
      <div class="mb-3 flex items-center justify-between">
        {/* Timeframe Buttons */}
        <div class="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 text-xs">
          {(["1D", "1Y", "5Y", "ALL"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => store.setTimeframe(tf)}
              class={`rounded-md px-2.5 py-1 font-medium transition ${
                timeframe === tf
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tf === "1D" ? "1D (Live Intraday)" : tf}
            </button>
          ))}
        </div>

        {/* Metric Selector (Price vs Market Cap for historical) */}
        {timeframe !== "1D" && (
          <div class="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 text-xs">
            <button
              type="button"
              onClick={() => store.setChartMetric("price")}
              class={`rounded-md px-2.5 py-1 font-medium transition ${
                metric === "price"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Price ($)
            </button>
            <button
              type="button"
              onClick={() => store.setChartMetric("mcap")}
              class={`rounded-md px-2.5 py-1 font-medium transition ${
                metric === "mcap"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Market Cap ($B)
            </button>
          </div>
        )}
      </div>

      {/* SVG Interactive Plot Container */}
      <div
        ref={chartWrapRef}
        class="relative min-h-0 flex-1 rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-2"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chart.w} ${chart.h}`}
          class="block h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color={strokeColor} stop-opacity="0.25" />
              <stop offset="100%" stop-color={strokeColor} stop-opacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {chart.ticks.map((tick) => {
            const y =
              chart.top +
              chart.plotH -
              ((tick - chart.minY) / Math.max(1e-6, chart.maxY - chart.minY)) * chart.plotH;

            return (
              <g key={tick}>
                <line
                  x1={chart.left}
                  y1={y}
                  x2={chart.left + chart.plotW}
                  y2={y}
                  stroke="#27272a"
                  stroke-width="1"
                  stroke-dasharray="3 3"
                />
                <text
                  x={chart.left - 12}
                  y={y + 4}
                  text-anchor="end"
                  class="text-[11px] font-medium fill-zinc-500 tabular-nums"
                >
                  {metric === "mcap" && timeframe !== "1D"
                    ? `$${Math.round(tick).toLocaleString()}B`
                    : `$${tick.toFixed(2)}`}
                </text>
              </g>
            );
          })}

          {/* X-Axis Labels */}
          {chart.points.map((pt, i) => {
            // Show every other label if too many points
            if (chart.points.length > 10 && i % 2 !== 0 && i !== chart.points.length - 1) {
              return null;
            }
            return (
              <text
                key={`${pt.label}-${i}`}
                x={pt.x}
                y={chart.top + chart.plotH + 22}
                text-anchor="middle"
                class="text-[11px] font-medium fill-zinc-500"
              >
                {pt.label}
              </text>
            );
          })}

          {/* Gradient Area Fill */}
          {chart.areaPolygon && (
            <polygon points={chart.areaPolygon} fill={`url(#${gradientId})`} />
          )}

          {/* Main Chart Polyline */}
          <polyline
            points={chart.polyline}
            fill="none"
            stroke={strokeColor}
            stroke-width="2.2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />

          {/* Hover Crosshair & Data Point Indicator */}
          {hoveredPoint && (
            <g>
              {/* Vertical crosshair line */}
              <line
                x1={hoveredPoint.x}
                y1={chart.top}
                x2={hoveredPoint.x}
                y2={chart.top + chart.plotH}
                stroke="#71717a"
                stroke-width="1"
                stroke-dasharray="4 4"
              />
              {/* Point glow & dot */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="6"
                fill={strokeColor}
                opacity="0.3"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="3.5"
                fill="#ffffff"
                stroke={strokeColor}
                stroke-width="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay Badge */}
        {hoveredPoint && (
          <div
            class="pointer-events-none absolute z-30 rounded-lg border border-zinc-700 bg-zinc-900/95 px-3 py-1.5 shadow-xl backdrop-blur"
            style={{
              left: `${Math.min(
                Math.max(chart.left + 10, hoveredPoint.x - 50),
                chart.left + chart.plotW - 100
              )}px`,
              top: `${Math.max(10, hoveredPoint.y - 50)}px`,
            }}
          >
            <div class="text-[10px] font-semibold text-zinc-400">{hoveredPoint.label}</div>
            <div class="text-xs font-bold text-white tabular-nums">
              {metric === "mcap" && timeframe !== "1D"
                ? `$${hoveredPoint.value.toLocaleString()} B`
                : `$${hoveredPoint.value.toFixed(2)}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
