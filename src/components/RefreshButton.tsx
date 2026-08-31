"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RefreshButtonProps = {
  riotId: string;
};

export function RefreshButton({ riotId }: RefreshButtonProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/player/${encodeURIComponent(riotId)}/refresh`,
        { method: "POST" },
      );
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "No se pudo actualizar.");
        return;
      }
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="text-sm text-neutral-500 underline disabled:opacity-50"
      >
        {isRefreshing ? "Actualizando..." : "Actualizar datos"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
