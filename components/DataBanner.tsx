/**
 * Honesty banner. When the data provider couldn't be reached (e.g. a network
 * policy is blocking it, or you're inside a sandbox), every metric is null and
 * the scores reflect only the static factors. Say so plainly.
 */
export default function DataBanner({ live }: { live: boolean }) {
  if (live) return null;
  return (
    <div className="card mb-5 border-warn/30 bg-warn/10 p-4 text-sm text-warn">
      <p className="font-semibold">⚠ Live financials not loaded</p>
      <p className="mt-1 text-warn/90">
        The data provider (Yahoo Finance) couldn&apos;t be reached from this
        environment, so revenue growth, margins and cash flow are missing.
        Scores below reflect only static factors (founder-led, theme, etc.).
        Run the app locally or deploy it where outbound network is allowed, then
        hit <span className="font-mono">Refresh</span> to load real numbers.
      </p>
    </div>
  );
}
