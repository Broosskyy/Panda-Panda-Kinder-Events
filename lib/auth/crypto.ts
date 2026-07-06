import { createHash, randomBytes } from "crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function hashIp(ip: string): string {
  const salt = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "pb-ip-salt";
  return sha256(`${salt}:${ip}`);
}
