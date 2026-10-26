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
    // Pase de diseño (feedback real del cliente, 15-oct-2026, "Dirección
    // visual · referencia azul elegida"): paleta exacta pedida por ViewOne,
    // validada además contra el perfil "B2B Service" de ui-ux-pro-max
    // (--domain color → primary #0F172A / accent #0369A1, navy + blue CTA),
    // que confirma que esta elección no es un default genérico sino la
    // dirección correcta para el rubro.
    palette: {
      primary: "#0A2F57", // Azul profundo — barras oscuras (header, overlays), nunca links/botones/íconos
      // Pase de fidelidad a la referencia (17-oct-2026): el azul de
      // botones/links/íconos en la imagen es notablemente más claro y vívido
      // que este accent (medido directo del botón "Cotiza tu proyecto":
      // rgb(16,102,228) ≈ #1668E3) — el #3779B8 anterior quedaba apagado en
      // comparación. Antes varios de estos elementos (eyebrows, links "Ver
      // todos...", íconos de servicios/atributos, botones de /servicios,
      // /proyectos y /contacto) usaban primary por error; se corrigieron a
      // accent además de este cambio de tono.
      accent: "#1668E3", // Azul vívido (CTAs, links, íconos, eyebrows)
      background: "#F2F7FB", // Fondo claro
      foreground: "#15202B", // Carbón
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
    whatsappButton: true,
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
    title: "Letreros, señalética e impresión digital para empresas | ViewOne",
    description:
      "Desarrollamos, producimos e instalamos letreros publicitarios, señalética, estructuras e impresión digital para empresas en Chile. Más de 20 años. Cotiza.",
    ogImageUrl: "/clients/viewone/home/hero-andacor.jpeg",
    businessType: "LocalBusiness",
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
