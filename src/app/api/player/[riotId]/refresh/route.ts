import { type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getPlayerData } from "@/lib/riot/cache";
import { RiotApiError, RiotNotFoundError } from "@/lib/riot/client";
import { parseRiotId } from "@/lib/riotId";
import { apiErrorResponse } from "@/lib/apiErrors";
import { hashIp, getClientIp } from "@/lib/hash";
import {
  checkRateLimit,
  RateLimitExceededError,
  REFRESH_RATE_LIMIT,
} from "@/lib/rateLimit";

type RouteContext = {
  params: Promise<{ riotId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { riotId } = await context.params;
  const { gameName, tagLine } = parseRiotId(decodeURIComponent(riotId));

  if (!gameName || !tagLine) {
    return apiErrorResponse("INVALID_INPUT");
  }

  const ipHash = hashIp(getClientIp(request));

  try {
    await checkRateLimit(
      `refresh:${riotId}`,
      ipHash,
      REFRESH_RATE_LIMIT.limit,
      REFRESH_RATE_LIMIT.windowMs,
    );
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return apiErrorResponse("RATE_LIMITED");
    }
    throw error;
  }

  try {
    const { stale } = await getPlayerData(gameName, tagLine, true);
    // A forced refresh that could not update anything is a failure for the
    // caller even though the cached profile still renders.
    if (stale.stats && stale.matches) {
      return apiErrorResponse("UPSTREAM_FAILED");
    }
  } catch (error) {
    if (error instanceof RiotNotFoundError) {
      return apiErrorResponse("NOT_FOUND");
    }
    if (error instanceof RiotApiError) {
      return apiErrorResponse("UPSTREAM_FAILED");
    }
    throw error;
  }

  revalidatePath(`/player/${riotId}`);

  return Response.json({ ok: true });
}
