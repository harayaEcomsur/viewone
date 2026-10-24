// Productos del visualizador 3D (concepto en staging, 2026-10-24): el
// cliente sube su diseño y lo ve aplicado sobre el soporte real, a escala.
//
// Los modelos son geometría procedural (cajas, planos, cilindros), no
// archivos .glb: se adaptan a cualquier medida que escriba el cliente sin
// deformar marcos ni bases, pesan cero y no dependen de modelar en Blender.
// Un .glb solo vale la pena para formas libres (un modelo de vehículo
// real); el furgón de acá es una aproximación de cajas, suficiente para
// ubicar el diseño en el costado.

// sessionStorage: el visualizador deja aquí el diseño para que
// ContactoForm lo adjunte solo (sin dependencias de three en /contacto).
export const CLAVE_COTIZACION = "viewone-visualizador";

export type ProductoId =
  | "senalPoste"
  | "placaMuro"
  | "totem"
  | "graficaMuro"
  | "vinilPiso"
  | "vidriera"
  | "furgon"
  | "fachada"
  | "cajaLuz"
  | "cierre"
  | "corporeo"
  | "pendon"
  | "backing"
  | "carretero";

export interface Producto {
  id: ProductoId;
  /** Categoría del catálogo de /proyectos (mismo nombre, para mostrar trabajos reales). */
  categoria: string;
  nombre: string;
  descripcion: string;
  /** Medidas por defecto del área impresa, en cm. */
  ancho: number;
  alto: number;
  min: number;
  max: number;
  /** Medidas típicas para elegir con un clic. */
  presets: { ancho: number; alto: number }[];
  /** Medida fija del soporte (vehículo): no se edita, solo informa. */
  fijo?: boolean;
  /** Se ilumina de noche (caja de luz). */
  luminoso?: boolean;
  /** El fondo puede quedar transparente (vinilo de corte, esmerilado). */
  admiteTransparencia?: boolean;
  /** Solo existe la silueta del diseño (letras corpóreas): nunca lleva fondo. */
  soloSilueta?: boolean;
  /** Admite vinilo esmerilado además del de color. */
  admiteEsmerilado?: boolean;
}

