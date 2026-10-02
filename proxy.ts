import { NextRequest, NextResponse } from "next/server";

const isAuthRoute = (pathname: string) =>
  pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const isProtectedRoute =
    pathname === "/admin" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/admin/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/");

  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // The client guest-only guard resolves the authenticated user's role and
  // sends admins to /admin and customers to /account.
  if (isAuthRoute(request.nextUrl.pathname) && accessToken) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/account/:path*", "/login", "/register", "/forgot-password"],
};




