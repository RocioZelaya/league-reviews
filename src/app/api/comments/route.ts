import { type NextRequest } from "next/server";
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
import { buildPlayerPath, parseRiotId } from "@/lib/riotId";
import {
  fetchAccountByRiotId,
  RiotApiError,
  RiotNotFoundError,
} from "@/lib/riot/client";
import { platformSchema } from "@/lib/riot/regions";
import { findSharedRecentMatch } from "@/lib/riot/verification";

type Verification = {
  reviewerPuuid: string;
  verifiedMatchId: string;
  verifiedMatchPlayedAt: Date;
};

type VerificationTarget = {
  id: string;
  puuid: string;
  platformRegion: string;
};

class VerificationError extends Error {
  constructor(public readonly code: "SELF_REVIEW" | "NO_SHARED_MATCH") {
    super(`Review verification failed: ${code}`);
    this.name = "VerificationError";
  }
}

/**
 * Resolves the reviewer's puuid without creating a RiotAccount row for them
 * (that would trigger a full stats and match refresh): a cached row is
 * reused when one exists, otherwise Account-V1 is asked directly.
 */
async function resolveReviewerPuuid(riotId: string): Promise<string> {
  const { gameName, tagLine } = parseRiotId(riotId);
  const cached = await db.riotAccount.findFirst({
    where: { gameName, tagLine },
    select: { puuid: true },
  });
  if (cached) return cached.puuid;
  const account = await fetchAccountByRiotId(gameName, tagLine);
  return account.puuid;
}

async function verifyReviewer(
  reviewerRiotId: string,
  target: VerificationTarget,
): Promise<Verification> {
  const reviewerPuuid = await resolveReviewerPuuid(reviewerRiotId);
  if (reviewerPuuid === target.puuid) {
    throw new VerificationError("SELF_REVIEW");
  }

  const platform = platformSchema.safeParse(target.platformRegion);
  if (!platform.success) {
    throw new RiotApiError(
      `Stored platform "${target.platformRegion}" is not a known Riot platform`,
    );
  }

  const shared = await findSharedRecentMatch(
    target.puuid,
    platform.data,
    reviewerPuuid,
  );
  if (!shared) {
    console.info("comment.verify.no_match", { riotAccountId: target.id });
    throw new VerificationError("NO_SHARED_MATCH");
  }
  console.info("comment.verify.matched", {
    riotAccountId: target.id,
    matchId: shared.matchId,
  });
  return {
    reviewerPuuid,
    verifiedMatchId: shared.matchId,
    verifiedMatchPlayedAt: shared.playedAt,
  };
}

export async function POST(request: NextRequest) {
  const parsed = createCommentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return apiErrorResponse("INVALID_INPUT");
  }

  const {
    riotAccountId,
    body,
    rating,
    tags,
    anonId,
    nickname,
    reviewerRiotId,
  } = parsed.data;

  if (containsProfanity(body)) {
    console.info("comment.create.rejected_profanity", { riotAccountId });
    return apiErrorResponse("PROFANITY");
  }

  const ipHash = hashIp(getClientIp(request));

  // Before any Riot call, so probing Riot IDs costs the same as publishing.
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

  const target = await db.riotAccount.findUnique({
    where: { id: riotAccountId },
    select: {
      id: true,
      puuid: true,
      gameName: true,
      tagLine: true,
      platformRegion: true,
    },
  });
  if (!target) {
    return apiErrorResponse("NOT_FOUND");
  }

  let verification: Verification | null = null;
  if (reviewerRiotId) {
    try {
      verification = await verifyReviewer(reviewerRiotId, target);
    } catch (error) {
      if (error instanceof VerificationError) {
        return apiErrorResponse(error.code);
      }
      if (error instanceof RiotNotFoundError) {
        return apiErrorResponse("NOT_FOUND");
      }
      if (error instanceof RiotApiError) {
        console.warn("comment.verify.upstream_failed", {
          riotAccountId,
          status: error.status,
          message: error.message,
        });
        return apiErrorResponse("UPSTREAM_FAILED");
      }
      throw error;
    }
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
        ...verification,
      },
    });
    if (tags.length > 0) {
      await tx.commentTag.createMany({
        data: tags.map((tag) => ({ commentId: created.id, tag })),
      });
    }
    return created;
  });

  revalidatePath(buildPlayerPath(target.gameName, target.tagLine));
  revalidatePath("/");

  return Response.json({ id: comment.id }, { status: 201 });
}
