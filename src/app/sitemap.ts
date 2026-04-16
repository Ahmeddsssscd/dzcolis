import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.waselli.com";

  return [
    { url: base,                              lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/annonces`,                lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/envoyer`,                 lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/transporter`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/international`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/suivi`,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/comment-ca-marche`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/assurance`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/parrainage`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/a-propos`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`,                     lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/connexion`,               lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${base}/inscription`,             lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
  ];
}
