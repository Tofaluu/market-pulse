// Shared constants and static instruction text used by the UI.
export const MAX_STOCKS = 9;

export const APP_TITLE = "Stocks";

export const WELCOME_TEXT = {
  title: "Welcome to Assignment 4!",
  subtitle: "This is the Preact version of the Stocks application.",
  supported: [
    "Use the Add and Del buttons to add or remove a stock.",
    "Click to select a stock in the list, or Shift-click to select multiple stocks.",
    "When viewing a single stock, use the Chart and List buttons for details.",
  ],
  shortcuts: [
    "Shift-A - add a random stock",
    "Shift-D - delete selected stocks",
    "Shift-C - clear all selections",
    "Shift-U - undo",
    "Shift-R - redo",
  ],
};

export const MULTI_SELECT_TEXT = {
  title: "Multiple stocks selected. Details can only be shown when a single stock is selected.",
  points: [
    "Use Shift-click to modify your selection, or",
    "Press Del to delete all selected Stocks from the list.",
  ],
};
