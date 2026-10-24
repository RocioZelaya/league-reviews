import { fetchMatch, fetchRecentMatchIds, RiotNotFoundError } from "./client";
import { getContinentalRegion, type Platform } from "./regions";

/** How far back "recent" reaches when checking that two players met. */
export const RECENT_MATCH_WINDOW = 20;

export type SharedMatch = {
  matchId: string;
  playedAt: Date;
};

// A reviewer from another continent has no history on this routing; Riot
// answers 404 for a puuid it has never seen there, which means "no match".
async function fetchRecentMatchIdsOrEmpty(
  puuid: string,
  region: ReturnType<typeof getContinentalRegion>,
): Promise<string[]> {
  try {
    return await fetchRecentMatchIds(puuid, region, RECENT_MATCH_WINDOW);
  } catch (error) {
    if (error instanceof RiotNotFoundError) return [];
    throw error;
  }
}

/**
 * Newest match among the target's recent games that the reviewer also played,
 * or null. Looks up both histories on the target's continent, intersects them
 * in the target's (newest-first) order, and confirms both puuids on the match
 * itself before trusting the id list.
 */
export async function findSharedRecentMatch(
  targetPuuid: string,
  targetPlatform: Platform,
  reviewerPuuid: string,
): Promise<SharedMatch | null> {
  const region = getContinentalRegion(targetPlatform);
  const [targetIds, reviewerIds] = await Promise.all([
    fetchRecentMatchIdsOrEmpty(targetPuuid, region),
    fetchRecentMatchIdsOrEmpty(reviewerPuuid, region),
  ]);
  const reviewerIdSet = new Set(reviewerIds);
  const sharedId = targetIds.find((id) => reviewerIdSet.has(id));
  if (!sharedId) return null;

  const match = await fetchMatch(sharedId, region);
  const participants = new Set(match.metadata.participants);
  if (!participants.has(targetPuuid) || !participants.has(reviewerPuuid)) {
    return null;
  }
  return {
    matchId: match.metadata.matchId,
    playedAt: new Date(match.info.gameEndTimestamp),
  };
}
