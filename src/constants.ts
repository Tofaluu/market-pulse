// Shared constants and static instruction text used by the UI.
export const MAX_STOCKS = 50;

export const APP_TITLE = "MarketPulse";

export const WELCOME_TEXT = {
  title: "Welcome to MarketPulse",
  subtitle: "Institutional-grade market tracker & equity research terminal.",
  supported: [
    "Live real-world price queries and batch portfolio synchronization via Gemini AI.",
    "Interactive SVG vector charts with crosshairs, tooltips, and multi-timeframe toggles.",
    "Comprehensive undo/redo command stack with full state persistence.",
    "Directory of 80+ Canadian TSX & US equities with universal custom ticker creation.",
  ],
  shortcuts: [
    "Shift-A - add stock to watchlist",
    "Shift-D - delete selected stocks",
    "Shift-C - clear selection",
    "Shift-U - undo last action",
    "Shift-R - redo action",
  ],
};

export const MULTI_SELECT_TEXT = {
  title: "Multiple stocks selected. Details can only be shown when a single stock is selected.",
  points: [
    "Use Shift-click to modify your selection, or",
    "Press Del to delete all selected Stocks from the list.",
  ],
};
