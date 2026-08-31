"use client";

import { useState } from "react";
import { getClientAnonId } from "@/lib/anon";

type ReportButtonProps = {
  commentId: string;
};

export function ReportButton({ commentId }: ReportButtonProps) {
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleReport() {
    const anonId = getClientAnonId();
    if (!anonId || status === "sent") return;

    const confirmed = window.confirm(
      "¿Seguro que querés reportar este comentario?",
    );
    if (!confirmed) return;

    setError(null);
    const response = await fetch(`/api/comments/${commentId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonId }),
    });

    if (response.ok) {
      setStatus("sent");
      return;
    }

    const data = (await response.json()) as { error?: string };
    setError(data.error ?? "No se pudo enviar el reporte.");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleReport}
        disabled={status === "sent"}
        className="text-sm text-neutral-500 underline disabled:no-underline"
      >
        {status === "sent" ? "Reportado" : "Reportar"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
