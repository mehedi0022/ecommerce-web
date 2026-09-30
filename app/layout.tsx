import "./globals.css";

import { ReduxProvider } from "@/redux/ReduxProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildWebSiteSchema } from "@/lib/seo/structured-data";
import { seoConfig } from "@/lib/seo/seo.config";
import type { Metadata } from "next";

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
      <body>
        <JsonLd data={buildWebSiteSchema()} />
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
