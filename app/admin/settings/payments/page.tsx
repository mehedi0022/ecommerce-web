import type { Metadata } from "next";
import { PaymentMethodsManagement } from "@/modules/payment/components/admin/PaymentMethodsManagement";

export const metadata: Metadata = {
  title: "Payment Methods & Gateways | Admin Console",
  description: "Configure manual MFS (bKash, Nagad), Bank transfer, and automated gateways.",
};

export default function AdminPaymentsPage() {
  return <PaymentMethodsManagement />;
}
