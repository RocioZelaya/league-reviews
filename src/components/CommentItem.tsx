import type { CommentTag } from "@prisma/client";
import { Stars } from "@/components/ui/Stars";
import { TagBadge } from "@/components/ui/TagBadge";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { interpolate } from "@/lib/i18n/message";
import { MAX_RATING, type VoteValue } from "@/lib/validation";
import { VoteButtons } from "./VoteButtons";
import { ReportButton } from "./ReportButton";

type CommentItemProps = {
  id: string;
  body: string;
  rating: number;
  nickname: string | null;
  score: number;
  tags: CommentTag[];
  createdAt: Date;
  verifiedMatchPlayedAt: Date | null;
  viewerVote: VoteValue | null;
  dictionary: Dictionary;
};

export function CommentItem({
  id,
  body,
  rating,
  nickname,
  score,
  tags,
  createdAt,
  verifiedMatchPlayedAt,
  viewerVote,
  dictionary,
}: CommentItemProps) {
  const { comments, rating: ratingCopy, reviewTags } = dictionary;
  return (
    <li
      id={`comment-${id}`}
      className="flex scroll-mt-20 flex-col gap-3 rounded-xl border border-line bg-ink p-4 target:border-cyan target:shadow-glow-cyan"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {nickname ?? comments.anonymous}
          </p>
          <p className="font-mono text-xs text-text-mute">
            <RelativeTime timestampMs={createdAt.getTime()} />
          </p>
          {verifiedMatchPlayedAt && (
            <div className="mt-1.5">
              <VerifiedBadge
                label={comments.verifiedBadge}
                playedAt={verifiedMatchPlayedAt}
              />
            </div>
          )}
        </div>
        <Stars
          rating={rating}
          label={interpolate(ratingCopy.outOf, { rating, max: MAX_RATING })}
        />
      </div>
      <p className="whitespace-pre-line text-text-dim">{body}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag.tag} label={reviewTags[tag.tag]} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-line pt-3">
        <VoteButtons
          commentId={id}
          initialScore={score}
          initialVote={viewerVote}
        />
        <ReportButton commentId={id} />
      </div>
    </li>
  );
}
