import type { Metadata } from "next";
import { AdminRolesManagement } from "@/modules/role/components/admin/AdminRolesManagement";

export const metadata: Metadata = {
  title: "Roles & Permissions (RBAC) | Admin Console",
  description: "Configure role-based access control and system permission matrices.",
};

export default function AdminRolesPage() {
  return <AdminRolesManagement />;
}
