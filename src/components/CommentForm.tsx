"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewTag } from "@prisma/client";
import { getClientAnonId, getClientNickname } from "@/lib/anon";
import { MAX_COMMENT_LENGTH } from "@/lib/validation";
import { StarRating } from "./StarRating";
import { TagSelector } from "./TagSelector";

type CommentFormProps = {
  riotAccountId: string;
};

export function CommentForm({ riotAccountId }: CommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Elegí un rating de 1 a 5 estrellas.");
      return;
    }

    const anonId = getClientAnonId();
    if (!anonId) {
      setError("No se pudo identificar tu sesión. Recargá la página.");
      return;
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
          nickname: getClientNickname() ?? undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "No se pudo publicar el comentario.");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={MAX_COMMENT_LENGTH}
        placeholder="Contá cómo es jugar con esta persona..."
        aria-label="Comentario"
        className="min-h-24 rounded-lg border border-neutral-300 p-3"
      />
      <TagSelector selected={tags} onChange={setTags} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting || body.trim().length === 0}
        className="self-start rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        Publicar review
      </button>
    </form>
  );
}
