"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewTag } from "@prisma/client";
import {
  getClientAnonId,
  getClientNickname,
  setClientNickname,
} from "@/lib/anon";
import { readApiErrorCode } from "@/lib/apiErrors";
import { apiErrorMessage } from "@/lib/i18n/apiErrorMessage";
import { MAX_COMMENT_LENGTH, MAX_NICKNAME_LENGTH } from "@/lib/validation";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InlineError } from "@/components/ui/InlineError";
import { StarRating } from "./StarRating";
import { TagSelector } from "./TagSelector";

const FIELD_CLASSES =
  "rounded-md border border-line-strong bg-void px-3 py-2 text-text placeholder:text-text-mute focus:border-cyan focus:shadow-glow-cyan focus:outline-none";

type CommentFormProps = {
  riotAccountId: string;
};

export function CommentForm({ riotAccountId }: CommentFormProps) {
  const router = useRouter();
  const dictionary = useDictionary();
  const { commentForm, rating: ratingCopy, errors } = dictionary;
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
      setError(commentForm.missingRating);
      return;
    }

    const anonId = getClientAnonId();
    if (!anonId) {
      setError(errors.sessionMissing);
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
        const code = await readApiErrorCode(response);
        setError(apiErrorMessage(code, dictionary, errors.publishFailed));
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
            {ratingCopy.prompt}
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
            placeholder={commentForm.bodyPlaceholder}
            aria-label={commentForm.bodyLabel}
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
            placeholder={commentForm.nicknamePlaceholder}
            aria-label={commentForm.nicknameLabel}
            autoComplete="nickname"
            className={`${FIELD_CLASSES} h-10 sm:max-w-56`}
          />
          <Button
            type="submit"
            disabled={isSubmitting || body.trim().length === 0}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? commentForm.submitting : commentForm.submit}
          </Button>
        </div>
        <InlineError message={error} />
      </form>
    </Card>
  );
}
