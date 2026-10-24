import { z } from "zod";
import { ANON_ID_MAX_AGE_SECONDS } from "@/lib/anon";
import { writeClientCookie } from "@/lib/clientCookies";

export const LOCALES = ["en", "es"] as const;
export const localeSchema = z.enum(LOCALES);
export type Locale = z.infer<typeof localeSchema>;

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";
// Same lifetime as the identity cookies so the three expire together.
export const LOCALE_COOKIE_MAX_AGE_SECONDS = ANON_ID_MAX_AGE_SECONDS;

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

/** Narrows any external value (cookie, header) to a supported locale, defaulting to English. */
export function parseLocale(value: unknown): Locale {
  const parsed = localeSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_LOCALE;
}

export function getOppositeLocale(locale: Locale): Locale {
  return locale === "en" ? "es" : "en";
}

export function setClientLocale(locale: Locale): void {
  writeClientCookie(LOCALE_COOKIE, locale, LOCALE_COOKIE_MAX_AGE_SECONDS);
}