// Ordenado y agrupado igual que el catálogo de /proyectos (CATEGORIAS_ORDEN
// en lib/viewone-data.ts): cada categoría de trabajos reales de ViewOne
// tiene al menos un soporte para previsualizar.
export const PRODUCTOS: Producto[] = [
  // Señalética y letreros
  {
    id: "senalPoste",
    categoria: "Señalética y letreros",
    nombre: "Señalética direccional",
    descripcion: "Placa a dos caras en poste, para orientar en recintos, viñedos, parques y estacionamientos.",
    ancho: 80,
    alto: 30,
    min: 20,
    max: 200,
    presets: [
      { ancho: 60, alto: 20 },
      { ancho: 80, alto: 30 },
      { ancho: 120, alto: 40 },
    ],
  },
  {
    id: "placaMuro",
    categoria: "Señalética y letreros",
    nombre: "Señalética de muro",
    descripcion: "Placa en muro con separadores: oficinas, recepciones, salas y accesos.",
    ancho: 60,
    alto: 40,
    min: 10,
    max: 300,
    presets: [
      { ancho: 30, alto: 20 },
      { ancho: 60, alto: 40 },
      { ancho: 100, alto: 70 },
    ],
  },
  {
    id: "totem",
    categoria: "Señalética y letreros",
    nombre: "Tótem o directorio",
    descripcion: "Estructura de pie a dos caras para accesos, directorios de edificios y estacionamientos.",
    ancho: 80,
    alto: 220,
    min: 40,
    max: 600,
    presets: [
      { ancho: 60, alto: 180 },
      { ancho: 80, alto: 220 },
      { ancho: 120, alto: 300 },
    ],
  },
  // Muros, pisos y superficies
  {
    id: "graficaMuro",
    categoria: "Muros, pisos y superficies",
    nombre: "Gráfica de muro",
    descripcion: "Vinilo o papel mural impreso, de muro completo, para oficinas, tiendas y salas.",
    ancho: 400,
    alto: 250,
    min: 50,
    max: 2000,
    presets: [
      { ancho: 300, alto: 240 },
      { ancho: 400, alto: 250 },
      { ancho: 600, alto: 280 },
    ],
  },
  {
    id: "vinilPiso",
    categoria: "Muros, pisos y superficies",
    nombre: "Vinilo de piso",
    descripcion: "Gráfica antideslizante para piso: señalización, promociones y circulación.",
    ancho: 100,
    alto: 100,
    min: 20,
    max: 600,
    presets: [
      { ancho: 60, alto: 60 },
      { ancho: 100, alto: 100 },
      { ancho: 200, alto: 100 },
    ],
  },
  // Vidrios y vitrinas
  {
    id: "vidriera",
    categoria: "Vidrios y vitrinas",
    nombre: "Vinilo en vidrio",
    descripcion: "Vinilo de color o esmerilado sobre vidrio de local u oficina. Usa un PNG con fondo transparente para ver el recorte.",
    ancho: 200,
    alto: 220,
    min: 30,
    max: 800,
    presets: [
      { ancho: 120, alto: 200 },
      { ancho: 200, alto: 220 },
      { ancho: 300, alto: 250 },
    ],
    admiteTransparencia: true,
    admiteEsmerilado: true,
  },
  // Vehículos
  {
    id: "furgon",
    categoria: "Vehículos",
    nombre: "Gráfica vehicular",
    descripcion: "Ploteo de furgón: el diseño va en los dos costados del área de carga. La medida final depende del modelo.",
    ancho: 300,
    alto: 160,
    min: 300,
    max: 300,
    presets: [],
    fijo: true,
  },
  // Fachadas, cierres y exteriores
  {
    id: "fachada",
    categoria: "Fachadas, cierres y exteriores",
    nombre: "Letrero de fachada",
    descripcion: "Panel rígido (ACM o PVC) instalado en muro, sobre el acceso.",
    ancho: 300,
    alto: 80,
    min: 30,
    max: 1200,
    presets: [
      { ancho: 200, alto: 60 },
      { ancho: 300, alto: 80 },
      { ancho: 500, alto: 100 },
    ],
  },
  {
    id: "cajaLuz",
    categoria: "Fachadas, cierres y exteriores",
    nombre: "Letrero luminoso",
    descripcion: "Caja de luz con tela o acrílico retroiluminado. Cambia a modo noche para verla encendida.",
    ancho: 200,
    alto: 60,
    min: 30,
    max: 800,
    presets: [
      { ancho: 120, alto: 40 },
      { ancho: 200, alto: 60 },
      { ancho: 300, alto: 100 },
    ],
    luminoso: true,
  },
  {
    id: "cierre",
    categoria: "Fachadas, cierres y exteriores",
    nombre: "Cierre perimetral",
    descripcion: "Gráfica continua sobre cierre de obra o recinto, con pilares cada 2,4 m.",
    ancho: 1000,
    alto: 220,
    min: 240,
    max: 4000,
    presets: [
      { ancho: 720, alto: 200 },
      { ancho: 1000, alto: 220 },
      { ancho: 2000, alto: 240 },
    ],
  },
  // Mobiliario, exhibidores y elementos especiales
  {
    id: "corporeo",
    categoria: "Mobiliario, exhibidores y elementos especiales",
    nombre: "Letras o logo corpóreo",
    descripcion: "Logo o letras con volumen, separados del muro. Sube un PNG con fondo transparente: se recorta la silueta.",
    ancho: 150,
    alto: 50,
    min: 20,
    max: 800,
    presets: [
      { ancho: 80, alto: 30 },
      { ancho: 150, alto: 50 },
      { ancho: 300, alto: 100 },
    ],
    soloSilueta: true,
  },
  // Eventos, stands y montajes
  {
    id: "pendon",
    categoria: "Eventos, stands y montajes",
    nombre: "Pendón roller",
    descripcion: "Pendón enrollable con base de aluminio, para eventos y puntos de venta.",
    ancho: 85,
    alto: 200,
    min: 40,
    max: 300,
    presets: [
      { ancho: 80, alto: 200 },
      { ancho: 85, alto: 200 },
      { ancho: 100, alto: 200 },
      { ancho: 120, alto: 200 },
    ],
  },
  {
    id: "backing",
    categoria: "Eventos, stands y montajes",
    nombre: "Backing o muro de prensa",
    descripcion: "Tela tensada en marco de aluminio, para fondos de evento, stands y photocalls.",
    ancho: 300,
    alto: 230,
    min: 100,
    max: 800,
    presets: [
      { ancho: 240, alto: 230 },
      { ancho: 300, alto: 230 },
      { ancho: 450, alto: 250 },
    ],
  },
  // Vía pública y gran formato
  {
    id: "carretero",
    categoria: "Vía pública y gran formato",
    nombre: "Letrero carretero",
    descripcion: "Valla de gran formato sobre monoposte, para carreteras y accesos.",
    ancho: 1200,
    alto: 400,
    min: 300,
    max: 1500,
    presets: [
      { ancho: 800, alto: 300 },
      { ancho: 1200, alto: 400 },
      { ancho: 1500, alto: 500 },
    ],
  },
];

/** Categorías en el orden del catálogo, solo las que tienen soporte. */
export const CATEGORIAS_VISUALIZADOR: string[] = Array.from(new Set(PRODUCTOS.map((p) => p.categoria)));

export function productoPorId(id: ProductoId): Producto {
  return PRODUCTOS.find((p) => p.id === id) ?? PRODUCTOS[0];
}

export type Ajuste = "cubrir" | "ajustar" | "estirar";

