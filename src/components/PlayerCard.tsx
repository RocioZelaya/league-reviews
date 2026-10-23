import { Card } from "@/components/ui/Card";
import { Stars } from "@/components/ui/Stars";
import { TagBadge } from "@/components/ui/TagBadge";
import type { ReviewSummary } from "@/lib/reviewSummary";
import { formatRiotId } from "@/lib/riotId";
import { RankSummary } from "./RankSummary";
import { RefreshButton } from "./RefreshButton";

type PlayerCardProps = {
  gameName: string;
  tagLine: string;
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
  wins: number | null;
  losses: number | null;
  reviewSummary: ReviewSummary;
};

export function PlayerCard({
  gameName,
  tagLine,
  tier,
  rank,
  leaguePoints,
  wins,
  losses,
  reviewSummary,
}: PlayerCardProps) {
  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-magenta/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="min-w-0 font-display text-2xl font-bold tracking-tight break-words sm:text-4xl">
            {gameName}
            <span className="text-text-mute">#{tagLine}</span>
          </h1>
          <div className="shrink-0">
            <RefreshButton riotId={formatRiotId(gameName, tagLine)} />
          </div>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <ReviewSummaryBlock summary={reviewSummary} />
          <RankSummary
            tier={tier}
            rank={rank}
            leaguePoints={leaguePoints}
            wins={wins}
            losses={losses}
          />
        </div>
      </div>
    </Card>
  );
}

function ReviewSummaryBlock({ summary }: { summary: ReviewSummary }) {
  if (summary.reviewCount === 0 || summary.averageRating === null) {
    return (
      <p className="text-sm text-text-mute">
        Todavía nadie dejó una review. Sé la primera persona.
      </p>
    );
  }

  const reviewLabel = summary.reviewCount === 1 ? "review" : "reviews";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Stars rating={Math.round(summary.averageRating)} size="md" />
        <p className="font-mono text-sm">
          <span className="text-star">{summary.averageRating.toFixed(1)}</span>
          <span className="text-text-mute">
            {" "}
            · {summary.reviewCount} {reviewLabel}
          </span>
        </p>
      </div>
      {summary.topTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {summary.topTags.map(({ tag, count }) => (
            <TagBadge key={tag} tag={tag} count={count} />
          ))}
        </div>
      )}
    </div>
  );
}
