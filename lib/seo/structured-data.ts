import { seoConfig } from "./seo.config";

export type JsonLd = Record<string, unknown>;

export function buildWebSiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
  };
}
