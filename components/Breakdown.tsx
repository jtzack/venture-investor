import { WEIGHTS } from "@/lib/scoring";
import type { ScoreBreakdown } from "@/lib/types";

const LABELS: Record<keyof ScoreBreakdown, string> = {
  growth: "Revenue growth",
  margins: "Gross margins",
  cashFlow: "Cash flow",
  marketCapFit: "Market-cap fit",
  founder: "Founder-led",
  themeTailwind: "Theme tailwind",
};

function barColor(v: number): string {
  if (v >= 75) return "bg-accent";
  if (v >= 55) return "bg-accent2";
  if (v >= 40) return "bg-warn";
  return "bg-bad";
}

export default function Breakdown({ breakdown }: { breakdown: ScoreBreakdown }) {
  const keys = Object.keys(breakdown) as Array<keyof ScoreBreakdown>;
  // Heaviest-weighted factors first.
  keys.sort((a, b) => WEIGHTS[b] - WEIGHTS[a]);

  return (
    <div className="space-y-3">
      {keys.map((k) => (
        <div key={k}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              {LABELS[k]}{" "}
              <span className="text-muted">· {Math.round(WEIGHTS[k] * 100)}% weight</span>
            </span>
            <span className="tabular-nums text-muted">{breakdown[k]}</span>
          </div>
          <div className="metric-bar">
            <div
              className={`h-full ${barColor(breakdown[k])}`}
              style={{ width: `${breakdown[k]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
