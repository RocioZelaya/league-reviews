import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-mono text-xs tracking-widest text-magenta uppercase">
        404
      </p>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Esta página no existe
      </h1>
      <p className="text-text-dim">Puede que el link esté roto o viejo.</p>
      <Link
        href="/"
        className="mt-2 font-mono text-sm text-cyan transition-colors hover:text-white"
      >
        ← Volver al inicio
      </Link>
    </main>
  );
}
