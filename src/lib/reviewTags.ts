import { ReviewTag } from "@prisma/client";

export type TagSentiment = "positive" | "negative";

export const REVIEW_TAG_SENTIMENT: Record<ReviewTag, TagSentiment> = {
  GOOD_SHOTCALLER: "positive",
  GOOD_CARRY: "positive",
  TEAM_PLAYER: "positive",
  GOOD_MECHANICS: "positive",
  FRIENDLY: "positive",
  TOXIC_FLAMER: "negative",
  INTING: "negative",
  BAD_ATTITUDE: "negative",
  GOES_AFK: "negative",
};

export const ALL_REVIEW_TAGS = Object.values(ReviewTag);
