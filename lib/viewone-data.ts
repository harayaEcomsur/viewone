// Contenido real del handoff aprobado por ViewOne (categorías, proyectos,
// servicios y fotos de home) — mismo origen que config/client.config.ts.
// Interino mientras se construye el panel de administración: hoy esto vive
// como data estática, no editable desde un CMS todavía (ver plan de fases).

export type Categoria = string;

export interface Proyecto {
  categoria: Categoria;
  cliente: string;
  trabajo: string;
  foto: string;
  galeria: string[];
  // Solo presente en los 2 proyectos que el handoff documentó como ejemplo
  // de lightbox (slides 19-20) — el resto queda sin inventar hasta que el
  // panel de administración permita completarlo caso por caso.
  material?: string;
  aplicacion?: string;
}

export interface Servicio {
  nombre: string;
  trabajo: string;
  textoCorto: string;
  textoCompleto: string;
  cta: string;
  foto: string;
}

export const CATEGORIAS_ORDEN: Categoria[] = [
  "Señalética y letreros",
  "Muros, pisos y superficies",
  "Vidrios y vitrinas",
  "Vehículos",
  "Fachadas, cierres y exteriores",
  "Mobiliario, exhibidores y elementos especiales",
  "Eventos, stands y montajes",
  "Vía pública y gran formato",
];

const ASSET_BASE = "/clients/viewone/";

