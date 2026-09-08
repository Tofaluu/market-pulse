// Extensive global ticker directory & universal dynamic stock generator.
import type { Stock, Point, IntradayPoint } from "./stocks";

export type TickerInfo = {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
  baseMcap: number; // in Billions
  peRatio: number;
};

export const GLOBAL_TICKER_DIRECTORY: TickerInfo[] = [
  // Mega-Cap Tech & AI
  { symbol: "NVDA", name: "NVIDIA", sector: "Semiconductors & AI Hardware", basePrice: 118.50, baseMcap: 2920, peRatio: 42.4 },
  { symbol: "GOOGL", name: "Alphabet (Google)", sector: "Internet Services & AI", basePrice: 172.80, baseMcap: 2150, peRatio: 24.2 },
  { symbol: "AAPL", name: "Apple", sector: "Consumer Electronics", basePrice: 228.40, baseMcap: 3480, peRatio: 34.2 },
  { symbol: "MSFT", name: "Microsoft", sector: "Cloud & Enterprise Software", basePrice: 422.50, baseMcap: 3140, peRatio: 35.1 },
  { symbol: "AMZN", name: "Amazon", sector: "E-Commerce & Cloud", basePrice: 188.20, baseMcap: 1980, peRatio: 43.1 },
  { symbol: "META", name: "Meta Platforms", sector: "Social Media & AI", basePrice: 515.60, baseMcap: 1310, peRatio: 26.5 },
  { symbol: "TSM", name: "TSMC", sector: "Semiconductor Foundry", basePrice: 176.50, baseMcap: 915, peRatio: 28.0 },
  { symbol: "TSLA", name: "Tesla", sector: "Electric Vehicles & Clean Energy", basePrice: 218.40, baseMcap: 695, peRatio: 64.8 },
  { symbol: "AVGO", name: "Broadcom", sector: "Networking & Silicon", basePrice: 164.80, baseMcap: 770, peRatio: 36.2 },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Semiconductors", basePrice: 218.45, baseMcap: 520, peRatio: 48.6 },
  { symbol: "NFLX", name: "Netflix", sector: "Digital Streaming & Media", basePrice: 998.15, baseMcap: 435, peRatio: 39.8 },
  { symbol: "PLTR", name: "Palantir Technologies", sector: "Enterprise AI & Big Data", basePrice: 124.60, baseMcap: 285, peRatio: 92.5 },
  { symbol: "QCOM", name: "Qualcomm", sector: "Wireless Chips & Edge AI", basePrice: 204.30, baseMcap: 230, peRatio: 21.4 },
  { symbol: "CRM", name: "Salesforce", sector: "Enterprise Cloud CRM", basePrice: 325.80, baseMcap: 310, peRatio: 45.3 },
  { symbol: "ASML", name: "ASML Holding", sector: "Semiconductor Lithography", basePrice: 985.40, baseMcap: 390, peRatio: 42.0 },
  { symbol: "ORCL", name: "Oracle", sector: "Database & Cloud Infrastructure", basePrice: 168.90, baseMcap: 460, peRatio: 38.7 },
  { symbol: "INTC", name: "Intel Corporation", sector: "Semiconductors & Foundry", basePrice: 48.25, baseMcap: 205, peRatio: 28.5 },
  { symbol: "IBM", name: "IBM", sector: "Enterprise Tech & Hybrid Cloud", basePrice: 234.50, baseMcap: 215, peRatio: 22.1 },
  { symbol: "CSCO", name: "Cisco Systems", sector: "Networking Hardware", basePrice: 62.80, baseMcap: 250, peRatio: 18.9 },
  { symbol: "ADBE", name: "Adobe", sector: "Creative Software & Generative AI", basePrice: 512.40, baseMcap: 230, peRatio: 34.2 },
  { symbol: "NOW", name: "ServiceNow", sector: "Workflow Automation", basePrice: 890.30, baseMcap: 180, peRatio: 52.0 },
  { symbol: "UBER", name: "Uber Technologies", sector: "Mobility & Delivery Tech", basePrice: 86.40, baseMcap: 178, peRatio: 37.5 },
  { symbol: "ABNB", name: "Airbnb", sector: "Travel & Hospitality Tech", basePrice: 142.10, baseMcap: 92, peRatio: 24.8 },
  { symbol: "SHOP", name: "Shopify", sector: "E-Commerce Infrastructure", basePrice: 112.50, baseMcap: 145, peRatio: 72.0 },
  { symbol: "SPOT", name: "Spotify", sector: "Audio Streaming & Podcasts", basePrice: 470.20, baseMcap: 94, peRatio: 44.0 },
  { symbol: "SNOW", name: "Snowflake", sector: "Data Cloud & Analytics", basePrice: 165.80, baseMcap: 55, peRatio: 65.0 },
  { symbol: "PANW", name: "Palo Alto Networks", sector: "Cybersecurity", basePrice: 385.00, baseMcap: 125, peRatio: 55.4 },
  { symbol: "CRWD", name: "CrowdStrike", sector: "Cybersecurity & Endpoint Protection", basePrice: 340.20, baseMcap: 83, peRatio: 68.0 },
  { symbol: "MSTR", name: "MicroStrategy", sector: "Bitcoin Treasury & Software", basePrice: 380.50, baseMcap: 95, peRatio: 45.0 },

  // Financial Services & Fintech
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Diversified Banking", basePrice: 242.80, baseMcap: 680, peRatio: 12.8 },
  { symbol: "BAC", name: "Bank of America", sector: "Banking & Financials", basePrice: 46.10, baseMcap: 360, peRatio: 13.5 },
  { symbol: "V", name: "Visa", sector: "Payments & Transaction Tech", basePrice: 315.60, baseMcap: 640, peRatio: 30.2 },
  { symbol: "MA", name: "Mastercard", sector: "Payments & Transaction Tech", basePrice: 520.40, baseMcap: 480, peRatio: 33.1 },
  { symbol: "GS", name: "Goldman Sachs", sector: "Investment Banking", basePrice: 560.20, baseMcap: 180, peRatio: 15.2 },
  { symbol: "MS", name: "Morgan Stanley", sector: "Wealth Management & Banking", basePrice: 128.50, baseMcap: 205, peRatio: 16.8 },
  { symbol: "BLK", name: "BlackRock", sector: "Asset Management", basePrice: 1045.00, baseMcap: 158, peRatio: 24.5 },
  { symbol: "COIN", name: "Coinbase Global", sector: "Crypto Exchange & Custody", basePrice: 285.40, baseMcap: 72, peRatio: 38.0 },
  { symbol: "PYPL", name: "PayPal Holdings", sector: "Digital Payments", basePrice: 88.20, baseMcap: 90, peRatio: 19.5 },
  { symbol: "HOOD", name: "Robinhood Markets", sector: "Retail Brokerage & Fintech", basePrice: 36.80, baseMcap: 32, peRatio: 27.4 },

  // Consumer, Retail & Media
  { symbol: "WMT", name: "Walmart", sector: "Retail & E-Commerce", basePrice: 94.20, baseMcap: 750, peRatio: 32.0 },
  { symbol: "COST", name: "Costco Wholesale", sector: "Membership Warehouse Retail", basePrice: 980.50, baseMcap: 435, peRatio: 52.4 },
  { symbol: "HD", name: "Home Depot", sector: "Home Improvement Retail", basePrice: 410.20, baseMcap: 405, peRatio: 26.5 },
  { symbol: "DIS", name: "Walt Disney Company", sector: "Entertainment & Theme Parks", basePrice: 114.80, baseMcap: 210, peRatio: 21.0 },
  { symbol: "NKE", name: "Nike", sector: "Footwear & Athletic Apparel", basePrice: 82.50, baseMcap: 124, peRatio: 25.8 },
  { symbol: "SBUX", name: "Starbucks", sector: "Coffee & Quick Service Restaurants", basePrice: 98.40, baseMcap: 112, peRatio: 28.2 },
  { symbol: "MCD", name: "McDonald's", sector: "Fast Food Franchise", basePrice: 298.60, baseMcap: 215, peRatio: 24.5 },
  { symbol: "KO", name: "Coca-Cola", sector: "Beverages", basePrice: 66.80, baseMcap: 288, peRatio: 24.0 },
  { symbol: "PEP", name: "PepsiCo", sector: "Snacks & Beverages", basePrice: 164.20, baseMcap: 225, peRatio: 22.8 },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Staples", basePrice: 172.50, baseMcap: 405, peRatio: 26.1 },
  { symbol: "LULU", name: "Lululemon Athletica", sector: "Apparel & Activewear", basePrice: 345.80, baseMcap: 42, peRatio: 23.4 },

  // Healthcare & Biotechnology
  { symbol: "LLY", name: "Eli Lilly", sector: "Pharmaceuticals & Weight Loss", basePrice: 890.20, baseMcap: 840, peRatio: 58.0 },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare & Medical Devices", basePrice: 156.40, baseMcap: 375, peRatio: 16.5 },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Managed Healthcare & Insurance", basePrice: 585.00, baseMcap: 535, peRatio: 22.4 },
  { symbol: "ABBV", name: "AbbVie", sector: "Immunology & Oncology Pharma", basePrice: 195.60, baseMcap: 345, peRatio: 17.8 },
  { symbol: "PFE", name: "Pfizer", sector: "Biopharmaceuticals", basePrice: 28.40, baseMcap: 160, peRatio: 14.2 },

  // Energy & Aerospace
  { symbol: "XOM", name: "ExxonMobil", sector: "Oil, Gas & Energy", basePrice: 122.50, baseMcap: 485, peRatio: 14.1 },
  { symbol: "CVX", name: "Chevron", sector: "Integrated Energy", basePrice: 158.40, baseMcap: 290, peRatio: 13.8 },
  { symbol: "BA", name: "Boeing", sector: "Aerospace & Defense Commercial", basePrice: 178.60, baseMcap: 110, peRatio: 35.0 },
  { symbol: "CAT", name: "Caterpillar", sector: "Heavy Industrial Machinery", basePrice: 415.80, baseMcap: 200, peRatio: 18.5 },
  { symbol: "GE", name: "GE Aerospace", sector: "Jet Engines & Avionics", basePrice: 192.40, baseMcap: 208, peRatio: 32.0 },
  { symbol: "LMT", name: "Lockheed Martin", sector: "Defense & Aerospace", basePrice: 540.20, baseMcap: 130, peRatio: 19.4 },

  // Index ETFs & Broad Market
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "US Broad Market Index", basePrice: 598.40, baseMcap: 560, peRatio: 25.4 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "Nasdaq 100 Tech Index", basePrice: 518.20, baseMcap: 290, peRatio: 31.2 },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial", sector: "Dow 30 Mega Cap Index", basePrice: 442.80, baseMcap: 35, peRatio: 21.0 },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", sector: "S&P 500 Core Index", basePrice: 548.60, baseMcap: 490, peRatio: 25.4 },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", sector: "US Small-Cap Index", basePrice: 232.40, baseMcap: 75, peRatio: 18.2 },
  { symbol: "SMH", name: "VanEck Semiconductor ETF", sector: "Global Semiconductor Index", basePrice: 268.50, baseMcap: 24, peRatio: 38.0 },
  { symbol: "ARKK", name: "ARK Innovation ETF", sector: "Disruptive Innovation Tech", basePrice: 54.20, baseMcap: 8, peRatio: 42.0 },

  // 🇨🇦 Canadian Equities & TSX Favorites
  { symbol: "XEQT", name: "iShares Core Equity ETF Portfolio (TSX)", sector: "Canadian All-Equity Asset Allocation ETF", basePrice: 34.65, baseMcap: 5.8, peRatio: 17.5 },
  { symbol: "VEQT", name: "Vanguard All-Equity ETF Portfolio (TSX)", sector: "Canadian All-Equity Asset Allocation ETF", basePrice: 42.15, baseMcap: 4.6, peRatio: 17.2 },
  { symbol: "VFV", name: "Vanguard S&P 500 Index ETF (TSX)", sector: "Canadian S&P 500 Index ETF (CAD)", basePrice: 145.20, baseMcap: 16.5, peRatio: 25.4 },
  { symbol: "XEQT.TO", name: "iShares Core Equity ETF Portfolio", sector: "Canadian All-Equity ETF (TSX)", basePrice: 34.65, baseMcap: 5.8, peRatio: 17.5 },
  { symbol: "VEQT.TO", name: "Vanguard All-Equity ETF Portfolio", sector: "Canadian All-Equity ETF (TSX)", basePrice: 42.15, baseMcap: 4.6, peRatio: 17.2 },
  { symbol: "RY", name: "Royal Bank of Canada (TSX/NYSE)", sector: "Canadian Diversified Banking", basePrice: 178.50, baseMcap: 252, peRatio: 13.2 },
  { symbol: "TD", name: "Toronto-Dominion Bank (TSX/NYSE)", sector: "Canadian & US Retail Banking", basePrice: 84.20, baseMcap: 148, peRatio: 11.5 },
  { symbol: "BNS", name: "Bank of Nova Scotia (TSX/NYSE)", sector: "Canadian Banking & Wealth", basePrice: 72.80, baseMcap: 88, peRatio: 11.0 },
  { symbol: "BMO", name: "Bank of Montreal (TSX/NYSE)", sector: "Canadian Commercial Banking", basePrice: 134.20, baseMcap: 98, peRatio: 12.8 },
  { symbol: "ENB", name: "Enbridge (TSX/NYSE)", sector: "Canadian Energy Pipelines", basePrice: 56.40, baseMcap: 120, peRatio: 18.2 },
  { symbol: "CNR", name: "Canadian National Railway (TSX/NYSE)", sector: "Freight & Transcontinental Rail", basePrice: 158.90, baseMcap: 98, peRatio: 20.4 },
  { symbol: "CP", name: "Canadian Pacific Kansas City (TSX/NYSE)", sector: "Transcontinental Freight Rail", basePrice: 110.20, baseMcap: 102, peRatio: 23.0 },
  { symbol: "CSU", name: "Constellation Software (TSX)", sector: "Canadian Vertical Market Software", basePrice: 4350.00, baseMcap: 92, peRatio: 38.0 },
  { symbol: "ATD", name: "Alimentation Couche-Tard (TSX)", sector: "Global Convenience & Fuel Retail", basePrice: 78.50, baseMcap: 74, peRatio: 17.5 },
  { symbol: "BAM", name: "Brookfield Asset Management (TSX/NYSE)", sector: "Global Alternative Asset Management", basePrice: 72.30, baseMcap: 118, peRatio: 26.0 },

  // Popular Growth & Community Stocks
  { symbol: "GME", name: "GameStop", sector: "Gaming Retail & Specialty", basePrice: 26.50, baseMcap: 11, peRatio: 65.0 },
  { symbol: "RBLX", name: "Roblox", sector: "Immersive Gaming & Metaverse", basePrice: 52.80, baseMcap: 34, peRatio: 55.0 },
  { symbol: "SOFI", name: "SoFi Technologies", sector: "Digital Banking & Lending", basePrice: 15.40, baseMcap: 16, peRatio: 32.0 },
  { symbol: "RIVN", name: "Rivian Automotive", sector: "Electric Trucks & Vans", basePrice: 12.80, baseMcap: 13, peRatio: 18.0 },
  { symbol: "BABA", name: "Alibaba Group", sector: "E-Commerce & Cloud (Asia)", basePrice: 96.40, baseMcap: 230, peRatio: 12.5 },
];

