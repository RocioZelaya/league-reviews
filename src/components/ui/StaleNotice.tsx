import { RelativeTime } from "./RelativeTime";

type StaleNoticeProps = {
  label: string;
  updatedAt: Date | null;
};

/** Caption shown when a section is served from expired cache because Riot failed. */
export function StaleNotice({ label, updatedAt }: StaleNoticeProps) {
  return (
    <p role="status" className="font-mono text-xs text-magenta">
      {label}
      {updatedAt && (
        <>
          {" · "}
          <RelativeTime timestampMs={updatedAt.getTime()} />
        </>
      )}
    </p>
  );
}
