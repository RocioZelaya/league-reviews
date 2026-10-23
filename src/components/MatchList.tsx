import { EmptyState } from "@/components/ui/EmptyState";
import type { MatchSummary } from "@/types";
import { MatchItem } from "./MatchItem";

type MatchListProps = {
  matches: MatchSummary[];
  dataDragonVersion: string;
};

export function MatchList({ matches, dataDragonVersion }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <EmptyState
        title="Sin partidas recientes."
        description="Cuando juegue algo, aparece acá."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {matches.map((match) => (
        <MatchItem
          key={match.matchId}
          match={match}
          dataDragonVersion={dataDragonVersion}
        />
      ))}
    </ul>
  );
}
