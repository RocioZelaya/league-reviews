import { notFound } from "next/navigation";
import { getPlayerData } from "@/lib/riot/cache";
import { RiotNotFoundError } from "@/lib/riot/client";
import { PlayerCard } from "@/components/PlayerCard";
import { RankSummary } from "@/components/RankSummary";
import { ChampionStatsGrid } from "@/components/ChampionStatsGrid";
import { MatchList } from "@/components/MatchList";
import type { ChampionStat, MatchSummary } from "@/types";

function parseRiotId(riotId: string): { gameName: string; tagLine: string } {
  const decoded = decodeURIComponent(riotId);
  const separatorIndex = decoded.indexOf("#");
  return {
    gameName: decoded.slice(0, separatorIndex),
    tagLine: decoded.slice(separatorIndex + 1),
  };
}

type PlayerPageProps = {
  params: Promise<{ riotId: string }>;
};

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { riotId } = await params;
  const { gameName, tagLine } = parseRiotId(riotId);

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

  const matches = (account.lastMatchesData as MatchSummary[] | null) ?? [];
  const championStats = (account.topChampions as ChampionStat[] | null) ?? [];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <PlayerCard gameName={account.gameName} tagLine={account.tagLine} />
      <RankSummary
        tier={account.soloTier}
        rank={account.soloRank}
        leaguePoints={account.soloLp}
        wins={account.soloWins}
        losses={account.soloLosses}
      />
      <ChampionStatsGrid championStats={championStats} />
      <MatchList matches={matches} />
    </main>
  );
}
