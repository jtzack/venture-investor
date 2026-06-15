"use client";

import { useWatchlist } from "@/hooks/useWatchlist";

export default function WatchlistStar({
  ticker,
  withLabel = false,
}: {
  ticker: string;
  withLabel?: boolean;
}) {
  const { has, toggle, ready } = useWatchlist();
  const active = ready && has(ticker);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(ticker);
      }}
      aria-pressed={active}
      title={active ? "Remove from watchlist" : "Add to watchlist"}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm transition ${
        active
          ? "border-warn/40 bg-warn/10 text-warn"
          : "border-edge bg-panel2 text-muted hover:text-slate-200"
      }`}
    >
      <span>{active ? "★" : "☆"}</span>
      {withLabel && <span>{active ? "Watching" : "Watch"}</span>}
    </button>
  );
}
