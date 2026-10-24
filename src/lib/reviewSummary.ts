import type { ReviewTag } from "@prisma/client";

type ReviewLike = {
  rating: number;
  tags: Array<{ tag: ReviewTag }>;
};

export type TagCount = {
  tag: ReviewTag;
  count: number;
};

export type ReviewSummary = {
  reviewCount: number;
  averageRating: number | null;
  topTags: TagCount[];
};

export const TOP_TAGS_LIMIT = 3;
const RATING_DECIMALS = 1;

/** Aggregates rating and tag usage across a player's visible reviews. */
export function summarizeReviews(reviews: ReviewLike[]): ReviewSummary {
  if (reviews.length === 0) {
    return { reviewCount: 0, averageRating: null, topTags: [] };
  }

  const ratingTotal = reviews.reduce(
    (total, review) => total + review.rating,
    0,
  );
  const tagCounts = new Map<ReviewTag, number>();
  for (const review of reviews) {
    for (const { tag } of review.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const topTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_TAGS_LIMIT);

  return {
    reviewCount: reviews.length,
    averageRating: Number(
      (ratingTotal / reviews.length).toFixed(RATING_DECIMALS),
    ),
    topTags,
  };
}
