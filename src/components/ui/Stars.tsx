import { MAX_RATING } from "@/lib/validation";
import { StarIcon } from "./StarIcon";

type StarsProps = {
  rating: number;
  /** Accessible name, e.g. "4 out of 5 stars"; pass the localized string. */
  label: string;
  size?: "sm" | "md";
};

const SIZE_CLASSES = {
  sm: "size-3.5",
  md: "size-5",
};

/** Read-only star display. For the interactive picker use `StarRating`. */
export function Stars({ rating, label, size = "sm" }: StarsProps) {
  return (
    <span role="img" aria-label={label} className="inline-flex gap-0.5">
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <StarIcon
          key={index}
          className={`${SIZE_CLASSES[size]} ${index < rating ? "text-star" : "text-line-strong"}`}
        />
      ))}
    </span>
  );
}
