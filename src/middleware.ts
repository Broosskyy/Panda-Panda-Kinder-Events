import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    request.headers.set("x-pathname", request.nextUrl.pathname);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