export const PROYECTOS: Proyecto[] = [
  {
    categoria: "Señalética y letreros",
    cliente: "Havas Group",
    trabajo: "Directorio exterior - 01",
    foto: ASSET_BASE + "proyectos/havas-group-directorio-exterior-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Señalética y letreros",
    cliente: "ESACHS",
    trabajo: "Señalética interior - 01",
    foto: ASSET_BASE + "proyectos/esachs-senaletica-interior-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Señalética y letreros",
    cliente: "ANDACOR",
    trabajo: "Señalética direccional - 01",
    foto: ASSET_BASE + "proyectos/andacor-senaletica-direccional-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Muros, pisos y superficies",
    cliente: "Inmobiliaria Koyam",
    trabajo: "Gráfica de muro interior - 01",
    foto: ASSET_BASE + "proyectos/inmobiliaria-koyam-grafica-de-muro-interior-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Muros, pisos y superficies",
    cliente: "Anasac",
    trabajo: "Gráfica de muro interior - 01",
    foto: ASSET_BASE + "proyectos/anasac-grafica-de-muro-interior-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Muros, pisos y superficies",
    cliente: "School of Rock",
    trabajo: "Gráfica de muro con frases - 03",
    foto: ASSET_BASE + "proyectos/school-of-rock-grafica-de-muro-con-frases-03.jpeg",
    galeria: [],
  },
  {
    categoria: "Vidrios y vitrinas",
    cliente: "Coca-Cola",
    trabajo: "Gráfica esmerilada en vidrios - 01",
    foto: ASSET_BASE + "proyectos/coca-cola-grafica-esmerilada-en-vidrios-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Vidrios y vitrinas",
    cliente: "Netafim",
    trabajo: "Gráfica esmerilada en vidrios - 02",
    foto: ASSET_BASE + "proyectos/netafim-grafica-esmerilada-en-vidrios-02.jpeg",
    galeria: [],
  },
  {
    categoria: "Vidrios y vitrinas",
    cliente: "Aconcagua",
    trabajo: "Gráfica de muro interior - 01",
    foto: ASSET_BASE + "proyectos/aconcagua-grafica-de-muro-interior-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Vehículos",
    cliente: "Reale Seguros",
    trabajo: "Gráfica vehicular - 01",
    foto: ASSET_BASE + "proyectos/reale-seguros-grafica-vehicular-01.jpeg",
    galeria: [],
    material: "Adhesivo vehicular impreso",
    aplicacion: "Camión",
  },
  {
    categoria: "Vehículos",
    cliente: "Fiat",
    trabajo: "Gráfica vehicular - 02",
    foto: ASSET_BASE + "proyectos/fiat-grafica-vehicular-02.jpeg",
    galeria: [],
  },
  {
    categoria: "Vehículos",
    cliente: "Verisure",
    trabajo: "Gráfica vehicular Transporte de Cortesía - 01",
    foto: ASSET_BASE + "proyectos/verisure-grafica-vehicular-transporte-de-cortesia-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Fachadas, cierres y exteriores",
    cliente: "Casa Fèvre",
    trabajo: "Letrero luminoso - 01",
    foto: ASSET_BASE + "proyectos/casa-fevre-letrero-luminoso-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Fachadas, cierres y exteriores",
    cliente: "School of Rock",
    trabajo: "Letrero de fachada - 01",
    foto: ASSET_BASE + "proyectos/school-of-rock-letrero-de-fachada-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Fachadas, cierres y exteriores",
    cliente: "SuperZoo",
    trabajo: "Gráfica de fachada - 01",
    foto: ASSET_BASE + "proyectos/superzoo-grafica-de-fachada-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Mobiliario, exhibidores y elementos especiales",
    cliente: "Marley Coffee",
    trabajo: "Logo corporativo - 01",
    foto: ASSET_BASE + "proyectos/marley-coffee-logo-corporativo-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Mobiliario, exhibidores y elementos especiales",
    cliente: "CCU",
    trabajo: "Letras corporativas - 01",
    foto: ASSET_BASE + "proyectos/ccu-letras-corporativas-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Mobiliario, exhibidores y elementos especiales",
    cliente: "Southbridge",
    trabajo: "Logos corpóreos exteriores - 02",
    foto: ASSET_BASE + "proyectos/southbridge-logos-corporeos-exteriores-02.jpeg",
    galeria: [],
  },
  {
    categoria: "Eventos, stands y montajes",
    cliente: "Vinci Compass",
    trabajo: "Gráfica evento corporativo - 01",
    foto: ASSET_BASE + "proyectos/vinci-compass-grafica-evento-corporativo-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Eventos, stands y montajes",
    cliente: "BICE",
    trabajo: "Graficas evento corporativo - 01",
    foto: ASSET_BASE + "proyectos/bice-graficas-evento-corporativo-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Eventos, stands y montajes",
    cliente: "Southbridge",
    trabajo: "Logos corpóreos exteriores - 01",
    foto: ASSET_BASE + "proyectos/southbridge-logos-corporeos-exteriores-01.jpeg",
    galeria: [ASSET_BASE + "proyectos/southbridge-logos-corporeos-exteriores-galeria-2.jpeg", ASSET_BASE + "proyectos/southbridge-logos-corporeos-exteriores-galeria-3.jpeg", ASSET_BASE + "proyectos/southbridge-logos-corporeos-exteriores-galeria-4.jpeg"],
    material: "Madera ruteada + estructura de fierro + LED",
    aplicacion: "Exterior evento",
  },
  {
    categoria: "Vía pública y gran formato",
    cliente: "Chevrolet",
    trabajo: "Letrero carretero Colorado - 02",
    foto: ASSET_BASE + "proyectos/chevrolet-letrero-carretero-colorado-02.jpeg",
    galeria: [],
  },
  {
    categoria: "Vía pública y gran formato",
    cliente: "Mall paseo del Puerto",
    trabajo: "Letrero de acceso - 01",
    foto: ASSET_BASE + "proyectos/mall-paseo-del-puerto-letrero-de-acceso-01.jpeg",
    galeria: [],
  },
  {
    categoria: "Vía pública y gran formato",
    cliente: "Noval Inmobiliaria",
    trabajo: "Cierre perimetral - 01",
    foto: ASSET_BASE + "proyectos/noval-inmobiliaria-cierre-perimetral-01.jpeg",
    galeria: [],
  },
];

