import type { ApiErrorCode } from "@/lib/apiErrors";
import type { Dictionary } from "./dictionaries/en";

/** Localized text for an API error code; `fallback` covers non-JSON or unknown errors. */
export function apiErrorMessage(
  code: ApiErrorCode | null,
  dictionary: Dictionary,
  fallback: string,
): string {
  return code ? dictionary.apiErrors[code] : fallback;
}
