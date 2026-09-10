// Shared constants and static instruction text used by the UI.
export const MAX_STOCKS = 50;

export const APP_TITLE = "MarketPulse";

export const WELCOME_TEXT = {
  title: "Welcome to MarketPulse",
  subtitle: "Institutional-grade market tracker & equity research terminal.",
  supported: [
    "Live Market Feeds - Real-time stock prices, automatic 20-second updates during market hours, and instant sync on add.",
    "AI Equity Research - In-depth institutional analysis powered by Gemini AI covering company moats, weekly drivers, and risks.",
    "Global Stock Discovery - Search any company name or ticker worldwide (TSX, NYSE, NASDAQ) to add to your watchlist.",
    "Interactive Financial Charts - Clean vector charts with timeframe toggles, hover crosshairs, and performance metrics.",
  ],
  shortcuts: [
    "Delete - delete selected stock(s)",
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
