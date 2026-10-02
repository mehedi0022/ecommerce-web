"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./store";
import { AuthSessionProvider } from "@/modules/auth/components/AuthSessionProvider";

export function ReduxProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [store] = useState<AppStore>(() => makeStore());

  return <Provider store={store}><AuthSessionProvider>{children}</AuthSessionProvider></Provider>;
}
