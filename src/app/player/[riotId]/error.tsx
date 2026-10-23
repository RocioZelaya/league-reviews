"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function PlayerError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="No pudimos cargar este perfil"
      description="Puede ser un problema temporal con la API de Riot. Probá de nuevo."
      onRetry={reset}
    />
  );
}
