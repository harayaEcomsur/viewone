import type { Metadata } from "next";
import { db, withDb, jsonb } from "@/lib/db";
import { clientConfig } from "@/config/client.config";
import { PAGINAS_SEO, seoOverridesSchema, type PaginaSeoId, type SeoOverrides } from "@/lib/viewone-seo-paginas";

export { PAGINAS_SEO, seoOverridesSchema, type PaginaSeoId, type SeoOverrides };

// SEO editable desde el panel (pedido 2026-10-27): título y descripción que
// Google muestra para cada página. Lo guardado vive en `settings`
// (`viewone_seo`, mismo patrón que Contacto); un campo vacío vuelve al texto
// por defecto (lib/viewone-seo-paginas.ts), que es el que se definió en el pase SEO del 2026-10-26
// (ver commit "SEO: landing de letreros…") — así borrar un campo en el panel
// nunca deja una página sin título.
//
// Solo título y descripción: el canonical, el schema y el sitemap siguen en
// código porque un error ahí puede sacar páginas de Google.

export async function getSeoOverrides(): Promise<SeoOverrides> {
  return withDb(
    async () => {
      const rows = await db()`SELECT value FROM settings WHERE key = 'viewone_seo' LIMIT 1`;
      const parsed = seoOverridesSchema.safeParse(rows[0]?.value ?? {});
      return parsed.success ? parsed.data : {};
    },
    () => ({})
  );
}

export async function setSeoOverrides(overrides: SeoOverrides): Promise<SeoOverrides> {
  // Se guardan solo los campos con texto: vacío = volver al por defecto.
  const limpio: SeoOverrides = {};
  for (const [id, v] of Object.entries(overrides) as [PaginaSeoId, { titulo?: string; descripcion?: string }][]) {
    const titulo = v.titulo?.trim();
    const descripcion = v.descripcion?.trim();
    if (titulo || descripcion) limpio[id] = { ...(titulo && { titulo }), ...(descripcion && { descripcion }) };
  }
  await withDb(
    async () => {
      await db()`
        INSERT INTO settings (key, value) VALUES ('viewone_seo', ${jsonb(limpio)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    },
    () => undefined
  );
  return limpio;
}

// generateMetadata de cada página. También arma openGraph: sin esto, al
// compartir /servicios en WhatsApp o LinkedIn salía el título del Inicio
// (Next hereda el openGraph del layout tal cual).
export async function seoMetadata(id: PaginaSeoId): Promise<Metadata> {
  const pagina = PAGINAS_SEO.find((p) => p.id === id)!;
  const override = (await getSeoOverrides())[id];
  const title = override?.titulo || pagina.titulo;
  const description = override?.descripcion || pagina.descripcion;
  const imagen = clientConfig.seo.ogImageUrl;
  return {
    title,
    description,
    alternates: { canonical: pagina.ruta },
    openGraph: {
      title,
      description,
      url: pagina.ruta,
      siteName: clientConfig.meta.businessName,
      locale: clientConfig.meta.locale,
      type: "website",
      images: imagen ? [{ url: imagen }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: imagen ? [imagen] : undefined },
  };
}
