import Link from "next/link";
import CompanyCard from "@/components/CompanyCard";
import DataBanner from "@/components/DataBanner";
import RefreshButton from "@/components/RefreshButton";
import { anyLiveData, getScreen } from "@/lib/screen";

export const dynamic = "force-dynamic";

const ALLOCATION = [
  {
    bucket: "$500 — Proven winner",
    note: "A scaled, founder-led compounder (e.g. a benchmark name). Anchors the portfolio.",
  },
  {
    bucket: "$500 — Emerging leader",
    note: "Past the risky-startup phase, still growing 30%+. The core bet.",
  },
  {
    bucket: "$500 — Small-cap growth",
    note: "$500M–$5B, accelerating revenue. The asymmetric lottery slice.",
  },
  {
    bucket: "$500 — Cash (dry powder)",
    note: "Held for the next earnings overreaction or a thesis you grow into.",
  },
];

export default async function Dashboard() {
  const companies = await getScreen();
  const live = anyLiveData(companies);

  // Top candidates that actually have data, biased toward the small-cap sweet spot.
  const top = companies
    .filter((c) => !c.dataIncomplete)
    .slice(0, 6);
  const display = top.length ? top : companies.slice(0, 6);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Find the next 10–50x before it&apos;s obvious
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            A venture-style screener for public markets. It ranks a curated
            universe of small companies entering huge markets by the factors that
            actually precede hockey-stick returns: accelerating revenue,
            software-like margins, founder leadership, and a major technology
            tailwind.
          </p>
        </div>
        <div className="flex gap-2">
          <RefreshButton />
          <Link href="/screener" className="btn border-accent/40 bg-accent/10 text-accent">
            Open screener →
          </Link>
        </div>
      </section>

      <DataBanner live={live} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Top candidates right now</h2>
          <Link href="/screener" className="text-sm text-accent2 hover:underline">
            See all {companies.length} →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {display.map((c) => (
            <CompanyCard key={c.entry.ticker} c={c} />
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-semibold">Your $2,000 starter framework</h2>
        <p className="mt-1 text-sm text-muted">
          With a small account you don&apos;t need diversification for capital
          preservation — you need exposure to asymmetric upside. One structure:
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ALLOCATION.map((a) => (
            <div key={a.bucket} className="rounded-lg border border-edge bg-panel2 p-3">
              <div className="font-medium text-accent">{a.bucket}</div>
              <p className="mt-1 text-sm text-slate-400">{a.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          The screener helps you fill the &quot;emerging leader&quot; and
          &quot;small-cap growth&quot; buckets. See{" "}
          <Link href="/method" className="text-accent2 hover:underline">
            how scoring works
          </Link>{" "}
          to understand what each number means.
        </p>
      </section>
    </div>
  );
}
