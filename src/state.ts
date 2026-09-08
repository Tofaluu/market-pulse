// Centralized application state, undoable actions, and real-time market simulation engine.
import { computed, signal } from "@preact/signals";
import { MAX_STOCKS } from "./constants";
import type { Stock } from "./stocks";
import { stockRecords, generateIntraday } from "./stocks";
import { UndoManager, type Command } from "./undo";
import { GLOBAL_TICKER_DIRECTORY, createStockFromTicker } from "./tickerDatabase";

export type ViewMode = "chart" | "list" | "ai";
export type Timeframe = "1D" | "1Y" | "5Y" | "ALL";
export type ChartMetric = "price" | "mcap";

/**
 * Checks if North American equity markets (NYSE, NASDAQ, TSX) are currently open.
 * Regular hours: Mon–Fri 9:30 AM – 4:00 PM Eastern Time.
 */
export function isMarketOpen(): boolean {
  try {
    const etString = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const etDate = new Date(etString);
    const day = etDate.getDay(); // 0 = Sun, 6 = Sat
    if (day === 0 || day === 6) return false;
    const minutes = etDate.getHours() * 60 + etDate.getMinutes();
    return minutes >= 570 && minutes < 960; // 9:30 AM to 4:00 PM ET
  } catch {
    return false;
  }
}

const STORAGE_KEY = "marketpulse_watchlist_v2";

function loadPersistedWatchlist(): Stock[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data === null) return null;
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to load persisted watchlist", err);
  }
  return null;
}

function persistWatchlist(stocks: Stock[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
  } catch (err) {
    console.warn("Failed to persist watchlist", err);
  }
}

class StockStore {
  // Initialize with persisted watchlist if present, otherwise initial curated stocks
  private initialStocks =
    loadPersistedWatchlist() ??
    stockRecords.slice(0, 6).map((s) => ({ ...s }));

  stocks = signal<Stock[]>(this.initialStocks);
  selectedSymbols = signal<Set<string>>(new Set<string>());
  viewMode = signal<ViewMode>("chart");
  chartTimeframe = signal<Timeframe>("1D");
  chartMetric = signal<ChartMetric>("price");

  // Real-time market streaming simulation state (only active when market is open or manually enabled)
  isMarketOpen = signal<boolean>(isMarketOpen());
  isLive = signal<boolean>(isMarketOpen());
  simulationSpeed = signal<number>(2000);
  lastMarketUpdate = signal<string>(
    isMarketOpen() ? new Date().toLocaleTimeString() : "4:00 PM ET (Market Close)"
  );
  searchQuery = signal<string>("");

  private undoManager = new UndoManager();
  private historyVersion = signal(0);
  private timerId: number | null = null;
  private flashTimers = new Map<string, number>();

  constructor() {
    if (this.isLive.value) {
      this.startSimulation();
    }
  }

  save() {
    persistWatchlist(this.stocks.value);
  }

