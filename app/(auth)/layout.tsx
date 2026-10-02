import type { Metadata } from "next";
import { GuestOnlyRoute } from "@/modules/auth/components/GuestOnlyRoute";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <GuestOnlyRoute>{children}</GuestOnlyRoute>;
}
