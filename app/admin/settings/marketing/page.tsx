import { MarketingSettingsManagement } from "@/modules/marketing/components/admin/MarketingSettingsManagement";

export const metadata = {
  title: "Marketing & Pixels Settings | Admin",
  description: "Configure Facebook Pixel, CAPI, Google Tag Manager, and TikTok tracking.",
};

export default function MarketingSettingsPage() {
  return <MarketingSettingsManagement />;
}
