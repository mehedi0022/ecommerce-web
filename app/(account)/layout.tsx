import type { Metadata } from "next";
import { ProtectedRoute } from "@/modules/auth/components/ProtectedRoute";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
