import { db } from "@/lib/db";

/**
 * Visible comments for a player, newest first. When `viewerAnonId` is given,
 * each comment also carries that viewer's vote (at most one, by unique index)
 * so the UI can render the active arrow without a round-trip.
 */
export async function getCommentsForAccount(
  riotAccountId: string,
  viewerAnonId: string | null,
) {
  return db.comment.findMany({
    where: { riotAccountId, isHidden: false },
    include: {
      tags: true,
      votes: viewerAnonId
        ? { where: { anonId: viewerAnonId }, select: { value: true } }
        : false,
    },
    orderBy: { createdAt: "desc" },
  });
}

const DEFAULT_TOP_COMMENTS_LIMIT = 20;

export async function getTopComments(limit = DEFAULT_TOP_COMMENTS_LIMIT) {
  return db.comment.findMany({
    where: { isHidden: false },
    include: {
      tags: true,
      riotAccount: {
        select: { gameName: true, tagLine: true, soloTier: true },
      },
    },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export type MostReviewedAccount = {
  id: string;
  gameName: string;
  tagLine: string;
  soloTier: string | null;
  reviewCount: number;
};

const DEFAULT_MOST_REVIEWED_LIMIT = 5;

export async function getMostReviewedAccounts(
  limit = DEFAULT_MOST_REVIEWED_LIMIT,
): Promise<MostReviewedAccount[]> {
  const grouped = await db.comment.groupBy({
    by: ["riotAccountId"],
    where: { isHidden: false },
    _count: { _all: true },
    orderBy: { _count: { riotAccountId: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const accounts = await db.riotAccount.findMany({
    where: { id: { in: grouped.map((group) => group.riotAccountId) } },
    select: { id: true, gameName: true, tagLine: true, soloTier: true },
  });
  const accountsById = new Map(
    accounts.map((account) => [account.id, account]),
  );

  return grouped.flatMap((group) => {
    const account = accountsById.get(group.riotAccountId);
    if (!account) return [];
    return [{ ...account, reviewCount: group._count._all }];
  });
}
