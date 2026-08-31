import { createHash } from "crypto";

export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt) {
    throw new Error("Missing required environment variable: RATE_LIMIT_SALT");
  }
  return createHash("sha256")
    .update(ip + salt)
    .digest("hex");
}
