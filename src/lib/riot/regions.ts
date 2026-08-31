const CONTINENTAL_REGIONS = ["americas", "europe", "asia", "sea"] as const;

export type ContinentalRegion = (typeof CONTINENTAL_REGIONS)[number];

function isContinentalRegion(value: string): value is ContinentalRegion {
  return (CONTINENTAL_REGIONS as readonly string[]).includes(value);
}

function readEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAccountRegion(): ContinentalRegion {
  const value = readEnv("RIOT_ACCOUNT_REGION");
  if (!isContinentalRegion(value)) {
    throw new Error(`Invalid RIOT_ACCOUNT_REGION: ${value}`);
  }
  return value;
}

export function getPlatformRegion(): string {
  return readEnv("RIOT_PLATFORM_REGION");
}

export function getAccountBaseUrl(): string {
  return `https://${getAccountRegion()}.api.riotgames.com`;
}

export function getPlatformBaseUrl(): string {
  return `https://${getPlatformRegion()}.api.riotgames.com`;
}
