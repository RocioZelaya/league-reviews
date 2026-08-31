import { db } from "@/lib/db";

export async function getCommentsForAccount(riotAccountId: string) {
  return db.comment.findMany({
    where: { riotAccountId, isHidden: false },
    include: { tags: true },
    orderBy: { createdAt: "desc" },
  });
}
