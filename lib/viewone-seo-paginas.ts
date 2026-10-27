import { z } from "zod";

// Páginas con SEO editable y su texto por defecto. Archivo aparte (sin base
// de datos) porque el panel, que corre en el navegador, también lo importa.
export const PAGINAS_SEO = [
  {
    id: "inicio",
    ruta: "/",
    nombre: "Inicio",
    titulo: "Letreros, señalética e impresión digital | ViewOne",
    descripcion:
      "Desarrollamos, producimos e instalamos letreros publicitarios, señalética, estructuras e impresión digital para empresas en Chile. Más de 20 años. Cotiza.",
  },
  {
    id: "letreros",
    ruta: "/letreros-publicitarios",
    nombre: "Letreros publicitarios",
    titulo: "Letreros y carteles publicitarios para empresas | ViewOne",
    descripcion:
      "Letreros de fachada, luminosos, letras corpóreas, tótems y letreros carreteros para empresas. Desarrollamos, producimos e instalamos. Más de 20 años. Cotiza.",
  },
  {
    id: "servicios",
    ruta: "/servicios",
    nombre: "Servicios",
    titulo: "Servicios de impresión, señalética y letreros | ViewOne",
    descripcion:
      "Impresión digital, señalética y letreros, estructuras publicitarias, instalación y montaje, y proyectos integrales para empresas en Chile. Cotiza tu proyecto.",
  },
  {
    id: "proyectos",
    ruta: "/proyectos",
    nombre: "Proyectos",
    titulo: "Proyectos de letreros y señalética para empresas | ViewOne",
    descripcion:
      "Proyectos reales para empresas: letreros, señalética, gráfica de muros y vidrios, vehículos, fachadas, eventos y vía pública. Míralos por categoría.",
  },
  {
    id: "contacto",
    ruta: "/contacto",
    nombre: "Contacto",
    titulo: "Contacto y cotizaciones | ViewOne",
    descripcion:
      "Cotiza tu letrero, señalética o proyecto de impresión digital. Cuéntanos qué necesitas y te ayudamos a definir la solución adecuada. Recoleta, Santiago.",
  },
] as const;

export type PaginaSeoId = (typeof PAGINAS_SEO)[number]["id"];

// Límites duros (no los recomendados): evitan que alguien pegue un texto
// entero por error. Lo recomendado (60 / 160) se avisa en el panel.
export const seoOverridesSchema = z.record(
  z.enum(PAGINAS_SEO.map((p) => p.id) as [PaginaSeoId, ...PaginaSeoId[]]),
  z.object({ titulo: z.string().max(120).optional(), descripcion: z.string().max(320).optional() })
);
export type SeoOverrides = z.infer<typeof seoOverridesSchema>;
