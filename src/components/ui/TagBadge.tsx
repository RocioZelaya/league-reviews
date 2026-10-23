import type { ReviewTag } from "@prisma/client";
import { REVIEW_TAG_META, type TagSentiment } from "@/lib/reviewTags";

type TagBadgeProps = {
  tag: ReviewTag;
  count?: number;
};

const SENTIMENT_CLASSES: Record<TagSentiment, string> = {
  positive: "border-cyan/30 bg-cyan-dim/40 text-cyan",
  negative: "border-magenta/30 bg-magenta-dim/40 text-magenta",
};

export function TagBadge({ tag, count }: TagBadgeProps) {
  const { label, sentiment } = REVIEW_TAG_META[tag];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${SENTIMENT_CLASSES[sentiment]}`}
    >
      {label}
      {count !== undefined && (
        <span className="font-mono opacity-70">×{count}</span>
      )}
    </span>
  );
}
