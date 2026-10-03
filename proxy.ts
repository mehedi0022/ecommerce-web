import { NextResponse } from "next/server";

export function proxy() {
  // An expired/missing access cookie does not mean the refresh session expired.
  // Refresh cookies may also be API-path/host scoped and invisible to this proxy.
  // ProtectedRoute waits for /auth/me + refresh before rendering private UI.
  // The backend authenticates and authorizes every protected API request.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/account/:path*", "/login", "/register", "/forgot-password"],
};
