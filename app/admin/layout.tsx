import type { Metadata } from "next";
import { ProtectedRoute } from "@/modules/auth/components/ProtectedRoute";
import { AdminHeader } from "@/components/layout/admin/AdminHeader";
import { AdminSidebar } from "@/components/layout/admin/AdminSidebar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedRoute adminOnly>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        {/* Left Fixed Sidebar */}
        <AdminSidebar />

        {/* Right Main Column */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
