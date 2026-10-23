import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MostReviewedAccount } from "@/lib/comments";
import { formatTier } from "@/lib/format";
import { buildPlayerPath } from "@/lib/riotId";

type MostReviewedListProps = {
  accounts: MostReviewedAccount[];
};

export function MostReviewedList({ accounts }: MostReviewedListProps) {
  if (accounts.length === 0) {
    return <EmptyState title="Nadie tiene reviews todavía." />;
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
                  ? formatTier(account.soloTier, null)
                  : "Sin clasificar"}
              </p>
            </div>
            <p className="font-mono text-sm text-magenta">
              {account.reviewCount}
              <span className="ml-1 text-xs text-text-mute">
                {account.reviewCount === 1 ? "review" : "reviews"}
              </span>
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
