import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/server";

const CHAMPION_SKELETON_COUNT = 3;
const MATCH_SKELETON_COUNT = 5;
const COMMENT_SKELETON_COUNT = 2;

function Skeleton({ className }: { className: string }) {
  return (
    <div aria-hidden="true" className={`skeleton rounded-xl ${className}`} />
  );
}

export default async function PlayerLoading() {
  const { player } = getDictionary(await getLocale());
  return (
    <main
      aria-busy="true"
      aria-label={player.loading}
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8"
    >
      <Skeleton className="h-44" />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-5">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-32" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: CHAMPION_SKELETON_COUNT }, (_, index) => (
                <Skeleton key={index} className="h-16" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-40" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: MATCH_SKELETON_COUNT }, (_, index) => (
                <Skeleton key={index} className="h-16" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-7">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-72" />
          {Array.from({ length: COMMENT_SKELETON_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      </div>
    </main>
  );
}
