import type { LiveMetrics } from "./types";
import { emptyMetrics, num } from "./metrics-util";

// Financial Modeling Prep provider, written against FMP's CURRENT "stable" API.
//
// FMP migrated away from the legacy `/api/v3/` endpoints; keys created after the
// migration get HTTP 403 ("Legacy Endpoint") on v3 and must use `/stable/`
// instead. The stable endpoints take the symbol as a query parameter.
//
// Free tier (no credit card): https://site.financialmodelingprep.com/developer
// Request budget ~250/day. We make two calls per ticker: a quote (price +
// market cap) and the two most recent annual income statements (growth +
// margins). Results cache for 30 minutes in screen.ts.

const BASE = "https://financialmodelingprep.com/stable";
const TIMEOUT_MS = 9000;

export function fmpKey(): string | undefined {
  return process.env.FMP_API_KEY?.trim() || undefined;
}

async function fmpGet(path: string): Promise<any> {
  const key = fmpKey();
  if (!key) throw new Error("FMP_API_KEY not set");
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}apikey=${key}`;
  const label = path.split("?")[0];

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      cache: "no-store",
      headers: { "User-Agent": "venture-investor/1.0" },
    });
    if (!res.ok) {
      // Capture a snippet of the body so diagnostics explain *why* (e.g.
      // "Legacy Endpoint", "Invalid API KEY", "Limit Reach").
      let body = "";
      try {
        body = (await res.text()).replace(/\s+/g, " ").slice(0, 140);
      } catch {
        /* ignore */
      }
      throw new Error(`HTTP ${res.status}${body ? ` — ${body}` : ""} for ${label}`);
    }
    const json = await res.json();
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

/** Quote: price + market cap for one ticker (stable API is single-symbol). */
async function fetchQuote(ticker: string): Promise<QuoteLite> {
  const rows = await fmpGet(`/quote?symbol=${encodeURIComponent(ticker)}`);
  const r = Array.isArray(rows) ? rows[0] : rows;
  return { price: num(r?.price), marketCap: num(r?.marketCap) };
}

interface IncomeLite {
  revenue: number | null;
  revenueGrowthYoY: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
}

/** Two most-recent annual income statements → growth + margins. */
async function fetchIncome(ticker: string): Promise<IncomeLite> {
  const rows = await fmpGet(
    `/income-statement?symbol=${encodeURIComponent(ticker)}&period=annual&limit=2`,
  );
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
  quote: QuoteLite | null,
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

/** Fetch one ticker (quote + income), tolerating a failure of either call. */
export async function fetchOneFmp(
  ticker: string,
): Promise<{ metrics: LiveMetrics; errors: string[] }> {
  const errors: string[] = [];
  const quote = await fetchQuote(ticker).catch((e) => {
    errors.push(`${ticker} quote: ${(e as Error).message}`);
    return null;
  });
  const income = await fetchIncome(ticker).catch((e) => {
    errors.push(`${ticker} income: ${(e as Error).message}`);
    return null;
  });
  return { metrics: combine(ticker, quote, income), errors };
}

/** Fetch the whole universe via FMP with bounded concurrency. */
export async function fetchManyFmp(
  tickers: string[],
  concurrency = 6,
): Promise<{ metrics: LiveMetrics[]; errors: string[] }> {
  const metrics = new Array<LiveMetrics>(tickers.length);
  const errors: string[] = [];
  let i = 0;
  async function worker() {
    while (i < tickers.length) {
      const idx = i++;
      const res = await fetchOneFmp(tickers[idx]);
      metrics[idx] = res.metrics;
      for (const e of res.errors) if (errors.length < 4) errors.push(e);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tickers.length) }, worker),
  );
  return { metrics, errors };
}
