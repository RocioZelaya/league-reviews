import { ChampionIcon } from "@/components/ui/ChampionIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { formatCount } from "@/lib/i18n/message";
import type { ChampionStat } from "@/types";

type ChampionStatsGridProps = {
  championStats: ChampionStat[];
  dataDragonVersion: string;
  dictionary: Dictionary;
};

const WINRATE_HIGHLIGHT_THRESHOLD = 50;
const CHAMPION_ICON_SIZE = 36;

export function ChampionStatsGrid({
  championStats,
  dataDragonVersion,
  dictionary,
}: ChampionStatsGridProps) {
  if (championStats.length === 0) {
    return <EmptyState title={dictionary.player.noChampions} />;
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {championStats.map((stat) => (
        <li
          key={stat.championName}
          className="flex items-center gap-3 rounded-xl border border-line bg-ink p-3"
        >
          <ChampionIcon
            championName={stat.championName}
            version={dataDragonVersion}
            size={CHAMPION_ICON_SIZE}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{stat.championName}</p>
            <p className="font-mono text-xs text-text-mute">
              {formatCount(stat.games, dictionary.match.games)} ·{" "}
              <span
                className={
                  stat.winrate >= WINRATE_HIGHLIGHT_THRESHOLD
                    ? "text-cyan"
                    : "text-magenta"
                }
              >
                {stat.winrate}%
              </span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
