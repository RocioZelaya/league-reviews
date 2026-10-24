import type { z } from "zod";
import {
  getAccountBaseUrl,
  getContinentalBaseUrl,
  getPlatformBaseUrl,
  type ContinentalRegion,
  type Platform,
} from "./regions";
import {
  accountDtoSchema,
  activeShardDtoSchema,
  leagueEntriesSchema,
  matchDtoSchema,
  matchIdsSchema,
  type AccountDto,
  type LeagueEntryDto,
  type MatchDto,
} from "./types";

const REQUEST_TIMEOUT_MS = 8000;
const RETRY_AFTER_FALLBACK_SECONDS = 2;
const SOLO_QUEUE_TYPE = "RANKED_SOLO_5x5";

export class RiotNotFoundError extends Error {
  constructor(resource: string) {
    super(`Riot resource not found: ${resource}`);
    this.name = "RiotNotFoundError";
  }
}

export class RiotApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "RiotApiError";
  }
}

const AUTH_FAILURE_STATUSES = new Set([401, 403]);

/** True when Riot rejected the API key itself (expired dev key, wrong key). */
export function isRiotAuthFailure(error: unknown): boolean {
  return (
    error instanceof RiotApiError &&
    error.status !== undefined &&
    AUTH_FAILURE_STATUSES.has(error.status)
  );
}

function readApiKey(): string {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required environment variable: RIOT_API_KEY");
  }
  return apiKey;
}

async function riotFetch<T>(
  url: string,
  schema: z.ZodType<T>,
  hasRetried = false,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "X-Riot-Token": readApiKey() },
      signal: controller.signal,
    });
  } catch (error) {
    console.warn("riot.request.network_error", {
      url,
      message: error instanceof Error ? error.message : String(error),
    });
    throw new RiotApiError("Riot API network error");
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    throw new RiotNotFoundError(url);
  }

  if (response.status === 429) {
    if (hasRetried) {
      console.warn("riot.request.rate_limited", { url });
      throw new RiotApiError("Riot API rate limit exceeded", 429);
    }
    const retryAfterSeconds = Number(
      response.headers.get("Retry-After") ?? RETRY_AFTER_FALLBACK_SECONDS,
    );
    await new Promise((resolve) =>
      setTimeout(resolve, retryAfterSeconds * 1000),
    );
    return riotFetch(url, schema, true);
  }

  if (!response.ok) {
    throw new RiotApiError(
      `Riot API request failed with status ${response.status}`,
      response.status,
    );
  }

  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) {
    console.warn("riot.request.unexpected_payload", {
      url,
      issues: parsed.error.issues.length,
    });
    throw new RiotApiError("Riot API payload has unexpected shape");
  }
  return parsed.data;
}

export async function fetchAccountByRiotId(
  gameName: string,
  tagLine: string,
): Promise<AccountDto> {
  const url = `${getAccountBaseUrl()}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch(url, accountDtoSchema);
}

/** The platform where this account plays League, or null if it has no League account. */
export async function fetchActiveLolPlatform(
  puuid: string,
): Promise<Platform | null> {
  const url = `${getAccountBaseUrl()}/riot/account/v1/region/by-game/lol/by-puuid/${puuid}`;
  try {
    const shard = await riotFetch(url, activeShardDtoSchema);
    return shard.region;
  } catch (error) {
    if (error instanceof RiotNotFoundError) return null;
    throw error;
  }
}

export async function fetchSoloQueueEntry(
  puuid: string,
  platform: Platform,
): Promise<LeagueEntryDto | null> {
  const url = `${getPlatformBaseUrl(platform)}/lol/league/v4/entries/by-puuid/${puuid}`;
  const entries = await riotFetch(url, leagueEntriesSchema);
  return entries.find((entry) => entry.queueType === SOLO_QUEUE_TYPE) ?? null;
}

export async function fetchRecentMatchIds(
  puuid: string,
  region: ContinentalRegion,
  count: number,
): Promise<string[]> {
  const url = `${getContinentalBaseUrl(region)}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
  return riotFetch(url, matchIdsSchema);
}

export async function fetchMatch(
  matchId: string,
  region: ContinentalRegion,
): Promise<MatchDto> {
  const url = `${getContinentalBaseUrl(region)}/lol/match/v5/matches/${matchId}`;
  return riotFetch(url, matchDtoSchema);
}
