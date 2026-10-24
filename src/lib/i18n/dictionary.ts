import type { Locale } from "./locale";
import { en, type Dictionary } from "./dictionaries/en";
import { es } from "./dictionaries/es";

const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

// Server-side only by convention: client components receive the dictionary
// through LocaleProvider, so neither language ships in the browser bundle.
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary } from "./dictionaries/en";
