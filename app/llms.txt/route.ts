import { getContacto, listServiciosVisibles } from "@/lib/viewone-content-store";
import { listCategoriasVisibles } from "@/lib/viewone-store";

export const dynamic = "force-dynamic";

// /llms.txt (llmstxt.org, pase SEO 2026-10-26): resumen en texto plano para
// asistentes de IA (ChatGPT, Claude, Perplexity). Sale del mismo contenido
// editable del sitio (servicios, categorías, contacto), así nunca contradice
// lo que dicen las páginas. Solo hechos, nada dirigido a "la IA".
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.viewone.cl";
  const [contacto, servicios, categorias] = await Promise.all([
    getContacto(),
    listServiciosVisibles(),
    listCategoriasVisibles(),
  ]);

  const texto = `# ViewOne

> Empresa chilena B2B de impresión digital, letreros publicitarios, señalética y publicidad exterior para empresas. Desarrolla, produce e instala. Más de 20 años de experiencia. Ubicada en ${contacto.address}, Santiago, Chile.

## Servicios

${servicios.map((s) => `- ${s.nombre}: ${s.textoCorto}`).join("\n")}

## Tipos de trabajos (catálogo de proyectos)

${categorias.map((c) => `- ${c.nombre}`).join("\n")}

## Páginas

- [Inicio](${base}/)
- [Letreros y carteles publicitarios para empresas](${base}/letreros-publicitarios): letreros de fachada, luminosos, letras corpóreas, tótems, señalética y letreros carreteros.
- [Servicios](${base}/servicios)
- [Proyectos realizados](${base}/proyectos): trabajos reales por categoría.
- [Contacto y cotizaciones](${base}/contacto)

## Contacto

- Teléfono / WhatsApp: ${contacto.phone}
- Correo: ${contacto.email}
- Dirección: ${contacto.address}, Santiago, Chile
- Cotizaciones: ${base}/contacto (cada proyecto se cotiza según medida, materiales e instalación; no hay lista de precios fija)
`;

  return new Response(texto, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
