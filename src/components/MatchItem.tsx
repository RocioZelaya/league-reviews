import type { MatchSummary } from "@/types";

const SECONDS_PER_MINUTE = 60;

function formatDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / SECONDS_PER_MINUTE);
  const seconds = durationSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type MatchItemProps = {
  match: MatchSummary;
};

export function MatchItem({ match }: MatchItemProps) {
  return (
    <li
      className={`flex items-center justify-between rounded-lg border p-3 ${
        match.win ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      <div>
        <p className="font-medium">{match.championName}</p>
        <p className="text-sm text-neutral-500">
          {match.kills}/{match.deaths}/{match.assists} · {match.role}
        </p>
      </div>
      <div className="text-right text-sm text-neutral-500">
        <p>{match.win ? "Victoria" : "Derrota"}</p>
        <p>{formatDuration(match.durationSeconds)}</p>
      </div>
    </li>
  );
}
