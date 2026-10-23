export const RIOT_ID_SEPARATOR = "#";

export type ParsedRiotId = {
  gameName: string;
  tagLine: string;
};

export function formatRiotId(gameName: string, tagLine: string): string {
  return `${gameName}${RIOT_ID_SEPARATOR}${tagLine}`;
}

export function buildPlayerPath(gameName: string, tagLine: string): string {
  return `/player/${encodeURIComponent(formatRiotId(gameName, tagLine))}`;
}

/** Splits a raw `Name#Tag` string; either part may be empty if malformed. */
export function parseRiotId(riotId: string): ParsedRiotId {
  const separatorIndex = riotId.indexOf(RIOT_ID_SEPARATOR);
  if (separatorIndex === -1) {
    return { gameName: riotId, tagLine: "" };
  }
  return {
    gameName: riotId.slice(0, separatorIndex),
    tagLine: riotId.slice(separatorIndex + 1),
  };
}
