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

  // Endpoint candidates: local Vite proxy first, then direct
  const endpoints = [
    `/api/yahoo/v8/finance/chart/${encodeURIComponent(formattedSymbol)}?interval=1d`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(formattedSymbol)}?interval=1d`,
  ];

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
