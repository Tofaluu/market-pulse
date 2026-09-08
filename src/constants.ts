// Shared constants and static instruction text used by the UI.
export const MAX_STOCKS = 50;

export const APP_TITLE = "MarketPulse";

export const WELCOME_TEXT = {
  title: "Welcome to MarketPulse",
  subtitle: "High-performance real-time market tracker & portfolio visualization dashboard.",
  supported: [
    "Live real-time price updates with visual tick animations.",
    "Interactive SVG line charts with crosshairs, tooltips, and timeframe toggles.",
    "Comprehensive undo/redo command stack with full history support.",
    "Filter and search stocks instantly from the global tech universe.",
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
