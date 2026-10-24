import Image from "next/image";
import { getRankEmblemUrl } from "@/lib/riot/assets";

type RankEmblemProps = {
  tier: string;
  size?: number;
};

const DEFAULT_EMBLEM_SIZE = 80;

// Community Dragon ships each emblem centered on a 1280x720 canvas with the
// mark itself taking roughly a fifth of the width, so the image is scaled up
// inside a clipped box to show only the mark. The requested source width
// keeps the upscaled mark sharp.
const EMBLEM_SOURCE_WIDTH = "320px";

export function RankEmblem({
  tier,
  size = DEFAULT_EMBLEM_SIZE,
}: RankEmblemProps) {
  return (
    <div
      className="relative shrink-0 overflow-hidden drop-shadow-glow-cyan"
      style={{ width: size, height: size }}
    >
      <Image
        src={getRankEmblemUrl(tier)}
        alt=""
        fill
        priority
        sizes={EMBLEM_SOURCE_WIDTH}
        className="scale-[3.6] object-contain"
      />
    </div>
  );
}
