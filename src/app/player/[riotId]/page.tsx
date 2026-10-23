import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPlayerData } from "@/lib/riot/cache";
import { RiotNotFoundError } from "@/lib/riot/client";
import { getDataDragonVersion } from "@/lib/riot/assets";
import { ANON_ID_COOKIE } from "@/lib/anon";
import { getCommentsForAccount } from "@/lib/comments";
import { summarizeReviews } from "@/lib/reviewSummary";
import { formatRiotId, parseRiotId } from "@/lib/riotId";
import { PlayerCard } from "@/components/PlayerCard";
import { ChampionStatsGrid } from "@/components/ChampionStatsGrid";
import { MatchList } from "@/components/MatchList";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ChampionStat, MatchSummary } from "@/types";

type PlayerPageProps = {
  params: Promise<{ riotId: string }>;
};

function parseRouteParam(riotId: string) {
  return parseRiotId(decodeURIComponent(riotId));
}

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  const { riotId } = await params;
  const { gameName, tagLine } = parseRouteParam(riotId);
  if (!gameName || !tagLine) return {};
  const fullRiotId = formatRiotId(gameName, tagLine);
  return {
    title: fullRiotId,
    description: `Rank, partidas recientes y reviews de ${fullRiotId} en League of Legends.`,
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { riotId } = await params;
  const { gameName, tagLine } = parseRouteParam(riotId);

  if (!gameName || !tagLine) {
    notFound();
  }

  let account;
  try {
    account = await getPlayerData(gameName, tagLine);
  } catch (error) {
    if (error instanceof RiotNotFoundError) {
      notFound();
    }
    throw error;
  }

  const viewerAnonId = (await cookies()).get(ANON_ID_COOKIE)?.value ?? null;
  const [comments, dataDragonVersion] = await Promise.all([
    getCommentsForAccount(account.id, viewerAnonId),
    getDataDragonVersion(),
  ]);
  const matches = (account.lastMatchesData as MatchSummary[] | null) ?? [];
  const championStats = (account.topChampions as ChampionStat[] | null) ?? [];
  const reviewSummary = summarizeReviews(comments);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      <PlayerCard
        gameName={account.gameName}
        tagLine={account.tagLine}
        tier={account.soloTier}
        rank={account.soloRank}
        leaguePoints={account.soloLp}
        wins={account.soloWins}
        losses={account.soloLosses}
        reviewSummary={reviewSummary}
      />

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-5">
          <section className="flex flex-col gap-4">
            <SectionHeading eyebrow="Últimas partidas" title="Campeones" />
            <ChampionStatsGrid
              championStats={championStats}
              dataDragonVersion={dataDragonVersion}
            />
          </section>
          <section className="flex flex-col gap-4">
            <SectionHeading eyebrow="Historial" title="Partidas recientes" />
            <MatchList
              matches={matches}
              dataDragonVersion={dataDragonVersion}
            />
          </section>
        </div>

        <section className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          <SectionHeading
            eyebrow="Lo que dicen"
            title="Reviews"
            action={
              reviewSummary.reviewCount > 0 ? (
                <p className="font-mono text-sm text-text-mute">
                  {reviewSummary.reviewCount}
                </p>
              ) : undefined
            }
          />
          <CommentForm riotAccountId={account.id} />
          <CommentList comments={comments} />
        </section>
      </div>
    </main>
  );
}
