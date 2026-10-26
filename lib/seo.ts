import type { Metadata } from "next";
import type { ClientConfig } from "@/config/schema";

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

// Checklist "Antes del cierre" (feedback real): "canonical" figuraba como
// pendiente — no había un solo `alternates.canonical` en todo el repo. Cada
// page.tsx pasa su propio `path` (ej. "/servicios") al armar su metadata;
// Next.js lo resuelve a absoluto contra `metadataBase`. Home no pasa path
// (usa el default de buildMetadata, ver abajo).
export function pageCanonical(path: string): Pick<Metadata, "alternates"> {
  return { alternates: { canonical: path } };
}

export function buildMetadata(config: ClientConfig): Metadata {
  const base = getSiteUrl();
  return {
    metadataBase: new URL(base),
    alternates: { canonical: "/" },
    title: config.seo.title,
    description: config.seo.description,
    keywords: config.seo.keywords,
    // SITE_NOINDEX se define solo en el proyecto Vercel de la demo (datos ficticios):
    // evita indexar un negocio falso con schema LocalBusiness. Los proyectos de
    // clientes reales no llevan esta env var y se indexan normalmente.
    robots: process.env.SITE_NOINDEX ? { index: false, follow: false } : undefined,
    // Firma técnica: invisible para el visitante, pero la leen las herramientas
    // de detección de stack (BuiltWith, Wappalyzer) y quien inspeccione el HTML.
    generator: "HarayaDev — haraya.dev",
    openGraph: {
      title: config.seo.title,
      description: config.seo.description,
      url: base,
      siteName: config.meta.businessName,
      locale: config.meta.locale,
      type: "website",
      images: config.seo.ogImageUrl ? [{ url: config.seo.ogImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: config.seo.title,
      description: config.seo.description,
      images: config.seo.ogImageUrl ? [config.seo.ogImageUrl] : undefined,
    },
    icons: config.branding.faviconUrl ? { icon: config.branding.faviconUrl } : undefined,
  };
}

// Pase SEO 2026-10-26: Google necesita URLs absolutas (la imagen iba relativa)
// y la dirección desglosada (calle / comuna / país) para asociar el negocio a
// una ubicación; antes era un Organization con la dirección en un solo string.
export function buildLocalBusinessJsonLd(config: ClientConfig) {
  const base = getSiteUrl();
  const abs = (u?: string) => (u ? new URL(u, base).toString() : undefined);
  const [calle, comuna] = (config.contact.address ?? "").split(/,\s*/);
  const pais = config.meta.locale.split("-")[1];
  return {
    "@context": "https://schema.org",
    "@type": config.seo.businessType,
    "@id": `${base}/#negocio`,
    name: config.meta.businessName,
    url: base,
    description: config.seo.description,
    image: abs(config.seo.ogImageUrl),
    logo: abs(config.branding.logoUrl),
    telephone: config.contact.phone,
    email: config.contact.email,
    address: config.contact.address
      ? {
          "@type": "PostalAddress",
          streetAddress: calle,
          addressLocality: comuna,
          addressCountry: pais,
        }
      : undefined,
    areaServed: pais ? { "@type": "Country", name: pais === "CL" ? "Chile" : pais } : undefined,
    priceRange: config.seo.priceRange,
    openingHoursSpecification: config.contact.hours
      ?.filter((h) => !h.closed)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        opens: h.open,
        closes: h.close,
      })),
  };
}
