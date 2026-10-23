"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useDictionary, useLocale } from "@/components/i18n/LocaleProvider";
import {
  getOppositeLocale,
  LOCALE_SHORT_LABELS,
  setClientLocale,
} from "@/lib/i18n/locale";

export function LanguageToggle() {
  const router = useRouter();
  const locale = useLocale();
  const { header } = useDictionary();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    setClientLocale(getOppositeLocale(locale));
    startTransition(() => router.refresh());
  }

  const shortLabel = LOCALE_SHORT_LABELS[locale];

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      aria-busy={isPending}
      aria-label={`${shortLabel}: ${header.switchLanguage}`}
      title={header.switchLanguage}
      className="px-2"
    >
      <GlobeIcon />
      <span aria-hidden="true" className="font-mono text-xs">
        {shortLabel}
      </span>
    </Button>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
