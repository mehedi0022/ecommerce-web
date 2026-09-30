import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/seo.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/account/",
          "/cart/",
          "/checkout/",
          "/order-success/",
          "/login/",
          "/register/",
          "/forgot-password/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
