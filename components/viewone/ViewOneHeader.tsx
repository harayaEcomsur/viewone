"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Instagram, Facebook, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { clientConfig } from "@/config/client.config";

// Header a medida del handoff (sección 06): franja superior con
// teléfono/correo/dirección + redes, header principal con logo + nav. El
// genérico components/layout/Header.tsx no sirve acá: ViewOne tiene páginas
// reales (/servicios, /proyectos, /contacto), no anclas dentro de una sola
// página.
//
// Pase de diseño (feedback real, "Corregir el tiriteo al hacer scroll"): la
// franja superior NO es sticky — se va con el scroll como contenido normal,
// sin animar su alto. Solo el nav principal es sticky, y a una altura fija
// (nunca anima height/max-height: eso es lo que causaba el tiriteo, porque
// un sticky que cambia de alto mientras se hace scroll fuerza un recálculo
// de posición en cada frame). El único cambio al hacer scroll es un
// fondo/sombra vía opacity — composable, no dispara layout.
const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

const SOCIAL_ICON = { instagram: Instagram, facebook: Facebook, linkedin: Linkedin } as const;

type ContactInfo = {
  phone?: string;
  whatsapp?: string;
  whatsappPrefilledMessage?: string;
  email?: string;
  address?: string;
  mapQuery?: string;
  socials?: { platform: string; url: string }[];
};

// `contact` es opcional a propósito: si una página no pasa el contenido
// editable desde el admin (lib/viewone-content-store.ts), cae al config
// estático de siempre — ningún caller existente se rompe.
export function ViewOneHeader({ contact: contactOverride }: { contact?: ContactInfo } = {}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { meta, branding } = clientConfig;
  const contact = contactOverride ?? clientConfig.contact;
  const pathname = usePathname();
  // El ítem de "Nosotros" es un ancla dentro de Home (/#nosotros), no una
  // ruta propia — nunca se marca activo junto a Inicio.
  const isActive = (href: string) => !href.includes("#") && pathname === href;

  // IntersectionObserver sobre un centinela de 1px en vez de un listener de
  // scroll crudo: dispara solo al cruzar el umbral (no en cada frame) y no
  // participa del tiriteo — ver nota de diseño arriba.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), { threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const whatsappHref = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappPrefilledMessage ?? "")}`
    : undefined;
  const mapsHref = contact.mapQuery ? `https://maps.google.com/?q=${encodeURIComponent(contact.mapQuery)}` : undefined;

  return (
    <>
      {/* Centinela de 1px: cuando sale del viewport, ya se hizo scroll más
          allá de la franja superior. No es sticky ni se renderiza como caja
          visible — solo marca el umbral para el observer de arriba. */}
      <div ref={sentinelRef} aria-hidden="true" />
      <header className="relative z-40">
        {/* Franja superior: teléfono/correo/dirección a la izquierda, redes a
            la derecha. Vive en el flujo normal (no sticky) — se va con el
            scroll, nunca anima su alto. `min-w-0`/`truncate` por ítem, no en
            todo el grupo: así el correo nunca queda cortado antes de hora
            (feedback: "revisar ventas@viewone.cl clickeable en desktop"). */}
        <div className="bg-primary text-background">
          <Container className="flex h-9 items-center justify-between gap-4 text-xs">
            <div className="flex min-w-0 items-center gap-4">
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="shrink-0 hover:underline">
                  {contact.phone}
                </a>
              )}
              {contact.email && (
                // Oculto en mobile (hidden sm:inline), igual que antes: el
                // feedback real pide el fix solo "en desktop" — en mobile no
                // se toca nada. El fix real era el `truncate` puesto en todo
                // el grupo de arriba (podía cortar el correo entero en
                // ciertos anchos); ahora `truncate` vive en el propio enlace,
                // así él solo se recorta con "…" en vez de desaparecer.
                <a href={`mailto:${contact.email}`} className="hidden truncate hover:underline sm:inline">
                  {contact.email}
                </a>
              )}
              {contact.address && (
                <a href={mapsHref} target="_blank" rel="noreferrer" className="hidden shrink-0 hover:underline lg:inline">
                  {contact.address}
                </a>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {contact.socials?.map((s) => {
                const Icon = SOCIAL_ICON[s.platform as keyof typeof SOCIAL_ICON];
                if (!Icon) return null;
                return (
                  <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" aria-label={s.platform}>
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </Container>
        </div>

        {/* Nav principal: sticky, SIEMPRE a la misma altura (nunca anima
            height/max-height — ver nota de diseño arriba). Logo con más
            presencia (feedback: "mayor presencia al wordmark VIEWONE") pero
            constante, sin resize animado. Solo el fondo/sombra reacciona al
            scroll, vía opacity — no dispara layout. */}
        <div
          className={`sticky top-0 bg-background transition-[box-shadow,background-color] duration-200 ${
            scrolled ? "shadow-[0_1px_0_0_rgb(var(--color-foreground)/0.08)]" : ""
          }`}
        >
          <Container className="flex h-20 items-center justify-between">
            <a href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
              {/* eslint-disable-next-line @next/next/no-img-element -- logo real, formato variable entre clientes */}
              <img src={branding.logoUrl} alt={meta.businessName} className="h-12 w-auto object-contain" />
            </a>
            <nav className="hidden gap-8 text-sm font-bold uppercase tracking-wide text-foreground/70 sm:flex">
              {NAV.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`transition-colors hover:text-primary ${isActive(link.href) ? "text-primary" : ""}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              className="-m-2 p-2 text-foreground sm:hidden"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </Container>
        </div>

      {open && (
        <nav className="border-b border-foreground/10 bg-background sm:hidden">
          <Container className="flex flex-col py-2">
            {NAV.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`border-b border-foreground/5 py-3.5 text-base font-semibold last:border-b-0 ${
                  isActive(link.href) ? "text-primary" : "text-foreground/80"
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-4 py-3.5 text-sm text-foreground/60">
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              )}
              {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
            </div>
            <div className="flex items-center gap-4 pb-2">
              {contact.socials?.map((s) => {
                const Icon = SOCIAL_ICON[s.platform as keyof typeof SOCIAL_ICON];
                if (!Icon) return null;
                return (
                  <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" aria-label={s.platform}>
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </Container>
        </nav>
      )}
      </header>
    </>
  );
}
