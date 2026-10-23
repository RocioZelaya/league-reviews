import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MostReviewedAccount } from "@/lib/comments";
import { formatTier } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { formatCount } from "@/lib/i18n/message";
import { buildPlayerPath } from "@/lib/riotId";

type MostReviewedListProps = {
  accounts: MostReviewedAccount[];
  dictionary: Dictionary;
};

export function MostReviewedList({
  accounts,
  dictionary,
}: MostReviewedListProps) {
  const { home, player, rank, tiers } = dictionary;

  if (accounts.length === 0) {
    return <EmptyState title={home.noPlayersTitle} />;
  }

  return (
    <ol className="flex flex-col divide-y divide-line rounded-xl border border-line bg-ink">
      {accounts.map((account, index) => (
        <li key={account.id}>
          <Link
            href={buildPlayerPath(account.gameName, account.tagLine)}
            className="flex items-center gap-3 p-3 transition-colors hover:bg-ink-raised"
          >
            <span className="w-5 font-mono text-sm text-text-mute">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {account.gameName}
                <span className="text-text-mute">#{account.tagLine}</span>
              </p>
              <p className="font-mono text-xs text-text-mute">
                {account.soloTier
                  ? formatTier(account.soloTier, null, tiers)
                  : rank.unranked}
              </p>
            </div>
            <p className="font-mono text-xs text-magenta">
              {formatCount(account.reviewCount, player.reviewCount)}
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
