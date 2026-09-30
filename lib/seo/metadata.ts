import type { Metadata } from "next";
import { absoluteUrl, seoConfig } from "./seo.config";

type MetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description = seoConfig.defaultDescription,
  path = "/",
  image = seoConfig.defaultOgImage,
  noIndex = false,
}: MetadataInput = {}): Metadata {
  const url = absoluteUrl(path);
  const images = image ? [{ url: absoluteUrl(image), alt: title || seoConfig.siteName }] : undefined;

  return {
    title: title || seoConfig.defaultTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: title || seoConfig.defaultTitle,
      description,
      url,
      siteName: seoConfig.siteName,
      locale: seoConfig.locale,
      type: "website",
      images,
    },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
