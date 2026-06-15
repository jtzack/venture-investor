import type { LiveMetrics } from "./types";

export function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function emptyMetrics(ticker: string): LiveMetrics {
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