// Generates smooth intraday price curve ending at current price
function generateIntraday(currentPrice: number, change: number): IntradayPoint[] {
  const openPrice = Math.max(1, currentPrice - change);
  const times = [
    "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00",
    "14:30", "15:00", "15:30", "16:00"
  ];
  
  const points: IntradayPoint[] = [];
  const range = currentPrice - openPrice;

  times.forEach((time, index) => {
    if (index === 0) {
      points.push({ time, price: Number(openPrice.toFixed(2)) });
    } else if (index === times.length - 1) {
      points.push({ time, price: Number(currentPrice.toFixed(2)) });
    } else {
      const progress = index / (times.length - 1);
      const noise = (Math.sin(index * 1.5) * 0.4 + (index % 2 === 0 ? 0.3 : -0.2)) * (currentPrice * 0.008);
      const intermediate = openPrice + range * progress + noise;
      points.push({ time, price: Number(Math.max(1, intermediate).toFixed(2)) });
    }
  });

  return points;
}

// Generate realistic yearly market cap progression based on base price and mcap
function generateHistory(baseMcap: number, basePrice: number): Point[] {
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const multipliers = [0.35, 0.55, 0.38, 0.58, 0.78, 0.94, 1.0];

  return years.map((year, idx) => {
    const mult = multipliers[idx];
    const mcap = Math.max(1, Math.round(baseMcap * mult * 10) / 10);
    const price = Math.max(0.5, Math.round(basePrice * mult * 100) / 100);
    return { year, mcap, price };
  });
}

