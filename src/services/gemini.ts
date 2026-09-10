// Gemini 2.0 Flash AI Service with Google Search Grounding for live financial lookups & company research.

const API_KEY_STORAGE_KEY = "marketpulse_gemini_api_key";

export function getGeminiApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function hasGeminiApiKey(): boolean {
  return Boolean(getGeminiApiKey().trim());
}

export function setGeminiApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } catch (err) {
    console.error("Failed to save API key to localStorage", err);
  }
}

export function clearGeminiApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear API key from localStorage", err);
  }
}

export type LivePriceResult = {
  price: number;
  change?: number;
  percentChange?: number;
  currency?: string;
  sourceText: string;
  timestamp: string;
};

/**
 * Executes a raw query to Gemini Flash with optional Google Search Grounding.
 */
const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
];

export async function callGemini(
  prompt: string,
  useSearchGrounding: boolean = false
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Please add your key in AI Settings."
    );
  }

  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody: any = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };

      if (useSearchGrounding) {
        requestBody.tools = [{ google_search: {} }];
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData?.error?.message ||
          `Gemini API returned error code ${response.status}`;

        // If the model is deprecated or not available, try the next model candidate
        if (
          message.includes("no longer available") ||
          message.includes("not found") ||
          response.status === 404
        ) {
          lastError = new Error(message);
          continue;
        }

        throw new Error(message);
      }

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response returned from Gemini.";
      return text;
    } catch (err: any) {
      lastError = err;
      if (
        err.message?.includes("no longer available") ||
        err.message?.includes("not found")
      ) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}

/**
 * Returns formatted date and time in Eastern Time (ET) to anchor AI searches.
 */
function getMarketDateContext(): { dateStr: string; timeStr: string } {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
  return { dateStr, timeStr };
}

/**
 * Uses Gemini with Google Search to fetch the genuine current trading price for any ticker.
 */
export async function fetchLivePriceWithAI(
  symbol: string,
  name: string
): Promise<LivePriceResult> {
  const { dateStr, timeStr } = getMarketDateContext();
  const prompt = `You are a real-time financial market data agent.
TEMPORAL CONTEXT:
- Today's date: ${dateStr}
- Current Eastern Time: ${timeStr} ET

Perform a Google Search to determine the current, up-to-date real-world trading price for the asset/stock ticker '${symbol}' (${name}).
Look for trading prices on NYSE, NASDAQ, or TSX (Toronto Stock Exchange for Canadian assets like XEQT).

CRITICAL PRICING RULES:
1. DO NOT return the "Previous Close" (which is the closing price from the prior day).
2. If the market is open, report the live trading price.
3. If the market is closed or in after-hours, report TODAY'S official closing price (${dateStr} 4:00 PM ET close), NOT yesterday's close.
4. If today is a weekend or market holiday, report the closing price of the most recent active trading day (e.g. Friday), NOT the day before that.

Provide the output strictly in this JSON format:
{
  "price": <numeric price, e.g. 34.65 or 255.50>,
  "change": <numeric day change, e.g. +0.45 or -1.20>,
  "percentChange": <numeric percent change, e.g. 1.32 or -0.50>,
  "currency": <"USD" or "CAD">,
  "summary": <one-sentence summary of today's price and market movement>
}
Output only the JSON block without markdown backticks if possible, or inside a clean json code block.`;

  const raw = await callGemini(prompt, true);

  // Parse JSON out of response
  let jsonMatch = raw.match(/\{[\s\S]*\}/);
  let parsed: any = null;

  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // JSON parse failed, extract with regex fallback below
    }
  }

  // Extract price with regex fallback if JSON parsing wasn't clean
  let price = parsed?.price;
  if (typeof price !== "number" || isNaN(price)) {
    const priceMatch = raw.match(/\$?\s*(\d{1,6}(?:\.\d{1,2})?)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
    }
  }

  if (typeof price !== "number" || isNaN(price) || price <= 0) {
    throw new Error(
      `Could not reliably extract price from AI response: ${raw.slice(0, 150)}...`
    );
  }

  const change =
    typeof parsed?.change === "number" ? parsed.change : undefined;
  const percentChange =
    typeof parsed?.percentChange === "number" ? parsed.percentChange : undefined;
  const currency = parsed?.currency || (symbol.includes(".TO") || symbol === "XEQT" ? "CAD" : "USD");

  return {
    price: Number(price.toFixed(2)),
    change: change !== undefined ? Number(change.toFixed(2)) : undefined,
    percentChange:
      percentChange !== undefined ? Number(percentChange.toFixed(2)) : undefined,
    currency,
    sourceText: parsed?.summary || raw.trim().slice(0, 200),
    timestamp: new Date().toLocaleTimeString(),
  };
}

