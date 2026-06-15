import yahooFinance from "yahoo-finance2";
import type { LiveMetrics } from "./types";
import { emptyMetrics, num } from "./metrics-util";
import { fetchManyFmp, fetchOneFmp, fmpKey } from "./provider-fmp";

// Quiet the library's first-run notices so server logs stay clean.
// `suppressNotices` isn't in every version's types, so guard it loosely.
try {
  (yahooFinance as any).suppressNotices?.(["yahooSurvey"]);
} catch {
  /* older/newer versions may not expose this; ignore */
}

const MODULES = ["price", "summaryDetail", "financialData"] as const;

export type ProviderName = "fmp" | "yahoo";

/**
 * Choose the data source. Prefer FMP when an API key is configured because it
 * works from datacenter IPs (Vercel). Yahoo is the keyless local-dev fallback,
 * but it is frequently blocked when called from serverless hosts.
 */
export function activeProvider(): ProviderName {
  return fmpKey() ? "fmp" : "yahoo";
}

// Lightweight diagnostics from the most recent universe fetch, surfaced to the
// UI so a blank screen is explainable instead of mysterious.
export interface Diagnostics {
  provider: ProviderName;
  attempted: number;
  succeeded: number;
  errors: string[];
  at: string;
}

let lastDiagnostics: Diagnostics | null = null;
export function getDiagnostics(): Diagnostics | null {
  return lastDiagnostics;
}

// ───────────────────────── Yahoo backend ─────────────────────────

async function fetchMetricsYahoo(ticker: string): Promise<LiveMetrics> {
  try {
    const r = await yahooFinance.quoteSummary(
      ticker,
      { modules: [...MODULES] } as any,
      { validateResult: false },
    );

    const fin = r.financialData ?? {};
    const sum = r.summaryDetail ?? {};
    const price = r.price ?? {};

    const revenue = num((fin as any).totalRevenue);
    const fcf = num((fin as any).freeCashflow);
    const d2eRaw = num((fin as any).debtToEquity);

    return {
      ticker,
      price: num((price as any).regularMarketPrice) ?? num((fin as any).currentPrice),
      marketCap: num((price as any).marketCap) ?? num((sum as any).marketCap),
      revenueTTM: revenue,
      revenueGrowthYoY: num((fin as any).revenueGrowth),
      grossMargin: num((fin as any).grossMargins),
      operatingMargin: num((fin as any).operatingMargins),
      freeCashFlow: fcf,
      fcfMargin: fcf != null && revenue ? fcf / revenue : null,
      debtToEquity: d2eRaw != null ? d2eRaw / 100 : null,
      fetched: true,
      asOf: new Date().toISOString(),
    };
  } catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}

async function fetchManyYahoo(
  tickers: string[],
  concurrency = 5,
): Promise<{ metrics: LiveMetrics[]; errors: string[] }> {
  const metrics = new Array<LiveMetrics>(tickers.length);
  const errors: string[] = [];
  let i = 0;
  async function worker() {
    while (i < tickers.length) {
      const idx = i++;
      try {
        metrics[idx] = await fetchMetricsYahoo(tickers[idx]);
      } catch (e) {
        metrics[idx] = emptyMetrics(tickers[idx]);
        if (errors.length < 3) errors.push(`${tickers[idx]}: ${(e as Error).message}`);
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tickers.length) }, worker),
  );
  return { metrics, errors };
}

// ───────────────────────── Dispatcher ─────────────────────────

/** Fetch live metrics for many tickers using the active provider. */
export async function fetchMany(tickers: string[]): Promise<LiveMetrics[]> {
  const provider = activeProvider();
  const { metrics, errors } =
    provider === "fmp"
      ? await fetchManyFmp(tickers)
      : await fetchManyYahoo(tickers);

  lastDiagnostics = {
    provider,
    attempted: tickers.length,
    succeeded: metrics.filter((m) => m.fetched).length,
    errors,
    at: new Date().toISOString(),
  };
  return metrics;
}

/** Fetch a single ticker using the active provider. */
export async function fetchMetrics(ticker: string): Promise<LiveMetrics> {
  if (activeProvider() === "fmp") {
    const { metrics } = await fetchOneFmp(ticker);
    return metrics;
  }
  try {
    return await fetchMetricsYahoo(ticker);
  } catch {
    return emptyMetrics(ticker);
  }
}
