import DataBanner from "@/components/DataBanner";
import DiscoveryView from "@/components/DiscoveryView";
import RefreshButton from "@/components/RefreshButton";
import { getDiagnostics } from "@/lib/provider";
import { anyLiveData, getScreen } from "@/lib/screen";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const companies = await getScreen();
  const live = anyLiveData(companies);
  const diag = getDiagnostics();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
          <p className="max-w-2xl text-sm text-muted">
            Set your bar — minimum growth, margins, market-cap band — and see only
            the companies that clear it, ranked by fit. This scans the curated
            candidate pool ({companies.length} names). Full market-wide scanning
            is a planned next step.
          </p>
        </div>
        <RefreshButton />
      </div>

      <DataBanner live={live} diag={diag} />

      <DiscoveryView companies={companies} />
    </div>
  );
}
