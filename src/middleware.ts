import { NextResponse, type NextRequest } from "next/server";
import { ANON_ID_COOKIE, ANON_ID_MAX_AGE_SECONDS } from "@/lib/anon";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.has(ANON_ID_COOKIE)) {
    response.cookies.set(ANON_ID_COOKIE, crypto.randomUUID(), {
      sameSite: "lax",
      maxAge: ANON_ID_MAX_AGE_SECONDS,
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
