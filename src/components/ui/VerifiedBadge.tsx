import { RelativeTime } from "./RelativeTime";

type VerifiedBadgeProps = {
  label: string;
  playedAt: Date;
};

/** Marks a review whose author shared a recent match with the reviewed player. */
export function VerifiedBadge({ label, playedAt }: VerifiedBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan-dim/50 px-2.5 py-0.5 text-xs font-medium text-cyan">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-3.5"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      {label}
      <span className="font-mono opacity-80">
        · <RelativeTime timestampMs={playedAt.getTime()} variant="short" />
      </span>
    </span>
  );
}
