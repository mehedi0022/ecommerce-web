import type { Metadata } from "next";
import { CouponsPage } from "@/modules/coupon/components/CouponsPage";

export const metadata: Metadata = {
  title: "Coupon Management | Admin Console",
  description: "Create, view, edit and manage promo coupons and discounts.",
};

export default function AdminCouponsPage() {
  return <CouponsPage />;
}
