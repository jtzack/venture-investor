"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "vi.watchlist.v1";

// A tiny pub/sub so every mounted component stays in sync after a toggle,
// without pulling in a state library.
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  emit();
}

export function useWatchlist() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTickers(read());
    setReady(true);
    const sync = () => setTickers(read());
    listeners.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((ticker: string) => {
    const cur = read();
    const next = cur.includes(ticker)
      ? cur.filter((t) => t !== ticker)
      : [...cur, ticker];
    write(next);
  }, []);

  const has = useCallback(
    (ticker: string) => tickers.includes(ticker),
    [tickers],
  );

  return { tickers, toggle, has, ready };
}
