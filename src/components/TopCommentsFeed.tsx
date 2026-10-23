import Link from "next/link";
import type { Comment, CommentTag } from "@prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stars } from "@/components/ui/Stars";
import { TagBadge } from "@/components/ui/TagBadge";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { formatTier } from "@/lib/format";
import { buildPlayerPath, formatRiotId } from "@/lib/riotId";
import { VoteButtons } from "./VoteButtons";

type TopComment = Comment & {
  tags: CommentTag[];
  riotAccount: { gameName: string; tagLine: string; soloTier: string | null };
};

type TopCommentsFeedProps = {
  comments: TopComment[];
};

const ANONYMOUS_LABEL = "Anónimo";

export function TopCommentsFeed({ comments }: TopCommentsFeedProps) {
  if (comments.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay reviews publicadas."
        description="Buscá a alguien y dejá la primera."
      />
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {comments.map((comment, index) => {
        const { gameName, tagLine, soloTier } = comment.riotAccount;
        const playerHref = `${buildPlayerPath(gameName, tagLine)}#comment-${comment.id}`;
        return (
          <li
            key={comment.id}
            className="flex gap-4 rounded-xl border border-line bg-ink p-4"
          >
            <span
              aria-hidden="true"
              className="hidden w-6 shrink-0 pt-0.5 text-right font-mono text-sm text-text-mute sm:block"
            >
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={playerHref}
                    className="font-display font-bold break-all transition-colors hover:text-cyan"
                  >
                    {formatRiotId(gameName, tagLine)}
                  </Link>
                  <p className="font-mono text-xs text-text-mute">
                    {soloTier ? formatTier(soloTier, null) : "Sin clasificar"}
                    {" · "}
                    {comment.nickname ?? ANONYMOUS_LABEL}
                    {" · "}
                    <RelativeTime timestampMs={comment.createdAt.getTime()} />
                  </p>
                </div>
                <Stars rating={comment.rating} />
              </div>
              <p className="line-clamp-4 whitespace-pre-line text-text-dim">
                {comment.body}
              </p>
              {comment.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {comment.tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag.tag} />
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between border-t border-line pt-3">
                <VoteButtons
                  commentId={comment.id}
                  initialScore={comment.score}
                />
                <Link
                  href={playerHref}
                  className="font-mono text-xs text-text-mute transition-colors hover:text-cyan"
                >
                  Ver perfil →
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
