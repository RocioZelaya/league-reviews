import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createCommentSchema } from "@/lib/validation";
import { containsProfanity } from "@/lib/profanity";
import { apiErrorResponse } from "@/lib/apiErrors";
import { hashIp, getClientIp } from "@/lib/hash";
import {
  checkRateLimit,
  RateLimitExceededError,
  COMMENT_RATE_LIMIT,
} from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const parsed = createCommentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return apiErrorResponse("INVALID_INPUT");
  }

  const { riotAccountId, body, rating, tags, anonId, nickname } = parsed.data;

  if (containsProfanity(body)) {
    console.info("comment.create.rejected_profanity", { riotAccountId });
    return apiErrorResponse("PROFANITY");
  }

  const ipHash = hashIp(getClientIp(request));

  try {
    await checkRateLimit(
      "comment",
      ipHash,
      COMMENT_RATE_LIMIT.limit,
      COMMENT_RATE_LIMIT.windowMs,
    );
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return apiErrorResponse("RATE_LIMITED");
    }
    throw error;
  }

  const comment = await db.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        riotAccountId,
        body,
        rating,
        anonId,
        nickname,
        ipHash,
      },
    });
    if (tags.length > 0) {
      await tx.commentTag.createMany({
        data: tags.map((tag) => ({ commentId: created.id, tag })),
      });
    }
    return created;
  });

  const riotAccount = await db.riotAccount.findUnique({
    where: { id: riotAccountId },
  });
  if (riotAccount) {
    revalidatePath(
      `/player/${encodeURIComponent(`${riotAccount.gameName}#${riotAccount.tagLine}`)}`,
    );
    revalidatePath("/");
  }

  return NextResponse.json({ id: comment.id }, { status: 201 });
}
