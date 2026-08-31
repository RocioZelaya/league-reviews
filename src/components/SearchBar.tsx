"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RIOT_ID_PATTERN = /^.+#.+$/;

export function SearchBar() {
  const router = useRouter();
  const [riotId, setRiotId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = riotId.trim();

    if (!RIOT_ID_PATTERN.test(trimmed)) {
      setError("Usá el formato Nombre#Tag, por ejemplo Faker#KR1.");
      return;
    }

    setError(null);
    router.push(`/player/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-2"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={riotId}
          onChange={(event) => setRiotId(event.target.value)}
          placeholder="Nombre#Tag"
          aria-label="Riot ID"
          className="flex-1 rounded-lg border border-neutral-300 px-4 py-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Buscar
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
