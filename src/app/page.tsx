import { SearchBar } from "@/components/SearchBar";
import { TopCommentsFeed } from "@/components/TopCommentsFeed";
import { getTopComments } from "@/lib/comments";

export default async function Home() {
  const topComments = await getTopComments();

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 p-4 py-16 sm:p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold">League Reviews</h1>
        <p className="max-w-md text-neutral-500">
          Buscá a cualquier jugador de League of Legends por su Riot ID y leé (o
          dejá) reviews sobre cómo es tenerlo de equipo.
        </p>
      </div>
      <SearchBar />
      <section className="flex w-full flex-col items-center gap-4">
        <h2 className="text-xl font-semibold">Top reviews</h2>
        <TopCommentsFeed comments={topComments} />
      </section>
    </main>
  );
}
