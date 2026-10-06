import type { Metadata } from "next";
import { ShippingManagementPage } from "@/modules/shipping/components/ShippingManagementPage";

export const metadata: Metadata = {
  title: "Shipping & Zone Management | Admin Console",
  description: "Configure regional delivery zones across Bangladesh, map locations, and manage delivery charges.",
};

export default function AdminShippingPage() {
  return <ShippingManagementPage />;
}
