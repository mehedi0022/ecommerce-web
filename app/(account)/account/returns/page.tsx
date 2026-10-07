import type { Metadata } from "next";
import { CustomerReturnsPage } from "@/modules/return/components/customer/CustomerReturnsPage";

export const metadata: Metadata = {
  title: "My Returns & Exchanges | My Account",
  description: "Track your return requests, product inspections, and refunds",
};

export default function Page() {
  return <CustomerReturnsPage />;
}
