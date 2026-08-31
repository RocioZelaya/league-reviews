import type { CommentTag } from "@prisma/client";
import { VoteButtons } from "./VoteButtons";
import { ReportButton } from "./ReportButton";

type CommentItemProps = {
  id: string;
  body: string;
  rating: number;
  nickname: string | null;
  score: number;
  tags: CommentTag[];
};

export function CommentItem({
  id,
  body,
  rating,
  nickname,
  score,
  tags,
}: CommentItemProps) {
  return (
    <li
      id={`comment-${id}`}
      className="rounded-lg border border-neutral-200 p-4"
    >
      <div className="flex items-center justify-between">
        <p className="font-medium">{nickname ?? "Anónimo"}</p>
        <p className="text-yellow-500">{"★".repeat(rating)}</p>
      </div>
      <p className="mt-2 text-neutral-700">{body}</p>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
            >
              {tag.tag.replaceAll("_", " ").toLowerCase()}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <VoteButtons commentId={id} initialScore={score} />
        <ReportButton commentId={id} />
      </div>
    </li>
  );
}
