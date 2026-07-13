import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Sin valor de SEO (funcionales/tras login) y sin nada que indexar.
      disallow: ["/checkout", "/account"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
