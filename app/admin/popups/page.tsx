import type { Metadata } from "next";
import { AdminPopupsManagement } from "@/modules/popup/components/admin/AdminPopupsManagement";

export const metadata: Metadata = {
  title: "Popups & Modals | Admin Console",
  description:
    "Manage storefront promotional popups, discount triggers, exit-intent modals, and newsletter forms.",
};

export default function AdminPopupsPage() {
  return (
    <div className="container mx-auto max-w-7xl py-2 space-y-6">
      <AdminPopupsManagement />
    </div>
  );
}
