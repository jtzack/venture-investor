import { fetchMany, fetchMetrics } from "./provider";
import { rankCompanies, scoreCompany } from "./scoring";
import type { ScoredCompany } from "./types";
import { getEntry, UNIVERSE } from "./universe";

// Simple in-memory TTL cache. On a warm serverless instance this avoids
// re-hitting the data provider on every page view. 30-minute freshness is
// plenty for fundamentals that update quarterly.
const TTL_MS = 30 * 60 * 1000;

let screenCache: { at: number; data: ScoredCompany[] } | null = null;
const companyCache = new Map<string, { at: number; data: ScoredCompany }>();

/** Fetch, score, and rank the whole universe. Cached for TTL_MS. */
export async function getScreen(force = false): Promise<ScoredCompany[]> {
  if (!force && screenCache && Date.now() - screenCache.at < TTL_MS) {
    return screenCache.data;
  }
  const metrics = await fetchMany(UNIVERSE.map((u) => u.ticker));
  const scored = UNIVERSE.map((entry, i) => scoreCompany(entry, metrics[i]));
  const ranked = rankCompanies(scored);
  screenCache = { at: Date.now(), data: ranked };
  return ranked;
}

/** Score a single company by ticker (must be in the universe). */
export async function getCompany(
  ticker: string,
  force = false,
): Promise<ScoredCompany | null> {
  const entry = getEntry(ticker);
  if (!entry) return null;
  const key = entry.ticker;
  const hit = companyCache.get(key);
  if (!force && hit && Date.now() - hit.at < TTL_MS) return hit.data;

  const metrics = await fetchMetrics(entry.ticker);
  const data = scoreCompany(entry, metrics);
  companyCache.set(key, { at: Date.now(), data });
  return data;
}

/** Whether the last screen actually reached the data provider for anything. */
export function anyLiveData(scored: ScoredCompany[]): boolean {
  return scored.some((s) => s.metrics.fetched);
}
