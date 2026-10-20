import Image from "next/image";
import {
  ArrowRight,
  Factory,
  Settings2,
  Building2,
  Printer,
  Signpost,
  Wrench,
  Layers,
  Star,
  CheckCircle2,
  Truck,
  MapPin,
  Mail,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { RegisterMark } from "@/components/viewone/RegisterMark";
import { ClientesMarquee } from "@/components/viewone/ClientesMarquee";
import { ClienteLogoMark } from "@/components/viewone/ClienteLogoMark";
import { slugifyServicio } from "@/lib/viewone-slug";
import type { Cliente } from "@/lib/viewone-clientes";
import { mismoOrigen } from "@/lib/viewone-media";
import type { HomeContent, Servicio } from "@/lib/viewone-content-store";
import { clientesDeSeccion, type IconoKey, type SeccionDe } from "@/lib/viewone-home-sections";

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

// Íconos que el panel ofrece para los atributos (lib/viewone-home-sections.ts).
const ICONO: Record<IconoKey, LucideIcon> = {
  fabrica: Factory,
  engranaje: Settings2,
  edificio: Building2,
  impresora: Printer,
  senal: Signpost,
  llave: Wrench,
  capas: Layers,
  estrella: Star,
  check: CheckCircle2,
  camion: Truck,
};

type Contact = { email?: string; phone?: string; whatsapp?: string; whatsappPrefilledMessage?: string };

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
  clientes: Cliente[];
  servicios: Servicio[];
  contact: Contact;
}) {
  const visibles = content.secciones.filter((s) => s.visible);
  return (
    <>
      {visibles.map((s, i) => {
        switch (s.tipo) {
          case "hero":
            return <HeroSeccion key={s.id} s={s} primera={i === 0} />;
          case "logos":
            return <LogosSeccion key={s.id} s={s} clientes={clientes} />;
          case "servicios":
            return <ServiciosSeccion key={s.id} s={s} servicios={servicios} />;
          case "atributos":
            return <AtributosSeccion key={s.id} s={s} />;
          case "galeria":
            return <GaleriaSeccion key={s.id} s={s} />;
          case "textoImagen":
            return <TextoImagenSeccion key={s.id} s={s} />;
          case "texto":
            return <TextoSeccion key={s.id} s={s} />;
          case "clientes":
            return <ClientesSeccion key={s.id} s={s} clientes={clientes} />;
          case "cta":
            return <CtaSeccion key={s.id} s={s} contact={contact} />;
        }
      })}
    </>
  );
}

function Eyebrow({ children, className = "text-accent" }: { children: string; className?: string }) {
  if (!children) return null;
  return <p className={`text-xs font-bold uppercase tracking-[0.2em] ${className}`}>{children}</p>;
}

// Encabezado común de Servicios y Galería: eyebrow + título a la izquierda,
// link "Ver todos" a la derecha.
function EncabezadoSeccion({ eyebrow, titulo, linkTexto, linkHref }: { eyebrow: string; titulo: string; linkTexto?: string; linkHref?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        {titulo && <h2 className="mt-2 font-heading text-3xl font-extrabold text-primary sm:text-4xl">{titulo}</h2>}
      </div>
      {linkTexto && linkHref && (
        <a href={linkHref} className="text-sm font-bold text-accent hover:underline">
          {linkTexto} →
        </a>
      )}
    </div>
  );
}

