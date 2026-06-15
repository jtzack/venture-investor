// Small display helpers shared across the UI.

export function fmtPct(v: number | null, digits = 0): string {
  if (v == null) return "—";
  return `${(v * 100).toFixed(digits)}%`;
}

export function fmtMoney(v: number | null): string {
  if (v == null) return "—";
  const a = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (a >= 1e12) return `${sign}$${(a / 1e12).toFixed(2)}T`;
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(1)}K`;
  return `${sign}$${a.toFixed(2)}`;
}

export function fmtPrice(v: number | null): string {
  if (v == null) return "—";
  return `$${v.toFixed(2)}`;
}

/** Map a 0–100 score to a tailwind text color class. */
export function scoreColor(score: number): string {
  if (score >= 75) return "text-accent";
  if (score >= 55) return "text-accent2";
  if (score >= 40) return "text-warn";
  return "text-bad";
}

export function scoreBg(score: number): string {
  if (score >= 75) return "bg-accent/15 text-accent border-accent/30";
  if (score >= 55) return "bg-accent2/15 text-accent2 border-accent2/30";
  if (score >= 40) return "bg-warn/15 text-warn border-warn/30";
  return "bg-bad/15 text-bad border-bad/30";
}
