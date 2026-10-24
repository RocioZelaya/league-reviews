"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { InlineError } from "@/components/ui/InlineError";
import { RIOT_ID_PATTERN } from "@/lib/riotId";

type SearchBarProps = {
  compact?: boolean;
};

export function SearchBar({ compact = false }: SearchBarProps) {
  const router = useRouter();
  const { search } = useDictionary();
  const [riotId, setRiotId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = riotId.trim();

    if (!RIOT_ID_PATTERN.test(trimmed)) {
      setError(search.invalidFormat);
      return;
    }

    setError(null);
    router.push(`/player/${encodeURIComponent(trimmed)}`);
  }

  const inputHeight = compact ? "h-9 text-sm" : "h-12 text-base";

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex w-full flex-col gap-2 ${compact ? "" : "max-w-xl"}`}
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={riotId}
          onChange={(event) => {
            setRiotId(event.target.value);
            if (error) setError(null);
          }}
          placeholder={search.placeholder}
          aria-label={search.inputLabel}
          autoComplete="off"
          spellCheck={false}
          className={`${inputHeight} min-w-0 flex-1 rounded-md border border-line-strong bg-ink px-4 font-mono text-text placeholder:text-text-mute focus:border-cyan focus:shadow-glow-cyan focus:outline-none`}
        />
        <Button
          type="submit"
          size={compact ? "sm" : "md"}
          className={compact ? "h-9" : "h-12 px-6"}
        >
          {search.submit}
        </Button>
      </div>
      {compact ? (
        <div className="absolute top-full left-0 mt-1">
          <InlineError message={error} />
        </div>
      ) : (
        <InlineError message={error} />
      )}
    </form>
  );
}
