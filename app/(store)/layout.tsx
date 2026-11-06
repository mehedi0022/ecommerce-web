import type { ReactNode } from "react";
import { StoreFooter } from "@/components/layout/store/StoreFooter";
import { StoreHeader } from "@/components/layout/store/StoreHeader";
import { StoreNavbar } from "@/components/layout/store/StoreNavbar";
import { StorefrontPromoPopup } from "@/modules/popup/components/store/StorefrontPromoPopup";
import { StorefrontTrackingScripts } from "@/modules/marketing/components/StorefrontTrackingScripts";

export default function StoreLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <StorefrontTrackingScripts />
      <StoreHeader />

      <main className="flex-1">{children}</main>

      <StoreFooter />

      <StoreNavbar />

      <StorefrontPromoPopup />
    </div>
  );
}
