import type { Comment, CommentTag } from "@prisma/client";
import { voteValueSchema } from "@/lib/validation";
import type { Dictionary } from "@/lib/i18n/dictionary";
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
  dictionary: Dictionary;
};

export function CommentList({ comments, dictionary }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <EmptyState
        title={dictionary.comments.noneTitle}
        description={dictionary.comments.noneDescription}
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
          verifiedMatchPlayedAt={comment.verifiedMatchPlayedAt}
          viewerVote={readViewerVote(comment.votes)}
          dictionary={dictionary}
        />
      ))}
    </ul>
  );
}
