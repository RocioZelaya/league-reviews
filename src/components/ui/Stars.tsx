import { MAX_RATING } from "@/lib/validation";
import { StarIcon } from "./StarIcon";

type StarsProps = {
  rating: number;
  size?: "sm" | "md";
};

const SIZE_CLASSES = {
  sm: "size-3.5",
  md: "size-5",
};

/** Read-only star display. For the interactive picker use `StarRating`. */
export function Stars({ rating, size = "sm" }: StarsProps) {
  return (
    <span
      role="img"
      aria-label={`${rating} de ${MAX_RATING} estrellas`}
      className="inline-flex gap-0.5"
    >
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <StarIcon
          key={index}
          className={`${SIZE_CLASSES[size]} ${index < rating ? "text-star" : "text-line-strong"}`}
        />
      ))}
    </span>
  );
}
