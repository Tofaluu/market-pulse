// Shared numeric formatting helpers for prices, market caps, and signed deltas.
export function formatPrice(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMarketCapFromNumber(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")} B`;
}

export function formatMarketCapFromString(value: string): string {
  const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return formatMarketCapFromNumber(numeric);
}

export function parseMarketCap(value: string): number {
  // Market cap strings are stored with currency/suffix text in the data source.
  return Number.parseFloat(value.replace(/[^0-9.]/g, ""));
}

export function formatSignedChange(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function changeArrow(value: number): string {
  return value >= 0 ? "↑" : "↓";
}
