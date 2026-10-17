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
// Optimización de performance (2026-10-16): esta foto venía como PNG (sin
// transparencia real — hasAlpha: no) a 1.77MB; convertida a JPEG calidad 88
// queda en ~437KB, mismo contenido visual, sin pérdida perceptible. Se deja
// el .png viejo en el repo sin borrar por si un registro ya guardado en la
// tabla `settings` (vía /viewone-admin) todavía apunta a esa ruta.
export const HOME_NOSOTROS_FOTO = ASSET_BASE + "home/nosotros-letrero-madera.jpg";

// 20 clientes del handoff (slide 09) — placeholders de texto a propósito:
// son la lista NUEVA que ViewOne quiere mostrar, distinta a los logos reales
// del sitio viejo, y el handoff no trae logos gráficos para estos todavía.
//
// "Andacor / El Colorado" y "Anasac" salieron de esta lista (17-oct-2026,
// pedido explícito): no aparecen en la imagen de referencia del cliente,
// que en esas 2 posiciones muestra "Agrosuper" y "Falabella" — la regla es
// estricta: si el nombre del cliente real no está en la imagen, se
// desactiva de esta sección en vez de mostrarse como texto. (Sí existe un
// logo real para ambos, encontrado en un sitio Wix sin publicar del
// cliente — ctrlroom7.wixstudio.com/my-site-5 → "Nuestros Clientes" — pero
// no se usa acá por la regla anterior ni para mantener los logos actuales
// sin tocar, pedido aparte.)
//
// "Agrosuper" y "Falabella" SÍ se agregan (mismo pedido, 17-oct-2026): son
// los 2 nombres que la imagen de referencia muestra en esas posiciones, y
// ahora sí tienen logo real (ver CLIENTE_LOGO) — con eso la fila vuelve a
// los 20 nombres exactos de la imagen, los 20 con logo real.
// Ampliación a ~38 clientes (17-oct-2026, pedido explícito vía
// AskUserQuestion: "Sí, agregar los 18 (Recomendado)" sobre la lista de
// clientes reales identificada en el sitio Wix sin publicar del cliente
// (ctrlroom7.wixstudio.com/my-site-5 → "Nuestros Clientes"). Mismo criterio
// que el resto del archivo: ese sitio Wix solo sirvió para IDENTIFICAR cuáles
// son clientes reales — todos los logos de abajo se buscaron de nuevo en el
// sitio oficial vigente de cada marca ("deja los logos actuales, no ocupes
// logos antiguos", pedido explícito del cliente), nunca se reusó el archivo
// del Wix.
//
// De los ~19 nombres candidatos, 16 quedaron con logo verificable y 3 se
// excluyeron (no se fabricó ni se adivinó ningún logo):
// - Patio Bellavista: el sitio oficial (patiobellavista.cl) está caído
//   (error de conexión a base de datos WordPress) y no hay alternativa
//   confiable (Wikimedia Commons no tiene el logo).
// - Deportes Zapallar: resultó ser una sub-página de la Municipalidad de
//   Zapallar sin marca gráfica propia, no una entidad separada.
// - Municipalidad de Zapallar: el único asset disponible en su sitio es de
//   85×39px (confirmado incluso sin los parámetros de recorte de la URL —
//   el archivo fuente es así de chico), ilegible a cualquier escala.
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
  "Agrosuper",
  "Aconcagua",
  "Havas Group",
  "SuperZoo",
  "Verisure",
  "Claro",
  "Falabella",
  "El Colorado",
  "SuKsa",
  "Wood Inmobiliaria",
  "IDEA Inmobiliaria",
  "Undurraga",
  "Saint George's College",
  "DESCO",
  "Anasac",
  "Inmobiliaria Almahue",
  "ZIVO Inmobiliaria",
  "NUMANCIA Inmobiliaria",
  "School of Rock",
  "Netafim",
  "maestra",
  "sanasalud",
  "INMOBILIA",
];

