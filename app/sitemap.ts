import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/seo.config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/products"), changeFrequency: "daily", priority: 0.8 },
  ];
}
