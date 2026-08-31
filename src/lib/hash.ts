import { createHash } from "crypto";
import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt) {
    throw new Error("Missing required environment variable: RATE_LIMIT_SALT");
  }
  return createHash("sha256")
    .update(ip + salt)
    .digest("hex");
}
