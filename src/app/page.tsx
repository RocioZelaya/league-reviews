import { SearchBar } from "@/components/SearchBar";
import { TopCommentsFeed } from "@/components/TopCommentsFeed";
import { MostReviewedList } from "@/components/MostReviewedList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getMostReviewedAccounts, getTopComments } from "@/lib/comments";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/server";

export default async function Home() {
  const [topComments, mostReviewed, locale] = await Promise.all([
    getTopComments(),
    getMostReviewedAccounts(),
    getLocale(),
  ]);
  const dictionary = getDictionary(locale);
  const { home } = dictionary;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12 sm:py-20">
      <section className="flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-xs tracking-widest text-cyan uppercase">
          {home.eyebrow}
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          {home.heroTitleBefore}
          <span className="text-magenta">{home.heroTitleHighlight}</span>
          {home.heroTitleAfter}
        </h1>
        <p className="max-w-md text-text-dim text-balance">{home.subtitle}</p>
        <SearchBar />
      </section>

      <div className="flex flex-col gap-10 lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <SectionHeading
            eyebrow={home.topReviewsEyebrow}
            title={home.topReviewsTitle}
          />
          <TopCommentsFeed comments={topComments} dictionary={dictionary} />
        </section>
        <aside className="flex flex-col gap-4 lg:w-72 lg:shrink-0">
          <SectionHeading
            eyebrow={home.mostReviewedEyebrow}
            title={home.mostReviewedTitle}
          />
          <MostReviewedList accounts={mostReviewed} dictionary={dictionary} />
        </aside>
      </div>
    </main>
  );
}
