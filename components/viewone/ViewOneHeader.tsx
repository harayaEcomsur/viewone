"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Instagram, Facebook, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { clientConfig } from "@/config/client.config";
import { CmykBar } from "@/components/viewone/CmykBar";

// Header a medida del handoff (sección 06): franja superior con
// teléfono/correo/dirección + redes, header principal con logo + nav, y
// sticky/compacto al hacer scroll. El genérico components/layout/Header.tsx
// no sirve acá: ViewOne tiene páginas reales (/servicios, /proyectos,
// /contacto), no anclas dentro de una sola página.
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
  const { meta, branding } = clientConfig;
  const contact = contactOverride ?? clientConfig.contact;
  const pathname = usePathname();
  // El ítem de "Nosotros" es un ancla dentro de Home (/#nosotros), no una
  // ruta propia — nunca se marca activo junto a Inicio.
  const isActive = (href: string) => !href.includes("#") && pathname === href;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const whatsappHref = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappPrefilledMessage ?? "")}`
    : undefined;
  const mapsHref = contact.mapQuery ? `https://maps.google.com/?q=${encodeURIComponent(contact.mapQuery)}` : undefined;

  return (
    <header className="sticky top-0 z-40">
      {/* Franja superior: teléfono/correo/dirección a la izquierda, redes a la
          derecha — se oculta al hacer scroll para dejar paso al header compacto. */}
      <div
        className={`overflow-hidden bg-foreground text-foreground transition-[max-height,opacity] duration-200 ${
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        }`}
        style={{ color: "rgb(var(--color-background))" }}
      >
        <Container className="flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4 truncate">
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:underline">
                {contact.phone}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="hidden hover:underline sm:inline">
                {contact.email}
              </a>
            )}
            {contact.address && (
              <a href={mapsHref} target="_blank" rel="noreferrer" className="hidden hover:underline md:inline">
                {contact.address}
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
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

      {/* Header principal: compacto apenas se hace scroll. Logo y nav más
          grandes/confiados (feedback: "el logo lo veo muy pequeño"; referencia
          speedpro.com/fastsigns.com, donde el logo domina la barra). */}
      <div className="bg-background/95 backdrop-blur">
        <Container className={`flex items-center justify-between transition-[height] duration-200 ${scrolled ? "h-20" : "h-24"}`}>
          <a href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- logo real, formato variable entre clientes */}
            <img
              src={branding.logoUrl}
              alt={meta.businessName}
              className={`w-auto object-contain transition-[height] duration-200 ${scrolled ? "h-11" : "h-14"}`}
            />
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
        <CmykBar />
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
  );
}
