import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE,
} from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  let password = "";
  try {
    const body = await req.json();
    if (typeof body?.password === "string") password = body.password;
  } catch {
    /* malformed body → treated as empty password below */
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ ok: false, error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  // Store a signed session token — never the password itself.
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
