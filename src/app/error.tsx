"use client";

export default function HomeError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Algo salió mal</h1>
      <p className="text-neutral-500">
        No pudimos cargar la página. Probá de nuevo en un momento.
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
