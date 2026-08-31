"use client";

import { useState } from "react";
import { getClientAnonId } from "@/lib/anon";

type ReportButtonProps = {
  commentId: string;
};

export function ReportButton({ commentId }: ReportButtonProps) {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  async function handleReport() {
    const anonId = getClientAnonId();
    if (!anonId || status === "sent") return;

    const confirmed = window.confirm(
      "¿Seguro que querés reportar este comentario?",
    );
    if (!confirmed) return;

    const response = await fetch(`/api/comments/${commentId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonId }),
    });

    if (response.ok) {
      setStatus("sent");
    }
  }

  return (
    <button
      type="button"
      onClick={handleReport}
      disabled={status === "sent"}
      className="text-sm text-neutral-500 underline disabled:no-underline"
    >
      {status === "sent" ? "Reportado" : "Reportar"}
    </button>
  );
}
