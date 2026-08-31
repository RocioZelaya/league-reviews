import type { Comment, CommentTag } from "@prisma/client";
import { CommentItem } from "./CommentItem";

type CommentWithTags = Comment & { tags: CommentTag[] };

type CommentListProps = {
  comments: CommentWithTags[];
};

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-neutral-500">
        Todavía no hay reviews de este jugador.
      </p>
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
        />
      ))}
    </ul>
  );
}