// Logos placeholder (pedido explícito del cliente, 16-oct-2026: "Dejalos
// como placeholder"): recortados directo de la imagen de referencia que
// ViewOne mandó — esa imagen es un mockup de 900×1600px, así que cada logo
// sale de ~100×30px recortados y reescalados. Se ve borroso a propósito.
//
// Pase 2 (mismo día): el cliente pidió reemplazarlos por logos oficiales en
// mejor calidad buscados en internet. 18 de 18 ya están resueltos con el
// archivo oficial (Wikimedia Commons o el propio sitio de la marca; SVG en
// la mayoría, JPG/PNG donde esa era la única fuente confiable disponible —
// ver cada comentario abajo).
//
// LarrainVial/Aconcagua/SuperZoo necesitaron un enfoque distinto al resto:
// un curl directo a la URL que cada sitio referencia en su propio HTML
// fallaba (404 en LarrainVial, 403 en Aconcagua) o encontraba el asset
// equivocado (el ícono de la mascota de SuperZoo, no el logotipo). La
// navegación con un browser real (Claude in Chrome) sorteó los tres
// problemas a la vez: ejecuta el JS/redirects de la página, así que
// `getComputedStyle`/`<img src>` da la URL real del asset ya resuelta
// (ej. LarrainVial sirve su logo desde el subdominio chile.larrainvial.com,
// no www. — por eso el curl directo a www. 404aba) en vez de la que el
// bot-protection o un typo de ruta rompen con curl/WebFetch.
//
export const CLIENTE_LOGO: Partial<Record<(typeof CLIENTES_TODOS)[number], string>> = {
  "Coca-Cola": ASSET_BASE + "clientes/coca-cola.svg",
  BCI: ASSET_BASE + "clientes/bci.svg",
  Peugeot: ASSET_BASE + "clientes/peugeot.svg",
  Mazda: ASSET_BASE + "clientes/mazda.svg",
  Santander: ASSET_BASE + "clientes/santander.svg",
  LarrainVial: ASSET_BASE + "clientes/larrainvial.svg", // chile.larrainvial.com/img/logo_larrainvial_color.svg (el subdominio real, no www.)
  BICE: ASSET_BASE + "clientes/bice.png", // Wikimedia Commons: "Banco BICE" (Chile) — el primer SVG encontrado con ese nombre era de un banco argentino homónimo, se descartó. Reprocesado a PNG con canal alfa (el JPG original no tenía transparencia) para que funcione con la técnica mask-image de la fila "destacados", ver ViewOneHome.tsx
  CCU: ASSET_BASE + "clientes/ccu.svg",
  Chevrolet: ASSET_BASE + "clientes/chevrolet.png",
  Volkswagen: ASSET_BASE + "clientes/volkswagen.svg",
  Entel: ASSET_BASE + "clientes/entel.svg",
  Derco: ASSET_BASE + "clientes/derco.svg", // derco.cl/derco/LogoFooter.svg (la versión Logo.svg del header es blanca, invisible sobre fondo claro)
  Salfa: ASSET_BASE + "clientes/salfa.png", // salfa.cl (WordPress, logo en /wp-content/uploads/)
  Agrosuper: ASSET_BASE + "clientes/agrosuper.png", // agrosuper.com (logo "Empresas Agrosuper" vigente en su propio sitio; la imagen de referencia usa una variante más antigua con swoosh que ya no publican)
  Aconcagua: ASSET_BASE + "clientes/aconcagua.png", // iaconcagua.com/Content/img/aconcagua-logo.png — el sitio Wix sin publicar (ctrlroom7.wixstudio.com/my-site-5) tiene otro logo de Aconcagua, pero es una versión antigua; se mantiene este, el vigente
  "Havas Group": ASSET_BASE + "clientes/havas-group.svg",
  SuperZoo: ASSET_BASE + "clientes/superzoo.svg", // superzoo.cl, variante roja del logo (la que sirven por defecto es blanca, pensada para fondo oscuro — mismo problema que Derco)
  Verisure: ASSET_BASE + "clientes/verisure.svg", // verisure.cl/sites/cl/files/flmngr/logo-verisure.svg
  Claro: ASSET_BASE + "clientes/claro.svg", // clarochile.cl/portal/cl/recursos_tema_evo/assets/vector/logo-claro-rojo.svg — ni el primer Claro.svg (Wikimedia, solo el isotipo circular → círculo sólido con mask-image) ni claro.cl (dominio real de "Claro y Cía.", un estudio jurídico homónimo, no la telecom) eran correctos
  Falabella: ASSET_BASE + "clientes/falabella.svg", // Wikimedia Commons, wordmark script oficial — calza exacto con la referencia

  // Los 16 nuevos (ver comentario sobre CLIENTES_TODOS) — mismo método que
  // arriba: verificar el dominio oficial real antes de confiar en el logo,
  // extraer el archivo vigente del propio sitio, y si el PNG/JPG venía
  // opaco con fondo blanco/gris en vez de transparencia real, reprocesarlo
  // con un umbral de luminancia para recuperar el canal alfa.
  "El Colorado": ASSET_BASE + "clientes/el-colorado.svg", // elcolorado.cl, SVG inline del header (ícono + wordmark "El Colorado / Centro de Montaña")
  SuKsa: ASSET_BASE + "clientes/suksa.png", // suksa.cl/img/logo.png — venía opaco sobre blanco, reprocesado con canal alfa
  "Wood Inmobiliaria": ASSET_BASE + "clientes/wood.png", // iwood.cl/images/logo-wood-blanco.png — ya transparente (diseño blanco pensado para fondo oscuro, igual que Derco/SuperZoo)
  "IDEA Inmobiliaria": ASSET_BASE + "clientes/idea.svg", // idea.cl/wp-content/themes/idea-inmobiliaria/assets/img/logo.svg — el ícono tiene barras de color que la técnica mask-image aplana a un solo tono sólido (mismo trade-off aceptado que en otros logos multicolor)
  Undurraga: ASSET_BASE + "clientes/undurraga.svg", // undurraga.cl/wp-content/uploads/2022/05/logo_undurraga.svg
  "Saint George's College": ASSET_BASE + "clientes/saint-george.svg", // saintgeorge.cl — escudo "Santiago St. George's College / Recte At Ardua"
  DESCO: ASSET_BASE + "clientes/desco.png", // desco.cl/wp-content/uploads/2024/03/logo_desco_transparente.png — reprocesado (alfa casi opaco) y recortado al isotipo "D" verde; el wordmark no se logró recuperar del archivo fuente
  Anasac: ASSET_BASE + "clientes/anasac.png", // anasac.cl/wp-content/uploads/2024/11/logo.png
  "Inmobiliaria Almahue": ASSET_BASE + "clientes/almahue.svg", // ialmahue.com/wp-content/uploads/2022/01/logo_almahue.svg — bloqueado por curl directo (403), extraído con fetch() same-origin desde el navegador
  "ZIVO Inmobiliaria": ASSET_BASE + "clientes/zivo.png", // zivo.cl — el archivo original es un lockup combinado "ZIVO INMOBILIARIA | TERRAVISTA"; recortado para dejar solo la marca ZIVO
  "NUMANCIA Inmobiliaria": ASSET_BASE + "clientes/numancia.png", // numancia.cl/wp-content/uploads/2022/04/logo-numancia-200.png
  "School of Rock": ASSET_BASE + "clientes/school-of-rock.png", // CDN de schoolofrock.com, variante @3x (la @1x por defecto quedaba demasiado chica)
  Netafim: ASSET_BASE + "clientes/netafim.svg", // de-proxificado desde la URL de resize de Cloudflare que sirve netafim.cl hasta el SVG original en netafim.com; recortado (editando el viewBox) para dejar gotas + wordmark + "An Orbia business", sacando el ícono circular multicolor de la derecha
  maestra: ASSET_BASE + "clientes/maestra.svg", // maestra.cl/wp-content/themes/maestra-2022/img/logo-maestra-main.svg
  sanasalud: ASSET_BASE + "clientes/sanasalud.svg", // sanasalud.cl/stuff/uploads/2025/12/Sanasalud-1.svg
  INMOBILIA: ASSET_BASE + "clientes/inmobilia.png", // inmobiliachile.cl/images/logo/new_logo_inm.png — el original venía con un sello "+30 AÑOS" pegado; recortado para dejar solo el wordmark INMOBILIA
};

// 8 destacados (feedback real, "Dirección visual": "Solo 8 destacados, con
// logos", arriba del Home; los 20 completos van abajo en carrusel lento) —
// los primeros 8 de la lista de arriba, mismo orden que la referencia visual
// elegida por el cliente.
export const CLIENTES_DESTACADOS = CLIENTES_TODOS.slice(0, 8);
