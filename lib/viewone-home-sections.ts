import { z } from "zod";

// Home armado por secciones (pedido 2026-10-20: "agregar elementos o
// secciones o eliminar elementos y secciones, como un CMS como WordPress").
// El Home deja de ser un layout fijo con campos sueltos: es una lista
// ordenada de secciones, cada una de un tipo con su propio diseño ya
// cerrado. El admin agrega, reordena, oculta, duplica y elimina secciones, y
// dentro de las que son listas (atributos, galería) agrega o quita elementos.
//
// Lo que sigue sin ser autoservicio, a propósito: colores, tipografía y el
// diseño de cada tipo de sección — un tipo nuevo de sección es un pedido a
// HarayaDev, no un bloque libre de HTML (así nadie rompe la consistencia de
// marca que se afinó contra la referencia del cliente).
//
// Archivo sin dependencias de servidor: lo usan el Home (server), la API
// (validación) y el panel (cliente).

export const ICONOS = {
  fabrica: "Fábrica",
  engranaje: "Engranaje",
  edificio: "Edificio",
  impresora: "Impresora",
  senal: "Señalética",
  llave: "Herramienta",
  capas: "Capas",
  estrella: "Estrella",
  check: "Check",
  camion: "Camión",
} as const;
export type IconoKey = keyof typeof ICONOS;
const iconoSchema = z.enum(Object.keys(ICONOS) as [IconoKey, ...IconoKey[]]);

const base = { id: z.string().min(1), visible: z.boolean() };
const texto = z.string().max(2000);
const url = z.string().max(2000);

export const seccionSchema = z.discriminatedUnion("tipo", [
  z.object({
    ...base,
    tipo: z.literal("hero"),
    eyebrow: texto,
    titulo: texto,
    bajada: texto,
    fotoUrl: url.min(1),
    botonTexto: texto,
    botonHref: url,
    boton2Texto: texto,
    boton2Href: url,
  }),
  z.object({ ...base, tipo: z.literal("logos"), eyebrow: texto, cantidad: z.number().int().min(1).max(40) }),
  z.object({ ...base, tipo: z.literal("servicios"), eyebrow: texto, titulo: texto, linkTexto: texto }),
  z.object({
    ...base,
    tipo: z.literal("atributos"),
    eyebrow: texto,
    titulo: texto,
    subtitulo: texto,
    fotoUrl: url,
    items: z.array(z.object({ titulo: texto.min(1), descripcion: texto, icono: iconoSchema })).max(12),
  }),
  z.object({
    ...base,
    tipo: z.literal("galeria"),
    eyebrow: texto,
    titulo: texto,
    linkTexto: texto,
    linkHref: url,
    items: z.array(z.object({ nombre: texto, foto: url.min(1), href: url })).max(24),
  }),
  z.object({
    ...base,
    tipo: z.literal("textoImagen"),
    eyebrow: texto,
    titulo: texto,
    texto: z.string().max(6000),
    fotoUrl: url.min(1),
    lado: z.enum(["izquierda", "derecha"]),
    ancla: z.string().max(60).regex(/^[a-z0-9-]*$/),
    botonTexto: texto,
    botonHref: url,
  }),
  z.object({
    ...base,
    tipo: z.literal("texto"),
    eyebrow: texto,
    titulo: texto,
    texto: z.string().max(6000),
    botonTexto: texto,
    botonHref: url,
    fondo: z.enum(["claro", "blanco"]),
  }),
  z.object({ ...base, tipo: z.literal("clientes"), eyebrow: texto }),
  z.object({
    ...base,
    tipo: z.literal("cta"),
    eyebrow: texto,
    titulo: texto,
    fotoUrl: url,
    botonTexto: texto,
    botonHref: url,
    mostrarContacto: z.boolean(),
  }),
]);

export const seccionesSchema = z.array(seccionSchema).max(40);

export type HomeSeccion = z.infer<typeof seccionSchema>;
export type TipoSeccion = HomeSeccion["tipo"];
export type SeccionDe<T extends TipoSeccion> = Extract<HomeSeccion, { tipo: T }>;

export const TIPOS_SECCION: Record<TipoSeccion, { nombre: string; descripcion: string }> = {
  hero: { nombre: "Portada (hero)", descripcion: "Foto grande con titular, bajada y dos botones." },
  logos: { nombre: "Logos destacados", descripcion: "Una fila con los primeros logos de la lista de Clientes." },
  servicios: { nombre: "Servicios", descripcion: "Tarjetas con los servicios visibles (se editan en Servicios)." },
  atributos: { nombre: "Atributos", descripcion: "Banda con un dato grande y atributos con ícono (ej. +20 años)." },
  galeria: { nombre: "Galería de proyectos", descripcion: "Grilla de fotos con nombre, cada una con su link." },
  textoImagen: { nombre: "Texto + imagen", descripcion: "Foto a sangre a un lado y texto al otro (ej. Nosotros)." },
  texto: { nombre: "Texto", descripcion: "Bloque de texto centrado con botón opcional." },
  clientes: { nombre: "Clientes (carrusel)", descripcion: "Todos los logos de Clientes, paginados de a 20." },
  cta: { nombre: "Llamado a la acción", descripcion: "Banda azul con título, datos de contacto y botón." },
};

