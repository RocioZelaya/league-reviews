"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/ui/InlineError";

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
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        aria-busy={isRefreshing}
      >
        <RefreshIcon spinning={isRefreshing} />
        {isRefreshing ? "Actualizando" : "Actualizar"}
      </Button>
      <InlineError message={error} />
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`size-4 ${spinning ? "animate-spin" : ""}`}
    >
      <path d="M21 12a9 9 0 1 1-2.6-6.4" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
