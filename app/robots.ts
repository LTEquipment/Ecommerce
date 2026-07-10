import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/checkout"],
    },
    sitemap: "https://www.ltfse.com/sitemap.xml",
    host: "https://www.ltfse.com",
  };
}
