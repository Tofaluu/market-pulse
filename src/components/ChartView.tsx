// Single-stock chart mode with responsive SVG sizing.
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { changeArrow, formatMarketCapFromString, formatPrice, formatSignedChange } from "../format";
import type { Stock } from "../stocks";

type ChartViewProps = {
  stock: Stock;
};

const axisTextStyle = { fontFamily: "Arial", fontSize: "14pt" };
const MIN_CHART_HEIGHT = 180;

export function ChartView({ stock }: ChartViewProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 600, height: 280 });

  useEffect(() => {
    const rootEl = rootRef.current;
    const infoEl = infoRef.current;
    const chartEl = wrapRef.current;
    if (!rootEl || !infoEl || !chartEl) return;

    const updateSize = () => {
      // Keep chart coordinates in sync with the current rendered panel size.
      const width = Math.floor(chartEl.clientWidth);
      const height = Math.floor(chartEl.clientHeight);
      if (width <= 0 || height <= 0) return;

      setSize({ width, height: Math.max(MIN_CHART_HEIGHT, height) });
    };

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(rootEl);
    observer.observe(chartEl);
    updateSize();
    return () => observer.disconnect();
  }, []);

  const chart = useMemo(() => {
    const values = stock.history.map((h) => h.mcap);
    const years = stock.history.map((h) => h.year);

    const minY = Math.min(...values);
    const maxY = Math.max(...values);
    const tickCount = 6;
    const ticks = Array.from({ length: tickCount }, (_, i) => {
      const ratio = i / (tickCount - 1);
      return minY + (maxY - minY) * ratio;
    });

    const left = 96;
    const right = 40;
    const top = 18;
    const bottom = 86;
    const w = size.width;
    const h = size.height;
    const plotW = Math.max(80, w - left - right);
    const plotH = Math.max(80, h - top - bottom);

    const toX = (index: number) => left + (index * plotW) / Math.max(1, years.length - 1);
    const toY = (value: number) => {
      const ratio = (value - minY) / Math.max(1e-6, maxY - minY);
      return top + plotH - ratio * plotH;
    };

    const points = stock.history.map((entry, index) => ({
      x: toX(index),
      y: toY(entry.mcap),
      year: entry.year,
      value: entry.mcap,
    }));

    const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

    return { left, right, top, bottom, w, h, plotW, plotH, ticks, points, polyline };
  }, [size, stock]);

  return (
    <div ref={rootRef} class="flex h-full min-h-0 flex-col p-6">
      <div ref={infoRef} class="ml-8 mb-3 space-y-1 text-[14pt]">
        <div class="text-[16pt]">{stock.name} ({stock.symbol})</div>
        <div>Market cap: {formatMarketCapFromString(stock.mcap)}</div>
        <div>
          Stock price: {formatPrice(stock.price)} ({formatSignedChange(stock.change)}{changeArrow(stock.change)})
        </div>
      </div>

      <div class="ml-8 mr-3 min-h-0 flex flex-1 flex-col">
        <div ref={wrapRef} class="min-h-0 flex-1">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${chart.w} ${chart.h}`}
            preserveAspectRatio="none"
            class="block h-full w-full bg-white"
          >
          {chart.ticks.map((tick, i) => {
            const y = chart.top + chart.plotH - (i * chart.plotH) / (chart.ticks.length - 1);
            return (
              <text
                key={tick}
                x={chart.left - 14}
                y={y + 5}
                text-anchor="end"
                style={axisTextStyle}
                fill="#18181b"
              >
                {Math.round(tick).toLocaleString("en-US")}
              </text>
            );
          })}

          {chart.points.map((point) => (
            <text
              key={point.year}
              x={point.x}
              y={chart.top + chart.plotH + 36}
              text-anchor="middle"
              style={axisTextStyle}
              fill="#18181b"
            >
              {point.year}
            </text>
          ))}

          <polyline
            points={chart.polyline}
            fill="none"
            stroke="#2563eb"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
          />

          {chart.points.map((point) => (
            <circle key={`${point.year}-pt`} cx={point.x} cy={point.y} r="4.5" fill="#2563eb" />
          ))}

          </svg>
        </div>
        <div class="pt-2 text-center text-[14pt]">Market Cap by Year (Billions)</div>
      </div>
    </div>
  );
}
