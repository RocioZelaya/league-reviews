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
  const [error, setError] = useState<string | null>(null);

  async function handleVote(value: 1 | -1) {
    const anonId = getClientAnonId();
    if (!anonId || isVoting) return;

    const previousScore = score;
    setScore((current) => current + value);
    setIsVoting(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonId, value }),
      });

      if (!response.ok) {
        setScore(previousScore);
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "No se pudo registrar el voto.");
        return;
      }

      const data = (await response.json()) as { score: number };
      setScore(data.score);
    } catch {
      setScore(previousScore);
      setError("No se pudo registrar el voto.");
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
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
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