export function nuevoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Sección recién agregada desde el panel: contenido de ejemplo neutro (sin
// datos inventados de clientes) que el admin reemplaza antes de guardar.
export function seccionNueva(tipo: TipoSeccion, fotoPorDefecto: string): HomeSeccion {
  const id = nuevoId();
  const visible = true;
  switch (tipo) {
    case "hero":
      return {
        id, visible, tipo, eyebrow: "", titulo: "Nuevo titular", bajada: "", fotoUrl: fotoPorDefecto,
        botonTexto: "Cotiza tu proyecto", botonHref: "/contacto", boton2Texto: "", boton2Href: "",
      };
    case "logos":
      return { id, visible, tipo, eyebrow: "Empresas que han confiado en ViewOne", cantidad: 8 };
    case "servicios":
      return { id, visible, tipo, eyebrow: "Nuestros servicios", titulo: "Nuevo título", linkTexto: "Ver todos los servicios" };
    case "atributos":
      return {
        id, visible, tipo, eyebrow: "", titulo: "Nuevo título", subtitulo: "", fotoUrl: "",
        items: [{ titulo: "Atributo", descripcion: "", icono: "check" }],
      };
    case "galeria":
      return { id, visible, tipo, eyebrow: "", titulo: "Nuevo título", linkTexto: "", linkHref: "", items: [] };
    case "textoImagen":
      return {
        id, visible, tipo, eyebrow: "", titulo: "Nuevo título", texto: "", fotoUrl: fotoPorDefecto,
        lado: "izquierda", ancla: "", botonTexto: "", botonHref: "",
      };
    case "texto":
      return { id, visible, tipo, eyebrow: "", titulo: "Nuevo título", texto: "", botonTexto: "", botonHref: "", fondo: "claro" };
    case "clientes":
      return { id, visible, tipo, eyebrow: "Experiencia con empresas de distintos rubros" };
    case "cta":
      return {
        id, visible, tipo, eyebrow: "", titulo: "Nuevo título", fotoUrl: fotoPorDefecto,
        botonTexto: "Contáctanos", botonHref: "/contacto", mostrarContacto: true,
      };
  }
}

// Campos sueltos del Home anterior (todavía guardados en producción bajo
// `viewone_home_content`). Se convierten una vez a secciones al leer, con el
// mismo orden y textos que el Home tenía hasta hoy — el sitio se ve igual.
export interface HomeLegacy {
  heroTitulo: string;
  heroBajada: string;
  heroFotoUrl: string;
  nosotrosEyebrow: string;
  nosotrosTitulo: string;
  nosotrosTexto: string;
  nosotrosFotoUrl: string;
  badges: string[];
  proyectosDestacados: { nombre: string; foto: string }[];
  cierreTitulo: string;
}

const ATRIBUTO_LEGACY: Record<string, { descripcion: string; icono: IconoKey }> = {
  "Taller propio": { descripcion: "Contamos con infraestructura y equipamiento de producción.", icono: "fabrica" },
  "Producción integral": { descripcion: "Desde la idea hasta la instalación.", icono: "engranaje" },
  "Experiencia B2B": { descripcion: "Soluciones para empresas de todos los tamaños.", icono: "edificio" },
};

export function seccionesDesdeLegacy(l: HomeLegacy): HomeSeccion[] {
  const visible = true;
  return [
    {
      id: "hero", visible, tipo: "hero", eyebrow: "Soluciones gráficas para empresas", titulo: l.heroTitulo,
      bajada: l.heroBajada, fotoUrl: l.heroFotoUrl, botonTexto: "Cotiza tu proyecto", botonHref: "/contacto",
      boton2Texto: "Ver proyectos", boton2Href: "/proyectos",
    },
    { id: "logos", visible, tipo: "logos", eyebrow: "Empresas que han confiado en ViewOne", cantidad: 8 },
    {
      id: "servicios", visible, tipo: "servicios", eyebrow: "Nuestros servicios",
      titulo: "Soluciones gráficas de alto impacto", linkTexto: "Ver todos los servicios",
    },
    {
      id: "atributos", visible, tipo: "atributos", eyebrow: "Más de 20 años", titulo: "+20 años",
      subtitulo: "haciendo realidad grandes proyectos", fotoUrl: l.heroFotoUrl,
      items: l.badges.map((titulo) => ({
        titulo,
        descripcion: ATRIBUTO_LEGACY[titulo]?.descripcion ?? "",
        icono: ATRIBUTO_LEGACY[titulo]?.icono ?? "edificio",
      })),
    },
    {
      id: "destacados", visible, tipo: "galeria", eyebrow: "Proyectos destacados",
      titulo: "Resultados que hablan por sí solos", linkTexto: "Ver todos los proyectos", linkHref: "/proyectos",
      items: l.proyectosDestacados.map((p) => ({ nombre: p.nombre, foto: p.foto, href: "/proyectos" })),
    },
    {
      id: "nosotros", visible, tipo: "textoImagen", eyebrow: l.nosotrosEyebrow, titulo: l.nosotrosTitulo,
      texto: l.nosotrosTexto, fotoUrl: l.nosotrosFotoUrl, lado: "izquierda", ancla: "nosotros",
      botonTexto: "", botonHref: "",
    },
    { id: "clientes", visible, tipo: "clientes", eyebrow: "Experiencia con empresas de distintos rubros" },
    {
      id: "cierre", visible, tipo: "cta", eyebrow: "Hablemos de tu proyecto", titulo: l.cierreTitulo,
      fotoUrl: l.heroFotoUrl, botonTexto: "Contáctanos", botonHref: "/contacto", mostrarContacto: true,
    },
  ];
}
