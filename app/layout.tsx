import type { Metadata } from "next";
import { clientConfig } from "@/config/client.config";
import { getFontVariables } from "@/lib/fonts";
import { paletteToCssVars } from "@/lib/theme";
import { buildMetadata, buildLocalBusinessJsonLd } from "@/lib/seo";
import { PaperGrain } from "@/components/viewone/PaperGrain";
import { Analitica } from "@/components/viewone/Analitica";
import "./globals.css";

export const metadata: Metadata = buildMetadata(clientConfig);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVariables = getFontVariables(clientConfig.branding.fontPairing);
  const jsonLd = buildLocalBusinessJsonLd(clientConfig);
  // Nombre del sitio para Google (2026-10-26): sin esto el resultado mostraba
  // "viewone.cl" en vez de "ViewOne" sobre el título. Google lo toma del
  // WebSite de la página de inicio.
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: clientConfig.meta.businessName,
    alternateName: ["View One", "ViewOne Chile"],
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/`,
  };

  return (
    <html
      lang={clientConfig.meta.locale}
      className={fontVariables}
      style={paletteToCssVars(clientConfig.branding.palette)}
    >
      <body>
        <PaperGrain />
        {children}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <Analitica />
      </body>
    </html>
  );
}
