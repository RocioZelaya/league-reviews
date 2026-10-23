import Image from "next/image";
import { getChampionIconUrl } from "@/lib/riot/assets";

type ChampionIconProps = {
  championName: string;
  version: string;
  size?: number;
};

const DEFAULT_ICON_SIZE = 40;

export function ChampionIcon({
  championName,
  version,
  size = DEFAULT_ICON_SIZE,
}: ChampionIconProps) {
  return (
    <Image
      src={getChampionIconUrl(championName, version)}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-md border border-line-strong bg-ink-raised"
    />
  );
}
