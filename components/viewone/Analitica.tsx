import { AnaliticaCliente } from "@/components/viewone/AnaliticaCliente";

// Medición del sitio (desde 2026-10-26): Vercel Web Analytics (sin cookies) y
// Google Analytics 4 (propiedad de ViewOne). GA4 se carga SOLO en producción
// (www.viewone.cl) y SOLO si la persona acepta cookies (ver AvisoCookies): las
// visitas a staging, demos y local no deben ensuciar los números reales. El
// aviso sí se muestra en todos lados, para poder revisarlo en staging. El
// panel interno (/viewone-admin) no se mide: ver AnaliticaCliente.
export const GA4_ID = "G-2E2767Y3CS";

export function Analitica() {
  const esProduccion = process.env.VERCEL_ENV === "production";
  return <AnaliticaCliente ga4Id={esProduccion ? GA4_ID : null} />;
}
