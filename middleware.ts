import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Login page is always accessible
    if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

    const cookie = req.cookies.get("admin_auth")?.value;
    const secret = process.env.ADMIN_PASSWORD ?? "admin";

    if (cookie !== secret) {
      const url = new URL("/admin/login", req.url);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
