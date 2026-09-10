import type { LivePriceResult, BatchPriceResult } from "./gemini";
import { getStockExpectedCurrency } from "../stocks";

/**
 * Maps an internal ticker symbol to Yahoo Finance's ticker format.
 * Canadian TSX stocks require a ".TO" suffix (e.g. XEQT -> XEQT.TO).
 */
export function formatYahooSymbol(
  symbol: string,
  sector?: string,
  currency?: string
): string {
  const clean = symbol.trim().toUpperCase();
  if (clean.endsWith(".TO") || clean.endsWith(".V")) {
    return clean;
  }

  const expectedCur = getStockExpectedCurrency(clean, sector, currency);
  if (expectedCur === "CAD") {
    return `${clean}.TO`;
  }

  return clean;
}

/**
 * Production Cloudflare Worker CORS proxy for Yahoo Finance.
 * Relays requests to query1.finance.yahoo.com and attaches open CORS headers.
 */
export const YAHOO_PROXY_BASE = "https://yahoo-proxy.samohtliu.workers.dev";

/**
 * Returns prioritized endpoint candidates based on current environment.
 * On production (e.g. GitHub Pages), prioritize the Cloudflare Worker proxy to avoid 404s.
 */
function getYahooEndpoints(queryPath: string): string[] {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (isLocal) {
    return [
      `/api/yahoo${queryPath}`,
      `${YAHOO_PROXY_BASE}${queryPath}`,
      `https://query1.finance.yahoo.com${queryPath}`,
    ];
  }

  return [
    `${YAHOO_PROXY_BASE}${queryPath}`,
    `/api/yahoo${queryPath}`,
    `https://query1.finance.yahoo.com${queryPath}`,
  ];
}

/**
 * Fetches real-time price and day statistics from Yahoo Finance.
 * Uses the local Vite proxy (/api/yahoo) in development or direct fetch if available.
 */
export async function fetchYahooFinanceQuote(
  symbol: string,
  sector?: string,
  currency?: string
): Promise<LivePriceResult | null> {
  const formattedSymbol = formatYahooSymbol(symbol, sector, currency);
  const expectedCur = getStockExpectedCurrency(symbol, sector, currency);

  const queryPath = `/v8/finance/chart/${encodeURIComponent(formattedSymbol)}?interval=1d`;
  const endpoints = getYahooEndpoints(queryPath);

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta || typeof meta.regularMarketPrice !== "number") continue;

      const price = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose ?? price;
      const change = price - prevClose;
      const percentChange =
        typeof meta.regularMarketChangePercent === "number"
          ? meta.regularMarketChangePercent
          : prevClose > 0
          ? (change / prevClose) * 100
          : 0;

      return {
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        percentChange: Number(percentChange.toFixed(2)),
        dayHigh:
          typeof meta.regularMarketDayHigh === "number"
            ? Number(meta.regularMarketDayHigh.toFixed(2))
            : undefined,
        dayLow:
          typeof meta.regularMarketDayLow === "number"
            ? Number(meta.regularMarketDayLow.toFixed(2))
            : undefined,
        currency: meta.currency || expectedCur,
        sourceText: `Yahoo Finance Live (${meta.fullExchangeName || meta.exchangeName || "Real-Time"})`,
        timestamp: new Date().toLocaleTimeString(),
      };
    } catch {
      // Try next endpoint candidate
      continue;
    }
  }

  return null;
}

/**
 * Fetches real-time prices for multiple stocks in parallel from Yahoo Finance.
 */
export async function batchFetchYahooFinanceQuotes(
  stocks: { symbol: string; sector?: string; currency?: string }[]
): Promise<BatchPriceResult> {
  if (stocks.length === 0) return {};

  const results: BatchPriceResult = {};
  const promises = stocks.map(async (stock) => {
    try {
      const quote = await fetchYahooFinanceQuote(
        stock.symbol,
        stock.sector,
        stock.currency
      );
      if (quote) {
        results[stock.symbol.toUpperCase()] = {
          price: quote.price,
          change: quote.change,
          percentChange: quote.percentChange,
          dayHigh: quote.dayHigh,
          dayLow: quote.dayLow,
          currency: quote.currency,
        };
      }
    } catch {
      // Ignore individual failures so other stocks succeed
    }
  });

  await Promise.allSettled(promises);
  return results;
}

export type YahooChartPoint = {
  timestamp: number;
  dateStr: string;
  timeStr: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
};