/**
 * Universally create a stock from ANY ticker symbol.
 * If in database: uses verified company name, sector, and realistic pricing.
 * If custom/arbitrary: generates a realistic financial profile procedurally.
 */
export function createStockFromTicker(
  rawSymbol: string,
  customName?: string,
  customPrice?: number,
  customSector?: string
): Stock {
  const cleanSymbol = rawSymbol.trim().toUpperCase();
  const known = GLOBAL_TICKER_DIRECTORY.find((t) => t.symbol === cleanSymbol);

  const price = customPrice ?? known?.basePrice ?? Math.floor(Math.random() * 200 + 45) + 0.5;
  const name = customName || known?.name || `${cleanSymbol} Inc.`;
  const sector = customSector || known?.sector || "Global Equities & Assets";
  const peRatio = known?.peRatio ?? Math.floor(Math.random() * 35 + 15);
  const mcapNum = known?.baseMcap ?? Math.round(price * 4.2);
  const mcapStr = mcapNum >= 1000 ? `${(mcapNum / 1000).toFixed(1)} T` : `${mcapNum} B`;

  // Random realistic day change between -2.5% and +3.2%
  const pctChange = Number(((Math.random() - 0.47) * 3.5).toFixed(2));
  const change = Number(((price * pctChange) / 100).toFixed(2));
  const open = Number((price - change).toFixed(2));
  const dayHigh = Number(Math.max(price, open + Math.random() * (price * 0.015)).toFixed(2));
  const dayLow = Number(Math.min(price, open - Math.random() * (price * 0.015)).toFixed(2));
  const volume = Math.floor(Math.random() * 35_000_000 + 5_000_000);

  return {
    symbol: cleanSymbol,
    name,
    sector,
    date: new Date().toISOString(),
    mcap: mcapStr,
    price,
    change,
    percentChange: pctChange,
    open,
    dayHigh,
    dayLow,
    volume,
    peRatio,
    history: generateHistory(mcapNum, price),
    intraday: generateIntraday(price, change),
  };
}
