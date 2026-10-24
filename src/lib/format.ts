import type { Locale } from "@/lib/i18n/locale";

const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

type RelativeTimeUnit = "day" | "hour" | "minute";

const RELATIVE_TIME_UNITS: Array<{ unit: RelativeTimeUnit; ms: number }> = [
  { unit: "day", ms: MS_PER_DAY },
  { unit: "hour", ms: MS_PER_HOUR },
  { unit: "minute", ms: MS_PER_MINUTE },
];

const RELATIVE_TIME_FORMATTERS: Record<Locale, Intl.RelativeTimeFormat> = {
  en: new Intl.RelativeTimeFormat("en", { numeric: "auto" }),
  es: new Intl.RelativeTimeFormat("es", { numeric: "auto" }),
};

// UTC keeps the output identical on the server and in the browser.
const ABSOLUTE_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
};

const ABSOLUTE_DATE_FORMATTERS: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en", ABSOLUTE_DATE_OPTIONS),
  es: new Intl.DateTimeFormat("es", ABSOLUTE_DATE_OPTIONS),
};

const SHORT_UNIT_SUFFIX: Record<RelativeTimeUnit, string> = {
  day: "d",
  hour: "h",
  minute: "min",
};

export type TimeLabels = {
  justNow: string;
  now: string;
};

export function formatDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / SECONDS_PER_MINUTE);
  const seconds = durationSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatRelativeTime(
  timestampMs: number,
  locale: Locale,
  labels: TimeLabels,
  now = Date.now(),
): string {
  const elapsedMs = timestampMs - now;
  for (const { unit, ms } of RELATIVE_TIME_UNITS) {
    if (Math.abs(elapsedMs) >= ms) {
      return RELATIVE_TIME_FORMATTERS[locale].format(
        Math.round(elapsedMs / ms),
        unit,
      );
    }
  }
  return labels.justNow;
}

/** Compact variant for dense rows: "2 h", "3 d", "15 min". */
export function formatRelativeTimeShort(
  timestampMs: number,
  labels: TimeLabels,
  now = Date.now(),
): string {
  const elapsedMs = now - timestampMs;
  for (const { unit, ms } of RELATIVE_TIME_UNITS) {
    if (elapsedMs >= ms) {
      return `${Math.round(elapsedMs / ms)} ${SHORT_UNIT_SUFFIX[unit]}`;
    }
  }
  return labels.now;
}

/** Deterministic across server and client; shown until relative time is computed. */
export function formatAbsoluteDate(
  timestampMs: number,
  locale: Locale,
): string {
  return ABSOLUTE_DATE_FORMATTERS[locale].format(new Date(timestampMs));
}

export function formatKdaRatio(
  kills: number,
  deaths: number,
  assists: number,
  perfectLabel: string,
): string {
  if (deaths === 0) return perfectLabel;
  return ((kills + assists) / deaths).toFixed(2);
}

export function computeWinrate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

const UNKNOWN_ROLE_LABEL = "—";

export function formatRole(
  role: string,
  labels: Record<string, string>,
): string {
  return labels[role] ?? UNKNOWN_ROLE_LABEL;
}

const APEX_TIERS = new Set(["MASTER", "GRANDMASTER", "CHALLENGER"]);

export function formatTier(
  tier: string,
  rank: string | null,
  labels: Record<string, string>,
): string {
  const label = labels[tier] ?? tier;
  if (!rank || APEX_TIERS.has(tier)) return label;
  return `${label} ${rank}`;
}
