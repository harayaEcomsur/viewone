import { defineClientConfig } from "@/config/schema";

// Contenido real tomado del handoff aprobado por ViewOne ("ViewOne Mockup
// Handoff Web versión final", V5, 24-sep-2026) — arquitectura, textos, CTAs
// y fotos son los definidos ahí; la línea visual (paleta, tipografía,
// composición) es la que propone HarayaDev, como el handoff indica
// explícitamente que debe ser ("el proveedor propone una línea visual y
// ViewOne la aprueba" — no hay manual visual cerrado).
//
// La home, /servicios y /proyectos son páginas a medida (ver
// components/viewone/*) porque la arquitectura del handoff no calza con
// HomeContent.tsx genérico: los 5 servicios van en bloques alternados
// foto/texto (no tarjetas de ícono), y /proyectos es un catálogo filtrable
// por categoría con lightbox — no hay nada parecido en el motor genérico.
export const clientConfig = defineClientConfig({
  meta: {
    slug: "viewone",
    businessName: "ViewOne",
    rubro: "Impresión digital y publicidad exterior (B2B)",
    locale: "es-CL",
  },

  branding: {
    logoUrl: "/clients/viewone/logo.png",
    faviconUrl: "/clients/viewone/logo.png",
    logoIncludesName: true,
    // Azul real de la marca (muestreado del logo oficial, #0034A1) + ámbar
    // como acento de acción — nada de navy genérico de plantilla SaaS.
    palette: {
      primary: "#0034A1",
      accent: "#F2A900",
      background: "#FAFAF8",
      foreground: "#15181D",
    },
    fontPairing: "estructural",
    layout: "clasico",
    credit: true,
  },

  // El hero real combina foto + H1 (ver components/viewone/ViewOneHome.tsx);
  // estos campos igual alimentan SEO/asistente.
  hero: {
    title: "Impresión digital y soluciones gráficas para empresas",
    subtitle:
      "Desarrollamos, producimos e instalamos soluciones gráficas para marcas, empresas y proyectos, desde impresión digital hasta implementaciones integrales.",
    ctaLabel: "Cotiza tu proyecto",
    ctaHref: "/contacto",
    backgroundImageUrl: "/clients/viewone/home/hero-andacor.jpeg",
  },

  services: [],

  about: {
    title: "Experiencia que respalda cada proyecto",
    body: "En ViewOne contamos con más de 20 años de experiencia desarrollando soluciones gráficas y publicitarias para empresas y marcas. Producimos e implementamos proyectos de impresión, fabricación e instalación, adaptándonos a los requerimientos de cada cliente y cada espacio.",
    imageUrl: "/clients/viewone/home/nosotros-letrero-madera.png",
  },

  contact: {
    phone: "+56 9 6787 3525",
    whatsapp: "56967873525",
    whatsappPrefilledMessage: "Hola! Quiero cotizar un proyecto con ViewOne",
    email: "ventas@viewone.cl",
    address: "La Montaña 3150, Recoleta",
    mapQuery: "La Montaña 3150, Recoleta, Chile",
    socials: [
      { platform: "instagram", url: "https://instagram.com/viewone.cl" },
      { platform: "facebook", url: "https://facebook.com/viewone.cl" },
      { platform: "linkedin", url: "https://linkedin.com/company/viewone" },
    ],
  },

  modules: {
    contactForm: true,
    whatsappButton: false,
    testimonials: false,
    faq: false,
    pricing: false,
    chat: false,
  },

  chat: {
    businessDescription:
      "ViewOne es una empresa B2B de impresión digital y publicidad exterior en Santiago, Chile, con más de 20 años de experiencia en estructuras publicitarias, señalética, instalación y proyectos integrales para empresas.",
    qaPairs: [],
    fallbackToWhatsapp: false,
  },

  seo: {
    title: "ViewOne — Impresión digital y publicidad exterior para empresas",
    description:
      "Impresión digital, señalética, estructuras publicitarias e instalación para empresas en Chile. Más de 20 años de experiencia. Cotiza tu proyecto.",
    ogImageUrl: "/clients/viewone/home/hero-andacor.jpeg",
    businessType: "Organization",
    keywords: [
      "impresion digital empresas",
      "publicidad exterior chile",
      "estructuras publicitarias",
      "senaletica corporativa",
      "building wrap chile",
    ],
  },
});

export default clientConfig;
