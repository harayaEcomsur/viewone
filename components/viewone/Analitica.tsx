import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

// Medición del sitio (desde 2026-10-26): Vercel Web Analytics (sin cookies) y
// Google Analytics 4 (propiedad de ViewOne). GA4 se carga SOLO en producción
// (www.viewone.cl): las visitas a staging, demos y local no deben ensuciar los
// números reales. Vercel Analytics ya ignora solo lo que no es producción.
export const GA4_ID = "G-2E2767Y3CS";

export function Analitica() {
  const esProduccion = process.env.VERCEL_ENV === "production";
  return (
    <>
      <Analytics />
      {esProduccion && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
