"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function HomeError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="Algo salió mal"
      description="No pudimos cargar la página. Probá de nuevo en un momento."
      onRetry={reset}
    />
  );
}
