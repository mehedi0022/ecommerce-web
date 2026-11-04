import type { Metadata } from "next";
import { PosManualOrderPage } from "@/modules/order/components/admin/PosManualOrderPage";

export const metadata: Metadata = {
  title: "POS & Manual Order Entry | Admin Console",
  description: "Point of Sale counter sales, phone call bookings, and manual order creation.",
};

export default function Page() {
  return <PosManualOrderPage />;
}
