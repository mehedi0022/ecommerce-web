import "./globals.css";
import { Inter } from "next/font/google";
import { ReduxProvider } from "@/redux/ReduxProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildWebSiteSchema } from "@/lib/seo/structured-data";
import { seoConfig } from "@/lib/seo/seo.config";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  ...buildMetadata(),
  metadataBase: new URL(seoConfig.siteUrl),
  title: { default: seoConfig.defaultTitle, template: seoConfig.titleTemplate },
  applicationName: seoConfig.siteName,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JsonLd data={buildWebSiteSchema()} />
        <TooltipProvider>
          <ReduxProvider>{children}</ReduxProvider>
        </TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
