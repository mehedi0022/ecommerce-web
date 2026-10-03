"use client";

import { useEffect, useState } from "react";
import { setupListeners } from "@reduxjs/toolkit/query";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./store";
import { AuthSessionProvider } from "@/modules/auth/components/AuthSessionProvider";

export function ReduxProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [store] = useState<AppStore>(() => makeStore());
  useEffect(() => setupListeners(store.dispatch), [store]);

  return <Provider store={store}><AuthSessionProvider>{children}</AuthSessionProvider></Provider>;
}
