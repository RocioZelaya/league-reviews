import type { Prisma, RiotAccount } from "@prisma/client";
import { db } from "@/lib/db";
import { getPlatformRegion } from "./regions";
import {
  fetchAccountByRiotId,
  fetchSoloQueueEntry,
  fetchRecentMatchIds,
  fetchMatch,
} from "./client";
import type { ChampionStat, MatchSummary } from "./types";

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

async function refreshStats(
  account: RiotAccount,
): Promise<Prisma.RiotAccountUpdateInput> {
  const entry = await fetchSoloQueueEntry(account.puuid);
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
): Promise<Prisma.RiotAccountUpdateInput> {
  const matchIds = await fetchRecentMatchIds(account.puuid, RECENT_MATCH_COUNT);
  const matches = await Promise.all(matchIds.map((id) => fetchMatch(id)));
  const summaries: MatchSummary[] = matches.map((match) => {
    const participant = match.info.participants.find(
      (p) => p.puuid === account.puuid,
    );
    if (!participant) {
      throw new Error(
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

export async function getPlayerData(
  gameName: string,
  tagLine: string,
  forceRefresh = false,
): Promise<RiotAccount> {
  const existing = await db.riotAccount.findFirst({
    where: { gameName, tagLine },
  });

  if (existing) {
    const updates: Prisma.RiotAccountUpdateInput = {};
    if (forceRefresh || isStale(existing.statsUpdatedAt, STATS_TTL_MS)) {
      try {
        Object.assign(updates, await refreshStats(existing));
      } catch (error) {
        console.error("riot.stats.refresh_failed", {
          gameName,
          tagLine,
          error,
        });
      }
    }
    if (forceRefresh || isStale(existing.matchesUpdatedAt, MATCHES_TTL_MS)) {
      try {
        Object.assign(updates, await refreshMatches(existing));
      } catch (error) {
        console.error("riot.matches.refresh_failed", {
          gameName,
          tagLine,
          error,
        });
      }
    }
    if (Object.keys(updates).length === 0) {
      console.info("riot.player.cache_hit", { gameName, tagLine });
      return existing;
    }
    return db.riotAccount.update({ where: { id: existing.id }, data: updates });
  }

  const account = await fetchAccountByRiotId(gameName, tagLine);
  const created = await db.riotAccount.create({
    data: {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      platformRegion: getPlatformRegion(),
    },
  });

  const [statsUpdates, matchUpdates] = await Promise.all([
    refreshStats(created),
    refreshMatches(created),
  ]);

  return db.riotAccount.update({
    where: { id: created.id },
    data: { ...statsUpdates, ...matchUpdates },
  });
}
