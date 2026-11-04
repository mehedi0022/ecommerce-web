import { MarketingSettingsManagement } from "@/modules/marketing/components/admin/MarketingSettingsManagement";

export const metadata = {
  title: "Marketing & Pixels Settings | Admin",
  description: "Configure Facebook Pixel, CAPI, Google Tag Manager, and TikTok tracking.",
};

export default function MarketingSettingsPage() {
  return (
    <div className="container mx-auto max-w-5xl py-2">
      <MarketingSettingsManagement />
    </div>
  );
}
