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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fhGet(path: string, retryOn429 = true): Promise<any> {
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
    // Free tier is 60 calls/min; a near-full scan can briefly trip 429.
    // Back off once and retry before giving up on this ticker.
    if (res.status === 429 && retryOn429) {
      await sleep(1500);
      return fhGet(path, false);
    }
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

interface Basics {
  metric: Record<string, unknown>;
  series: Record<string, any>;
}

/** Pull the most recent value of an annual `series` entry (e.g. fcfMargin). */
function latestSeries(series: Record<string, any>, key: string): number | null {
  const arr = series?.annual?.[key];
  if (!Array.isArray(arr) || arr.length === 0) return null;
  // Series entries look like { period: "2023-12-31", v: 0.31 }.
  let best: { period: string; v: number } | null = null;
  for (const e of arr) {
    if (typeof e?.v !== "number") continue;
    if (!best || String(e.period) > String(best.period)) best = e;
  }
  return best ? best.v : null;
}

function buildMetrics(
  ticker: string,
  basics: Basics | null,
  price: number | null,
  shares: number | null,
): LiveMetrics {
  const m = basics?.metric ?? {};
  const series = basics?.series ?? {};

  const mcapMillions = num(m.marketCapitalization);
  const revenuePerShare = num(m.revenuePerShareTTM);
  // Absolute revenue needs shares outstanding (only fetched on the detail page).
  const revenueTTM =
    revenuePerShare != null && shares ? revenuePerShare * shares : null;

  // FCF margin comes straight from Finnhub's annual series when present — more
  // accurate than the operating-margin proxy the score otherwise falls back to.
  const fcfMargin = asFracMargin(latestSeries(series, "fcfMargin"));
  const freeCashFlow =
    fcfMargin != null && revenueTTM != null ? fcfMargin * revenueTTM : null;

  return {
    ticker,
    price,
    marketCap: mcapMillions != null ? mcapMillions * 1e6 : null,
    revenueTTM,
    revenueGrowthYoY: asFracGrowth(
      num(m.revenueGrowthTTMYoy) ?? num(m.revenueGrowthQuarterlyYoy),
    ),
    grossMargin: asFracMargin(num(m.grossMarginTTM) ?? num(m.grossMarginAnnual)),
    operatingMargin: asFracMargin(
      num(m.operatingMarginTTM) ?? num(m.operatingMarginAnnual),
    ),
    freeCashFlow,
    fcfMargin,
    debtToEquity: asFracMargin(num(m["totalDebt/totalEquityQuarterly"])),
    fetched: basics != null,
    asOf: new Date().toISOString(),
  };
}

async function fetchBasics(ticker: string): Promise<Basics | null> {
  const r = await fhGet(`/stock/metric?symbol=${encodeURIComponent(ticker)}&metric=all`);
  if (!r || typeof r !== "object" || !r.metric) return null;
  return { metric: r.metric as Record<string, unknown>, series: r.series ?? {} };
}

/** Shares outstanding (absolute) from the company profile, for revenue/FCF $. */
async function fetchShares(ticker: string): Promise<number | null> {
  const p = await fhGet(`/stock/profile2?symbol=${encodeURIComponent(ticker)}`);
  const millions = num(p?.shareOutstanding); // Finnhub reports in millions
  return millions != null ? millions * 1e6 : null;
}

/**
 * Single ticker for the detail page: basics + a price quote + shares
 * outstanding (so we can show absolute Revenue and Free Cash Flow).
 */
export async function fetchOneFinnhub(
  ticker: string,
): Promise<{ metrics: LiveMetrics; errors: string[] }> {
  const errors: string[] = [];
  const basics = await fetchBasics(ticker).catch((e) => {
    errors.push(`${ticker} metric: ${(e as Error).message}`);
    return null;
  });
  const [price, shares] = await Promise.all([
    fhGet(`/quote?symbol=${encodeURIComponent(ticker)}`)
      .then((q) => num(q?.c))
      .catch(() => null),
    fetchShares(ticker).catch(() => null),
  ]);
  return { metrics: buildMetrics(ticker, basics, price, shares), errors };
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
        const basics = await fetchBasics(t);
        metrics[idx] = buildMetrics(t, basics, null, null);
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
