import { ChampionIcon } from "@/components/ui/ChampionIcon";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { formatDuration, formatKdaRatio, formatRole } from "@/lib/format";
import type { MatchSummary } from "@/types";

type MatchItemProps = {
  match: MatchSummary;
  dataDragonVersion: string;
};

export function MatchItem({ match, dataDragonVersion }: MatchItemProps) {
  const outcomeColor = match.win ? "bg-cyan" : "bg-magenta";
  const outcomeText = match.win ? "text-cyan" : "text-magenta";

  return (
    <li className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-line bg-ink p-3 pl-4">
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${outcomeColor}`}
      />
      <ChampionIcon
        championName={match.championName}
        version={dataDragonVersion}
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2">
          <span className="truncate font-medium">{match.championName}</span>
          <span
            className={`shrink-0 font-display text-xs font-bold ${outcomeText}`}
          >
            <span aria-hidden="true">{match.win ? "V" : "D"}</span>
            <span className="sr-only">
              {match.win ? "Victoria" : "Derrota"}
            </span>
          </span>
        </p>
        <p className="truncate font-mono text-xs text-text-mute">
          {formatRole(match.role)} · {formatDuration(match.durationSeconds)} ·{" "}
          <RelativeTime timestampMs={match.playedAt} variant="short" />
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-sm tabular-nums">
          {match.kills}
          <span className="text-text-mute">/</span>
          <span className="text-magenta">{match.deaths}</span>
          <span className="text-text-mute">/</span>
          {match.assists}
        </p>
        <p className="font-mono text-xs text-text-mute">
          {formatKdaRatio(match.kills, match.deaths, match.assists)} KDA
        </p>
      </div>
    </li>
  );
}
