import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/proyectos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];
}
