import type { Metadata } from "next";
import { InvoiceSettingsManagement } from "@/modules/order/invoice-settings/InvoiceSettingsManagement";

export const metadata: Metadata = {
  title: "Invoice & Shipping Label Customization | Admin Console",
  description:
    "Customize company branding, store logo, return address, VAT/BIN number, helpline, and return policies for official A4 invoices and parcel shipping slips.",
};

export default function AdminInvoiceSettingsPage() {
  return <InvoiceSettingsManagement />;
}
