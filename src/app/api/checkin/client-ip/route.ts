import { NextResponse } from "next/server";

function isValidIp(value: string): boolean {
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    return value.split(".").every((part) => Number(part) <= 255);
  }
  // IPv6 (relaxed — presence of ":" and hex chars only)
  if (value.includes(":") && /^[0-9a-fA-F:]+$/.test(value)) {
    return true;
  }
  return false;
}

/**
 * GET /api/checkin/client-ip
 * Returns the guest's public IP as seen by the server (best effort), so it
 * can be stored with the consent record. The first x-forwarded-for entry is
 * the original client address on Vercel; anything that does not parse as an
 * IP is discarded.
 */
export async function GET(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const candidate = forwarded?.split(",")[0]?.trim() ?? null;
  const ip = candidate && isValidIp(candidate) ? candidate : null;
  return NextResponse.json({ ip });
}
