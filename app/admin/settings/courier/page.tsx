import type { Metadata } from "next";
import { CourierSettingsManagement } from "@/modules/courier/components/admin/CourierSettingsManagement";

export const metadata: Metadata = {
  title: "Courier Integration | Admin Console",
  description:
    "Configure automated courier services (Steadfast, Pathao), check merchant balances, and set up fulfillment credentials.",
};

export default function AdminCourierSettingsPage() {
  return (
    <div className="container mx-auto max-w-6xl py-4 space-y-6">
      <CourierSettingsManagement />
    </div>
  );
}
