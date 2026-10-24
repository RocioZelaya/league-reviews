import type { ReviewTag } from "@prisma/client";
import { REVIEW_TAG_SENTIMENT, type TagSentiment } from "@/lib/reviewTags";

type TagBadgeProps = {
  tag: ReviewTag;
  label: string;
  count?: number;
};

const SENTIMENT_CLASSES: Record<TagSentiment, string> = {
  positive: "border-cyan/30 bg-cyan-dim/40 text-cyan",
  negative: "border-magenta/30 bg-magenta-dim/40 text-magenta",
};

export function TagBadge({ tag, label, count }: TagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${SENTIMENT_CLASSES[REVIEW_TAG_SENTIMENT[tag]]}`}
    >
      {label}
      {count !== undefined && (
        <span className="font-mono opacity-70">×{count}</span>
      )}
    </span>
  );
}
