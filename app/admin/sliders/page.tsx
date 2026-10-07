import type { Metadata } from "next";
import { AdminSlidersManagement } from "@/modules/slider/components/admin/AdminSlidersManagement";

export const metadata: Metadata = {
  title: "Sliders & Banners | Admin Console",
  description:
    "Manage storefront hero banners, promotional image sliders, scheduling, and CTA links.",
};

export default function AdminSlidersPage() {
  return (
    <div className="container mx-auto max-w-7xl py-2 space-y-6">
      <AdminSlidersManagement />
    </div>
  );
}
