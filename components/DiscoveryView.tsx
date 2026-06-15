"use client";

import { useMemo, useState } from "react";
import CompanyCard from "@/components/CompanyCard";
import type { ScoredCompany } from "@/lib/types";

type Band = "sweet" | "small" | "mid" | "any";

const BANDS: Record<Band, { label: string; test: (m: number) => boolean }> = {
  sweet: { label: "Sweet spot $500M–$5B", test: (m) => m >= 0.5e9 && m <= 5e9 },
  small: { label: "Small-cap < $2B", test: (m) => m >= 5e7 && m < 2e9 },
  mid: { label: "Up to $10B", test: (m) => m <= 1e10 },
  any: { label: "Any size", test: () => true },
};

export default function DiscoveryView({
  companies,
}: {
  companies: ScoredCompany[];
}) {
  const [minGrowth, setMinGrowth] = useState(30);
  const [minMargin, setMinMargin] = useState(50);
  const [band, setBand] = useState<Band>("sweet");
  const [cashPositive, setCashPositive] = useState(false);
  const [founderOnly, setFounderOnly] = useState(false);

  const scored = companies.filter((c) => c.metrics.fetched);

  const passers = useMemo(() => {
    const inBand = BANDS[band].test;
    return scored
      .filter((c) => {
        const m = c.metrics;
        if (m.revenueGrowthYoY == null || m.grossMargin == null || m.marketCap == null)
          return false;
        if (m.revenueGrowthYoY * 100 < minGrowth) return false;
        if (m.grossMargin * 100 < minMargin) return false;
        if (!inBand(m.marketCap)) return false;
        if (founderOnly && !c.entry.founderLed) return false;
        if (cashPositive) {
          const cf = m.fcfMargin ?? m.operatingMargin;
          if (cf == null || cf <= 0) return false;
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [scored, minGrowth, minMargin, band, founderOnly, cashPositive]);

  return (
    <div className="space-y-5">
      <div className="card space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Slider
            label="Min revenue growth"
            value={minGrowth}
            onChange={setMinGrowth}
            min={0}
            max={80}
            step={5}
            suffix="%+"
          />
          <Slider
            label="Min gross margin"
            value={minMargin}
            onChange={setMinMargin}
            min={0}
            max={90}
            step={5}
            suffix="%+"
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Market cap</span>
            <select
              value={band}
              onChange={(e) => setBand(e.target.value as Band)}
              className="rounded-lg border border-edge bg-panel2 px-3 py-2 outline-none focus:border-muted"
            >
              {(Object.keys(BANDS) as Band[]).map((b) => (
                <option key={b} value={b} className="bg-panel">
                  {BANDS[b].label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="btn cursor-pointer">
            <input
              type="checkbox"
              checked={founderOnly}
              onChange={(e) => setFounderOnly(e.target.checked)}
              className="accent-accent"
            />
            Founder-led only
          </label>
          <label className="btn cursor-pointer">
            <input
              type="checkbox"
              checked={cashPositive}
              onChange={(e) => setCashPositive(e.target.checked)}
              className="accent-accent"
            />
            Cash-flow positive
          </label>
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <p className="text-sm">
          <span className="text-2xl font-bold text-accent">{passers.length}</span>{" "}
          <span className="text-muted">
            {passers.length === 1 ? "company clears" : "companies clear"} your bar
            {" "}· {scored.length} scored
          </span>
        </p>
      </div>

      {passers.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {passers.map((c) => (
            <CompanyCard key={c.entry.ticker} c={c} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-muted">
          Nothing clears this bar right now. Loosen a threshold — or take it as a
          signal that the obvious names are richly priced and the real work is
          finding the under-followed ones.
        </div>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex items-center justify-between text-muted">
        <span>{label}</span>
        <span className="tabular-nums text-accent">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-accent"
      />
    </label>
  );
}
