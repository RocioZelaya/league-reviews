import { ReviewTag } from "@prisma/client";

export type TagSentiment = "positive" | "negative";

export type ReviewTagMeta = {
  label: string;
  sentiment: TagSentiment;
};

export const REVIEW_TAG_META: Record<ReviewTag, ReviewTagMeta> = {
  GOOD_SHOTCALLER: { label: "Buen shotcaller", sentiment: "positive" },
  GOOD_CARRY: { label: "Carry", sentiment: "positive" },
  TEAM_PLAYER: { label: "Juega en equipo", sentiment: "positive" },
  GOOD_MECHANICS: { label: "Buenas mecánicas", sentiment: "positive" },
  FRIENDLY: { label: "Buena onda", sentiment: "positive" },
  TOXIC_FLAMER: { label: "Tóxico", sentiment: "negative" },
  INTING: { label: "Inteador", sentiment: "negative" },
  BAD_ATTITUDE: { label: "Mala actitud", sentiment: "negative" },
  GOES_AFK: { label: "Se va AFK", sentiment: "negative" },
};

export const ALL_REVIEW_TAGS = Object.values(ReviewTag);
