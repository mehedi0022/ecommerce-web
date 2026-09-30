const fallbackSiteUrl = "http://localhost:3000";

function normalizeSiteUrl(value: string): string {
  return value.trim().replace(/\/+$/, "") || fallbackSiteUrl;
}

export const seoConfig = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "E-commerce Store",
  siteUrl: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl,
  ),
  defaultTitle: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "E-commerce Store",
  titleTemplate: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "E-commerce Store"}`,
  defaultDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
    "Browse products and shop online.",
  defaultOgImage: process.env.NEXT_PUBLIC_OG_IMAGE?.trim(),
  locale: process.env.NEXT_PUBLIC_SITE_LOCALE?.trim() || "en_US",
} as const;

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = `/${path.replace(/^\/+/, "")}`;
  return new URL(normalizedPath, `${seoConfig.siteUrl}/`).toString();
}
