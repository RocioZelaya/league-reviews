import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/server";

export default async function NotFound() {
  const { errors } = getDictionary(await getLocale());
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-mono text-xs tracking-widest text-magenta uppercase">
        404
      </p>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        {errors.notFoundTitle}
      </h1>
      <p className="text-text-dim">{errors.notFoundDescription}</p>
      <Link
        href="/"
        className="mt-2 font-mono text-sm text-cyan transition-colors hover:text-white"
      >
        {errors.backHome}
      </Link>
    </main>
  );
}
