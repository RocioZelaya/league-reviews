import { z } from "zod";

const DATA_DRAGON_BASE_URL = "https://ddragon.leagueoflegends.com";
const COMMUNITY_DRAGON_EMBLEM_BASE_URL =
  "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem";

// Used only if the versions endpoint is unreachable: champion icons still
// resolve against an older patch, so the page never renders without art.
const FALLBACK_DATA_DRAGON_VERSION = "16.21.1";
const VERSION_REVALIDATE_SECONDS = 60 * 60 * 24;

// Match-V5 reports a few champion names that differ from the Data Dragon
// image filename.
const CHAMPION_IMAGE_NAME_OVERRIDES: Record<string, string> = {
  FiddleSticks: "Fiddlesticks",
};

const dataDragonVersionsSchema = z.array(z.string()).nonempty();

/**
 * Resolves the current Data Dragon patch version. Cached by Next for a day;
 * falls back to a pinned version if the request fails.
 */
export async function getDataDragonVersion(): Promise<string> {
  try {
    const response = await fetch(`${DATA_DRAGON_BASE_URL}/api/versions.json`, {
      next: { revalidate: VERSION_REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      throw new Error(`Data Dragon versions returned ${response.status}`);
    }
    const parsed = dataDragonVersionsSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new Error("Data Dragon versions payload has unexpected shape");
    }
    return parsed.data[0];
  } catch (error) {
    console.warn("riot.assets.version_fallback", { error });
    return FALLBACK_DATA_DRAGON_VERSION;
  }
}

export function getChampionIconUrl(
  championName: string,
  version: string,
): string {
  const imageName = CHAMPION_IMAGE_NAME_OVERRIDES[championName] ?? championName;
  return `${DATA_DRAGON_BASE_URL}/cdn/${version}/img/champion/${imageName}.png`;
}

export function getRankEmblemUrl(tier: string): string {
  return `${COMMUNITY_DRAGON_EMBLEM_BASE_URL}/emblem-${tier.toLowerCase()}.png`;
}
