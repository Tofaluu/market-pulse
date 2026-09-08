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
 * Uses Gemini with Google Search to fetch the genuine current trading price for any ticker.
 */
export async function fetchLivePriceWithAI(
  symbol: string,
  name: string
): Promise<LivePriceResult> {
  const prompt = `You are a real-time financial market data agent. Perform a Google Search to determine the current, up-to-date real-world trading price for the asset/stock ticker '${symbol}' (${name}).
Look for current trading prices on NYSE, NASDAQ, or TSX (Toronto Stock Exchange for Canadian assets like XEQT).

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

export type AnalysisTopic = "summary" | "trajectory" | "risks" | "custom";

/**
 * Conducts specialized AI research on a company or ETF.
 */
export async function analyzeCompanyWithAI(
  symbol: string,
  name: string,
  topic: AnalysisTopic,
  customQuestion?: string
): Promise<string> {
  let prompt = "";

  if (topic === "summary") {
    prompt = `You are a Wall Street senior equity research analyst. Write a concise, insightful executive overview of '${name}' (${symbol}).
Include:
1. Core Business / Fund Model: What they do and how they generate profit or asset allocation (if ETF like XEQT).
2. Competitive Moat: What gives them a defensible market advantage.
3. Target Market & Core Customers.
Keep the formatting clean with markdown bullet points and bold key terms. Be punchy and professional.`;
  } else if (topic === "trajectory") {
    prompt = `You are a strategic financial analyst. Perform a forward-looking trajectory and catalyst analysis for '${name}' (${symbol}).
Include:
1. Key Growth Drivers & Catalysts: What tailwinds (AI, interest rate cycles, market expansion, product roadmap) could drive revenue and valuation over the next 2-5 years.
2. Bull Case Scenario: Potential upside if execution is flawless.
3. Bear Case Scenario: Potential downside if key risks materialize.
4. Strategic Outlook: Overall consensus.
Format in clear markdown sections with bullets.`;
  } else if (topic === "risks") {
    prompt = `You are a risk management analyst. Identify the top 3-4 critical risks, headwinds, and threats facing '${name}' (${symbol}).
Include macroeconomic risks (interest rates, inflation), competitive threats, regulatory/legal exposure, and operational challenges.
Be realistic, objective, and specific to their industry. Format in markdown bullets.`;
  } else {
    prompt = `You are a financial research assistant analyzing '${name}' (${symbol}). Answer the following user question thoroughly and objectively with financial context:
"${customQuestion}"
Format your response in structured markdown with headings or bullet points where appropriate.`;
  }

  return await callGemini(prompt, false);
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

  const stockListStr = stocks.map((s) => `${s.symbol} (${s.name})`).join(", ");
  const prompt = `You are a financial market data agent. Perform a Google Search to find current, up-to-date real-world trading prices on NYSE, NASDAQ, or TSX (Toronto Stock Exchange for Canadian assets like XEQT, SHOP, RY) for these assets:
${stockListStr}

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
