import type { Diagnostics } from "@/lib/provider";

/**
 * Honesty + actionability banner. When live metrics didn't load, explain WHY
 * (which provider ran, what error it hit) and exactly how to fix it, instead of
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

  const onYahoo = diag?.provider === "yahoo";

  return (
    <div className="card mb-5 border-warn/30 bg-warn/10 p-4 text-sm text-warn">
      <p className="font-semibold">⚠ Live financials didn&apos;t load</p>

      {onYahoo ? (
        <p className="mt-1 text-warn/90">
          The app is using the keyless <b>Yahoo Finance</b> source, which works
          locally but is <b>blocked from datacenter IPs like Vercel</b> (Yahoo
          returns 401/429). To get live data in production, add a free{" "}
          <b>Financial Modeling Prep</b> key:
        </p>
      ) : (
        <p className="mt-1 text-warn/90">
          The data provider returned no usable data. Check that your{" "}
          <span className="font-mono">FMP_API_KEY</span> is valid and that the
          free-tier request limit hasn&apos;t been hit.
        </p>
      )}

      <ol className="mt-2 list-decimal space-y-1 pl-5 text-warn/90">
        <li>
          Grab a free key at{" "}
          <a
            className="underline"
            href="https://site.financialmodelingprep.com/developer/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            financialmodelingprep.com
          </a>{" "}
          (no credit card).
        </li>
        <li>
          In Vercel → Project → <b>Settings → Environment Variables</b>, add{" "}
          <span className="font-mono">FMP_API_KEY</span> = your key.
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
