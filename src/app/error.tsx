"use client";

import { useDictionary } from "@/components/i18n/LocaleProvider";
import { ErrorState } from "@/components/ui/ErrorState";

export default function HomeError({ reset }: { reset: () => void }) {
  const { errors } = useDictionary();
  return (
    <ErrorState
      title={errors.genericTitle}
      description={errors.genericDescription}
      onRetry={reset}
    />
  );
}
