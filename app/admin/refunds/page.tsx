import { AdminRefundsListPage } from "@/modules/refund/components/admin/AdminRefundsListPage";

export const metadata = {
  title: "Refunds Management | Admin Console",
  description: "Track customer refunds, approve payouts, and manage bank/MFS settlements.",
};

export default function AdminRefundsPage() {
  return <AdminRefundsListPage />;
}
