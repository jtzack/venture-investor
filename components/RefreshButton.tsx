"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshButton({
  endpoint = "/api/screen?refresh=1",
}: {
  endpoint?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setBusy(true);
    try {
      await fetch(endpoint, { cache: "no-store" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={refresh} disabled={busy} className="btn disabled:opacity-50">
      <span className={busy ? "animate-spin" : ""}>↻</span>
      {busy ? "Refreshing…" : "Refresh data"}
    </button>
  );
}