function sanitizeAiResponse(text: string): string {
  let cleaned = text.trim();
  // Strip common conversational chatbot prefixes:
  cleaned = cleaned.replace(
    /^(?:here\s+is|certainly|below\s+is|sure|as\s+an?\s+ai|of\s+course)[^\n]*\n+/i,
    ""
  );
  cleaned = cleaned.replace(
    /^(?:here\s+(?:is|are)|in\s+this\s+report|the\s+following\s+is)[^\n]*:\s*\n+/i,
    ""
  );
  cleaned = cleaned.replace(/^---+\s*\n+/, "");
  return cleaned.trim();
}

export type AnalysisTopic = "summary" | "trajectory" | "risks" | "past_week" | "custom";

/**
 * Conducts specialized, highly structured institutional AI research on a company or ETF.
 */
export async function analyzeCompanyWithAI(
  symbol: string,
  name: string,
  topic: AnalysisTopic,
  customQuestion?: string
): Promise<string> {
  const commonDirectives = `
IMPORTANT DIRECTIVES:
- DO NOT include conversational filler, pleasantries, or phrases like "Here is...", "Below is...", or "Certainly!".
- Jump directly into the first markdown header.
- Maintain a concise, plain-English tone. Avoid unnecessary, confusing financial jargon.
- Use bold lead-ins for every bullet point. Keep explanations focused and avoid fluffy filler.
`;

  let prompt = "";
  let useSearch = false;

  if (topic === "summary") {
    prompt = `You are a senior equity research analyst analyzing '${name}' (${symbol}).
${commonDirectives}

Provide a structured, concise executive overview using EXACTLY this markdown layout:

### **Core Business & Revenue Model**
* **Primary Activities:** [2 sentences on core operations or asset allocation if ETF]
* **Monetization & Margins:** [1-2 sentences on profit drivers, cash flow, or MER/yield if ETF]

### **Competitive Moat**
* **Defensible Advantage:** [1-2 sentences on moat: network effects, scale, switching costs, or tax efficiency]
* **Pricing Power:** [1 sentence on customer stickiness or fee durability]

### **Target Market & Client Base**
* **Core Demographics:** [1-2 sentences on core customer profile or ideal investor persona]

### **Executive Takeaway**
[1 punchy sentence synthesizing their long-term competitive durability]`;
  } else if (topic === "past_week") {
    useSearch = true;
    const { dateStr } = getMarketDateContext();
    prompt = `You are a market analyst explaining why '${name}' (${symbol}) went up or down over the past 7 days (the 7 days leading up to ${dateStr}).
${commonDirectives}
- Today's Date is: ${dateStr}.
- USE PLAIN, STRAIGHTFORWARD ENGLISH. AVOID CONFUSING WALL STREET JARGON.
- Perform a Google Search to identify real news, earnings reports, regulatory decisions, political developments, or broader sector shifts from the past 7 days leading up to ${dateStr}.

Provide a concise breakdown using EXACTLY this markdown layout:

### **Past Week Price Movement**
* **Direction & Sentiment:** [1 sentence explaining whether the stock rose, dropped, or remained flat over the past week, and the main market sentiment]

### **Why It Moved (Past Week Drivers)**
* **[Primary Company Driver]:** [1-2 simple, plain-English sentences on recent company news, earnings, product announcements, or leadership updates]
* **[Macro, Political, or Sector Driver]:** [1-2 simple, plain-English sentences on political headlines, interest rate moves, or industry trends that affected it]

### **Bottom Line**
[1 punchy sentence stating whether this past week's price movement is short-term market noise or a meaningful fundamental shift]`;
  } else if (topic === "trajectory") {
    prompt = `You are a strategic financial analyst conducting a 2–5 year trajectory analysis for '${name}' (${symbol}).
${commonDirectives}

Provide a structured, forward-looking roadmap using EXACTLY this markdown layout:

### **Key Growth Catalysts & Tailwinds (2–5 Years)**
* **[Catalyst 1 Name]:** [1-2 sentences on specific growth driver e.g. AI infrastructure, rate cycle, or secular inflows]
* **[Catalyst 2 Name]:** [1-2 sentences on operational or industry tailwind]
* **[Catalyst 3 Name]:** [1-2 sentences on valuation re-rating or market expansion]

### **Bull vs. Bear Scenarios**
* **Bull Case (Upside):** [2 sentences on realistic upside thesis and target return/valuation]
* **Bear Case (Downside):** [2 sentences on primary risk trigger and potential drawdown]

### **Strategic Consensus Outlook**
* **Consensus Stance:** **[ACCUMULATE / HOLD / BUY ON PULLBACKS / SPECULATIVE]**
* **Rationale:** [2 sentences on optimal investor time horizon and execution approach]`;
  } else if (topic === "risks") {
    prompt = `You are a chief risk officer auditing '${name}' (${symbol}).
${commonDirectives}

Provide a structured, objective risk audit using EXACTLY this markdown layout:

### **Critical Risk Factors & Headwinds**
* **Macro & Interest Rate Sensitivity:** [1-2 sentences on inflation, discount rate impact, or economic cycle]
* **Industry & Valuation Pressure:** [1-2 sentences on multiple contraction, tech concentration, or competition]
* **Operational & Regulatory Exposure:** [1-2 sentences on legal, geopolitical, or operational friction]
* **Currency & Liquidity:** [1 sentence on FX drag, liquidity, or volatility profile]

### **Vulnerability Assessment**
* **Risk Profile:** **[LOW / MODERATE / HIGH]**
* **Key Vulnerability:** [1-2 sentences identifying the single catalyst that could most impair the thesis]`;
  } else {
    prompt = `You are an institutional financial analyst analyzing '${name}' (${symbol}).
${commonDirectives}

User Question: "${customQuestion}"

Provide a structured, objective response using EXACTLY this markdown layout:

### **Direct Answer**
[1-2 clear, direct sentences directly addressing the user's specific query]

### **Key Financial Factors**
* **[Factor 1]:** [1-2 sentences of contextual evidence or financial rationale]
* **[Factor 2]:** [1-2 sentences of contextual evidence or financial rationale]
* **[Factor 3]:** [1-2 sentences of contextual evidence or financial rationale]

### **Investor Bottom Line**
[1 concise takeaway sentence summarizing the practical implication for an investor]`;
  }

  const raw = await callGemini(prompt, useSearch);
  return sanitizeAiResponse(raw);
}

