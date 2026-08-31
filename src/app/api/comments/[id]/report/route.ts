import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reportSchema } from "@/lib/validation";
import { hashIp, getClientIp } from "@/lib/hash";
import {
  checkRateLimit,
  RateLimitExceededError,
  REPORT_RATE_LIMIT,
} from "@/lib/rateLimit";

const AUTO_HIDE_REPORT_THRESHOLD = 5;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: commentId } = await context.params;
  const parsed = reportSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Reporte inválido." }, { status: 400 });
  }

  const { anonId, reason } = parsed.data;

  try {
    await checkRateLimit(
      "report",
      hashIp(getClientIp(request)),
      REPORT_RATE_LIMIT.limit,
      REPORT_RATE_LIMIT.windowMs,
    );
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json(
        { error: "Alcanzaste el límite de reportes por hora." },
        { status: 429 },
      );
    }
    throw error;
  }

  const reportCount = await db.$transaction(async (tx) => {
    await tx.report.upsert({
      where: { commentId_anonId: { commentId, anonId } },
      create: { commentId, anonId, reason },
      update: { reason },
    });

    const count = await tx.report.count({ where: { commentId } });

    if (count >= AUTO_HIDE_REPORT_THRESHOLD) {
      await tx.comment.update({
        where: { id: commentId },
        data: { isHidden: true },
      });
      console.info("comment.report.auto_hidden", { commentId, count });
    }

    return count;
  });

  return NextResponse.json({ reportCount });
}
