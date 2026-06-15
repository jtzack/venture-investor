import type { LiveMetrics } from "./types";
import { emptyMetrics, num } from "./metrics-util";

// Financial Modeling Prep provider. Unlike Yahoo, FMP is built for server-side
// use and works reliably from datacenter IPs (Vercel, AWS, etc.). It needs a
// free API key (no credit card): https://site.financialmodelingprep.com/developer
//
// Request budget: the free tier allows ~250 calls/day. To stay frugal we make
// ONE batched /quote call for every ticker's price + market cap, then one
// /income-statement call per ticker for revenue, growth and margins.

const BASE = "https://financialmodelingprep.com/api/v3";
const TIMEOUT_MS = 9000;

export function fmpKey(): string | undefined {
  return process.env.FMP_API_KEY?.trim() || undefined;
}

async function fmpGet(path: string): Promise<any> {
  const key = fmpKey();
  if (!key) throw new Error("FMP_API_KEY not set");
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}apikey=${key}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      cache: "no-store",
      headers: { "User-Agent": "venture-investor/1.0" },
    });
    if (!res.ok) {
      throw new Error(`FMP HTTP ${res.status} for ${path.split("?")[0]}`);
    }
    const json = await res.json();
    // FMP signals plan/limit problems with an object instead of an array.
    if (json && !Array.isArray(json) && (json["Error Message"] || json.error)) {
      throw new Error(String(json["Error Message"] || json.error));
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

interface QuoteLite {
  price: number | null;
  marketCap: number | null;
}

/** One batched call: price + market cap for every ticker. */
async function fetchQuotes(tickers: string[]): Promise<Map<string, QuoteLite>> {
  const map = new Map<string, QuoteLite>();
  const rows = await fmpGet(`/quote/${tickers.join(",")}`);
  if (Array.isArray(rows)) {
    for (const r of rows) {
      if (!r?.symbol) continue;
      map.set(String(r.symbol).toUpperCase(), {
        price: num(r.price),
        marketCap: num(r.marketCap),
      });
    }
  }
  return map;
}

interface IncomeLite {
  revenue: number | null;
  revenueGrowthYoY: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
}

/** Two most-recent annual income statements → growth + margins. */
async function fetchIncome(ticker: string): Promise<IncomeLite> {
  const rows = await fmpGet(`/income-statement/${ticker}?period=annual&limit=2`);
  const cur = Array.isArray(rows) ? rows[0] : null;
  const prev = Array.isArray(rows) ? rows[1] : null;

  const revenue = num(cur?.revenue);
  const prevRevenue = num(prev?.revenue);
  const grossProfit = num(cur?.grossProfit);
  const operatingIncome = num(cur?.operatingIncome);

  return {
    revenue,
    revenueGrowthYoY:
      revenue != null && prevRevenue && prevRevenue > 0
        ? (revenue - prevRevenue) / prevRevenue
        : null,
    grossMargin: grossProfit != null && revenue ? grossProfit / revenue : null,
    operatingMargin:
      operatingIncome != null && revenue ? operatingIncome / revenue : null,
  };
}

function combine(
  ticker: string,
  quote: QuoteLite | undefined,
  income: IncomeLite | null,
): LiveMetrics {
  return {
    ticker,
    price: quote?.price ?? null,
    marketCap: quote?.marketCap ?? null,
    revenueTTM: income?.revenue ?? null,
    revenueGrowthYoY: income?.revenueGrowthYoY ?? null,
    grossMargin: income?.grossMargin ?? null,
    operatingMargin: income?.operatingMargin ?? null,
    freeCashFlow: null, // skipped to conserve the free request budget
    fcfMargin: null,
    debtToEquity: null,
    fetched: quote != null || income != null,
    asOf: new Date().toISOString(),
  };
}

/** Fetch the whole universe via FMP. Returns metrics + any errors hit. */
export async function fetchManyFmp(
  tickers: string[],
  concurrency = 6,
): Promise<{ metrics: LiveMetrics[]; errors: string[] }> {
  const errors: string[] = [];

  let quotes = new Map<string, QuoteLite>();
  try {
    quotes = await fetchQuotes(tickers);
  } catch (e) {
    errors.push(`quotes: ${(e as Error).message}`);
  }

  const incomes = new Array<IncomeLite | null>(tickers.length).fill(null);
  let i = 0;
  async function worker() {
    while (i < tickers.length) {
      const idx = i++;
      try {
        incomes[idx] = await fetchIncome(tickers[idx]);
      } catch (e) {
        if (errors.length < 3) errors.push(`${tickers[idx]}: ${(e as Error).message}`);
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tickers.length) }, worker),
  );

  const metrics = tickers.map((t, idx) =>
    combine(t, quotes.get(t.toUpperCase()), incomes[idx]),
  );
  return { metrics, errors };
}

/** Fetch a single ticker via FMP (used by the company page). */
export async function fetchOneFmp(ticker: string): Promise<LiveMetrics> {
  try {
    const [quotes, income] = await Promise.all([
      fetchQuotes([ticker]).catch(() => new Map<string, QuoteLite>()),
      fetchIncome(ticker).catch(() => null),
    ]);
    return combine(ticker, quotes.get(ticker.toUpperCase()), income);
  } catch {
    return emptyMetrics(ticker);
  }
}
