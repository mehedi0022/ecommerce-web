import type { Metadata } from "next";
import { AdminOrderDetailsPage } from "@/modules/order/components/admin/AdminOrderDetailsPage";

export const metadata: Metadata = {
  title: "Order Details | Admin Console",
  description: "View comprehensive order details, customer addresses, audit timeline, and fulfillment actions.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminOrderDetailsPage orderNumber={id} />;
}