export const SERVICIOS: Servicio[] = [
  {
    nombre: "Impresión Digital",
    trabajo: "Claro - Gráfica de muro - 01",
    textoCorto: "Imprimimos en gran formato para proyectos corporativos, comerciales y publicitarios.",
    textoCompleto: "Imprimimos en gran formato para proyectos corporativos, comerciales y publicitarios. El servicio contempla impresión, corte, terminaciones y aplicación según los requerimientos de cada proyecto.",
    cta: "Cotizar impresión",
    foto: ASSET_BASE + "servicios/impresion-digital.jpeg",
  },
  {
    nombre: "Señalética y Gráfica Corporativa",
    trabajo: "Viñedos Veramonte - Señalética exterior viñedo - 01",
    textoCorto: "Producimos señalética y elementos gráficos corporativos.",
    textoCompleto: "Producimos señalética y elementos gráficos corporativos para identificar, informar, orientar y comunicar una marca en oficinas, puntos de venta, salas de venta y otros espacios.",
    cta: "Cotizar proyecto",
    foto: ASSET_BASE + "servicios/senaletica-y-grafica-corporativa.jpeg",
  },
  {
    nombre: "Estructuras Publicitarias",
    trabajo: "Peugeot - Letrero carretero - 02",
    textoCorto: "Fabricamos estructuras y soportes publicitarios.",
    textoCompleto: "Fabricamos estructuras y soportes publicitarios que combinan una solución gráfica con una estructura física, adaptados a proyectos de distintas escalas y ubicaciones.",
    cta: "Cotizar estructura",
    foto: ASSET_BASE + "servicios/estructuras-publicitarias.jpeg",
  },
  {
    nombre: "Instalación y Montaje",
    trabajo: "Maestra - Stand evento - 01",
    textoCorto: "Instalamos y montamos las soluciones gráficas y publicitarias producidas por ViewOne.",
    textoCompleto: "Instalamos y montamos las soluciones gráficas y publicitarias producidas por ViewOne en oficinas, puntos de venta, eventos, espacios de marca y stands, coordinando su correcta implementación en terreno.",
    cta: "Solicitar cotización",
    foto: ASSET_BASE + "servicios/instalacion-y-montaje.jpeg",
  },
  {
    nombre: "Proyectos Integrales",
    trabajo: "Amphora - Fachada tienda - 01",
    textoCorto: "Desarrollamos proyectos que combinan distintas soluciones y etapas.",
    textoCompleto: "Desarrollamos proyectos que combinan distintas soluciones y etapas, integrando impresión, fabricación, terminaciones e instalación según los requerimientos de cada proyecto.",
    cta: "Cuéntanos tu proyecto",
    foto: ASSET_BASE + "servicios/proyectos-integrales.jpeg",
  },
];

export const HOME_PROYECTOS_DESTACADOS = [
  { nombre: "HEAD", foto: ASSET_BASE + "home/destacado-head.jpeg" },
  { nombre: "Aconcagua", foto: ASSET_BASE + "home/destacado-aconcagua.jpeg" },
  { nombre: "Koyam", foto: ASSET_BASE + "home/destacado-koyam.jpeg" },
  { nombre: "LarrainVial", foto: ASSET_BASE + "home/destacado-larrainvial.jpeg" },
];

export const HOME_HERO_FOTO = ASSET_BASE + "home/hero-andacor.jpeg";
export const HOME_NOSOTROS_FOTO = ASSET_BASE + "home/nosotros-letrero-madera.png";

// 20 clientes del handoff (slide 09) — placeholders de texto a propósito:
// son la lista NUEVA que ViewOne quiere mostrar, distinta a los logos reales
// del sitio viejo, y el handoff no trae logos gráficos para estos todavía.
export const CLIENTES_DESTACADOS = [
  "Coca-Cola",
  "BCI",
  "Peugeot",
  "Mazda",
  "Aconcagua",
  "Andacor / El Colorado",
  "Santander",
  "LarrainVial",
];

export const CLIENTES_TODOS = [
  "Coca-Cola",
  "BCI",
  "Peugeot",
  "Mazda",
  "Santander",
  "LarrainVial",
  "BICE",
  "CCU",
  "Chevrolet",
  "Volkswagen",
  "Entel",
  "Derco",
  "Salfa",
  "Aconcagua",
  "Andacor / El Colorado",
  "Anasac",
  "Havas Group",
  "SuperZoo",
  "Verisure",
  "Claro",
];
