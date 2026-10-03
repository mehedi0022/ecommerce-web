"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useMeQuery } from "@/modules/auth/authApi";
import { setSession } from "@/modules/auth/authSlice";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data, error, isFetching } = useMeQuery(undefined, { refetchOnMountOrArgChange: true, refetchOnFocus: true, refetchOnReconnect: true });

  useEffect(() => {
    if (isFetching) return;
    if (error && "status" in error && error.status === 401) dispatch(setSession(null));
    else if (!error && data?.data) dispatch(setSession(data.data));
  }, [data, error, dispatch, isFetching]);

  return <>{children}</>;
}
