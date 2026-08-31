import { db } from "@/lib/db";

export async function getCommentsForAccount(riotAccountId: string) {
  return db.comment.findMany({
    where: { riotAccountId, isHidden: false },
    include: { tags: true },
    orderBy: { createdAt: "desc" },
  });
}

const DEFAULT_TOP_COMMENTS_LIMIT = 20;

export async function getTopComments(limit = DEFAULT_TOP_COMMENTS_LIMIT) {
  return db.comment.findMany({
    where: { isHidden: false },
    include: { tags: true, riotAccount: true },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}
