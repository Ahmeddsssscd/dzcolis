import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/kyc/", "/tableau-de-bord/", "/profil/"],
    },
    sitemap: "https://www.waselli.com/sitemap.xml",
  };
}
