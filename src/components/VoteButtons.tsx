"use client";

import { useState } from "react";
import { getClientAnonId } from "@/lib/anon";
import { readApiErrorCode } from "@/lib/apiErrors";
import { apiErrorMessage } from "@/lib/i18n/apiErrorMessage";
import type { VoteValue } from "@/lib/validation";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { InlineError } from "@/components/ui/InlineError";

type VoteButtonsProps = {
  commentId: string;
  initialScore: number;
  /** The viewer's current vote, or null when unknown or absent. */
  initialVote?: VoteValue | null;
};

type VoteResponse = {
  score: number;
  vote: VoteValue | null;
};

/** Mirrors the endpoint: same value toggles off, a different one switches. */
function applyVote(
  score: number,
  currentVote: VoteValue | null,
  value: VoteValue,
): { score: number; vote: VoteValue | null } {
  if (currentVote === value) {
    return { score: score - value, vote: null };
  }
  const withoutCurrent = currentVote ? score - currentVote : score;
  return { score: withoutCurrent + value, vote: value };
}

export function VoteButtons({
  commentId,
  initialScore,
  initialVote = null,
}: VoteButtonsProps) {
  const dictionary = useDictionary();
  const { comments, errors } = dictionary;
  const [score, setScore] = useState(initialScore);
  const [activeVote, setActiveVote] = useState<VoteValue | null>(initialVote);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVote(value: VoteValue) {
    const anonId = getClientAnonId();
    if (!anonId || isVoting) return;

    const previous = { score, vote: activeVote };
    const optimistic = applyVote(score, activeVote, value);
    setScore(optimistic.score);
    setActiveVote(optimistic.vote);
    setIsVoting(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonId, value }),
      });

      if (!response.ok) {
        setScore(previous.score);
        setActiveVote(previous.vote);
        const code = await readApiErrorCode(response);
        setError(apiErrorMessage(code, dictionary, errors.voteFailed));
        return;
      }

      const data = (await response.json()) as VoteResponse;
      setScore(data.score);
      setActiveVote(data.vote);
    } catch {
      setScore(previous.score);
      setActiveVote(previous.vote);
      setError(errors.voteFailed);
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 rounded-full border border-line bg-void p-0.5">
        <VoteButton
          label={comments.upvote}
          direction="up"
          isActive={activeVote === 1}
          onClick={() => handleVote(1)}
        />
        <span className="min-w-6 text-center font-mono text-sm tabular-nums">
          {score}
        </span>
        <VoteButton
          label={comments.downvote}
          direction="down"
          isActive={activeVote === -1}
          onClick={() => handleVote(-1)}
        />
      </div>
      <InlineError message={error} />
    </div>
  );
}

type VoteButtonProps = {
  label: string;
  direction: "up" | "down";
  isActive: boolean;
  onClick: () => void;
};

function VoteButton({ label, direction, isActive, onClick }: VoteButtonProps) {
  const activeColor = direction === "up" ? "text-cyan" : "text-magenta";
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      onClick={onClick}
      className={`flex size-7 items-center justify-center rounded-full transition-colors hover:bg-ink-raised ${
        isActive ? activeColor : "text-text-mute hover:text-text"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`size-4 ${direction === "down" ? "rotate-180" : ""}`}
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
