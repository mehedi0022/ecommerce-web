import type { ReactNode } from "react";

import { StoreFooter } from "@/components/layout/store/StoreFooter";
import { StoreHeader } from "@/components/layout/store/StoreHeader";

export default function StoreLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />

      <main className="flex-1">{children}</main>

      <StoreFooter />
    </div>
  );
}
