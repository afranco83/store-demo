import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Sin valor de SEO (funcionales/tras login) y sin nada que indexar —
      // en ambos locales: español sin prefijo (localePrefix "as-needed") e
      // inglés con /en.
      disallow: ["/checkout", "/account", "/en/checkout", "/en/account"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
