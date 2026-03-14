import { NextResponse, type NextRequest } from "next/server";

const PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL!
  .replace("https://", "")
  .split(".")[0];

const COOKIE_BASE = `sb-${PROJECT_REF}-auth-token`;

function isAuthenticated(request: NextRequest): boolean {
  // @supabase/ssr stores the session as the base cookie or chunked (.0, .1 ...)
  // Also check for any cookie starting with the base name to handle
  // variations across browsers (e.g. mobile Safari)
  const cookieNames = request.cookies.getAll().map((c) => c.name);
  return cookieNames.some(
    (name) => name === COOKIE_BASE || name.startsWith(`${COOKIE_BASE}.`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth");
  const authenticated = isAuthenticated(request);

  // Only block unauthenticated users from protected routes.
  // Do NOT redirect authenticated users away from /auth here —
  // a stale cookie with an invalid token would create a redirect loop.
  // The auth page handles the already-logged-in redirect itself.
  if (!authenticated && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
