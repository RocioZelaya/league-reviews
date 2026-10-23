"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { ErrorState } from "@/components/ui/ErrorState";

export default function PlayerError({ reset }: { reset: () => void }) {
  const { errors } = useDictionary();
  return (
    <ErrorState
      title={errors.playerTitle}
      description={errors.playerDescription}
      onRetry={reset}
    />
  );
}
