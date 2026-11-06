import type { Metadata } from "next";
import { ProtectedRoute } from "@/modules/auth/components/ProtectedRoute";
import { StoreHeader } from "@/components/layout/store/StoreHeader";
import { StoreFooter } from "@/components/layout/store/StoreFooter";
import { StoreNavbar } from "@/components/layout/store/StoreNavbar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col pb-16 md:pb-0">
        <StoreHeader />
        <main className="flex-1">{children}</main>
        <StoreFooter />
        <StoreNavbar />
      </div>
    </ProtectedRoute>
  );
}
