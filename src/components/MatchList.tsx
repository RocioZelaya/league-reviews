import type { MatchSummary } from "@/types";
import { MatchItem } from "./MatchItem";

type MatchListProps = {
  matches: MatchSummary[];
};

export function MatchList({ matches }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 p-4 text-neutral-500 sm:p-6">
        Sin partidas recientes.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {matches.map((match) => (
        <MatchItem key={match.matchId} match={match} />
      ))}
    </ul>
  );
}
