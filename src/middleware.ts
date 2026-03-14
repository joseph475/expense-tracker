import { NextResponse, type NextRequest } from "next/server";

const PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL!
  .replace("https://", "")
  .split(".")[0];

const COOKIE_BASE = `sb-${PROJECT_REF}-auth-token`;

function isAuthenticated(request: NextRequest): boolean {
  // @supabase/ssr stores the session as the base cookie or chunked (.0, .1 ...)
  return (
    request.cookies.has(COOKIE_BASE) ||
    request.cookies.has(`${COOKIE_BASE}.0`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth");
  const authenticated = isAuthenticated(request);

  if (!authenticated && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (authenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
