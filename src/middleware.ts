import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

const PUBLIC_ADMIN_PAGE_PREFIXES = ["/admin/passwort-reset", "/admin/einladung"];

const PUBLIC_ADMIN_API_PREFIXES = [
  "/api/admin/login",
  "/api/admin/invites",
  "/api/admin/password-reset",
  "/api/admin/auth/bootstrap",
];

function isPublicAdminPage(pathname: string) {
  return PUBLIC_ADMIN_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicAdminApi(pathname: string) {
  return PUBLIC_ADMIN_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  if (request.nextUrl.pathname.startsWith("/admin")) {
    response.headers.set("x-pathname", request.nextUrl.pathname);
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin") && !isPublicAdminApi(pathname)) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }
  }

  if (pathname.startsWith("/admin") && !isPublicAdminPage(pathname)) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session && pathname !== "/admin" && pathname !== "/admin/") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin";
      loginUrl.search = "";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const requestHeaders = new Headers(request.headers);
  if (pathname.startsWith("/admin")) {
    requestHeaders.set("x-pathname", pathname);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  applySecurityHeaders(response, request);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.png|assets/|icons/).*)"],
};
