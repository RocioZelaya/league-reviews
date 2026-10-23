"use client";

import { useSyncExternalStore } from "react";
import { useDictionary, useLocale } from "@/components/i18n/LocaleProvider";
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
 * The server and the hydrating render both show a timezone-independent
 * absolute date; the relative label only appears once the client owns the
 * tree, so the two never disagree and hydration never mismatches.
 */
export function RelativeTime({
  timestampMs,
  variant = "long",
  className,
}: RelativeTimeProps) {
  const isHydrated = useIsHydrated();
  const locale = useLocale();
  const { time } = useDictionary();

  let label: string;
  if (!isHydrated) {
    label = formatAbsoluteDate(timestampMs, locale);
  } else if (variant === "short") {
    label = formatRelativeTimeShort(timestampMs, time);
  } else {
    label = formatRelativeTime(timestampMs, locale, time);
  }

  return (
    <time dateTime={new Date(timestampMs).toISOString()} className={className}>
      {label}
    </time>
  );
}
