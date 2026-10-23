import { EmptyState } from "@/components/ui/EmptyState";
import { StaleNotice } from "@/components/ui/StaleNotice";
import type { MatchSummary } from "@/types";
import { MatchItem } from "./MatchItem";

const STALE_LABEL = "Partidas desactualizadas · Riot no respondió";

type MatchListProps = {
  matches: MatchSummary[];
  dataDragonVersion: string;
  updatedAt: Date | null;
  isStale: boolean;
};

export function MatchList({
  matches,
  dataDragonVersion,
  updatedAt,
  isStale,
}: MatchListProps) {
  if (matches.length === 0) {
    return (
      <EmptyState
        title="Sin partidas recientes."
        description="Cuando juegue algo, aparece acá."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {isStale && <StaleNotice label={STALE_LABEL} updatedAt={updatedAt} />}
      <ul className="flex flex-col gap-2">
        {matches.map((match) => (
          <MatchItem
            key={match.matchId}
            match={match}
            dataDragonVersion={dataDragonVersion}
          />
        ))}
      </ul>
    </div>
  );
}
