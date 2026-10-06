import type { Metadata } from "next";
import { NotificationManagement } from "@/modules/notification/components/admin/NotificationManagement";

export const metadata: Metadata = {
  title: "SMS & Notifications | Admin Console",
  description: "Configure SMS gateways (Greenweb, BulksmsBD, Generic), event templates, and view delivery logs.",
};

export default function AdminNotificationsPage() {
  return (
    <div className="container mx-auto max-w-6xl py-4 space-y-6">
      <NotificationManagement />
    </div>
  );
}
