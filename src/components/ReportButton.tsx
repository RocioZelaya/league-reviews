"use client";

import { useRef, useState } from "react";
import { getClientAnonId } from "@/lib/anon";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/ui/InlineError";

type ReportButtonProps = {
  commentId: string;
};

type ReportStatus = "idle" | "confirming" | "sending" | "sent";

const REPORT_FAILED_MESSAGE = "No se pudo enviar el reporte.";
const MISSING_SESSION_MESSAGE =
  "No se pudo identificar tu sesión. Recargá la página.";

export function ReportButton({ commentId }: ReportButtonProps) {
  const [status, setStatus] = useState<ReportStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function cancel() {
    setStatus("idle");
    // The trigger is unmounted while confirming; refocus it once it is back.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function handleConfirm() {
    const anonId = getClientAnonId();
    if (!anonId) {
      setError(MISSING_SESSION_MESSAGE);
      setStatus("idle");
      return;
    }

    setStatus("sending");
    setError(null);
    try {
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
      setError(data.error ?? REPORT_FAILED_MESSAGE);
      setStatus("idle");
    } catch {
      setError(REPORT_FAILED_MESSAGE);
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return <span className="font-mono text-xs text-text-mute">Reportado</span>;
  }

  if (status === "confirming" || status === "sending") {
    return (
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label="Confirmar reporte"
      >
        <span className="text-xs text-text-dim">¿Reportar?</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleConfirm}
          disabled={status === "sending"}
          className="h-7 border-magenta/50 text-magenta hover:border-magenta hover:text-magenta"
        >
          Sí
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={cancel}
          disabled={status === "sending"}
          autoFocus
          className="h-7"
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setStatus("confirming")}
        className="font-mono text-xs text-text-mute transition-colors hover:text-magenta"
      >
        Reportar
      </button>
      <InlineError message={error} />
    </div>
  );
}
