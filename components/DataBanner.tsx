import type { Diagnostics } from "@/lib/provider";

/**
 * Honesty + actionability banner. When live metrics didn't load, explain which
 * provider ran, the first error it hit, and exactly how to fix it — instead of
 * silently showing empty numbers.
 */
export default function DataBanner({
  live,
  diag,
}: {
  live: boolean;
  diag?: Diagnostics | null;
}) {
  if (live) return null;

  const provider = diag?.provider ?? "yahoo";

  let reason: string;
  if (provider === "yahoo") {
    reason =
      "No data-provider key is set, so the app fell back to keyless Yahoo Finance — which is blocked from datacenter IPs like Vercel.";
  } else if (provider === "fmp") {
    reason =
      "FMP's free plan restricts its symbol universe to large, established names and blocks the small-caps this screener targets.";
  } else {
    reason =
      "The data provider returned no usable data — likely an invalid key or a rate limit.";
  }

  return (
    <div className="card mb-5 border-warn/30 bg-warn/10 p-4 text-sm text-warn">
      <p className="font-semibold">⚠ Live financials didn&apos;t load</p>
      <p className="mt-1 text-warn/90">{reason}</p>

      <p className="mt-2 text-warn/90">
        Fix: use <b>Finnhub</b> — its free tier covers US small-caps and works
        from serverless hosts.
      </p>
      <ol className="mt-1 list-decimal space-y-1 pl-5 text-warn/90">
        <li>
          Get a free key at{" "}
          <a
            className="underline"
            href="https://finnhub.io/register"
            target="_blank"
            rel="noopener noreferrer"
          >
            finnhub.io/register
          </a>{" "}
          (no credit card).
        </li>
        <li>
          In Vercel → <b>Settings → Environment Variables</b>, add{" "}
          <span className="font-mono">FINNHUB_API_KEY</span>.
        </li>
        <li>
          <b>Redeploy</b>, then hit <span className="font-mono">Refresh</span>.
        </li>
      </ol>

      {diag && (
        <p className="mt-2 text-xs text-warn/70">
          Diagnostics — provider: <b>{diag.provider}</b>, succeeded{" "}
          {diag.succeeded}/{diag.attempted}
          {diag.errors.length ? ` · e.g. ${diag.errors[0]}` : ""}.
        </p>
      )}
    </div>
  );
}
