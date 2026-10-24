"use client";

import { useRef, useState } from "react";
import { getClientAnonId } from "@/lib/anon";
import { readApiErrorCode } from "@/lib/apiErrors";
import { apiErrorMessage } from "@/lib/i18n/apiErrorMessage";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/ui/InlineError";

type ReportButtonProps = {
  commentId: string;
};

type ReportStatus = "idle" | "confirming" | "sending" | "sent";

export function ReportButton({ commentId }: ReportButtonProps) {
  const dictionary = useDictionary();
  const { comments, errors } = dictionary;
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
      setError(errors.sessionMissing);
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

      const code = await readApiErrorCode(response);
      setError(apiErrorMessage(code, dictionary, errors.reportFailed));
      setStatus("idle");
    } catch {
      setError(errors.reportFailed);
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <span className="font-mono text-xs text-text-mute">
        {comments.reported}
      </span>
    );
  }

  if (status === "confirming" || status === "sending") {
    return (
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label={comments.reportConfirmGroup}
      >
        <span className="text-xs text-text-dim">{comments.reportConfirm}</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleConfirm}
          disabled={status === "sending"}
          className="h-7 border-magenta/50 text-magenta hover:border-magenta hover:text-magenta"
        >
          {comments.yes}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={cancel}
          disabled={status === "sending"}
          autoFocus
          className="h-7"
        >
          {comments.no}
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
        {comments.report}
      </button>
      <InlineError message={error} />
    </div>
  );
}
