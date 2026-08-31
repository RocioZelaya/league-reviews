import Link from "next/link";
import type { Comment, CommentTag, RiotAccount } from "@prisma/client";

type TopComment = Comment & { tags: CommentTag[]; riotAccount: RiotAccount };

type TopCommentsFeedProps = {
  comments: TopComment[];
};

export function TopCommentsFeed({ comments }: TopCommentsFeedProps) {
  if (comments.length === 0) {
    return (
      <p className="text-neutral-500">Todavía no hay reviews publicadas.</p>
    );
  }

  return (
    <ul className="flex w-full max-w-2xl flex-col gap-3">
      {comments.map((comment) => {
        const riotId = `${comment.riotAccount.gameName}#${comment.riotAccount.tagLine}`;
        return (
          <li
            key={comment.id}
            className="rounded-lg border border-neutral-200 p-4"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/player/${encodeURIComponent(riotId)}#comment-${comment.id}`}
                className="font-medium underline"
              >
                {riotId}
              </Link>
              <p className="text-yellow-500">{"★".repeat(comment.rating)}</p>
            </div>
            <p className="mt-2 text-neutral-700">{comment.body}</p>
            <p className="mt-2 text-sm text-neutral-500">
              Score: {comment.score}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
