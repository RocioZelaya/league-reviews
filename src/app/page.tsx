import { SearchBar } from "@/components/SearchBar";
import { TopCommentsFeed } from "@/components/TopCommentsFeed";
import { MostReviewedList } from "@/components/MostReviewedList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getMostReviewedAccounts, getTopComments } from "@/lib/comments";

export default async function Home() {
  const [topComments, mostReviewed] = await Promise.all([
    getTopComments(),
    getMostReviewedAccounts(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12 sm:py-20">
      <section className="flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-xs tracking-widest text-cyan uppercase">
          Reviews anónimas de jugadores
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          ¿Cómo es tenerlo de <span className="text-magenta">equipo</span>?
        </h1>
        <p className="max-w-md text-text-dim text-balance">
          Buscá a cualquier jugador de League of Legends por su Riot ID, mirá
          cómo viene jugando y leé lo que dicen de él.
        </p>
        <SearchBar />
      </section>

      <div className="flex flex-col gap-10 lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <SectionHeading eyebrow="Lo más votado" title="Top reviews" />
          <TopCommentsFeed comments={topComments} />
        </section>
        <aside className="flex flex-col gap-4 lg:w-72 lg:shrink-0">
          <SectionHeading eyebrow="Más comentados" title="Jugadores" />
          <MostReviewedList accounts={mostReviewed} />
        </aside>
      </div>
    </main>
  );
}
