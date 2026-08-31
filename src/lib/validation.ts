import { z } from "zod";
import { ReviewTag } from "@prisma/client";

export const MAX_COMMENT_LENGTH = 1000;
export const MAX_TAGS_PER_COMMENT = 3;

export const createCommentSchema = z.object({
  riotAccountId: z.string().min(1),
  body: z.string().min(1).max(MAX_COMMENT_LENGTH),
  rating: z.number().int().min(1).max(5),
  tags: z.array(z.nativeEnum(ReviewTag)).max(MAX_TAGS_PER_COMMENT),
  anonId: z.string().uuid(),
  nickname: z.string().min(1).max(50).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const voteSchema = z.object({
  anonId: z.string().uuid(),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type VoteInput = z.infer<typeof voteSchema>;

export const reportSchema = z.object({
  anonId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
