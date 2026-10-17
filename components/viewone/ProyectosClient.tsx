"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { clientConfig } from "@/config/client.config";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { RegisterMark } from "@/components/viewone/RegisterMark";
import type { Categoria, Proyecto } from "@/lib/viewone-store";

// /proyectos (handoff sección 17-20): vista 1 = categorías; click en una
// reemplaza la grilla por sus proyectos (misma página, sin navegar); click en
// un proyecto abre un lightbox con foto(s), cliente, material/aplicación (si
// se conoce) y CTA "Quiero algo similar" → WhatsApp. Categorías y proyectos
// llegan desde el panel /viewone-admin (lib/viewone-store.ts), no están
// hardcodeados — la foto de portada de cada categoría es la del primer
// proyecto visible que la incluye.
type ContactInfo = { whatsapp?: string };

// El dato real (lib/viewone-data.ts) usa sufijos "- 01"/"- 02" en `trabajo`
// para distinguir entradas que comparten cliente+trabajo (ej. dos proyectos
// "Southbridge · Logos corpóreos exteriores"). El feedback real pide
// quitarlos de los títulos VISIBLES sin tocar el dato — por eso esto vive
// acá, en el punto de render, no en viewone-data.ts.
function tituloVisible(trabajo: string): string {
  return trabajo.replace(/\s*-\s*0\d+\s*$/, "");
}

export function ProyectosClient({
  categorias,
  proyectos,
  contact: contactOverride,
}: {
  categorias: Categoria[];
  proyectos: Proyecto[];
  contact?: ContactInfo;
}) {
  const [categoria, setCategoria] = useState<string | null>(null);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [galIndex, setGalIndex] = useState(0);
  const contact = contactOverride ?? clientConfig.contact;

  const portadas = useMemo(() => {
    const map = new Map<string, Proyecto>();
    for (const p of proyectos) {
      for (const cat of p.categorias) {
        if (!map.has(cat)) map.set(cat, p);
      }
    }
    return map;
  }, [proyectos]);

  const proyectosDeCategoria = useMemo(
    () => (categoria ? proyectos.filter((p) => p.categorias.includes(categoria)) : []),
    [categoria, proyectos]
  );

  function abrirProyecto(p: Proyecto) {
    setProyecto(p);
    setGalIndex(0);
  }

  // Bug real reportado en el feedback: al entrar a una categoría (o volver al
  // listado completo) a veces se conservaba el scroll anterior y la vista
  // abría mostrando proyectos de más abajo, no el inicio del listado.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [categoria]);

  const fotos = proyecto ? [proyecto.portada, ...proyecto.galeria] : [];

  useEffect(() => {
    if (!proyecto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProyecto(null);
      if (e.key === "ArrowLeft") setGalIndex((i) => (i - 1 + fotos.length) % fotos.length);
      if (e.key === "ArrowRight") setGalIndex((i) => (i + 1) % fotos.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyecto, fotos.length]);

  const whatsappSimilar = proyecto && contact.whatsapp
    ? buildWhatsAppLink(
        contact.whatsapp,
        proyecto.whatsappMensaje ??
          `Hola! Vi el proyecto de ${proyecto.cliente} (${proyecto.trabajo}) en viewone.cl y quiero algo similar`
      )
    : undefined;

  return (
    <>
      <Container>
        {categoria ? (
          <button
            onClick={() => setCategoria(null)}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline"
          >
            ← Volver a todas las categorías
          </button>
        ) : null}

        <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-5xl">Proyectos</h1>

        {categoria && (
          <h2 className="mt-2 font-heading text-xl font-bold text-foreground/70 sm:text-2xl">{categoria}</h2>
        )}

        {!categoria ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categorias.map((cat) => {
              const cover = portadas.get(cat.nombre);
              if (!cover) {
                // Categoría sin proyecto visible todavía (ej. recién creada en
                // el admin): "próximamente" en vez de desaparecer sin aviso.
                return (
                  <div key={cat.id} className="overflow-hidden rounded-2xl text-left opacity-60">
                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-foreground/5">
                      <p className="text-xs font-bold uppercase tracking-wide text-foreground/40">Próximamente</p>
                    </div>
                    <p className="mt-3 font-heading text-base font-bold text-foreground">{cat.nombre}</p>
                  </div>
                );
              }
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoria(cat.nombre)}
                  className="group overflow-hidden rounded-2xl text-left"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-foreground/5">
                    <Image
                      src={cover.portada}
                      alt={cat.nombre}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />
                    <RegisterMark className="absolute right-3 top-3 h-5 w-5 text-background/60" />
                  </div>
                  <p className="mt-3 font-heading text-base font-bold text-foreground">{cat.nombre}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {proyectosDeCategoria.map((p) => (
              <button key={p.id} onClick={() => abrirProyecto(p)} className="group overflow-hidden rounded-2xl text-left">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-foreground/5">
                  <Image
                    src={p.portada}
                    alt={`${p.cliente} — ${p.trabajo}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="font-heading text-base font-bold text-foreground">{p.cliente}</h3>
                  <p className="text-sm text-foreground/50">{tituloVisible(p.trabajo)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Container>

      {/* Lightbox. Feedback real: "Reducir ligeramente el lightbox en
          desktop: dejar margen alrededor" — más padding del backdrop en
          pantallas grandes (p-4 → lg:p-12) y un poco menos de ancho máximo,
          en vez de quedar casi pegado a los bordes del viewport. */}
      {proyecto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4 sm:p-8 lg:p-12"
          onClick={() => setProyecto(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl bg-background p-5 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading text-lg font-extrabold text-foreground sm:text-xl">{tituloVisible(proyecto.trabajo)}</h3>
                <p className="text-sm font-semibold text-accent">{proyecto.cliente}</p>
              </div>
              <button onClick={() => setProyecto(null)} aria-label="Cerrar" className="shrink-0 rounded-full p-1.5 text-foreground/50 hover:bg-foreground/5 hover:text-foreground">
                <X size={22} />
              </button>
            </div>

            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-foreground/5">
              <Image
                src={fotos[galIndex]}
                alt={`${proyecto.cliente} — ${proyecto.trabajo}`}
                fill
                sizes="(max-width: 640px) 100vw, 576px"
                className="object-cover"
              />
              {fotos.length > 1 && (
                <>
                  <button
                    onClick={() => setGalIndex((i) => (i - 1 + fotos.length) % fotos.length)}
                    aria-label="Foto anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground hover:bg-background"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setGalIndex((i) => (i + 1) % fotos.length)}
                    aria-label="Foto siguiente"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground hover:bg-background"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {(proyecto.material || proyecto.aplicacion) && (
              // font-mono: trato de "ficha técnica" para material/aplicación,
              // no texto corrido — ver nota en lib/fonts.ts.
              <p className="mt-4 text-center font-mono text-xs uppercase tracking-wide text-foreground/50">
                {[proyecto.material, proyecto.aplicacion].filter(Boolean).join(" · Aplicación/superficie: ")}
              </p>
            )}

            {whatsappSimilar && (
              <a
                href={whatsappSimilar}
                target="_blank"
                rel="noreferrer"
                className="mt-5 block w-full rounded-lg bg-accent py-3.5 text-center text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform hover:scale-[1.01]"
              >
                Quiero algo similar
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
