"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/modules/auth/authApi";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();
  const { data, isLoading, isFetching } = useMeQuery();

  const user = data?.data;
  const ready = !isLoading && !isFetching;

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (adminOnly && user.role.key.toUpperCase() === "CUSTOMER") {
      router.replace("/account");
    }
  }, [adminOnly, ready, router, user]);

  if (
    !ready ||
    !user ||
    (adminOnly && user.role.key.toUpperCase() === "CUSTOMER")
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading session...
      </div>
    );
  }

  return <>{children}</>;
}


