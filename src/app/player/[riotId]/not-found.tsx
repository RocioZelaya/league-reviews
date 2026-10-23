import { SearchBar } from "@/components/SearchBar";

export default function PlayerNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-mono text-xs tracking-widest text-magenta uppercase">
        404
      </p>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Jugador no encontrado
      </h1>
      <p className="text-text-dim">
        No existe ese Riot ID en la región configurada. Revisá el nombre y el
        tag, van separados por #.
      </p>
      <div className="mt-4 w-full">
        <SearchBar />
      </div>
    </main>
  );
}