export type BatchPriceResult = Record<
  string,
  { price: number; change?: number; percentChange?: number; currency?: string }
>;

/**
 * Uses Gemini with Google Search to fetch real-world quotes for all active stocks in one query.
 */
export async function batchFetchLivePricesWithAI(
  stocks: { symbol: string; name: string }[]
): Promise<BatchPriceResult> {
  if (stocks.length === 0) return {};

  const { dateStr, timeStr } = getMarketDateContext();
  const stockListStr = stocks.map((s) => `${s.symbol} (${s.name})`).join(", ");
  const prompt = `You are a financial market data agent.
TEMPORAL CONTEXT:
- Today's date: ${dateStr}
- Current Eastern Time: ${timeStr} ET

Perform a Google Search to find current, up-to-date real-world trading prices on NYSE, NASDAQ, or TSX (Toronto Stock Exchange for Canadian assets like XEQT, SHOP, RY) for these assets:
${stockListStr}

CRITICAL PRICING RULES:
1. DO NOT report the "Previous Close" (which is yesterday's / the prior day's close).
2. If the market is closed or in after-hours, report the official closing price from TODAY'S (${dateStr}) trading session, NOT yesterday's close.
3. If today is a weekend or market holiday, report the closing price of the most recent active trading day (e.g. Friday), NOT the day before that.
4. For Canadian assets (e.g. XEQT, SHOP.TO, RY.TO), fetch the price in CAD from TSX unless specified otherwise.

Provide output strictly in this JSON format without markdown wrapping:
{
  "SYMBOL": {
    "price": <numeric price>,
    "change": <numeric day change>,
    "percentChange": <numeric percent change>,
    "currency": <"USD" or "CAD">
  }
}`;

  const raw = await callGemini(prompt, true);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const results: BatchPriceResult = {};
    for (const [key, val] of Object.entries(parsed)) {
      const item = val as any;
      if (item && typeof item.price === "number") {
        results[key.toUpperCase()] = {
          price: Number(item.price.toFixed(2)),
          change: typeof item.change === "number" ? Number(item.change.toFixed(2)) : undefined,
          percentChange: typeof item.percentChange === "number" ? Number(item.percentChange.toFixed(2)) : undefined,
          currency: item.currency || "USD",
        };
      }
    }
    return results;
  } catch {
    return {};
  }
}
