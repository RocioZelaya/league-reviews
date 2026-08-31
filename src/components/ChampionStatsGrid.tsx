import type { ChampionStat } from "@/types";

type ChampionStatsGridProps = {
  championStats: ChampionStat[];
};

export function ChampionStatsGrid({ championStats }: ChampionStatsGridProps) {
  if (championStats.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 p-4 text-neutral-500 sm:p-6">
        Sin campeones jugados recientemente.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {championStats.map((stat) => (
        <div
          key={stat.championName}
          className="rounded-lg border border-neutral-200 p-3"
        >
          <p className="font-medium">{stat.championName}</p>
          <p className="text-sm text-neutral-500">
            {stat.games} partidas · {stat.winrate}% WR
          </p>
        </div>
      ))}
    </div>
  );
}
