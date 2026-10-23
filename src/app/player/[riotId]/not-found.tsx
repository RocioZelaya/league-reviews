import { SearchBar } from "@/components/SearchBar";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/server";

export default async function PlayerNotFound() {
  const { errors } = getDictionary(await getLocale());
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-mono text-xs tracking-widest text-magenta uppercase">
        404
      </p>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        {errors.playerNotFoundTitle}
      </h1>
      <p className="text-text-dim">{errors.playerNotFoundDescription}</p>
      <div className="mt-4 w-full">
        <SearchBar />
      </div>
    </main>
  );
}
