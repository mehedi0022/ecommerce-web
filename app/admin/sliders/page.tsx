import type { Metadata } from "next";
import { AdminSlidersManagement } from "@/modules/slider/components/admin/AdminSlidersManagement";

export const metadata: Metadata = {
  title: "Sliders & Banners | Admin Console",
  description:
    "Manage storefront hero banners, promotional image sliders, scheduling, and CTA links.",
};

export default function AdminSlidersPage() {
  return (
    <div className="space-y-6">
      <AdminSlidersManagement />
    </div>
  );
}
