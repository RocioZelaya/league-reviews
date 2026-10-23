"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewTag } from "@prisma/client";
import {
  getClientAnonId,
  getClientNickname,
  setClientNickname,
} from "@/lib/anon";
import { MAX_COMMENT_LENGTH, MAX_NICKNAME_LENGTH } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InlineError } from "@/components/ui/InlineError";
import { StarRating } from "./StarRating";
import { TagSelector } from "./TagSelector";

const MISSING_RATING_MESSAGE = "Elegí un rating de 1 a 5 estrellas.";
const MISSING_SESSION_MESSAGE =
  "No se pudo identificar tu sesión. Recargá la página.";
const PUBLISH_FAILED_MESSAGE = "No se pudo publicar la review.";

const FIELD_CLASSES =
  "rounded-md border border-line-strong bg-void px-3 py-2 text-text placeholder:text-text-mute focus:border-cyan focus:shadow-glow-cyan focus:outline-none";

type CommentFormProps = {
  riotAccountId: string;
};

export function CommentForm({ riotAccountId }: CommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [nickname, setNickname] = useState(() => getClientNickname() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (rating === 0) {
      setError(MISSING_RATING_MESSAGE);
      return;
    }

    const anonId = getClientAnonId();
    if (!anonId) {
      setError(MISSING_SESSION_MESSAGE);
      return;
    }

    const trimmedNickname = nickname.trim();
    if (trimmedNickname) {
      setClientNickname(trimmedNickname);
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riotAccountId,
          body,
          rating,
          tags,
          anonId,
          nickname: trimmedNickname || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? PUBLISH_FAILED_MESSAGE);
        return;
      }

      setBody("");
      setRating(0);
      setTags([]);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card raised className="p-4 sm:p-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <p id="comment-rating-label" className="text-sm text-text-dim">
            ¿Cómo es jugar con esta persona?
          </p>
          <StarRating
            value={rating}
            onChange={setRating}
            labelledBy="comment-rating-label"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <textarea
            id="comment-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            placeholder="Contá cómo fue. Sin insultos, que se filtran."
            aria-label="Review"
            rows={4}
            className={`${FIELD_CLASSES} resize-y`}
          />
          <p className="self-end font-mono text-xs text-text-mute">
            {body.length}/{MAX_COMMENT_LENGTH}
          </p>
        </div>

        <TagSelector selected={tags} onChange={setTags} />

        <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={MAX_NICKNAME_LENGTH}
            placeholder="Tu nombre (opcional)"
            aria-label="Nickname"
            autoComplete="nickname"
            className={`${FIELD_CLASSES} h-10 sm:max-w-56`}
          />
          <Button
            type="submit"
            disabled={isSubmitting || body.trim().length === 0}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Publicando" : "Publicar review"}
          </Button>
        </div>
        <InlineError message={error} />
      </form>
    </Card>
  );
}
