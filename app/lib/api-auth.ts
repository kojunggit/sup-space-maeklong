import type { NextRequest } from "next/server";

export function apiKeyEnabled(): boolean {
  return Boolean(process.env.BOOKING_API_KEY);
}

export function checkApiKey(req: NextRequest): boolean {
  const key = process.env.BOOKING_API_KEY;
  if (!key) return false;
  return req.headers.get("authorization") === `Bearer ${key}`;
}
