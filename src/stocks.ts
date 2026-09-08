export type Point = { year: number; mcap: number };

export type Stock = {
  name: string;
  symbol: string;
  date: string;
  mcap: string;
  price: number;
  change: number;
  history: Point[];
};

// sample data taken from this site:
// https://companiesmarketcap.com/cad/tech/largest-tech-companies-by-market-cap/

export const stockRecords: Stock[] = [
  {
    name: "NVIDIA",
    symbol: "NVDA",
    date: "2026-01-29T19:40:46Z",
    mcap: "6,647 B",
    price: 255.59,
    change: -0.78,
    history: [
      { year: 2020, mcap: 412.15 },
      { year: 2021, mcap: 937.06 },
      { year: 2022, mcap: 494.17 },
      { year: 2023, mcap: 1622 },
      { year: 2024, mcap: 4719 },
      { year: 2025, mcap: 6352 },
      { year: 2026, mcap: 6270 },
    ],
  },
  {
    name: "Alphabet",
    symbol: "GOOG",
    date: "2026-01-29T19:40:46Z",
    mcap: "5,477 B",
    price: 453.79,
    change: -0.07,
    history: [
      { year: 2020, mcap: 1511 },
      { year: 2021, mcap: 2443 },
      { year: 2022, mcap: 1553 },
      { year: 2023, mcap: 2330 },
      { year: 2024, mcap: 3394 },
      { year: 2025, mcap: 5206 },
      { year: 2026, mcap: 5491 },
    ],
  },
  {
    name: "Apple",
    symbol: "AAPL",
    date: "2026-01-29T19:40:46Z",
    mcap: "5,145 B",
    price: 348.21,
    change: 0.56,
    history: [
      { year: 2020, mcap: 2876 },
      { year: 2021, mcap: 3697 },
      { year: 2022, mcap: 2804 },
      { year: 2023, mcap: 3971 },
      { year: 2024, mcap: 5404 },
      { year: 2025, mcap: 5556 },
      { year: 2026, mcap: 5150 },
    ],
  },
  {
    name: "Microsoft",
    symbol: "MSFT",
    date: "2026-01-29T19:40:46Z",
    mcap: "4,250 B",
    price: 571.84,
    change: -12.07,
    history: [
      { year: 2020, mcap: 2144 },
      { year: 2021, mcap: 3214 },
      { year: 2022, mcap: 2425 },
      { year: 2023, mcap: 3706 },
      { year: 2024, mcap: 4593 },
      { year: 2025, mcap: 4964 },
      { year: 2026, mcap: 4251 },
    ],
  },
  {
    name: "Amazon",
    symbol: "AMZN",
    date: "2026-01-29T19:40:46Z",
    mcap: "3,450 B",
    price: 322.75,
    change: -1.64,
    history: [
      { year: 2020, mcap: 2083 },
      { year: 2021, mcap: 2155 },
      { year: 2022, mcap: 1162 },
      { year: 2023, mcap: 2082 },
      { year: 2024, mcap: 3376 },
      { year: 2025, mcap: 3404 },
      { year: 2026, mcap: 3456 },
    ],
  },
  {
    name: "Meta",
    symbol: "META",
    date: "2026-01-29T19:40:46Z",
    mcap: "2,501 B",
    price: 992.47,
    change: 9.91,
    history: [
      { year: 2020, mcap: 992.3 },
      { year: 2021, mcap: 1174 },
      { year: 2022, mcap: 434.07 },
      { year: 2023, mcap: 1206 },
      { year: 2024, mcap: 2172 },
      { year: 2025, mcap: 2289 },
      { year: 2026, mcap: 2507 },
    ],
  },
  {
    name: "TSMC",
    symbol: "TSM",
    date: "2026-01-31T17:40:46Z",
    mcap: "2,333 B",
    price: 449.99,
    change: -2.65,
    history: [
      { year: 2020, mcap: 622.39 },
      { year: 2021, mcap: 733.99 },
      { year: 2022, mcap: 524.2 },
      { year: 2023, mcap: 715.41 },
      { year: 2024, mcap: 1500 },
      { year: 2025, mcap: 2151 },
      { year: 2026, mcap: 2333 },
    ],
  },
  {
    name: "Tesla",
    symbol: "TSLA",
    date: "2026-01-31T17:40:46Z",
    mcap: "2,198 B",
    price: 585.92,
    change: 3.32,
    history: [
      { year: 2020, mcap: 852.9 },
      { year: 2021, mcap: 1352 },
      { year: 2022, mcap: 527.81 },
      { year: 2023, mcap: 1047 },
      { year: 2024, mcap: 1988 },
      { year: 2025, mcap: 2164 },
      { year: 2026, mcap: 2198 },
    ],
  },
  {
    name: "Broadcom",
    symbol: "AVGO",
    date: "2026-01-31T17:40:46Z",
    mcap: "2,138 B",
    price: 451.0,
    change: 0.17,
    history: [
      { year: 2020, mcap: 227.06 },
      { year: 2021, mcap: 350.12 },
      { year: 2022, mcap: 317.05 },
      { year: 2023, mcap: 611.46 },
      { year: 2024, mcap: 1626 },
      { year: 2025, mcap: 2286 },
      { year: 2026, mcap: 2138 },
    ],
  },
];