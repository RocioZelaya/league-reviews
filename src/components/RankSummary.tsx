import { RankEmblem } from "@/components/ui/RankEmblem";
import { computeWinrate, formatTier } from "@/lib/format";

const EMBLEM_SIZE = 80;

type RankSummaryProps = {
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
  wins: number | null;
  losses: number | null;
};

export function RankSummary({
  tier,
  rank,
  leaguePoints,
  wins,
  losses,
}: RankSummaryProps) {
  if (!tier) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex size-20 items-center justify-center rounded-full border border-dashed border-line-strong font-mono text-xs text-text-mute">
          —
        </div>
        <div>
          <p className="font-mono text-xs tracking-widest text-text-mute uppercase">
            SoloQ
          </p>
          <p className="font-display text-lg font-bold">Sin clasificar</p>
          <p className="text-sm text-text-mute">Sin partidas de ranked.</p>
        </div>
      </div>
    );
  }

  const safeWins = wins ?? 0;
  const safeLosses = losses ?? 0;
  const winrate = computeWinrate(safeWins, safeLosses);

  return (
    <div className="flex items-center gap-4">
      <RankEmblem tier={tier} size={EMBLEM_SIZE} />
      <div className="flex min-w-40 flex-col gap-1.5">
        <p className="font-mono text-xs tracking-widest text-text-mute uppercase">
          SoloQ
        </p>
        <p className="font-display text-lg leading-tight font-bold">
          {formatTier(tier, rank)}
          <span className="ml-2 font-mono text-sm font-medium text-cyan">
            {leaguePoints ?? 0} LP
          </span>
        </p>
        <WinrateBar wins={safeWins} losses={safeLosses} winrate={winrate} />
      </div>
    </div>
  );
}

type WinrateBarProps = {
  wins: number;
  losses: number;
  winrate: number;
};

function WinrateBar({ wins, losses, winrate }: WinrateBarProps) {
  return (
    <div className="flex flex-col gap-1">
      <div
        role="meter"
        aria-label="Winrate"
        aria-valuenow={winrate}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-magenta/60"
      >
        <div className="h-full bg-cyan" style={{ width: `${winrate}%` }} />
      </div>
      <p className="font-mono text-xs text-text-dim">
        <span className="text-cyan">{wins}V</span>
        <span className="text-text-mute"> / </span>
        <span className="text-magenta">{losses}D</span>
        <span className="text-text-mute"> · {winrate}% WR</span>
      </p>
    </div>
  );
}
