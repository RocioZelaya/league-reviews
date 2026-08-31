import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createCommentSchema } from "@/lib/validation";
import { containsProfanity } from "@/lib/profanity";
import { hashIp } from "@/lib/hash";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

export async function POST(request: NextRequest) {
  const parsed = createCommentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de comentario inválidos." },
      { status: 400 },
    );
  }

  const { riotAccountId, body, rating, tags, anonId, nickname } = parsed.data;

  if (containsProfanity(body)) {
    console.info("comment.create.rejected_profanity", { riotAccountId });
    return NextResponse.json(
      { error: "El comentario contiene lenguaje no permitido." },
      { status: 400 },
    );
  }

  const ipHash = hashIp(getClientIp(request));

  const comment = await db.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        riotAccountId,
        body,
        rating,
        anonId,
        nickname,
        ipHash,
      },
    });
    if (tags.length > 0) {
      await tx.commentTag.createMany({
        data: tags.map((tag) => ({ commentId: created.id, tag })),
      });
    }
    return created;
  });

  const riotAccount = await db.riotAccount.findUnique({
    where: { id: riotAccountId },
  });
  if (riotAccount) {
    revalidatePath(
      `/player/${encodeURIComponent(`${riotAccount.gameName}#${riotAccount.tagLine}`)}`,
    );
    revalidatePath("/");
  }

  return NextResponse.json({ id: comment.id }, { status: 201 });
}
