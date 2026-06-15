import WatchlistView from "@/components/WatchlistView";
import { getScreen } from "@/lib/screen";
import { ALL_THEMES } from "@/lib/universe";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const companies = await getScreen();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-sm text-muted">
          Your saved companies (stored locally in this browser) and a weekly
          review routine.
        </p>
      </div>
      <WatchlistView companies={companies} allThemes={ALL_THEMES} />
    </div>
  );
}