// Hero — py chico (medido contra la imagen de referencia, py-28 sm:py-36
// quedaba ~33% más alto). Overlay con el azul de marca en degradado
// horizontal: oscurece la zona del texto y deja la foto visible a la
// derecha. Miras de registro en las esquinas: firma del rubro (RegisterMark).
function HeroSeccion({ s, primera }: { s: SeccionDe<"hero">; primera: boolean }) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <Image src={s.fotoUrl} alt="" fill priority={primera} sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/95 from-30% via-primary/70 via-55% to-transparent" />
      <RegisterMark className="absolute left-5 top-5 h-6 w-6 text-background/50 sm:left-8 sm:top-8" />
      <RegisterMark className="absolute bottom-5 right-5 h-6 w-6 text-background/50 sm:bottom-8 sm:right-8" />
      <Container className="relative">
        <Eyebrow className="text-background/70">{s.eyebrow}</Eyebrow>
        {/* h1 solo en el primer hero de la página; otro hero más abajo es h2. */}
        {primera ? (
          <h1 className="mt-3 max-w-2xl font-heading text-4xl font-extrabold leading-[1.05] text-background sm:text-6xl">{s.titulo}</h1>
        ) : (
          <h2 className="mt-3 max-w-2xl font-heading text-4xl font-extrabold leading-[1.05] text-background sm:text-6xl">{s.titulo}</h2>
        )}
        {s.bajada && <p className="mt-5 max-w-lg text-base leading-relaxed text-background/85 sm:text-lg">{s.bajada}</p>}
        {(s.botonTexto || s.boton2Texto) && (
          <div className="mt-7 flex flex-wrap items-center gap-4">
            {/* rounded-lg en ambos (mismo radio de esquina que la referencia).
                text-background sobre el acento: el texto oscuro bajaba a 3.6:1. */}
            {s.botonTexto && (
              <a
                href={s.botonHref || "/contacto"}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform active:scale-[0.98]"
              >
                {s.botonTexto}
                <ArrowRight size={16} />
              </a>
            )}
            {s.boton2Texto && (
              <a
                href={s.boton2Href || "/proyectos"}
                className="inline-flex items-center rounded-lg border border-background/40 px-7 py-3.5 text-sm font-bold text-background transition-colors hover:bg-background/10"
              >
                {s.boton2Texto}
              </a>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}

// Logos destacados: los primeros N de la lista de Clientes, recoloreados a
// un solo tono con mask-image (ver ClienteLogoMark.tsx — grayscale() no
// logra el navy sólido de la referencia). `bg-white` explícito: el token
// `background` es el celeste de marca y la referencia alterna celeste con
// bandas blancas puras. gap-x-8 + logos w-24: con 8 logos entran en una
// sola fila a 1440px, como en la referencia.
function LogosSeccion({ s, clientes }: { s: SeccionDe<"logos">; clientes: Cliente[] }) {
  return (
    <section className="border-b border-foreground/10 bg-white py-10">
      <Container>
        <Eyebrow className="text-center text-foreground/40">{s.eyebrow}</Eyebrow>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
          {clientesDeSeccion(s, clientes).map(({ id, nombre, logo }) => {
            return logo ? (
              <ClienteLogoMark key={id} logo={mismoOrigen(logo)} nombre={nombre} />
            ) : (
              <span
                key={id}
                className="font-heading text-base font-extrabold uppercase tracking-wide text-foreground/35 transition-colors hover:text-foreground/70 sm:text-lg"
              >
                {nombre}
              </span>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function ServiciosSeccion({ s, servicios }: { s: SeccionDe<"servicios">; servicios: Servicio[] }) {
  return (
    <section id="servicios" className="py-14 sm:py-16">
      <Container>
        <EncabezadoSeccion eyebrow={s.eyebrow} titulo={s.titulo} linkTexto={s.linkTexto} linkHref="/servicios" />
        <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
          {servicios.map((sv) => {
            const Icono = SERVICIO_ICONO[sv.nombre] ?? Building2;
            return (
              <a key={sv.id} href={`/servicios#${slugifyServicio(sv.nombre)}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={sv.foto}
                    alt={`${sv.nombre} — ${sv.trabajo}, proyecto real de ViewOne`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {/* Medalla con ícono superpuesta foto/texto (referencia):
                    -mt-5 la sube sobre el borde de la foto, ring-4 la "corta"
                    contra el fondo. mt-3 (no negativo) en el texto de abajo:
                    con -mt-2.5 quedaba tapado por la medalla. */}
                <div className="relative z-10 -mt-5 ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-background text-accent shadow-md ring-4 ring-background">
                  <Icono size={18} />
                </div>
                <div className="mt-3 px-0.5">
                  <h3 className="font-heading text-sm font-bold text-foreground">{sv.nombre}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground/60">{sv.textoCorto}</p>
                  <span className="mt-3 inline-flex text-accent transition-transform group-hover:translate-x-1">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

// Atributos ("+20 años"): banda CLARA (texto azul marino sobre celeste, no
// blanco sobre overlay oscuro, como en la referencia), con la foto visible a
// la derecha en degradado. `object-top` recorta la foto del hero en la
// franja de montaña. El resplandor blanco difuso detrás del texto (div
// aparte con radial-gradient + blur) da legibilidad sin desenfocar la foto.
function AtributosSeccion({ s }: { s: SeccionDe<"atributos"> }) {
  return (
    <section className="relative overflow-hidden py-14 sm:py-16">
      {s.fotoUrl && (
        <>
          <Image src={s.fotoUrl} alt="" aria-hidden="true" fill sizes="100vw" className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-36 -translate-y-1/2 blur-2xl sm:h-44"
            style={{
              background:
                "radial-gradient(ellipse 65% 100% at 50% 50%, rgb(var(--color-background)) 0%, rgb(var(--color-background) / 0.7) 50%, transparent 80%)",
            }}
          />
        </>
      )}
      <Container className="relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
          <div className="shrink-0">
            <Eyebrow>{s.eyebrow}</Eyebrow>
            {s.titulo && <p className="font-heading text-4xl font-extrabold leading-none text-foreground sm:text-5xl">{s.titulo}</p>}
            {s.subtitulo && (
              <p className="mt-3 font-heading text-xl font-bold leading-snug text-foreground/80 sm:text-2xl">{s.subtitulo}</p>
            )}
          </div>
          {s.items.length > 0 && <div className="hidden h-20 w-px shrink-0 bg-foreground/15 lg:block" />}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            {s.items.map((item, i) => {
              const Icono = ICONO[item.icono] ?? Building2;
              return (
                <div key={i} className={`flex items-start gap-3 ${i % 3 > 0 ? "sm:border-l sm:border-foreground/15 sm:pl-6" : ""}`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-accent text-accent">
                    <Icono size={18} />
                  </span>
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{item.titulo}</p>
                    {item.descripcion && <p className="mt-1 text-xs leading-relaxed text-foreground/60">{item.descripcion}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

function GaleriaSeccion({ s }: { s: SeccionDe<"galeria"> }) {
  return (
    <section className="bg-white py-14 sm:py-16">
      <Container>
        <EncabezadoSeccion eyebrow={s.eyebrow} titulo={s.titulo} linkTexto={s.linkTexto} linkHref={s.linkHref} />
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {s.items.map((p, i) => (
            <a key={i} href={p.href || "/proyectos"} className="group overflow-hidden rounded-2xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={p.foto}
                  alt={p.nombre ? `Proyecto de ViewOne para ${p.nombre}` : "Proyecto de ViewOne"}
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
  );
}

// Texto + imagen (Nosotros): foto a sangre (sin padding de sección a ese
// lado, arriba ni abajo), al 45% del ancho; el padding vive solo en el
// texto. `object-top` para que se vea el logo VIEWONE de la foto de Nosotros.
// `scroll-mt-14`: el ancla (/#nosotros) no queda bajo el header sticky.
function TextoImagenSeccion({ s }: { s: SeccionDe<"textoImagen"> }) {
  const derecha = s.lado === "derecha";
  return (
    <section
      id={s.ancla || undefined}
      className={`scroll-mt-14 grid grid-cols-1 items-stretch ${derecha ? "sm:grid-cols-[55fr_45fr]" : "sm:grid-cols-[45fr_55fr]"}`}
    >
      <div className={`relative aspect-[4/3] overflow-hidden sm:aspect-auto sm:min-h-[340px] ${derecha ? "sm:order-2" : ""}`}>
        <Image src={s.fotoUrl} alt={s.titulo} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover object-top" />
      </div>
      <div className={`flex flex-col justify-center px-4 py-10 sm:px-12 sm:py-12 lg:max-w-xl ${derecha ? "sm:justify-self-end" : ""}`}>
        <Eyebrow>{s.eyebrow}</Eyebrow>
        {s.titulo && <h2 className="mt-3 font-heading text-3xl font-extrabold text-primary sm:text-4xl">{s.titulo}</h2>}
        {s.texto && <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-foreground/70">{s.texto}</p>}
        {s.botonTexto && (
          <a
            href={s.botonHref || "/contacto"}
            className="mt-7 inline-flex items-center gap-2 self-start rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform active:scale-[0.98]"
          >
            {s.botonTexto}
            <ArrowRight size={16} />
          </a>
        )}
      </div>
    </section>
  );
}

function TextoSeccion({ s }: { s: SeccionDe<"texto"> }) {
  return (
    <section className={`py-14 sm:py-16 ${s.fondo === "blanco" ? "bg-white" : ""}`}>
      <Container className="flex flex-col items-center text-center">
        <Eyebrow>{s.eyebrow}</Eyebrow>
        {s.titulo && <h2 className="mt-2 max-w-3xl font-heading text-3xl font-extrabold text-primary sm:text-4xl">{s.titulo}</h2>}
        {s.texto && <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-relaxed text-foreground/70">{s.texto}</p>}
        {s.botonTexto && (
          <a
            href={s.botonHref || "/contacto"}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform active:scale-[0.98]"
          >
            {s.botonTexto}
            <ArrowRight size={16} />
          </a>
        )}
      </Container>
    </section>
  );
}

// Clientes: 2 filas estáticas paginadas de a 20 (ver ClientesMarquee.tsx).
function ClientesSeccion({ s, clientes }: { s: SeccionDe<"clientes">; clientes: Cliente[] }) {
  return (
    <section className="border-y border-foreground/10 bg-white py-10">
      <Container>
        <ClientesMarquee clientes={clientesDeSeccion(s, clientes)} eyebrow={s.eyebrow} />
      </Container>
    </section>
  );
}

// Llamado a la acción (Cierre): foto + overlay azul, 3 columnas (título /
// contacto / botón) alineadas como en la referencia del cliente.
function CtaSeccion({ s, contact }: { s: SeccionDe<"cta">; contact: Contact }) {
  const whatsappHref = contact.whatsapp ? buildWhatsAppLink(contact.whatsapp, contact.whatsappPrefilledMessage) : undefined;
  return (
    <section className="relative overflow-hidden bg-primary py-12 sm:py-14">
      {s.fotoUrl && (
        <>
          <Image src={s.fotoUrl} alt="" aria-hidden="true" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-primary/90" />
        </>
      )}
      <Container className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <div>
          <Eyebrow className="text-background/60">{s.eyebrow}</Eyebrow>
          {s.titulo && <h2 className="mt-3 font-heading text-3xl font-extrabold text-background sm:text-4xl">{s.titulo}</h2>}
        </div>
        {s.mostrarContacto && (
          <div className="flex flex-col gap-2 text-sm text-background/80">
            <p className="flex items-center gap-2">
              <MapPin size={16} className="shrink-0 opacity-70" />
              Santiago, Chile
            </p>
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-background">
                <Mail size={16} className="shrink-0 opacity-70" />
                {contact.email}
              </a>
            )}
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-background">
                <Phone size={16} className="shrink-0 opacity-70" />
                {contact.phone}
              </a>
            )}
          </div>
        )}
        {s.botonTexto && (
          <a
            href={s.botonHref || "/contacto"}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-accent px-8 py-4 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02] sm:self-auto"
          >
            {s.botonTexto}
            <ArrowRight size={16} />
          </a>
        )}
      </Container>
    </section>
  );
}
