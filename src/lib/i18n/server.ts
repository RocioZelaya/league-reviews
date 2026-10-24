import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale, type Locale } from "./locale";

/** Locale from the cookie, validated; absent or unknown values fall back to English. */
export async function getLocale(): Promise<Locale> {
  return parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}
