import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { voteSchema, type VoteValue } from "@/lib/validation";
import { hashIp, getClientIp } from "@/lib/hash";
import {
  checkRateLimit,
  RateLimitExceededError,
  VOTE_RATE_LIMIT,
} from "@/lib/rateLimit";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: commentId } = await context.params;
  const parsed = voteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Voto inválido." }, { status: 400 });
  }

  const { anonId, value } = parsed.data;

  try {
    await checkRateLimit(
      "vote",
      hashIp(getClientIp(request)),
      VOTE_RATE_LIMIT.limit,
      VOTE_RATE_LIMIT.windowMs,
    );
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json(
        { error: "Alcanzaste el límite de votos por hora." },
        { status: 429 },
      );
    }
    throw error;
  }

  const { comment, resultingVote } = await db.$transaction(async (tx) => {
    const existingVote = await tx.vote.findUnique({
      where: { commentId_anonId: { commentId, anonId } },
    });

    let resultingVote: VoteValue | null = value;
    if (existingVote?.value === value) {
      await tx.vote.delete({ where: { id: existingVote.id } });
      resultingVote = null;
    } else if (existingVote) {
      await tx.vote.update({
        where: { id: existingVote.id },
        data: { value },
      });
    } else {
      await tx.vote.create({ data: { commentId, anonId, value } });
    }

    const [upvotes, downvotes] = await Promise.all([
      tx.vote.count({ where: { commentId, value: 1 } }),
      tx.vote.count({ where: { commentId, value: -1 } }),
    ]);

    const updated = await tx.comment.update({
      where: { id: commentId },
      data: { upvotes, downvotes, score: upvotes - downvotes },
    });
    return { comment: updated, resultingVote };
  });

  return NextResponse.json({
    upvotes: comment.upvotes,
    downvotes: comment.downvotes,
    score: comment.score,
    vote: resultingVote,
  });
}
