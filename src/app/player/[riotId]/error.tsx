"use client";

export default function PlayerError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">No pudimos cargar este perfil</h1>
      <p className="text-neutral-500">
        Puede ser un problema temporal con la API de Riot. Probá de nuevo.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-black px-4 py-2 text-white"
      >
        Reintentar
      </button>
    </main>
  );
}
