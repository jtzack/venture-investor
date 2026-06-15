import type {
  LiveMetrics,
  ScoreBreakdown,
  ScoredCompany,
  UniverseEntry,
} from "./types";

/**
 * The scoring engine encodes the venture-style thesis:
 *   "Find small companies entering huge markets, growing revenue fast,
 *    with software-like margins, founder-led, ideally near cash-flow
 *    positive, riding a major technology shift."
 *
 * Each sub-score is 0–100. The composite is a weighted average. If a live
 * metric is missing, that component is dropped and the remaining weights are
 * renormalized, rather than punishing a company for a data gap.
 */

export const WEIGHTS: Record<keyof ScoreBreakdown, number> = {
  growth: 0.35, // the single most predictive factor per the thesis
  margins: 0.2,
  cashFlow: 0.15,
  marketCapFit: 0.1,
  founder: 0.1,
  themeTailwind: 0.1,
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/** Linear interpolation of `x` from [inLo,inHi] onto [outLo,outHi]. */
function lerp(
  x: number,
  inLo: number,
  inHi: number,
  outLo: number,
  outHi: number,
): number {
  if (inHi === inLo) return outLo;
  const t = (x - inLo) / (inHi - inLo);
  return outLo + t * (outHi - outLo);
}

/** Revenue growth (YoY fraction) → 0–100. 30%+ is the bar, 50%+ is elite. */
export function scoreGrowth(g: number): number {
  if (g >= 0.5) return 100;
  if (g >= 0.3) return clamp(lerp(g, 0.3, 0.5, 80, 100));
  if (g >= 0.15) return clamp(lerp(g, 0.15, 0.3, 55, 80));
  if (g >= 0) return clamp(lerp(g, 0, 0.15, 20, 55));
  return clamp(20 + g * 100); // declining revenue ramps toward 0
}

/** Gross margin (fraction) → 0–100. 50%+ is the bar, software-like is best. */
export function scoreMargins(gm: number): number {
  if (gm >= 0.7) return 100;
  if (gm >= 0.5) return clamp(lerp(gm, 0.5, 0.7, 80, 100));
  if (gm >= 0.3) return clamp(lerp(gm, 0.3, 0.5, 50, 80));
  return clamp(lerp(gm, 0, 0.3, 10, 50));
}

/** FCF margin (fraction) → 0–100. Positive/near-breakeven rewarded; deep burn punished. */
export function scoreCashFlow(fcfMargin: number): number {
  if (fcfMargin >= 0.15) return 100;
  if (fcfMargin >= 0) return clamp(lerp(fcfMargin, 0, 0.15, 70, 100));
  if (fcfMargin >= -0.1) return clamp(lerp(fcfMargin, -0.1, 0, 40, 70));
  if (fcfMargin >= -0.3) return clamp(lerp(fcfMargin, -0.3, -0.1, 10, 40));
  return clamp(lerp(fcfMargin, -0.6, -0.3, 0, 10));
}

/** Market cap → 0–100. $500M–$5B is the asymmetric sweet spot. */
export function scoreMarketCapFit(mcap: number): number {
  const B = 1_000_000_000;
  const m = mcap / B;
  if (m >= 0.5 && m <= 5) return 100;
  if (m >= 0.2 && m < 0.5) return clamp(lerp(m, 0.2, 0.5, 65, 100));
  if (m < 0.2) return 40; // micro-cap: real upside but real risk
  if (m > 5 && m <= 15) return clamp(lerp(m, 5, 15, 100, 55));
  if (m > 15 && m <= 50) return clamp(lerp(m, 15, 50, 55, 22));
  return 12; // mega-cap: the asymmetry is mostly gone
}

export function scoreFounder(founderLed: boolean): number {
  return founderLed ? 100 : 45;
}

export function scoreThemeTailwind(numThemes: number): number {
  // Every universe entry rides at least one major shift.
  return clamp(80 + Math.min(Math.max(numThemes - 1, 0), 2) * 10);
}

function pickFcfMargin(m: LiveMetrics): number | null {
  if (m.fcfMargin != null) return m.fcfMargin;
  // Fall back to operating margin as a rough cash-flow proxy.
  if (m.operatingMargin != null) return m.operatingMargin;
  return null;
}

function buildFlags(entry: UniverseEntry, m: LiveMetrics): string[] {
  const flags: string[] = [];
  const g = m.revenueGrowthYoY;
  const gm = m.grossMargin;
  const fcf = pickFcfMargin(m);
  const mcap = m.marketCap;

  if (g != null && g >= 0.4) flags.push("Hyper-growth (>40% YoY)");
  else if (g != null && g >= 0.3) flags.push("Growth above the 30% bar");
  if (g != null && g < 0) flags.push("⚠ Revenue declining");

  if (gm != null && gm >= 0.6) flags.push("Software-like gross margins");
  if (gm != null && gm < 0.3) flags.push("⚠ Thin gross margins");

  if (fcf != null && fcf >= 0.05) flags.push("Cash generative");
  else if (fcf != null && fcf < -0.15) flags.push("⚠ Burning cash heavily");

  if (entry.founderLed) flags.push("Founder-led");

  if (mcap != null) {
    const B = 1_000_000_000;
    if (mcap >= 0.5 * B && mcap <= 5 * B) flags.push("Sweet-spot market cap");
    if (mcap > 15 * B) flags.push("Large-cap — less asymmetric");
    if (mcap < 0.2 * B) flags.push("⚠ Micro-cap — higher risk");
  }

  return flags;
}

/** Score one company. Missing metrics drop out and weights renormalize. */
export function scoreCompany(
  entry: UniverseEntry,
  metrics: LiveMetrics,
): ScoredCompany {
  const fcfMargin = pickFcfMargin(metrics);

  // Founder and theme are always computable from static data.
  const breakdown: ScoreBreakdown = {
    growth: metrics.revenueGrowthYoY != null ? scoreGrowth(metrics.revenueGrowthYoY) : 0,
    margins: metrics.grossMargin != null ? scoreMargins(metrics.grossMargin) : 0,
    cashFlow: fcfMargin != null ? scoreCashFlow(fcfMargin) : 0,
    marketCapFit: metrics.marketCap != null ? scoreMarketCapFit(metrics.marketCap) : 0,
    founder: scoreFounder(entry.founderLed),
    themeTailwind: scoreThemeTailwind(entry.themes.length),
  };

  // Renormalize over components we could actually compute.
  const available: Array<keyof ScoreBreakdown> = ["founder", "themeTailwind"];
  if (metrics.revenueGrowthYoY != null) available.push("growth");
  if (metrics.grossMargin != null) available.push("margins");
  if (fcfMargin != null) available.push("cashFlow");
  if (metrics.marketCap != null) available.push("marketCapFit");

  const weightSum = available.reduce((s, k) => s + WEIGHTS[k], 0);
  const score = available.reduce((s, k) => s + breakdown[k] * WEIGHTS[k], 0) / weightSum;

  const dataIncomplete =
    metrics.revenueGrowthYoY == null ||
    metrics.grossMargin == null ||
    metrics.marketCap == null;

  return {
    entry,
    metrics,
    breakdown,
    score: Math.round(score),
    flags: buildFlags(entry, metrics),
    dataIncomplete,
  };
}

export function rankCompanies(scored: ScoredCompany[]): ScoredCompany[] {
  return [...scored].sort((a, b) => {
    // Complete data first, then by score.
    if (a.dataIncomplete !== b.dataIncomplete) return a.dataIncomplete ? 1 : -1;
    return b.score - a.score;
  });
}
