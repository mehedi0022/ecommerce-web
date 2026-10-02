"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized || !user) return;

    router.replace(
      user.role.key.toUpperCase() !== "CUSTOMER"
        ? "/admin"
        : "/account",
    );
  }, [initialized, router, user]);

  if (!initialized || user) return null;

  return <>{children}</>;
}

