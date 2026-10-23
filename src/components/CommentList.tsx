import type { Comment, CommentTag } from "@prisma/client";
import { voteValueSchema } from "@/lib/validation";
import { EmptyState } from "@/components/ui/EmptyState";
import { CommentItem } from "./CommentItem";

type CommentWithTags = Comment & {
  tags: CommentTag[];
  votes?: Array<{ value: number }>;
};

/** The viewer's vote is the single row the query filtered by their anonId. */
function readViewerVote(votes: Array<{ value: number }> | undefined) {
  const parsed = voteValueSchema.safeParse(votes?.[0]?.value);
  return parsed.success ? parsed.data : null;
}

type CommentListProps = {
  comments: CommentWithTags[];
};

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay reviews de este jugador."
        description="La primera la dejás vos, arriba."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          id={comment.id}
          body={comment.body}
          rating={comment.rating}
          nickname={comment.nickname}
          score={comment.score}
          tags={comment.tags}
          createdAt={comment.createdAt}
          viewerVote={readViewerVote(comment.votes)}
        />
      ))}
    </ul>
  );
}
