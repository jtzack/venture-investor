import yahooFinance from "yahoo-finance2";
import type { LiveMetrics } from "./types";

// Quiet the library's first-run notices so server logs stay clean.
// `suppressNotices` isn't in every version's types, so guard it loosely.
try {
  (yahooFinance as any).suppressNotices?.(["yahooSurvey"]);
} catch {
  /* older/newer versions may not expose this; ignore */
}

const MODULES = ["price", "summaryDetail", "financialData"] as const;

function emptyMetrics(ticker: string): LiveMetrics {
  return {
    ticker,
    price: null,
    marketCap: null,
    revenueTTM: null,
    revenueGrowthYoY: null,
    grossMargin: null,
    operatingMargin: null,
    freeCashFlow: null,
    fcfMargin: null,
    debtToEquity: null,
    fetched: false,
    asOf: new Date().toISOString(),
  };
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * Fetch one company's live metrics from Yahoo Finance.
 * Never throws — on any failure it returns a `fetched: false` snapshot so the
 * UI can show a "data pending" state instead of crashing the whole screen.
 */
export async function fetchMetrics(ticker: string): Promise<LiveMetrics> {
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
      // Yahoo reports debt/equity as a percentage (e.g. 41.5 => 0.415).
      debtToEquity: d2eRaw != null ? d2eRaw / 100 : null,
      fetched: true,
      asOf: new Date().toISOString(),
    };
  } catch {
    return emptyMetrics(ticker);
  }
}

/** Fetch many tickers with bounded concurrency so we don't hammer the source. */
export async function fetchMany(
  tickers: string[],
  concurrency = 5,
): Promise<LiveMetrics[]> {
  const out: LiveMetrics[] = [];
  let i = 0;
  async function worker() {
    while (i < tickers.length) {
      const idx = i++;
      out[idx] = await fetchMetrics(tickers[idx]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tickers.length) }, worker),
  );
  return out;
}
