"use client";

import { useSyncExternalStore } from "react";
import {
  formatAbsoluteDate,
  formatRelativeTime,
  formatRelativeTimeShort,
} from "@/lib/format";

type RelativeTimeProps = {
  timestampMs: number;
  variant?: "long" | "short";
  className?: string;
};

const FORMATTERS = {
  long: formatRelativeTime,
  short: formatRelativeTimeShort,
};

function subscribeToNothing() {
  return () => {};
}

/** True only after hydration; false on the server and during the first client render. */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/**
 * Relative time that is safe to prerender: the server and the hydrating
 * render both show a timezone-independent absolute date, and the relative
 * label only appears once the client owns the tree, so a statically cached
 * page never freezes "hace un momento" and hydration never mismatches.
 */
export function RelativeTime({
  timestampMs,
  variant = "long",
  className,
}: RelativeTimeProps) {
  const isHydrated = useIsHydrated();
  const label = isHydrated
    ? FORMATTERS[variant](timestampMs)
    : formatAbsoluteDate(timestampMs);

  return (
    <time dateTime={new Date(timestampMs).toISOString()} className={className}>
      {label}
    </time>
  );
}
