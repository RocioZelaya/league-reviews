"use client";

import { ReviewTag } from "@prisma/client";
import { MAX_TAGS_PER_COMMENT } from "@/lib/validation";

const ALL_TAGS = Object.values(ReviewTag);

type TagSelectorProps = {
  selected: ReviewTag[];
  onChange: (tags: ReviewTag[]) => void;
};

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  function toggleTag(tag: ReviewTag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
      return;
    }
    if (selected.length >= MAX_TAGS_PER_COMMENT) {
      return;
    }
    onChange([...selected, tag]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_TAGS.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggleTag(tag)}
            className={`rounded-full border px-3 py-1 text-sm ${
              isSelected
                ? "border-black bg-black text-white"
                : "border-neutral-300 text-neutral-700"
            }`}
          >
            {tag.replaceAll("_", " ").toLowerCase()}
          </button>
        );
      })}
    </div>
  );
}
