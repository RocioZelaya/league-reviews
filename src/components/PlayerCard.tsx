type PlayerCardProps = {
  gameName: string;
  tagLine: string;
};

export function PlayerCard({ gameName, tagLine }: PlayerCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4 sm:p-6">
      <h1 className="text-xl font-semibold sm:text-2xl">
        {gameName}
        <span className="text-neutral-500">#{tagLine}</span>
      </h1>
    </div>
  );
}