  resetToDefaultWatchlist() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    const defaults = stockRecords.slice(0, 6).map((s) => ({ ...s }));
    this.stocks.value = defaults;
    this.selectedSymbols.value = new Set<string>();
    this.save();
  }

  canUndo = computed(() => {
    this.historyVersion.value;
    return this.undoManager.canUndo;
  });

  canRedo = computed(() => {
    this.historyVersion.value;
    return this.undoManager.canRedo;
  });

  selectedCount = computed(() => this.selectedSymbols.value.size);

  hasSingleSelection = computed(() => this.selectedCount.value === 1);

  selectedStock = computed<Stock | null>(() => {
    if (this.selectedSymbols.value.size !== 1) return null;
    const symbol = Array.from(this.selectedSymbols.value)[0];
    return this.stocks.value.find((stock) => stock.symbol === symbol) ?? null;
  });

  canAdd = computed(() => this.stocks.value.length < MAX_STOCKS);

  canDelete = computed(
    () => this.stocks.value.length > 0 && this.selectedSymbols.value.size > 0
  );

  statusLabel = computed(() => {
    const count = this.stocks.value.length;
    const selected = this.selectedSymbols.value.size;
    if (count === 0) return "No Stocks (0 Selected)";
    if (count === 1) return `1 Stock (${selected} Selected)`;
    return `${count} Stocks (${selected} Selected)`;
  });

  filteredStocks = computed(() => {
    const query = this.searchQuery.value.trim().toLowerCase();
    if (!query) return this.stocks.value;
    return this.stocks.value.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        (s.sector && s.sector.toLowerCase().includes(query))
    );
  });

  isSelected(symbol: string) {
    return this.selectedSymbols.value.has(symbol);
  }

  setViewMode(mode: ViewMode) {
    if (!this.hasSingleSelection.value) return;
    this.viewMode.value = mode;
  }

  setTimeframe(tf: Timeframe) {
    this.chartTimeframe.value = tf;
  }

  setChartMetric(metric: ChartMetric) {
    this.chartMetric.value = metric;
  }

  setSearchQuery(query: string) {
    this.searchQuery.value = query;
  }

  // --- Live Market Simulation Engine ---

  startSimulation() {
    if (this.timerId !== null) return;
    this.timerId = window.setInterval(() => {
      if (!this.isLive.value) return;
      this.tickSimulation();
    }, this.simulationSpeed.value);
  }

  stopSimulation() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  toggleLive() {
    this.isLive.value = !this.isLive.value;
    if (this.isLive.value && this.timerId === null) {
      this.startSimulation();
    }
  }

  setSimulationSpeed(ms: number) {
    this.simulationSpeed.value = ms;
    this.stopSimulation();
    this.startSimulation();
  }

  private tickSimulation() {
    const currentList = this.stocks.value;
    if (currentList.length === 0) return;

    // Pick 1 to 3 random stocks in the watchlist to update
    const numToUpdate = Math.min(
      currentList.length,
      Math.floor(Math.random() * 3) + 1
    );
    const shuffledIndices = [...Array(currentList.length).keys()].sort(
      () => 0.5 - Math.random()
    );
    const chosenIndices = new Set(shuffledIndices.slice(0, numToUpdate));

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    this.lastMarketUpdate.value = timeStr;

    const nextList = currentList.map((stock, idx) => {
      if (!chosenIndices.has(idx)) return stock;

      // Realistic Brownian motion: volatility delta between -0.45% and +0.45%
      const volatility = 0.0035;
      const pctDelta = (Math.random() - 0.49) * volatility * 2;
      const rawDelta = stock.price * pctDelta;
      const newPrice = Number(Math.max(0.5, stock.price + rawDelta).toFixed(2));
      const newChange = Number((newPrice - stock.open).toFixed(2));
      const newPctChange = Number(((newChange / stock.open) * 100).toFixed(2));
      const direction: "up" | "down" = newPrice >= stock.price ? "up" : "down";

      const newHigh = Math.max(stock.dayHigh, newPrice);
      const newLow = Math.min(stock.dayLow, newPrice);
      const volumeAdd = Math.floor(Math.random() * 15000 + 2500);

      // Append real-time tick to intraday series
      const updatedIntraday = [
        ...stock.intraday.slice(-30),
        { time: timeStr.slice(0, 5), price: newPrice },
      ];

      // Schedule flash removal
      if (this.flashTimers.has(stock.symbol)) {
        clearTimeout(this.flashTimers.get(stock.symbol)!);
      }
      const timeoutId = window.setTimeout(() => {
        this.clearStockFlash(stock.symbol);
      }, 700);
      this.flashTimers.set(stock.symbol, timeoutId);

      return {
        ...stock,
        price: newPrice,
        change: newChange,
        percentChange: newPctChange,
        dayHigh: newHigh,
        dayLow: newLow,
        volume: stock.volume + volumeAdd,
        flash: direction,
        intraday: updatedIntraday,
      };
    });

    this.stocks.value = nextList;
  }

  private clearStockFlash(symbol: string) {
    this.stocks.value = this.stocks.value.map((s) =>
      s.symbol === symbol ? { ...s, flash: null } : s
    );
    this.flashTimers.delete(symbol);
  }

  updateStockPrice(
    symbol: string,
    newPrice: number,
    newChange?: number,
    newPctChange?: number
  ) {
    const cleanSymbol = symbol.trim().toUpperCase();
    this.stocks.value = this.stocks.value.map((s) => {
      if (s.symbol !== cleanSymbol) return s;

      const change =
        newChange !== undefined
          ? newChange
          : Number((newPrice - s.open).toFixed(2));
      const percentChange =
        newPctChange !== undefined
          ? newPctChange
          : Number(((change / s.open) * 100).toFixed(2));
      const direction: "up" | "down" = newPrice >= s.price ? "up" : "down";

      const updatedHistory = (s.history || []).map((h) =>
        h.year === 2026 ? { ...h, price: newPrice } : h
      );
      const updatedIntraday = generateIntraday(newPrice, change);

      return {
        ...s,
        price: newPrice,
        change,
        percentChange,
        dayHigh: Math.max(s.dayHigh, newPrice),
        dayLow: Math.min(s.dayLow, newPrice),
        flash: direction,
        intraday: updatedIntraday,
        history: updatedHistory,
      };
    });
    this.save();
  }

  batchUpdatePrices(
    priceMap: Record<
      string,
      { price: number; change?: number; percentChange?: number }
    >
  ) {
    this.stocks.value = this.stocks.value.map((stock) => {
      const sym = stock.symbol.toUpperCase();
      const update =
        priceMap[sym] ||
        (sym.endsWith(".TO") ? priceMap[sym.replace(".TO", "")] : priceMap[`${sym}.TO`]);

      if (!update) return stock;

      const change =
        update.change !== undefined
          ? update.change
          : Number((update.price - stock.open).toFixed(2));
      const percentChange =
        update.percentChange !== undefined
          ? update.percentChange
          : Number(((change / stock.open) * 100).toFixed(2));
      const direction: "up" | "down" =
        update.price >= stock.price ? "up" : "down";

      const updatedHistory = (stock.history || []).map((h) =>
        h.year === 2026 ? { ...h, price: update.price } : h
      );
      const updatedIntraday = generateIntraday(update.price, change);

      return {
        ...stock,
        price: update.price,
        change,
        percentChange,
        dayHigh: Math.max(stock.dayHigh, update.price),
        dayLow: Math.min(stock.dayLow, update.price),
        flash: direction,
        intraday: updatedIntraday,
        history: updatedHistory,
      };
    });
    this.save();
  }

  // --- Undo/Redo & Watchlist Operations ---

  private normalizeSelection() {
    const available = new Set(this.stocks.value.map((stock) => stock.symbol));
    const next = new Set(
      Array.from(this.selectedSymbols.value).filter((symbol) =>
        available.has(symbol)
      )
    );
    this.selectedSymbols.value = next;
  }

  private pushHistory(command: Command) {
    this.undoManager.execute(command);
    this.historyVersion.value++;
  }

  undo() {
    if (!this.undoManager.canUndo) return;
    this.undoManager.undo();
    this.normalizeSelection();
    this.historyVersion.value++;
  }

  redo() {
    if (!this.undoManager.canRedo) return;
    this.undoManager.redo();
    this.normalizeSelection();
    this.historyVersion.value++;
  }

  availableStocks() {
    const current = new Set(this.stocks.value.map((stock) => stock.symbol));
    return GLOBAL_TICKER_DIRECTORY.filter((stock) => !current.has(stock.symbol));
  }

  addCustomStock(symbol: string, name?: string, price?: number, sector?: string) {
    if (!this.canAdd.value) return;
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) return;

    if (this.stocks.value.some((s) => s.symbol === cleanSymbol)) {
      this.selectedSymbols.value = new Set([cleanSymbol]);
      this.viewMode.value = "chart";
      return;
    }

    const stock = createStockFromTicker(cleanSymbol, name, price, sector);
    this.addStock(stock);
  }

  addStockBySymbol(symbol: string) {
    if (!this.canAdd.value) return;
    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) return;

    if (this.stocks.value.some((s) => s.symbol === cleanSymbol)) {
      this.selectedSymbols.value = new Set([cleanSymbol]);
      this.viewMode.value = "chart";
      return;
    }

    const existingInCatalog = stockRecords.find((s) => s.symbol === cleanSymbol);
    const stock = existingInCatalog ? { ...existingInCatalog } : createStockFromTicker(cleanSymbol);
    this.addStock(stock);
  }

  private addStock(stock: Stock) {
    const insertIndex = this.stocks.value.length;

    const doAdd = () => {
      const next = this.stocks.value.slice();
      next.splice(insertIndex, 0, stock);
      this.stocks.value = next;
      this.selectedSymbols.value = new Set([stock.symbol]);
      this.viewMode.value = "chart";
      this.save();
    };

    const undoAdd = () => {
      const next = this.stocks.value.slice();
      next.splice(insertIndex, 1);
      this.stocks.value = next;
      this.normalizeSelection();
      this.save();
    };

    this.pushHistory({ do: doAdd, undo: undoAdd });
    doAdd();
  }

  addRandomStock() {
    if (!this.canAdd.value) return;

    const available = this.availableStocks();
    if (available.length === 0) return;

    const pick = available[Math.floor(Math.random() * available.length)];
    this.addStockBySymbol(pick.symbol);
  }

  deleteSelectedStocks() {
    if (!this.canDelete.value) return;

    const previousStocks = this.stocks.value.slice();
    const previousSelection = new Set(this.selectedSymbols.value);
    const symbolsToDelete = new Set(previousSelection);

    const selectedIndexes = previousStocks
      .map((stock, index) => ({ stock, index }))
      .filter(({ stock }) => previousSelection.has(stock.symbol))
      .map(({ index }) => index)
      .sort((a, b) => a - b);

    if (selectedIndexes.length === 0) return;

    const topMostDeleted = selectedIndexes[0];

    const doDelete = () => {
      const next = this.stocks.value.filter(
        (stock) => !symbolsToDelete.has(stock.symbol)
      );
      this.stocks.value = next;

      if (next.length === 0) {
        this.selectedSymbols.value = new Set();
        this.save();
        return;
      }

      const nextIndex = Math.max(0, Math.min(topMostDeleted - 1, next.length - 1));
      this.selectedSymbols.value = new Set([next[nextIndex].symbol]);
      this.viewMode.value = "chart";
      this.save();
    };

    const undoDelete = () => {
      this.stocks.value = previousStocks.slice();
      this.selectedSymbols.value = new Set(previousSelection);
      if (previousSelection.size === 1) {
        this.viewMode.value = "chart";
      }
      this.save();
    };

    this.pushHistory({ do: doDelete, undo: undoDelete });
    doDelete();
  }

  clearSelection() {
    if (this.selectedSymbols.value.size === 0) return;
    const before = new Set(this.selectedSymbols.value);

    const doClear = () => {
      this.selectedSymbols.value = new Set();
    };

    const undoClear = () => {
      this.selectedSymbols.value = new Set(before);
      if (before.size === 1) {
        this.viewMode.value = "chart";
      }
    };

    this.pushHistory({ do: doClear, undo: undoClear });
    doClear();
  }

  clickStock(symbol: string, withShift: boolean) {
    const exists = this.stocks.value.some((stock) => stock.symbol === symbol);
    if (!exists) return;

    const before = new Set(this.selectedSymbols.value);
    const after = new Set(before);

    if (withShift) {
      if (after.has(symbol)) after.delete(symbol);
      else after.add(symbol);
    } else {
      if (before.size === 1 && before.has(symbol)) {
        after.clear();
      } else {
        after.clear();
        after.add(symbol);
      }
    }

    const changed =
      before.size !== after.size ||
      Array.from(before).some((entry) => !after.has(entry));

    if (!changed) return;

    const doSelect = () => {
      this.selectedSymbols.value = new Set(after);
      if (after.size === 1) {
        this.viewMode.value = "chart";
      }
    };

    const undoSelect = () => {
      this.selectedSymbols.value = new Set(before);
      if (before.size === 1) {
        this.viewMode.value = "chart";
      }
    };

    this.pushHistory({ do: doSelect, undo: undoSelect });
    doSelect();
  }

  handleShortcut(key: string) {
    const k = key.toLowerCase();
    const valid = ["a", "d", "c", "u", "r"].includes(k);
    if (!valid) return;

    if (k === "a") {
      this.addRandomStock();
      return;
    }
    if (k === "d") {
      this.deleteSelectedStocks();
      return;
    }
    if (k === "c") {
      this.clearSelection();
      return;
    }
    if (k === "u") {
      this.undo();
      return;
    }
    if (k === "r") {
      this.redo();
    }
  }
}

export const store = new StockStore();
