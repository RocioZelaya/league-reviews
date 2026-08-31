import { getAccountBaseUrl, getPlatformBaseUrl } from "./regions";
import type {
  AccountDto,
  LeagueEntryDto,
  MatchDto,
  MatchSummary,
  ResolvedRiotAccount,
} from "./types";

const REQUEST_TIMEOUT_MS = 8000;
const RETRY_AFTER_FALLBACK_SECONDS = 2;
const RECENT_MATCH_COUNT = 5;

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

function readApiKey(): string {
  const apiKey = process.env.RIOT_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required environment variable: RIOT_API_KEY");
  }
  return apiKey;
}

async function riotFetch<T>(url: string, hasRetried = false): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "X-Riot-Token": readApiKey() },
      signal: controller.signal,
    });
  } catch (error) {
    console.error("riot.request.network_error", { url, error });
    throw new RiotApiError("Riot API network error");
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    throw new RiotNotFoundError(url);
  }

  if (response.status === 429) {
    if (hasRetried) {
      console.error("riot.request.rate_limited", { url });
      throw new RiotApiError("Riot API rate limit exceeded", 429);
    }
    const retryAfterSeconds = Number(
      response.headers.get("Retry-After") ?? RETRY_AFTER_FALLBACK_SECONDS,
    );
    await new Promise((resolve) =>
      setTimeout(resolve, retryAfterSeconds * 1000),
    );
    return riotFetch<T>(url, true);
  }

  if (!response.ok) {
    console.error("riot.request.failed", { url, status: response.status });
    throw new RiotApiError(
      `Riot API request failed with status ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function fetchAccountByRiotId(
  gameName: string,
  tagLine: string,
): Promise<AccountDto> {
  const url = `${getAccountBaseUrl()}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch<AccountDto>(url);
}

export async function fetchSoloQueueEntry(
  puuid: string,
): Promise<LeagueEntryDto | null> {
  const url = `${getPlatformBaseUrl()}/lol/league/v4/entries/by-puuid/${puuid}`;
  const entries = await riotFetch<LeagueEntryDto[]>(url);
  return entries.find((entry) => entry.queueType === "RANKED_SOLO_5x5") ?? null;
}

export async function fetchRecentMatchIds(
  puuid: string,
  count: number,
): Promise<string[]> {
  const url = `${getAccountBaseUrl()}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
  return riotFetch<string[]>(url);
}

export async function fetchMatch(matchId: string): Promise<MatchDto> {
  const url = `${getAccountBaseUrl()}/lol/match/v5/matches/${matchId}`;
  return riotFetch<MatchDto>(url);
}

function toMatchSummary(match: MatchDto, puuid: string): MatchSummary {
  const participant = match.info.participants.find((p) => p.puuid === puuid);
  if (!participant) {
    throw new RiotApiError(
      `Participant ${puuid} not found in match ${match.metadata.matchId}`,
    );
  }
  return {
    matchId: match.metadata.matchId,
    championName: participant.championName,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    win: participant.win,
    durationSeconds: match.info.gameDuration,
    playedAt: match.info.gameEndTimestamp,
    role: participant.teamPosition,
  };
}

export async function resolveRiotAccount(
  gameName: string,
  tagLine: string,
): Promise<ResolvedRiotAccount> {
  const account = await fetchAccountByRiotId(gameName, tagLine);

  const [soloQueueEntry, matchIds] = await Promise.all([
    fetchSoloQueueEntry(account.puuid),
    fetchRecentMatchIds(account.puuid, RECENT_MATCH_COUNT),
  ]);

  const matches = await Promise.all(
    matchIds.map((matchId) => fetchMatch(matchId)),
  );

  return {
    puuid: account.puuid,
    gameName: account.gameName,
    tagLine: account.tagLine,
    soloQueueRank: soloQueueEntry
      ? {
          tier: soloQueueEntry.tier,
          rank: soloQueueEntry.rank,
          leaguePoints: soloQueueEntry.leaguePoints,
          wins: soloQueueEntry.wins,
          losses: soloQueueEntry.losses,
        }
      : null,
    matches: matches.map((match) => toMatchSummary(match, account.puuid)),
  };
}
