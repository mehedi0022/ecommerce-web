"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { sessionDestination } from "../redirect";
import { useMeQuery } from "../authApi";
import { Button } from "@/components/ui/button";

export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, initialized } = useAppSelector((state) => state.auth);
  const { error, isFetching, refetch } = useMeQuery();
  const unavailable = Boolean(
    error && !("status" in error && error.status === 401),
  );

  useEffect(() => {
    if (!initialized || !user || isFetching || error) return;

    router.replace(sessionDestination(user.role.key, window.location.search));
  }, [initialized, router, user, isFetching, error]);

  if (unavailable)
    return (
      <div role="alert" className="space-y-3 p-6 text-sm">
        <p>We could not verify your session. Please try again.</p>
        <Button disabled={isFetching} onClick={() => refetch()}>
          Retry session
        </Button>
      </div>
    );

  if (!initialized || user) return null;

  return <>{children}</>;
}
