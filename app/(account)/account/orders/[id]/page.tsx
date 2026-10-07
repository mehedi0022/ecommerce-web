import type { Metadata } from "next";
import { CustomerOrderDetailsPage } from "@/modules/order/components/store/CustomerOrderDetailsPage";

export const metadata: Metadata = {
  title: "Order Details | My Account",
  description: "View comprehensive order details, delivery timeline, invoice, and return requests.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerOrderDetailsPage orderNumber={id} />;
}
