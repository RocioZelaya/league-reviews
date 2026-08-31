"use client";

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
};

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1">
      {RATING_VALUES.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} estrellas`}
          onClick={() => onChange(star)}
          className={`text-2xl ${star <= value ? "text-yellow-500" : "text-neutral-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
