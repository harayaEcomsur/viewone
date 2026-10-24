"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Camera, Moon, Sun, Upload, User, X } from "lucide-react";
import {
  AJUSTES,
  CATEGORIAS_VISUALIZADOR,
  CLAVE_COTIZACION,
  PRODUCTOS,
  calidadImpresion,
  componerCara,
  disenoEjemplo,
  productoPorId,
  type Ajuste,
  type ProductoId,
} from "./productos";
import type { Acabado } from "./Escena";
import { mismoOrigen } from "@/lib/viewone-media";

// three.js solo existe en el navegador y pesa: se carga aparte, únicamente
// en esta página, y el resto del sitio no paga ese costo.
const Escena = dynamic(() => import("./Escena"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-foreground/50">Cargando vista 3D…</div>
  ),
});

interface Imagen {
  el: HTMLImageElement;
  ancho: number;
  alto: number;
  vectorial: boolean;
  nombre: string;
  archivo: File;
}

// El diseño viaja a /contacto adjunto si cabe en sessionStorage (~5 MB por
// origen; en base64 pesa un tercio más).
const MAX_ADJUNTO_BYTES = 3.5 * 1024 * 1024;

/** Lo mínimo de un proyecto del catálogo para mostrarlo como ejemplo real. */
export interface ProyectoEjemplo {
  cliente: string;
  trabajo: string;
  portada: string;
  categorias: string[];
}

type Vinilo = "color" | "esmerilado";