export const AJUSTES: { id: Ajuste; nombre: string; ayuda: string }[] = [
  { id: "ajustar", nombre: "Ajustar", ayuda: "Muestra el diseño completo; sobra fondo a los lados." },
  { id: "cubrir", nombre: "Rellenar", ayuda: "Llena toda la superficie; puede recortar los bordes." },
  { id: "estirar", nombre: "Estirar", ayuda: "Ocupa todo deformando el diseño." },
];

// Resolución real a la medida de impresión. En gran formato no se pide
// 300 dpi como en papel: se mira de lejos. Referencia usual de imprentas:
// ~100 dpi o más se ve nítido de cerca, 50–100 sirve para ver a 1–2 m o más,
// bajo 50 se nota pixelado.
export type Calidad = { nivel: "buena" | "media" | "baja" | "vectorial"; dpi: number | null; texto: string };

export function calidadImpresion(
  img: { ancho: number; alto: number; vectorial: boolean } | null,
  anchoCm: number,
  altoCm: number,
  ajuste: Ajuste
): Calidad | null {
  if (!img) return null;
  if (img.vectorial) return { nivel: "vectorial", dpi: null, texto: "Vectorial: se imprime nítido a cualquier tamaño." };
  const dpiX = img.ancho / (anchoCm / 2.54);
  const dpiY = img.alto / (altoCm / 2.54);
  // Rellenar amplía hasta cubrir el lado más exigente (vale el dpi menor);
  // ajustar, solo hasta que entra (vale el mayor); estirar, cada eje por
  // separado (vale el peor).
  const dpi = Math.round(ajuste === "ajustar" ? Math.max(dpiX, dpiY) : Math.min(dpiX, dpiY));
  if (dpi >= 100) return { nivel: "buena", dpi, texto: "Buena resolución para esta medida." };
  if (dpi >= 50) return { nivel: "media", dpi, texto: "Sirve si se mira desde 1–2 metros o más." };
  return { nivel: "baja", dpi, texto: "Baja para esta medida: puede verse pixelado. Si tienes el archivo original o vectorial (PDF, AI, SVG), mejor." };
}

// La cara impresa se compone en un canvas 2D con la proporción exacta de la
// medida: así rellenar/ajustar/estirar y el color de fondo se resuelven una
// sola vez, y el modelo 3D solo recibe una textura lista.
export function componerCara(
  img: CanvasImageSource | null,
  imgAncho: number,
  imgAlto: number,
  anchoCm: number,
  altoCm: number,
  ajuste: Ajuste,
  fondo: string | null,
  esmerilado = false
): HTMLCanvasElement {
  const LADO_MAX = 2048;
  const escala = LADO_MAX / Math.max(anchoCm, altoCm);
  const w = Math.max(2, Math.round(anchoCm * escala));
  const h = Math.max(2, Math.round(altoCm * escala));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  if (fondo) {
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, w, h);
  }
  if (!img) return canvas;
  if (ajuste === "estirar") {
    ctx.drawImage(img, 0, 0, w, h);
  } else {
    const s = ajuste === "cubrir" ? Math.max(w / imgAncho, h / imgAlto) : Math.min(w / imgAncho, h / imgAlto);
    const dw = imgAncho * s;
    const dh = imgAlto * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }
  if (esmerilado) {
    // El esmerilado no tiene color: es vidrio "arenado" blanco translúcido
    // con la forma del diseño. Se conserva solo la silueta (alfa).
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "rgba(244,247,249,0.82)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  }
  return canvas;
}

// Diseño de ejemplo mientras el cliente no sube el suyo: muestra la medida
// real, para que se entienda que el modelo está a escala.
export function disenoEjemplo(anchoCm: number, altoCm: number, transparente = false): HTMLCanvasElement {
  const escala = 1024 / Math.max(anchoCm, altoCm);
  const w = Math.max(64, Math.round(anchoCm * escala));
  const h = Math.max(64, Math.round(altoCm * escala));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  if (transparente) {
    // Corpóreo / vinilo de corte: solo el texto, sin placa de fondo.
    ctx.fillStyle = "#1668E3";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const t = Math.min(w / 7, h / 1.6);
    ctx.font = `900 ${t}px system-ui, sans-serif`;
    ctx.fillText("TU LOGO", w / 2, h / 2);
    return c;
  }
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#0A2F57");
  grad.addColorStop(1, "#1668E3");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const m = Math.min(w, h) * 0.06;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = Math.max(2, m * 0.08);
  ctx.setLineDash([m * 0.5, m * 0.35]);
  ctx.strokeRect(m, m, w - 2 * m, h - 2 * m);
  ctx.setLineDash([]);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const base = Math.min(w / 9, h / 4);
  ctx.font = `800 ${base}px system-ui, sans-serif`;
  ctx.fillText("Tu diseño aquí", w / 2, h / 2 - base * 0.35);
  ctx.font = `600 ${base * 0.42}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText(`${anchoCm} × ${altoCm} cm`, w / 2, h / 2 + base * 0.55);
  return c;
}
