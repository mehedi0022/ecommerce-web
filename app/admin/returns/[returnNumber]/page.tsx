import type { Metadata } from "next";
import { AdminReturnDetailsPage } from "@/modules/return/components/admin/AdminReturnDetailsPage";

export const metadata: Metadata = {
  title: "Return Details | Admin Console",
  description: "Inspect returned items, restock inventory, and issue customer refunds.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ returnNumber: string }>;
}) {
  const { returnNumber } = await params;
  return <AdminReturnDetailsPage returnNumber={returnNumber} />;
}
