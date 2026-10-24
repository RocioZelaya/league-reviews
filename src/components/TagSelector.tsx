"use client";

import type { ReviewTag } from "@prisma/client";
import { MAX_TAGS_PER_COMMENT } from "@/lib/validation";
import {
  ALL_REVIEW_TAGS,
  REVIEW_TAG_SENTIMENT,
  type TagSentiment,
} from "@/lib/reviewTags";
import { useDictionary } from "@/components/i18n/LocaleProvider";

type TagSelectorProps = {
  selected: ReviewTag[];
  onChange: (tags: ReviewTag[]) => void;
};

const SELECTED_CLASSES: Record<TagSentiment, string> = {
  positive: "border-cyan bg-cyan text-void",
  negative: "border-magenta bg-magenta text-void",
};

const IDLE_CLASSES: Record<TagSentiment, string> = {
  positive:
    "border-line-strong text-text-dim hover:border-cyan hover:text-cyan",
  negative:
    "border-line-strong text-text-dim hover:border-magenta hover:text-magenta",
};

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const { commentForm, reviewTags } = useDictionary();
  const isAtLimit = selected.length >= MAX_TAGS_PER_COMMENT;

  function toggleTag(tag: ReviewTag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((current) => current !== tag));
      return;
    }
    if (isAtLimit) return;
    onChange([...selected, tag]);
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 flex w-full items-center justify-between text-sm">
        <span className="text-text-dim">{commentForm.tagsLegend}</span>
        <span className="font-mono text-xs text-text-mute">
          {selected.length}/{MAX_TAGS_PER_COMMENT}
        </span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {ALL_REVIEW_TAGS.map((tag) => {
          const sentiment = REVIEW_TAG_SENTIMENT[tag];
          const isSelected = selected.includes(tag);
          const isDisabled = !isSelected && isAtLimit;
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={isSelected}
              disabled={isDisabled}
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? SELECTED_CLASSES[sentiment]
                  : IDLE_CLASSES[sentiment]
              }`}
            >
              {reviewTags[tag]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
