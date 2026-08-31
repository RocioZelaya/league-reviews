export const ANON_ID_COOKIE = "anonId";
export const NICKNAME_COOKIE = "nickname";
export const ANON_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getClientAnonId(): string | null {
  return readCookie(ANON_ID_COOKIE);
}

export function getClientNickname(): string | null {
  return readCookie(NICKNAME_COOKIE);
}

export function setClientNickname(nickname: string): void {
  document.cookie = `${NICKNAME_COOKIE}=${encodeURIComponent(nickname)}; path=/; max-age=${ANON_ID_MAX_AGE_SECONDS}; samesite=lax`;
}
