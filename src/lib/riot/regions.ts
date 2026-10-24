import { z } from "zod";

export const CONTINENTAL_REGIONS = [
  "americas",
  "europe",
  "asia",
  "sea",
] as const;
export const continentalRegionSchema = z.enum(CONTINENTAL_REGIONS);
export type ContinentalRegion = z.infer<typeof continentalRegionSchema>;

export const PLATFORMS = [
  "br1",
  "eun1",
  "euw1",
  "jp1",
  "kr",
  "la1",
  "la2",
  "na1",
  "oc1",
  "tr1",
  "ru",
  "me1",
  "ph2",
  "sg2",
  "th2",
  "tw2",
  "vn2",
] as const;
export const platformSchema = z.enum(PLATFORMS);
export type Platform = z.infer<typeof platformSchema>;

// League-V4 is served per platform; Account-V1 and Match-V5 per continent.
const PLATFORM_TO_CONTINENTAL: Record<Platform, ContinentalRegion> = {
  br1: "americas",
  la1: "americas",
  la2: "americas",
  na1: "americas",
  eun1: "europe",
  euw1: "europe",
  tr1: "europe",
  ru: "europe",
  me1: "europe",
  jp1: "asia",
  kr: "asia",
  oc1: "sea",
  ph2: "sea",
  sg2: "sea",
  th2: "sea",
  tw2: "sea",
  vn2: "sea",
};

// Account-V1 is global: any continental host answers for every account.
// The env var only picks the nearest host for those lookups.
const DEFAULT_ACCOUNT_REGION: ContinentalRegion = "americas";

export function getContinentalRegion(platform: Platform): ContinentalRegion {
  return PLATFORM_TO_CONTINENTAL[platform];
}

export function getAccountBaseUrl(): string {
  const parsed = continentalRegionSchema.safeParse(
    process.env.RIOT_ACCOUNT_REGION,
  );
  const region = parsed.success ? parsed.data : DEFAULT_ACCOUNT_REGION;
  return `https://${region}.api.riotgames.com`;
}

export function getContinentalBaseUrl(region: ContinentalRegion): string {
  return `https://${region}.api.riotgames.com`;
}

export function getPlatformBaseUrl(platform: Platform): string {
  return `https://${platform}.api.riotgames.com`;
}
