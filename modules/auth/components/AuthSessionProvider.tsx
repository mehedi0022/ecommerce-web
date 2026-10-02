"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useMeQuery } from "@/modules/auth/authApi";
import { setSession } from "@/modules/auth/authSlice";

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data, isLoading, isFetching } = useMeQuery();

  useEffect(() => {
    if (data?.data) dispatch(setSession(data.data));
    else if (!isLoading && !isFetching) dispatch(setSession(null));
  }, [data, dispatch, isFetching, isLoading]);

  return <>{children}</>;
}
