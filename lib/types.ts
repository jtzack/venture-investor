// Core domain types for the venture-style screener.

/** A theme = a major technology shift that can carry a company 10x. */
export type Theme =
  | "AI Infrastructure"
  | "Robotics & Automation"
  | "Defense Tech"
  | "Energy Storage"
  | "Nuclear Power"
  | "Digital Health"
  | "Cybersecurity"
  | "Space"
  | "Fintech / Payments"
  | "Semiconductors";

/**
 * Static, factual metadata for a company in the watch universe.
 * These fields rarely change and are curated by hand — they do NOT
 * include live financials, which are fetched at runtime.
 */
export interface UniverseEntry {
  ticker: string;
  name: string;
  themes: Theme[];
  /** Whether a founder is still CEO / heavily involved. */
  founderLed: boolean;
  /** Name of the founder(s) if founder-led, for quick reference. */
  founder?: string;
  /** One-line plain-English description of what they do. */
  blurb: string;
  /** Why this is a venture-style candidate (the thesis in a sentence). */
  thesis: string;
}

/**
 * Live, point-in-time financial metrics for a company.
 * Populated from the data provider (Yahoo Finance) at request time.
 * Any field may be null if the provider didn't return it.
 */
export interface LiveMetrics {
  ticker: string;
  price: number | null;
  marketCap: number | null;
  /** Trailing-twelve-month revenue. */
  revenueTTM: number | null;
  /** Year-over-year revenue growth as a fraction, e.g. 0.42 = 42%. */
  revenueGrowthYoY: number | null;
  /** Gross margin as a fraction, e.g. 0.61 = 61%. */
  grossMargin: number | null;
  /** Operating margin as a fraction (can be negative for young companies). */
  operatingMargin: number | null;
  /** Free cash flow (absolute, currency). */
  freeCashFlow: number | null;
  /** FCF margin = FCF / revenue, as a fraction. */
  fcfMargin: number | null;
  /** Total debt / total equity, as a fraction. */
  debtToEquity: number | null;
  /** True if the provider call succeeded; false means we show a "pending" state. */
  fetched: boolean;
  /** ISO timestamp of when this snapshot was taken. */
  asOf: string;
}

/** Sub-scores that make up the composite. Each is 0–100. */
export interface ScoreBreakdown {
  growth: number;
  margins: number;
  founder: number;
  marketCapFit: number;
  cashFlow: number;
  themeTailwind: number;
}

export interface ScoredCompany {
  entry: UniverseEntry;
  metrics: LiveMetrics;
  breakdown: ScoreBreakdown;
  /** Weighted composite, 0–100. Higher = better fit to the venture thesis. */
  score: number;
  /** Human-readable flags worth knowing at a glance. */
  flags: string[];
  /** True when we lack enough live data to score with confidence. */
  dataIncomplete: boolean;
}