export function Visualizador({ proyectos }: { proyectos: ProyectoEjemplo[] }) {
  const [productoId, setProductoId] = useState<ProductoId>("fachada");
  const producto = productoPorId(productoId);
  const [ancho, setAncho] = useState(producto.ancho);
  const [alto, setAlto] = useState(producto.alto);
  // "Ajustar" por defecto: lo primero que el cliente tiene que ver es su
  // diseño completo, no un recorte.
  const [ajuste, setAjuste] = useState<Ajuste>("ajustar");
  const [fondo, setFondo] = useState("#ffffff");
  const [fondoTransparente, setFondoTransparente] = useState(false);
  const [acabado, setAcabado] = useState<Acabado>("mate");
  const [vinilo, setVinilo] = useState<Vinilo>("color");
  const [noche, setNoche] = useState(false);
  const [escalaHumana, setEscalaHumana] = useState(true);
  const [imagen, setImagen] = useState<Imagen | null>(null);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // La cara impresa se arma con un canvas del navegador: hasta montar no hay
  // document, y renderizarla en el servidor rompería la hidratación.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  function elegirProducto(id: ProductoId) {
    const p = productoPorId(id);
    setProductoId(id);
    setAncho(p.ancho);
    setAlto(p.alto);
    setFondoTransparente(Boolean(p.admiteTransparencia));
    if (!p.admiteEsmerilado) setVinilo("color");
    if (p.luminoso) setNoche(true);
  }

  // Medidas válidas para la escena aunque el input esté a medio escribir.
  // Un soporte de medida fija (vehículo) usa siempre la suya.
  const anchoOk = producto.fijo ? producto.ancho : clamp(ancho, producto.min, producto.max);
  const altoOk = producto.fijo ? producto.alto : clamp(alto, producto.min, producto.max);

  const cara = useMemo(() => {
    if (!montado) return null;
    const esmerilado = vinilo === "esmerilado" && Boolean(producto.admiteEsmerilado);
    const sinFondo = producto.soloSilueta || (fondoTransparente && producto.admiteTransparencia);
    const base = imagen
      ? { el: imagen.el as CanvasImageSource, ancho: imagen.ancho, alto: imagen.alto, ajuste }
      : { el: disenoEjemplo(anchoOk, altoOk, Boolean(producto.soloSilueta || producto.admiteTransparencia)), ancho: 0, alto: 0, ajuste: "estirar" as Ajuste };
    if (!imagen) {
      const c = base.el as HTMLCanvasElement;
      base.ancho = c.width;
      base.alto = c.height;
    }
    return componerCara(base.el, base.ancho, base.alto, anchoOk, altoOk, base.ajuste, sinFondo ? null : fondo, esmerilado);
  }, [montado, imagen, anchoOk, altoOk, ajuste, fondo, fondoTransparente, vinilo, producto]);

  // Trabajos reales de ViewOne en la misma categoría del catálogo: el
  // cliente ve que esto ya se hizo, no solo una maqueta.
  const ejemplos = useMemo(
    () => proyectos.filter((p) => p.categorias.includes(producto.categoria)).slice(0, 3),
    [proyectos, producto.categoria]
  );

  const calidad = calidadImpresion(imagen, anchoOk, altoOk, ajuste);

  useEffect(() => () => {
    if (imagen) URL.revokeObjectURL(imagen.el.src);
  }, [imagen]);

  async function cargarArchivo(file: File) {
    setErrorImagen(null);
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
      setErrorImagen("Sube una imagen PNG, JPG, WEBP o SVG. Si tu diseño está en PDF o AI, adjúntalo en la cotización.");
      return;
    }
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.src = url;
    try {
      await el.decode();
    } catch {
      URL.revokeObjectURL(url);
      setErrorImagen("No pudimos leer esa imagen. Prueba exportándola de nuevo como PNG o JPG.");
      return;
    }
    const vectorial = file.type === "image/svg+xml";
    // Un SVG sin width/height no trae tamaño propio: se le da uno amplio; al
    // ser vectorial, el canvas lo rasteriza nítido igual.
    const ancho = el.naturalWidth || 2048;
    const alto = el.naturalHeight || 2048;
    setImagen({ el, ancho, alto, vectorial, nombre: file.name, archivo: file });
  }

  function descargarImagen() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `viewone-${productoId}-${anchoOk}x${altoOk}cm.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  }

  async function cotizar() {
    const tipo = producto.admiteEsmerilado ? `, vinilo ${vinilo}` : "";
    const medidaTxt = producto.fijo ? "medida según el vehículo" : `${anchoOk} × ${altoOk} cm`;
    const necesidad = `${producto.nombre}, ${medidaTxt} (acabado ${acabado}${tipo}).${
      imagen ? ` Diseño: ${imagen.nombre}.` : ""
    } Lo vi en el visualizador 3D.`;
    const medidas = producto.fijo ? "" : `${anchoOk} × ${altoOk} cm`;
    try {
      sessionStorage.removeItem(CLAVE_COTIZACION);
      if (imagen && imagen.archivo.size <= MAX_ADJUNTO_BYTES) {
        const dataUrl = await leerComoDataUrl(imagen.archivo);
        sessionStorage.setItem(
          CLAVE_COTIZACION,
          JSON.stringify({ nombre: imagen.nombre, tipo: imagen.archivo.type, dataUrl })
        );
      }
    } catch {
      // Sin sessionStorage (modo privado, cuota llena): se cotiza igual, sin adjunto.
    }
    const q = new URLSearchParams({ necesidad, medidas, desde: "visualizador" });
    window.location.href = `/contacto?${q.toString()}`;
  }

  const btnSeg = (activo: boolean) =>
    `flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-xs font-bold transition-colors ${
      activo ? "bg-accent text-background shadow" : "text-foreground/60 hover:text-foreground"
    }`;
  const labelClass = "text-xs font-bold uppercase tracking-wide text-foreground/50";
  const inputClass =
    "mt-1 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";
  const paso = "text-xs font-bold uppercase tracking-[0.2em] text-accent";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Vista 3D */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative h-[60vh] min-h-[360px] overflow-hidden rounded-2xl border border-foreground/10 bg-[#eef1f5] lg:h-[calc(100vh-8rem)]">
          {cara && (
            <Escena
              producto={productoId}
              anchoCm={anchoOk}
              altoCm={altoOk}
              cara={cara}
              noche={noche}
              escalaHumana={escalaHumana}
              acabado={acabado}
              onCanvas={(el) => (canvasRef.current = el)}
            />
          )}
          <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-background/85 px-2.5 py-1 text-xs font-semibold text-foreground/70 backdrop-blur">
            {producto.nombre} · {anchoOk} × {altoOk} cm{producto.fijo ? " aprox." : ""}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1 rounded-lg bg-background/90 p-1 shadow backdrop-blur">
              <button type="button" onClick={() => setNoche(false)} className={btnSeg(!noche)} aria-pressed={!noche}>
                <Sun size={14} /> Día
              </button>
              <button type="button" onClick={() => setNoche(true)} className={btnSeg(noche)} aria-pressed={noche}>
                <Moon size={14} /> Noche
              </button>
              <button
                type="button"
                onClick={() => setEscalaHumana((v) => !v)}
                className={btnSeg(escalaHumana)}
                aria-pressed={escalaHumana}
                title="Mostrar una persona de 1,70 m como referencia"
              >
                <User size={14} /> Escala
              </button>
            </div>
            <button
              type="button"
              onClick={descargarImagen}
              aria-label="Guardar imagen de la vista"
              className="flex items-center gap-1 rounded-lg bg-background/90 px-3 py-2 text-xs font-bold text-foreground shadow backdrop-blur hover:text-accent"
            >
              <Camera size={14} /> <span className="hidden sm:inline">Guardar imagen</span>
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-foreground/50">
          Arrastra para girar, usa la rueda o pellizca para acercar. Vista referencial: colores y terminaciones finales se
          confirman con prueba de color.
        </p>
      </div>

      {/* Panel */}
      <div className="space-y-7">
        <section>
          <p className={paso}>1 · ¿Qué quieres hacer?</p>
          {/* Mismas categorías que el catálogo de /proyectos. */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CATEGORIAS_VISUALIZADOR.map((cat) => {
              const activa = cat === producto.categoria;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => elegirProducto(PRODUCTOS.find((p) => p.categoria === cat)!.id)}
                  aria-pressed={activa}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activa ? "border-accent bg-accent text-background" : "border-foreground/15 text-foreground/65 hover:border-accent hover:text-accent"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {PRODUCTOS.filter((p) => p.categoria === producto.categoria).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => elegirProducto(p.id)}
                aria-pressed={p.id === productoId}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  p.id === productoId ? "border-accent bg-accent/5" : "border-foreground/10 hover:border-foreground/25"
                }`}
              >
                <span className="block text-sm font-bold text-foreground">{p.nombre}</span>
                <span className="mt-0.5 block text-xs leading-snug text-foreground/55">{p.descripcion}</span>
              </button>
            ))}
          </div>

          {ejemplos.length > 0 && (
            <div className="mt-4">
              <p className={labelClass}>Trabajos reales en esta categoría</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {ejemplos.map((e) => (
                  <a key={`${e.cliente}-${e.trabajo}`} href="/proyectos" className="group block" title={`${e.cliente} · ${e.trabajo}`}>
                    <span className="block aspect-[4/3] overflow-hidden rounded-lg bg-foreground/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mismoOrigen(e.portada)}
                        alt={`${e.cliente} — ${e.trabajo}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </span>
                    <span className="mt-1 block truncate text-[11px] font-semibold text-foreground/70">{e.cliente}</span>
                  </a>
                ))}
              </div>
              <a href="/proyectos" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline">
                Ver todos los proyectos <ArrowRight size={12} />
              </a>
            </div>
          )}
        </section>

        <section className="border-t border-foreground/10 pt-6">
          <p className={paso}>2 · Tu diseño</p>
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/15 px-4 py-5 text-sm font-semibold text-foreground/70 hover:border-accent hover:text-accent">
            <Upload size={16} />
            {imagen ? "Cambiar imagen" : "Subir imagen (PNG, JPG, SVG)"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) cargarArchivo(f);
                e.target.value = "";
              }}
            />
          </label>
          {errorImagen && <p className="mt-2 text-sm font-semibold text-red-600">{errorImagen}</p>}
          {imagen && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-foreground/[0.04] px-3 py-2 text-xs">
              <span className="truncate text-foreground/70">
                {imagen.nombre} · {imagen.vectorial ? "vectorial" : `${imagen.ancho} × ${imagen.alto} px`}
              </span>
              <button type="button" onClick={() => setImagen(null)} aria-label="Quitar imagen" className="text-foreground/50 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
          )}

          {imagen && (
            <>
              <div className="mt-4">
                <span className={labelClass}>Cómo se ubica</span>
                <div className="mt-1 flex gap-1 rounded-lg bg-foreground/[0.05] p-1">
                  {AJUSTES.map((a) => (
                    <button key={a.id} type="button" onClick={() => setAjuste(a.id)} className={btnSeg(ajuste === a.id)} aria-pressed={ajuste === a.id}>
                      {a.nombre}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-foreground/50">{AJUSTES.find((a) => a.id === ajuste)?.ayuda}</p>
              </div>
              {ajuste === "ajustar" && !producto.soloSilueta && (
                <div className="mt-3 flex items-center gap-3">
                  {producto.admiteTransparencia && (
                    <label className="flex items-center gap-2 text-xs font-semibold text-foreground/70">
                      <input type="checkbox" checked={fondoTransparente} onChange={(e) => setFondoTransparente(e.target.checked)} />
                      Sin fondo (solo el vinilo)
                    </label>
                  )}
                  {!(producto.admiteTransparencia && fondoTransparente) && (
                    <label className="flex items-center gap-2 text-xs font-semibold text-foreground/70">
                      Color de fondo
                      <input type="color" value={fondo} onChange={(e) => setFondo(e.target.value)} className="h-7 w-10 cursor-pointer rounded border border-foreground/15" />
                    </label>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <section className="border-t border-foreground/10 pt-6">
          <p className={paso}>3 · Medidas del área impresa</p>
          {producto.fijo ? (
            <p className="mt-3 rounded-lg bg-foreground/[0.04] px-3 py-2.5 text-xs leading-snug text-foreground/70">
              Área de impresión aproximada por costado: <span className="font-bold">{producto.ancho} × {producto.alto} cm</span>. La
              medida exacta depende del modelo de vehículo; la confirmamos al cotizar.
            </p>
          ) : (
            <>
          <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className={labelClass}>Ancho (cm)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={producto.min}
                  max={producto.max}
                  value={ancho}
                  onChange={(e) => setAncho(Number(e.target.value))}
                  onBlur={() => setAncho(anchoOk)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Alto (cm)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={producto.min}
                  max={producto.max}
                  value={alto}
                  onChange={(e) => setAlto(Number(e.target.value))}
                  onBlur={() => setAlto(altoOk)}
                  className={inputClass}
                />
              </label>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {producto.presets.map((p) => {
                const activo = p.ancho === anchoOk && p.alto === altoOk;
                return (
                  <button
                    key={`${p.ancho}x${p.alto}`}
                    type="button"
                    onClick={() => {
                      setAncho(p.ancho);
                      setAlto(p.alto);
                    }}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      activo ? "border-accent bg-accent text-background" : "border-foreground/15 text-foreground/60 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {p.ancho}×{p.alto}
                  </button>
                );
              })}
            </div>

            </>
          )}

          {calidad && (
            <div
              className={`mt-4 rounded-lg px-3 py-2.5 text-xs leading-snug ${
                calidad.nivel === "baja"
                  ? "bg-red-50 text-red-800"
                  : calidad.nivel === "media"
                  ? "bg-amber-50 text-amber-900"
                  : "bg-emerald-50 text-emerald-900"
              }`}
            >
              <span className="font-bold">
                {calidad.dpi !== null ? `Resolución a esta medida: ${calidad.dpi} dpi. ` : ""}
              </span>
              {calidad.texto}
            </div>
          )}

          {producto.admiteEsmerilado && (
            <div className="mt-4">
              <span className={labelClass}>Tipo de vinilo</span>
              <div className="mt-1 flex gap-1 rounded-lg bg-foreground/[0.05] p-1">
                <button type="button" onClick={() => setVinilo("color")} className={btnSeg(vinilo === "color")} aria-pressed={vinilo === "color"}>
                  Color
                </button>
                <button type="button" onClick={() => setVinilo("esmerilado")} className={btnSeg(vinilo === "esmerilado")} aria-pressed={vinilo === "esmerilado"}>
                  Esmerilado
                </button>
              </div>
              {vinilo === "esmerilado" && (
                <p className="mt-1 text-xs text-foreground/50">
                  Imita vidrio arenado: da privacidad sin tapar la luz. Se usa la silueta del diseño, sin sus colores.
                </p>
              )}
            </div>
          )}

          <div className="mt-4">
            <span className={labelClass}>Acabado</span>
            <div className="mt-1 flex gap-1 rounded-lg bg-foreground/[0.05] p-1">
              <button type="button" onClick={() => setAcabado("mate")} className={btnSeg(acabado === "mate")} aria-pressed={acabado === "mate"}>
                Mate
              </button>
              <button type="button" onClick={() => setAcabado("brillante")} className={btnSeg(acabado === "brillante")} aria-pressed={acabado === "brillante"}>
                Brillante
              </button>
            </div>
          </div>
        </section>

        <section className="border-t border-foreground/10 pt-6">
          <button
            type="button"
            onClick={cotizar}
            className="w-full rounded-lg bg-accent py-3.5 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform hover:scale-[1.01]"
          >
            Cotizar este trabajo
          </button>
          <p className="mt-2 text-center text-xs text-foreground/50">
            Llevamos el producto, la medida{imagen ? " y tu diseño" : ""} al formulario de cotización.
          </p>
        </section>
      </div>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.round(Math.min(max, Math.max(min, n)));
}

function leerComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
