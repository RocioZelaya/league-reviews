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

const relativeTimeFormatter = new Intl.RelativeTimeFormat("es", {
  numeric: "auto",
});

export function formatDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / SECONDS_PER_MINUTE);
  const seconds = durationSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatRelativeTime(
  timestampMs: number,
  now = Date.now(),
): string {
  const elapsedMs = timestampMs - now;
  for (const { unit, ms } of RELATIVE_TIME_UNITS) {
    if (Math.abs(elapsedMs) >= ms) {
      return relativeTimeFormatter.format(Math.round(elapsedMs / ms), unit);
    }
  }
  return "hace un momento";
}

const SHORT_UNIT_SUFFIX: Record<RelativeTimeUnit, string> = {
  day: "d",
  hour: "h",
  minute: "min",
};

const absoluteDateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** Deterministic across server and client; shown until relative time is computed. */
export function formatAbsoluteDate(timestampMs: number): string {
  return absoluteDateFormatter.format(new Date(timestampMs));
}

/** Compact variant for dense rows: "2 h", "3 d", "15 min". */
export function formatRelativeTimeShort(
  timestampMs: number,
  now = Date.now(),
): string {
  const elapsedMs = now - timestampMs;
  for (const { unit, ms } of RELATIVE_TIME_UNITS) {
    if (elapsedMs >= ms) {
      return `${Math.round(elapsedMs / ms)} ${SHORT_UNIT_SUFFIX[unit]}`;
    }
  }
  return "ahora";
}

export function formatKdaRatio(
  kills: number,
  deaths: number,
  assists: number,
): string {
  if (deaths === 0) return "Perfect";
  return ((kills + assists) / deaths).toFixed(2);
}

export function computeWinrate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

const ROLE_LABELS: Record<string, string> = {
  TOP: "Top",
  JUNGLE: "Jungla",
  MIDDLE: "Mid",
  BOTTOM: "ADC",
  UTILITY: "Support",
};

export function formatRole(role: string): string {
  return ROLE_LABELS[role] ?? "—";
}

const TIER_LABELS: Record<string, string> = {
  IRON: "Hierro",
  BRONZE: "Bronce",
  SILVER: "Plata",
  GOLD: "Oro",
  PLATINUM: "Platino",
  EMERALD: "Esmeralda",
  DIAMOND: "Diamante",
  MASTER: "Maestro",
  GRANDMASTER: "Gran Maestro",
  CHALLENGER: "Retador",
};

const APEX_TIERS = new Set(["MASTER", "GRANDMASTER", "CHALLENGER"]);

export function formatTier(tier: string, rank: string | null): string {
  const label = TIER_LABELS[tier] ?? tier;
  if (!rank || APEX_TIERS.has(tier)) return label;
  return `${label} ${rank}`;
}
