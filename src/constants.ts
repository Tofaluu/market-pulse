// Shared constants and static instruction text used by the UI.
export const MAX_STOCKS = 50;

export const APP_TITLE = "MarketPulse";

export const WELCOME_TEXT = {
  title: "Welcome to MarketPulse",
  subtitle: "Institutional-grade market tracker & equity research terminal.",
  supported: [
    "Live Market Sync - Real-time stock prices & 1-click portfolio sync grounded in Google Search via Gemini AI.",
    "AI Equity Research - In-depth institutional analysis covering company moats, weekly drivers, trajectory, and risks.",
    "Global Stock Discovery - Search any company name or ticker worldwide to automatically resolve and add to your watchlist.",
    "Interactive Financial Charts - Clean vector charts with timeframe toggles, hover crosshairs, and performance metrics.",
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