export type YahooHistoricalChart = {
  symbol: string;
  currency: string;
  previousClose: number;
  currentPrice: number;
  dayHigh?: number;
  dayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  volume?: number;
  points: YahooChartPoint[];
  timeframe: string;
};

/**
 * Fetches real historical/intraday chart data series from Yahoo Finance.
 */
export async function fetchYahooChartSeries(
  symbol: string,
  range: "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y" | "ALL" = "1D",
  sector?: string,
  currency?: string
): Promise<YahooHistoricalChart | null> {
  const formattedSymbol = formatYahooSymbol(symbol, sector, currency);
  const expectedCur = getStockExpectedCurrency(symbol, sector, currency);

  let yahooRange = "1d";
  let yahooInterval = "5m";

  switch (range) {
    case "1D":
      yahooRange = "1d";
      yahooInterval = "5m";
      break;
    case "5D":
      yahooRange = "5d";
      yahooInterval = "15m";
      break;
    case "1M":
      yahooRange = "1mo";
      yahooInterval = "1d";
      break;
    case "6M":
      yahooRange = "6mo";
      yahooInterval = "1d";
      break;
    case "1Y":
      yahooRange = "1y";
      yahooInterval = "1d";
      break;
    case "5Y":
      yahooRange = "5y";
      yahooInterval = "1wk";
      break;
    case "ALL":
      yahooRange = "max";
      yahooInterval = "1mo";
      break;
  }

  const queryPath = `/v8/finance/chart/${encodeURIComponent(formattedSymbol)}?range=${yahooRange}&interval=${yahooInterval}`;
  const endpoints = getYahooEndpoints(queryPath);

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const data = await response.json();
      const result = data?.chart?.result?.[0];
      const meta = result?.meta;
      if (!result || !meta) continue;

      const timestamps: number[] = result.timestamp || [];
      const quotes = result.indicators?.quote?.[0] || {};
      const quoteValues: (number | null)[] = quotes.close || [];
      const openValues: (number | null)[] = quotes.open || [];
      const highValues: (number | null)[] = quotes.high || [];
      const lowValues: (number | null)[] = quotes.low || [];
      const volumeValues: (number | null)[] = quotes.volume || [];

      const points: YahooChartPoint[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        const val = quoteValues[i];
        if (typeof val === "number" && !isNaN(val)) {
          const date = new Date(timestamps[i] * 1000);
          const timeStr = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: "America/New_York",
          });
          const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: range === "1Y" || range === "5Y" || range === "ALL" ? "numeric" : undefined,
            timeZone: "America/New_York",
          });
          points.push({
            timestamp: timestamps[i],
            dateStr,
            timeStr,
            price: Number(val.toFixed(2)),
            open: typeof openValues[i] === "number" ? Number(openValues[i]!.toFixed(2)) : undefined,
            high: typeof highValues[i] === "number" ? Number(highValues[i]!.toFixed(2)) : undefined,
            low: typeof lowValues[i] === "number" ? Number(lowValues[i]!.toFixed(2)) : undefined,
            volume: typeof volumeValues[i] === "number" ? volumeValues[i]! : undefined,
          });
        }
      }

      if (points.length === 0) continue;

      const dayHigh =
        typeof meta.regularMarketDayHigh === "number"
          ? Number(meta.regularMarketDayHigh.toFixed(2))
          : undefined;
      const dayLow =
        typeof meta.regularMarketDayLow === "number"
          ? Number(meta.regularMarketDayLow.toFixed(2))
          : undefined;
      const fiftyTwoWeekHigh =
        typeof meta.fiftyTwoWeekHigh === "number"
          ? Number(meta.fiftyTwoWeekHigh.toFixed(2))
          : undefined;
      const fiftyTwoWeekLow =
        typeof meta.fiftyTwoWeekLow === "number"
          ? Number(meta.fiftyTwoWeekLow.toFixed(2))
          : undefined;
      const volume =
        typeof meta.regularMarketVolume === "number"
          ? meta.regularMarketVolume
          : undefined;

      return {
        symbol: symbol.toUpperCase(),
        currency: meta.currency || expectedCur,
        previousClose: meta.chartPreviousClose || points[0].price,
        currentPrice: meta.regularMarketPrice || points[points.length - 1].price,
        dayHigh,
        dayLow,
        fiftyTwoWeekHigh,
        fiftyTwoWeekLow,
        volume,
        points,
        timeframe: range,
      };
    } catch {
      continue;
    }
  }

  return null;
}
