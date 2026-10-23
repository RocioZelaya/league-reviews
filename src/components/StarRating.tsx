"use client";

import { useState } from "react";
import { MAX_RATING } from "@/lib/validation";
import { StarIcon } from "@/components/ui/StarIcon";

const RATING_VALUES = Array.from(
  { length: MAX_RATING },
  (_, index) => index + 1,
);

const RATING_LABELS: Record<number, string> = {
  1: "Evitar",
  2: "Flojo",
  3: "Normal",
  4: "Bueno",
  5: "Excelente",
};

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  labelledBy: string;
};

export function StarRating({ value, onChange, labelledBy }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const displayed = hovered || value;

  return (
    <div className="flex items-center gap-3">
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        className="flex gap-0.5"
        onMouseLeave={() => setHovered(0)}
      >
        {RATING_VALUES.map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            className="rounded-sm p-0.5 transition-transform hover:scale-110"
          >
            <StarIcon
              className={`size-7 transition-colors ${
                star <= displayed ? "text-star" : "text-line-strong"
              }`}
            />
          </button>
        ))}
      </div>
      <span
        className="min-w-20 font-mono text-xs text-text-mute"
        aria-live="polite"
      >
        {displayed > 0 ? RATING_LABELS[displayed] : "Elegí un rating"}
      </span>
    </div>
  );
}
