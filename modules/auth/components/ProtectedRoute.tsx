"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/modules/auth/authApi";
import { useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();
  const { data, error, isLoading, isFetching, refetch } = useMeQuery();
  const session = useAppSelector((state) => state.auth);

  const unauthorized = Boolean(
    error && "status" in error && error.status === 401,
  );
  const user = session.expired || unauthorized ? undefined : data?.data;
  const ready = !isLoading && !isFetching;
  const unavailable = Boolean(
    error && !("status" in error && error.status === 401),
  );

  useEffect(() => {
    if (!ready || unavailable) return;
    if (!user)
      router.replace(
        `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
    else if (adminOnly && user.role.key.toUpperCase() === "CUSTOMER") {
      router.replace("/account");
    }
  }, [adminOnly, ready, router, user, unavailable]);

  if (!user && ready && unavailable)
    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-sm"
      >
        <p>
          We could not verify your session. Check your connection and try again.
        </p>
        <Button onClick={() => refetch()}>Retry session</Button>
      </div>
    );

  if (!user || (adminOnly && user.role.key.toUpperCase() === "CUSTOMER")) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading session...
      </div>
    );
  }

  // Focus/reconnect checks must not unmount forms or file/crop dialogs.
  // A terminal 401 or explicit expiry still removes private content above.
  return (
    <>
      {unavailable && (
        <div
          role="alert"
          className="flex items-center justify-center gap-3 border-b bg-amber-500/10 p-3 text-sm"
        >
          <p>Session check unavailable. Your unsaved changes are kept here.</p>
          <Button
            disabled={isFetching}
            variant="outline"
            onClick={() => refetch()}
          >
            Retry session
          </Button>
        </div>
      )}
      {children}
    </>
  );
}
