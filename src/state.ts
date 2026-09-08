// Centralized application state and undoable actions.
import { computed, signal } from "@preact/signals";
import { MAX_STOCKS } from "./constants";
import type { Stock } from "./stocks";
import { stockRecords } from "./stocks";
import { UndoManager, type Command } from "./undo";

export type ViewMode = "chart" | "list";

class StockStore {
  stocks = signal<Stock[]>([]);
  selectedSymbols = signal<Set<string>>(new Set());
  viewMode = signal<ViewMode>("chart");

  private undoManager = new UndoManager();
  private historyVersion = signal(0);

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

  isSelected(symbol: string) {
    return this.selectedSymbols.value.has(symbol);
  }

  setViewMode(mode: ViewMode) {
    if (!this.hasSingleSelection.value) return;
    this.viewMode.value = mode;
  }

  private normalizeSelection() {
    // Drop any selected symbols that no longer exist in the current stock list.
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

  private availableStocks() {
    // Add only from stocks that are not already present.
    const current = new Set(this.stocks.value.map((stock) => stock.symbol));
    return stockRecords.filter((stock) => !current.has(stock.symbol));
  }

  addRandomStock() {
    if (!this.canAdd.value) return;

    const available = this.availableStocks();
    if (available.length === 0) return;

    const pick = available[Math.floor(Math.random() * available.length)];
    const insertIndex = this.stocks.value.length;

    const doAdd = () => {
      const next = this.stocks.value.slice();
      next.splice(insertIndex, 0, pick);
      this.stocks.value = next;
    };

    const undoAdd = () => {
      const next = this.stocks.value.slice();
      next.splice(insertIndex, 1);
      this.stocks.value = next;
      this.normalizeSelection();
    };

    this.pushHistory({ do: doAdd, undo: undoAdd });
    doAdd();
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

    // Used to reselect the item before the first removed row (if one exists).
    const topMostDeleted = selectedIndexes[0];

    const doDelete = () => {
      const next = this.stocks.value.filter(
        (stock) => !symbolsToDelete.has(stock.symbol)
      );
      this.stocks.value = next;

      if (next.length === 0) {
        this.selectedSymbols.value = new Set();
        return;
      }

      const nextIndex = Math.max(0, Math.min(topMostDeleted - 1, next.length - 1));
      this.selectedSymbols.value = new Set([next[nextIndex].symbol]);
      this.viewMode.value = "chart";
    };

    const undoDelete = () => {
      this.stocks.value = previousStocks.slice();
      this.selectedSymbols.value = new Set(previousSelection);
      if (previousSelection.size === 1) {
        this.viewMode.value = "chart";
      }
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
      // Shift-click toggles one item without clearing the rest of the selection.
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
