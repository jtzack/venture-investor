import DataBanner from "@/components/DataBanner";
import RefreshButton from "@/components/RefreshButton";
import ScreenerTable from "@/components/ScreenerTable";
import { anyLiveData, getScreen } from "@/lib/screen";
import { getDiagnostics } from "@/lib/provider";
import { ALL_THEMES } from "@/lib/universe";

export const dynamic = "force-dynamic";

export default async function ScreenerPage() {
  const companies = await getScreen();
  const live = anyLiveData(companies);
  const diag = getDiagnostics();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Screener</h1>
          <p className="text-sm text-muted">
            Filter and rank the universe by the venture thesis. Tap ☆ to build
            your watchlist.
          </p>
        </div>
        <RefreshButton />
      </div>

      <DataBanner live={live} diag={diag} />

      <ScreenerTable companies={companies} allThemes={ALL_THEMES} />
    </div>
  );
}
