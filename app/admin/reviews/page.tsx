import type { Metadata } from "next";
import { AdminReviewsPage } from "@/modules/review/components/AdminReviewsPage";

export const metadata: Metadata = {
  title: "Review Moderation | Admin Console",
  description: "Moderate and inspect customer product reviews, ratings and approvals.",
};

export default function ReviewsAdminPage() {
  return <AdminReviewsPage />;
}
