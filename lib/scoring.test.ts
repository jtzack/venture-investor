import { describe, expect, it } from "vitest";
import {
  rankCompanies,
  scoreCashFlow,
  scoreCompany,
  scoreGrowth,
  scoreMargins,
  scoreMarketCapFit,
} from "./scoring";
import type { LiveMetrics, UniverseEntry } from "./types";

const entry: UniverseEntry = {
  ticker: "TEST",
  name: "Test Co",
  themes: ["AI Infrastructure"],
  founderLed: true,
  blurb: "A test company.",
  thesis: "Testing the engine.",
};

function metrics(overrides: Partial<LiveMetrics>): LiveMetrics {
  return {
    ticker: "TEST",
    price: 10,
    marketCap: 2_000_000_000,
    revenueTTM: 500_000_000,
    revenueGrowthYoY: 0.4,
    grossMargin: 0.65,
    operatingMargin: 0.05,
    freeCashFlow: 25_000_000,
    fcfMargin: 0.05,
    debtToEquity: 0.1,
    fetched: true,
    asOf: "2026-06-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("sub-score ramps", () => {
  it("rewards faster growth monotonically", () => {
    expect(scoreGrowth(-0.2)).toBeLessThan(scoreGrowth(0));
    expect(scoreGrowth(0)).toBeLessThan(scoreGrowth(0.15));
    expect(scoreGrowth(0.15)).toBeLessThan(scoreGrowth(0.3));
    expect(scoreGrowth(0.3)).toBeLessThan(scoreGrowth(0.5));
    expect(scoreGrowth(0.5)).toBe(100);
    expect(scoreGrowth(1.0)).toBe(100);
  });

  it("treats 30% growth as clearly above-bar", () => {
    expect(scoreGrowth(0.3)).toBeGreaterThanOrEqual(80);
  });

  it("scores margins with 50% as the bar", () => {
    expect(scoreMargins(0.5)).toBeGreaterThanOrEqual(80);
    expect(scoreMargins(0.2)).toBeLessThan(50);
    expect(scoreMargins(0.75)).toBe(100);
  });

  it("rewards positive cash flow and punishes deep burn", () => {
    expect(scoreCashFlow(0.2)).toBe(100);
    expect(scoreCashFlow(0)).toBeGreaterThanOrEqual(70);
    expect(scoreCashFlow(-0.05)).toBeLessThan(scoreCashFlow(0));
    expect(scoreCashFlow(-0.5)).toBeLessThan(15);
  });

  it("peaks market-cap fit in the $500M–$5B band", () => {
    expect(scoreMarketCapFit(2_000_000_000)).toBe(100);
    expect(scoreMarketCapFit(50_000_000_000)).toBeLessThan(30);
    expect(scoreMarketCapFit(2_000_000_000)).toBeGreaterThan(
      scoreMarketCapFit(40_000_000_000),
    );
  });
});

describe("scoreCompany", () => {
  it("gives a strong company a high composite", () => {
    const s = scoreCompany(entry, metrics({}));
    expect(s.score).toBeGreaterThan(80);
    expect(s.dataIncomplete).toBe(false);
    expect(s.flags).toContain("Founder-led");
  });

  it("penalizes a declining, low-margin, cash-burning company", () => {
    const s = scoreCompany(
      entry,
      metrics({
        revenueGrowthYoY: -0.1,
        grossMargin: 0.2,
        fcfMargin: -0.4,
        operatingMargin: -0.4,
      }),
    );
    expect(s.score).toBeLessThan(50);
    expect(s.flags).toContain("⚠ Revenue declining");
  });

  it("renormalizes weights when metrics are missing", () => {
    const s = scoreCompany(
      entry,
      metrics({
        revenueGrowthYoY: null,
        grossMargin: null,
        fcfMargin: null,
        operatingMargin: null,
        marketCap: null,
      }),
    );
    // Only founder + theme remain; both are high for this entry.
    expect(s.dataIncomplete).toBe(true);
    expect(s.score).toBeGreaterThan(0);
    expect(s.score).toBeLessThanOrEqual(100);
  });
});

describe("rankCompanies", () => {
  it("sorts complete-data companies above incomplete ones", () => {
    const complete = scoreCompany(entry, metrics({}));
    const incomplete = scoreCompany(
      { ...entry, ticker: "INC" },
      metrics({ revenueGrowthYoY: null, grossMargin: null, marketCap: null }),
    );
    const ranked = rankCompanies([incomplete, complete]);
    expect(ranked[0].entry.ticker).toBe("TEST");
  });
});
