import type { LiveMetrics } from "./types";
import { emptyMetrics, num } from "./metrics-util";

// Finnhub provider. Unlike FMP's free plan (which restricts its symbol universe
// to large, established names), Finnhub's free tier covers US small-caps — the
// exact names this screener exists to find. Its "basic financials" endpoint
// returns market cap, margins and revenue growth in ONE call per ticker, so a
// full universe scan is ~35 calls, well under the free 60-calls/minute limit.
//
// Free key (no credit card): https://finnhub.io/register
// Set FINNHUB_API_KEY locally (.env.local) and in Vercel env vars.

const BASE = "https://finnhub.io/api/v1";
const TIMEOUT_MS = 9000;

export function finnhubKey(): string | undefined {
  return process.env.FINNHUB_API_KEY?.trim() || undefined;
}

async function fhGet(path: string): Promise<any> {
  const key = finnhubKey();
  if (!key) throw new Error("FINNHUB_API_KEY not set");
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}token=${key}`;
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
      let body = "";
      try {
        body = (await res.text()).replace(/\s+/g, " ").slice(0, 140);
      } catch {
        /* ignore */
      }
      throw new Error(`HTTP ${res.status}${body ? ` — ${body}` : ""} for ${label}`);
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Finnhub returns margins/growth as percentages (e.g. 71.07 = 71.07%), but to
// be robust against ratio-formatted values we normalize by magnitude:
//   margins: a true fraction is ≤ ~1.0, a percent is ≫ 1.5  → divide if >1.5
//   growth:  fractions rarely exceed ~5 (500%), percents do → divide if >5
const asFracMargin = (v: number | null) =>
  v == null ? null : Math.abs(v) > 1.5 ? v / 100 : v;
const asFracGrowth = (v: number | null) =>
  v == null ? null : Math.abs(v) > 5 ? v / 100 : v;

function metricToLive(
  ticker: string,
  metric: Record<string, unknown> | null,
  price: number | null,
): LiveMetrics {
  const m = metric ?? {};
  const mcapMillions = num(m.marketCapitalization);
  return {
    ticker,
    price,
    // Finnhub reports market cap in millions of USD.
    marketCap: mcapMillions != null ? mcapMillions * 1e6 : null,
    revenueTTM: null, // not provided as an absolute by this endpoint
    revenueGrowthYoY: asFracGrowth(
      num(m.revenueGrowthTTMYoy) ?? num(m.revenueGrowthQuarterlyYoy),
    ),
    grossMargin: asFracMargin(num(m.grossMarginTTM) ?? num(m.grossMarginAnnual)),
    operatingMargin: asFracMargin(
      num(m.operatingMarginTTM) ?? num(m.operatingMarginAnnual),
    ),
    freeCashFlow: null,
    fcfMargin: null,
    debtToEquity: asFracMargin(num(m["totalDebt/totalEquityQuarterly"])),
    fetched: metric != null,
    asOf: new Date().toISOString(),
  };
}

async function fetchMetricObj(
  ticker: string,
): Promise<Record<string, unknown> | null> {
  const r = await fhGet(`/stock/metric?symbol=${encodeURIComponent(ticker)}&metric=all`);
  return (r?.metric as Record<string, unknown>) ?? null;
}

/** Single ticker, including a price quote (used by the company detail page). */
export async function fetchOneFinnhub(
  ticker: string,
): Promise<{ metrics: LiveMetrics; errors: string[] }> {
  const errors: string[] = [];
  const metric = await fetchMetricObj(ticker).catch((e) => {
    errors.push(`${ticker} metric: ${(e as Error).message}`);
    return null;
  });
  const price = await fhGet(`/quote?symbol=${encodeURIComponent(ticker)}`)
    .then((q) => num(q?.c))
    .catch(() => null);
  return { metrics: metricToLive(ticker, metric, price), errors };
}

/** Whole universe: one basic-financials call per ticker (no price, to stay frugal). */
export async function fetchManyFinnhub(
  tickers: string[],
  concurrency = 5,
): Promise<{ metrics: LiveMetrics[]; errors: string[] }> {
  const metrics = new Array<LiveMetrics>(tickers.length);
  const errors: string[] = [];
  let i = 0;
  async function worker() {
    while (i < tickers.length) {
      const idx = i++;
      const t = tickers[idx];
      try {
        const metric = await fetchMetricObj(t);
        metrics[idx] = metricToLive(t, metric, null);
      } catch (e) {
        metrics[idx] = emptyMetrics(t);
        if (errors.length < 4) errors.push(`${t}: ${(e as Error).message}`);
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tickers.length) }, worker),
  );
  return { metrics, errors };
}
