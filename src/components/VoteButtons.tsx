"use client";

import { useState } from "react";
import { getClientAnonId } from "@/lib/anon";

type VoteButtonsProps = {
  commentId: string;
  initialScore: number;
};

export function VoteButtons({ commentId, initialScore }: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [isVoting, setIsVoting] = useState(false);

  async function handleVote(value: 1 | -1) {
    const anonId = getClientAnonId();
    if (!anonId || isVoting) return;

    const previousScore = score;
    setScore((current) => current + value);
    setIsVoting(true);

    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonId, value }),
      });

      if (!response.ok) {
        setScore(previousScore);
        return;
      }

      const data = (await response.json()) as { score: number };
      setScore(data.score);
    } catch {
      setScore(previousScore);
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Votar arriba"
        onClick={() => handleVote(1)}
        className="rounded-full border border-neutral-300 px-2 py-1"
      >
        ▲
      </button>
      <span className="min-w-6 text-center">{score}</span>
      <button
        type="button"
        aria-label="Votar abajo"
        onClick={() => handleVote(-1)}
        className="rounded-full border border-neutral-300 px-2 py-1"
      >
        ▼
      </button>
    </div>
  );
}
