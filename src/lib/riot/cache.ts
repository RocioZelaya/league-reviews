import type { Prisma, RiotAccount } from "@prisma/client";
import { db } from "@/lib/db";
import { getContinentalRegion, platformSchema, type Platform } from "./regions";
import {
  fetchAccountByRiotId,
  fetchActiveLolPlatform,
  fetchSoloQueueEntry,
  fetchRecentMatchIds,
  fetchMatch,
  isRiotAuthFailure,
  RiotApiError,
  RiotNotFoundError,
} from "./client";
import type { ChampionStat, MatchSummary, StaleSections } from "./types";

export type PlayerData = {
  account: RiotAccount;
  /** A section is stale when its refresh was attempted and failed, so the value shown comes from expired cache. */
  stale: StaleSections;
};

const AUTH_FAILURE_HINT =
  "RIOT_API_KEY rejected: dev keys expire every 24 h, regenerate at developer.riotgames.com";

// Logged once per failed section with serializable fields only: the dev
// overlay forwards server console output to the browser and renders a raw
// Error as "{}".
function logRefreshFailure(
  section: keyof StaleSections,
  gameName: string,
  tagLine: string,
  error: unknown,
): void {
  console.warn(`riot.${section}.refresh_failed`, {
    gameName,
    tagLine,
    status: error instanceof RiotApiError ? error.status : undefined,
    message: error instanceof Error ? error.message : String(error),
    hint: isRiotAuthFailure(error) ? AUTH_FAILURE_HINT : undefined,
  });
}

function computeTopChampions(summaries: MatchSummary[]): ChampionStat[] {
  const byChampion = new Map<string, { games: number; wins: number }>();
  for (const summary of summaries) {
    const entry = byChampion.get(summary.championName) ?? {
      games: 0,
      wins: 0,
    };
    entry.games += 1;
    entry.wins += summary.win ? 1 : 0;
    byChampion.set(summary.championName, entry);
  }
  return Array.from(byChampion.entries())
    .map(([championName, { games, wins }]) => ({
      championName,
      games,
      winrate: Math.round((wins / games) * 100),
    }))
    .sort((a, b) => b.games - a.games);
}

const STATS_TTL_MS = 15 * 60 * 1000;
const MATCHES_TTL_MS = 10 * 60 * 1000;
const RECENT_MATCH_COUNT = 5;

function isStale(updatedAt: Date | null, ttlMs: number): boolean {
  if (!updatedAt) return true;
  return updatedAt.getTime() < Date.now() - ttlMs;
}

/**
 * The platform stored on the row, re-resolved from Riot when the stored value
 * is missing or invalid (rows created before auto-detection) or when a forced
 * refresh asks for it (players transfer regions).
 */
async function resolvePlatform(
  account: RiotAccount,
  forceResolve: boolean,
): Promise<Platform> {
  const stored = platformSchema.safeParse(account.platformRegion);
  if (stored.success && !forceResolve) return stored.data;

  const platform = await fetchActiveLolPlatform(account.puuid);
  if (!platform) {
    throw new RiotNotFoundError(`lol account for puuid ${account.puuid}`);
  }
  if (platform !== account.platformRegion) {
    await db.riotAccount.update({
      where: { id: account.id },
      data: { platformRegion: platform },
    });
  }
  return platform;
}

async function refreshStats(
  account: RiotAccount,
  platform: Platform,
): Promise<Prisma.RiotAccountUpdateInput> {
  const entry = await fetchSoloQueueEntry(account.puuid, platform);
  return {
    soloTier: entry?.tier ?? null,
    soloRank: entry?.rank ?? null,
    soloLp: entry?.leaguePoints ?? null,
    soloWins: entry?.wins ?? null,
    soloLosses: entry?.losses ?? null,
    statsUpdatedAt: new Date(),
  };
}

async function refreshMatches(
  account: RiotAccount,
  platform: Platform,
): Promise<Prisma.RiotAccountUpdateInput> {
  const region = getContinentalRegion(platform);
  const matchIds = await fetchRecentMatchIds(
    account.puuid,
    region,
    RECENT_MATCH_COUNT,
  );
  const matches = await Promise.all(
    matchIds.map((id) => fetchMatch(id, region)),
  );
  const summaries: MatchSummary[] = matches.map((match) => {
    const participant = match.info.participants.find(
      (p) => p.puuid === account.puuid,
    );
    if (!participant) {
      throw new RiotApiError(
        `Participant not found in match ${match.metadata.matchId}`,
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
  });
  return {
    lastMatchIds: matchIds,
    lastMatchesData: summaries,
    topChampions: computeTopChampions(summaries),
    matchesUpdatedAt: new Date(),
  };
}

async function refreshExisting(
  existing: RiotAccount,
  forceRefresh: boolean,
): Promise<PlayerData> {
  const { gameName, tagLine } = existing;
  const updates: Prisma.RiotAccountUpdateInput = {};
  const stale: StaleSections = { stats: false, matches: false };
  const needsStats =
    forceRefresh || isStale(existing.statsUpdatedAt, STATS_TTL_MS);
  const needsMatches =
    forceRefresh || isStale(existing.matchesUpdatedAt, MATCHES_TTL_MS);

  if (!needsStats && !needsMatches) {
    console.info("riot.player.cache_hit", { gameName, tagLine });
    return { account: existing, stale };
  }

  let platform: Platform;
  try {
    platform = await resolvePlatform(existing, forceRefresh);
  } catch (error) {
    // Without a platform nothing can be refreshed; serve the cache as stale.
    logRefreshFailure("stats", gameName, tagLine, error);
    return { account: existing, stale: { stats: true, matches: true } };
  }

  if (needsStats) {
    try {
      Object.assign(updates, await refreshStats(existing, platform));
    } catch (error) {
      stale.stats = true;
      logRefreshFailure("stats", gameName, tagLine, error);
    }
  }
  if (needsMatches) {
    try {
      Object.assign(updates, await refreshMatches(existing, platform));
    } catch (error) {
      stale.matches = true;
      logRefreshFailure("matches", gameName, tagLine, error);
    }
  }
  if (Object.keys(updates).length === 0) {
    return { account: existing, stale };
  }
  const account = await db.riotAccount.update({
    where: { id: existing.id },
    data: updates,
  });
  return { account, stale };
}

export async function getPlayerData(
  gameName: string,
  tagLine: string,
  forceRefresh = false,
): Promise<PlayerData> {
  const existing = await db.riotAccount.findFirst({
    where: { gameName, tagLine },
  });
  if (existing) {
    return refreshExisting(existing, forceRefresh);
  }

  const account = await fetchAccountByRiotId(gameName, tagLine);
  const platform = await fetchActiveLolPlatform(account.puuid);
  if (!platform) {
    throw new RiotNotFoundError(`lol account for ${gameName}#${tagLine}`);
  }
  const created = await db.riotAccount.create({
    data: {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      platformRegion: platform,
    },
  });

  const [statsUpdates, matchUpdates] = await Promise.all([
    refreshStats(created, platform),
    refreshMatches(created, platform),
  ]);

  const updated = await db.riotAccount.update({
    where: { id: created.id },
    data: { ...statsUpdates, ...matchUpdates },
  });
  return { account: updated, stale: { stats: false, matches: false } };
}
