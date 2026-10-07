import type { Metadata } from "next";
import { AdminStaffManagement } from "@/modules/user/components/admin/AdminStaffManagement";

export const metadata: Metadata = {
  title: "Staff & Team Members | Admin Console",
  description: "Manage admin and staff accounts, assign roles, and handle credentials.",
};

export default function AdminUsersPage() {
  return <AdminStaffManagement />;
}
