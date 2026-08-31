type RankSummaryProps = {
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
  wins: number | null;
  losses: number | null;
};

export function RankSummary({
  tier,
  rank,
  leaguePoints,
  wins,
  losses,
}: RankSummaryProps) {
  if (!tier) {
    return (
      <div className="rounded-lg border border-neutral-200 p-4 text-neutral-500 sm:p-6">
        Sin partidas clasificatorias de soloQ.
      </div>
    );
  }

  const totalGames = (wins ?? 0) + (losses ?? 0);
  const winrate =
    totalGames > 0 ? Math.round(((wins ?? 0) / totalGames) * 100) : 0;

  return (
    <div className="rounded-lg border border-neutral-200 p-4 sm:p-6">
      <p className="text-lg font-medium">
        {tier} {rank} · {leaguePoints} LP
      </p>
      <p className="text-neutral-500">
        {wins}V / {losses}D ({winrate}% winrate)
      </p>
    </div>
  );
}
