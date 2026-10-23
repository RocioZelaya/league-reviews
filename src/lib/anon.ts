import { readClientCookie, writeClientCookie } from "./clientCookies";

export const ANON_ID_COOKIE = "anonId";
export const NICKNAME_COOKIE = "nickname";
export const ANON_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function getClientAnonId(): string | null {
  return readClientCookie(ANON_ID_COOKIE);
}

export function getClientNickname(): string | null {
  return readClientCookie(NICKNAME_COOKIE);
}

export function setClientNickname(nickname: string): void {
  writeClientCookie(NICKNAME_COOKIE, nickname, ANON_ID_MAX_AGE_SECONDS);
}
