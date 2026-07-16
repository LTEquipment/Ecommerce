import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal / functional / no-index-value routes.
      disallow: [
        "/account",
        "/checkout",
        "/cart",
        "/admin",
        "/api/",
        "/auth/",
        "/login",
        "/register",
        "/wishlist",
        "/compare",
      ],
    },
    sitemap: "https://www.ltfse.com/sitemap.xml",
    host: "https://www.ltfse.com",
  };
}
