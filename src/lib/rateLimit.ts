import { db } from "@/lib/db";

const ONE_HOUR_MS = 60 * 60 * 1000;
const TWO_MINUTES_MS = 2 * 60 * 1000;

export const COMMENT_RATE_LIMIT = { limit: 5, windowMs: ONE_HOUR_MS };
export const VOTE_RATE_LIMIT = { limit: 30, windowMs: ONE_HOUR_MS };
export const REPORT_RATE_LIMIT = { limit: 10, windowMs: ONE_HOUR_MS };
export const REFRESH_RATE_LIMIT = { limit: 1, windowMs: TWO_MINUTES_MS };

export class RateLimitExceededError extends Error {
  constructor(key: string) {
    super(`Rate limit exceeded for ${key}`);
    this.name = "RateLimitExceededError";
  }
}

export async function checkRateLimit(
  keyPrefix: string,
  ipHash: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const key = `${keyPrefix}:${ipHash}`;
  const now = new Date();

  await db.$transaction(async (tx) => {
    const bucket = await tx.rateLimitBucket.findUnique({ where: { key } });

    if (!bucket || bucket.windowStart.getTime() < now.getTime() - windowMs) {
      await tx.rateLimitBucket.upsert({
        where: { key },
        create: { key, count: 1, windowStart: now },
        update: { count: 1, windowStart: now },
      });
      return;
    }

    if (bucket.count >= limit) {
      console.info("rate_limit.exceeded", { key });
      throw new RateLimitExceededError(key);
    }

    await tx.rateLimitBucket.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
  });
}
