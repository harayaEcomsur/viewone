import Image from "next/image";
import { ArrowRight, Factory, Settings2, Building2, Printer, Signpost, Wrench, Layers, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { RegisterMark } from "@/components/viewone/RegisterMark";
import { ClientesMarquee } from "@/components/viewone/ClientesMarquee";
import { slugifyServicio } from "@/lib/viewone-slug";
import { CLIENTE_LOGO } from "@/lib/viewone-data";
import type { HomeContent, Servicio } from "@/lib/viewone-content-store";

// Home a medida (handoff sección 07-10, con el pase de diseño del feedback
// real de ViewOne del 15-oct-2026 aplicado): Hero → 8 clientes destacados →
// Servicios → "+20 años" → Proyectos destacados → Nosotros → 20 clientes
// (carrusel) → Cierre. Contenido exacto del handoff/feedback aprobados; la
// composición/paleta/tipografía es la propuesta de HarayaDev (ver
// config/client.config.ts para la paleta real pedida por el cliente).
//
// El handoff repetía la lista de clientes dos veces (destacados + completa).
// El feedback real confirmó esa misma estructura (8 arriba, estáticos; 20
// abajo, en carrusel lento) — ver ClientesMarquee.tsx. Siguen como texto
// editorial, no logos fingidos: los logos reales son un pendiente de
// ViewOne (feedback, "Material que entregamos nosotros"); esta lista es el
// punto de reemplazo cuando lleguen.
//
// CMS completo (2026-10-05): todo el contenido de abajo (textos, fotos,
// lista de clientes, servicios) llega por props desde app/page.tsx, leído
// vía lib/viewone-content-store.ts (DB con fallback al contenido real
// estático) — así es editable desde /viewone-admin sin tocar código.

// "+20 años": el feedback pide mantener EXACTAMENTE estos 3 atributos y sus
// bajadas (copy aprobado, no editable desde el admin a propósito — ver nota
// en viewone-content-store.ts sobre por qué paleta/tipografía/layout tampoco
// lo son). `content.badges` sigue siendo la fuente de los títulos (el admin
// puede reordenarlos o renombrarlos sin romper nada: un título que no
// matchea este mapa simplemente no muestra bajada ni ícono específico).
const ATRIBUTO_INFO: Record<string, { descripcion: string; icono: LucideIcon }> = {
  "Taller propio": { descripcion: "Contamos con infraestructura y equipamiento de producción.", icono: Factory },
  "Producción integral": { descripcion: "Desde la idea hasta la instalación.", icono: Settings2 },
  "Experiencia B2B": { descripcion: "Soluciones para empresas de todos los tamaños.", icono: Building2 },
};

// Ícono por servicio (pase "pixel perfect" a la referencia: cada tarjeta de
// /servicios en el Home lleva una medalla con ícono superpuesta a la foto).
// Keyed por nombre, no por id: el admin puede reordenar servicios sin romper
// el mapeo; un nombre que no matchea cae al ícono genérico de abajo.
const SERVICIO_ICONO: Record<string, LucideIcon> = {
  "Impresión Digital": Printer,
  "Señalética y Gráfica Corporativa": Signpost,
  "Estructuras Publicitarias": Building2,
  "Instalación y Montaje": Wrench,
  "Proyectos Integrales": Layers,
};

export function ViewOneHome({
  content,
  clientes,
  servicios,
  contact,
}: {
  content: HomeContent;
  clientes: string[];
  servicios: Servicio[];
  contact: { email?: string; phone?: string; whatsapp?: string; whatsappPrefilledMessage?: string };
}) {
  const whatsappHref = contact.whatsapp ? buildWhatsAppLink(contact.whatsapp, contact.whatsappPrefilledMessage) : undefined;
  // 8 destacados arriba (estáticos) + los mismos 20 completos abajo (carrusel)
  // — feedback real: "Solo 8 destacados, con logos" / "20 logos en carrusel
  // lento". Los primeros 8 de la lista, mismo orden que la referencia visual.
  const clientesDestacados = clientes.slice(0, 8);

  return (
    <>
      {/* 01 Hero */}
      <section className="relative overflow-hidden py-28 sm:py-36">
        <Image
          src={content.heroFotoUrl}
          alt="Boletería de Andacor con señalética e impresión instalada por ViewOne"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Overlay con el azul de marca — degradado horizontal (izquierda a
            derecha), no vertical: la referencia oscurece la zona del texto
            (izquierda) y deja la foto más visible hacia la derecha, en vez
            de oscurecer parejo de abajo hacia arriba. */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/75 to-primary/15" />
        {/* Miras de registro en las esquinas: firma del rubro (ver
            RegisterMark.tsx), no decoración genérica. */}
        <RegisterMark className="absolute left-5 top-5 h-6 w-6 text-background/50 sm:left-8 sm:top-8" />
        <RegisterMark className="absolute bottom-5 right-5 h-6 w-6 text-background/50 sm:bottom-8 sm:right-8" />
        <Container className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-background/70">Soluciones gráficas para empresas</p>
          <h1 className="mt-3 max-w-2xl font-heading text-4xl font-extrabold leading-[1.05] text-background sm:text-6xl">
            {content.heroTitulo}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-background/85 sm:text-lg">{content.heroBajada}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            {/* rounded-lg en ambos botones (no rounded-full + medalla
                circular como antes): la referencia usa el mismo radio de
                esquina en los dos CTA del hero — SHAPE CONSISTENCY LOCK. */}
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform active:scale-[0.98]"
            >
              {/* text-background (claro), no text-foreground: con el acento
                  azul nuevo (vs. el ámbar anterior) el texto oscuro bajaba a
                  3.6:1 de contraste — texto claro da 4.24:1. */}
              Cotiza tu proyecto
              <ArrowRight size={16} />
            </a>
            <a
              href="/proyectos"
              className="inline-flex items-center rounded-lg border border-background/40 px-7 py-3.5 text-sm font-bold text-background transition-colors hover:bg-background/10"
            >
              Ver proyectos
            </a>
          </div>
        </Container>
      </section>

      {/* 02 Clientes destacados (8, estáticos — ver nota arriba) */}
      <section className="border-b border-foreground/10 py-12">
        <Container>
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">
            Empresas que han confiado en ViewOne
          </p>
          {/* Logo cuando hay (placeholder recortado de la referencia, ver
              nota en lib/viewone-data.ts sobre CLIENTE_LOGO) — texto como
              antes para los 2 nombres que todavía no tienen uno. */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {clientesDestacados.map((nombre) => {
              const logo = CLIENTE_LOGO[nombre];
              return logo ? (
                <img
                  key={nombre}
                  src={logo}
                  alt={nombre}
                  className="h-7 w-auto object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-8"
                />
              ) : (
                <span
                  key={nombre}
                  className="font-heading text-base font-extrabold uppercase tracking-wide text-foreground/35 transition-colors hover:text-foreground/70 sm:text-lg"
                >
                  {nombre}
                </span>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 03 Servicios resumidos */}
      <section id="servicios" className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Nuestros servicios</p>
              {/* Título del feedback real ("Dirección visual · cambios
                  concretos"): "Soluciones gráficas de alto impacto". */}
              <h2 className="mt-2 font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
                Soluciones gráficas de alto impacto
              </h2>
            </div>
            <a href="/servicios" className="text-sm font-bold text-primary hover:underline">
              Ver todos los servicios →
            </a>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {servicios.map((s) => {
              const Icono = SERVICIO_ICONO[s.nombre] ?? Building2;
              return (
                <a key={s.id} href={`/servicios#${slugifyServicio(s.nombre)}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={s.foto}
                      alt={`${s.nombre} — ${s.trabajo}, proyecto real de ViewOne`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {/* Medalla con ícono superpuesta foto/texto (referencia):
                      -mt-5 la sube sobre el borde inferior de la foto, por
                      fuera del overflow-hidden de la foto (que vive en el div
                      de arriba, no acá), con ring-4 ring-background para que
                      "corte" contra la foto y el fondo claro de la página. */}
                  <div className="relative z-10 -mt-5 ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-background text-primary shadow-md ring-4 ring-background">
                    <Icono size={18} />
                  </div>
                  <div className="-mt-2.5 px-0.5">
                    <h3 className="font-heading text-sm font-bold text-foreground">{s.nombre}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/60">{s.textoCorto}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 04 "+20 años" — banda propia con foto + overlay (feedback real:
          "Recuperar bloque '+20 años'", separado de Nosotros donde antes
          vivía fusionado como pills). Reutiliza la foto real del hero (misma
          ubicación, Andacor): nunca se inventa un asset nuevo. */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <Image src={content.heroFotoUrl} alt="" aria-hidden="true" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-primary/90" />
        <Container className="relative">
          {/* Heading grande a la izquierda + los 3 atributos en fila a la
              derecha (referencia): antes era un párrafo full-width arriba y
              una grilla de 3 columnas abajo. */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-center">
            <div>
              <p className="font-heading text-4xl font-extrabold leading-none text-background sm:text-5xl">+20 años</p>
              <p className="mt-3 font-heading text-xl font-bold leading-snug text-background/75 sm:text-2xl">
                haciendo realidad grandes proyectos
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {content.badges.map((titulo) => {
                const info = ATRIBUTO_INFO[titulo];
                const Icono = info?.icono ?? Building2;
                return (
                  <div key={titulo} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background/10 text-background">
                      <Icono size={20} />
                    </span>
                    <div>
                      <p className="font-heading text-base font-bold text-background">{titulo}</p>
                      {info && <p className="mt-1 text-sm leading-relaxed text-background/75">{info.descripcion}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* 05 Proyectos destacados */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Proyectos destacados</p>
              {/* Título del feedback real: "Resultados que hablan por sí solos". */}
              <h2 className="mt-2 font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
                Resultados que hablan por sí solos
              </h2>
            </div>
            <a href="/proyectos" className="text-sm font-bold text-primary hover:underline">
              Ver todos los proyectos →
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {content.proyectosDestacados.map((p) => (
              <a key={p.nombre} href="/proyectos" className="group overflow-hidden rounded-2xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={p.foto}
                    alt={`Proyecto de ViewOne para ${p.nombre}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-3 font-heading text-sm font-bold text-background">{p.nombre}</p>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* 06 Nosotros (sin los badges de "+20 años": esos ahora tienen su
          propia banda arriba — ver nota de diseño). */}
      <section id="nosotros" className="bg-foreground/[0.02] py-20 sm:py-28">
        <Container className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2">
          {/* object-cover sin padding (antes: object-contain + fondo negro):
              la foto real es 4:3 exacto (1448×1086), igual que el
              contenedor — llena el marco sin recorte, como en la referencia
              (foto a sangre, no un logo apagado sobre fondo oscuro). */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={content.nosotrosFotoUrl}
              alt="Letrero de ViewOne sobre pared de madera en nuestras oficinas"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{content.nosotrosEyebrow}</p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold text-foreground sm:text-4xl">{content.nosotrosTitulo}</h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/70">{content.nosotrosTexto}</p>
          </div>
        </Container>
      </section>

      {/* 07 Clientes (20, carrusel lento — feedback real: "20 logos en
          carrusel lento. Referencia de comportamiento: milamark.cl"). */}
      <section className="border-y border-foreground/10 py-12">
        <Container>
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">
            Experiencia con empresas de distintos rubros
          </p>
        </Container>
        <div className="mt-7">
          <ClientesMarquee clientes={clientes} />
        </div>
      </section>

      {/* 08 Cierre — foto + overlay azul (feedback real: "Aplicar al cierre
          'Cuéntanos qué necesitas' fondo visual + overlay azul"). Misma foto
          real que el hero, para cerrar el Home con el mismo lenguaje visual
          con el que abrió. */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <Image src={content.heroFotoUrl} alt="" aria-hidden="true" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-primary/90" />
        <Container className="relative text-center">
          <h2 className="font-heading text-3xl font-extrabold text-background sm:text-4xl">{content.cierreTitulo}</h2>
          <div className="mt-5 flex flex-col items-center gap-1 text-background/80">
            <p>Santiago, Chile</p>
            {contact.email && <a href={`mailto:${contact.email}`} className="hover:text-background">{contact.email}</a>}
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:text-background">
                {contact.phone}
              </a>
            )}
          </div>
          <a
            href="/contacto"
            className="mt-8 inline-flex items-center rounded-lg bg-accent px-8 py-4 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
          >
            Contáctanos
          </a>
        </Container>
      </section>
    </>
  );
}
