import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/app/lib/auth";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Login page is always accessible
    if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!(await verifySessionToken(token))) {
      const url = new URL("/admin/login", req.url);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
