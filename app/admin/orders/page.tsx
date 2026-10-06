import type { Metadata } from "next";
import { AdminOrdersPage } from "@/modules/order/components/admin/AdminOrdersPage";

export const metadata: Metadata = {
  title: "Orders & Fulfillment | Admin Console",
  description: "View and manage store orders, update statuses, and fulfill shipments.",
};

export default function Page() {
  return <AdminOrdersPage />;
}
