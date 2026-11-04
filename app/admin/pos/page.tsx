import type { Metadata } from "next";
import { PosManualOrderPage } from "@/modules/order/components/admin/PosManualOrderPage";

export const metadata: Metadata = {
  title: "POS Counter Sales | Admin Console",
  description: "Point of Sale counter sales with barcode scanner and receipt printer.",
};

export default function Page() {
  return <PosManualOrderPage />;
}
