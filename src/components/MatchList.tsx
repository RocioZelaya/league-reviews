import { EmptyState } from "@/components/ui/EmptyState";
import { StaleNotice } from "@/components/ui/StaleNotice";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { MatchSummary } from "@/types";
import { MatchItem } from "./MatchItem";

type MatchListProps = {
  matches: MatchSummary[];
  dataDragonVersion: string;
  updatedAt: Date | null;
  isStale: boolean;
  dictionary: Dictionary;
};

export function MatchList({
  matches,
  dataDragonVersion,
  updatedAt,
  isStale,
  dictionary,
}: MatchListProps) {
  if (matches.length === 0) {
    return (
      <EmptyState
        title={dictionary.player.noMatchesTitle}
        description={dictionary.player.noMatchesDescription}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {isStale && (
        <StaleNotice label={dictionary.match.outdated} updatedAt={updatedAt} />
      )}
      <ul className="flex flex-col gap-2">
        {matches.map((match) => (
          <MatchItem
            key={match.matchId}
            match={match}
            dataDragonVersion={dataDragonVersion}
            dictionary={dictionary}
          />
        ))}
      </ul>
    </div>
  );
}
