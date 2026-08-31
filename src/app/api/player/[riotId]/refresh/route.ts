import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getPlayerData } from "@/lib/riot/cache";
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
  const decoded = decodeURIComponent(riotId);
  const separatorIndex = decoded.indexOf("#");
  const gameName = decoded.slice(0, separatorIndex);
  const tagLine = decoded.slice(separatorIndex + 1);

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: "Riot ID inválido." }, { status: 400 });
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
      return NextResponse.json(
        { error: "Esperá antes de volver a actualizar este perfil." },
        { status: 429 },
      );
    }
    throw error;
  }

  await getPlayerData(gameName, tagLine, true);
  revalidatePath(`/player/${riotId}`);

  return NextResponse.json({ ok: true });
}
