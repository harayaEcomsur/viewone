import { Instagram, Facebook, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { clientConfig } from "@/config/client.config";

// Footer del handoff (sección 10), ampliado en el pase "pixel perfect" al
// mockup azul (feedback real, imagen de referencia enviada 16-oct-2026):
// tres columnas — wordmark + tagline + copyright / nav / redes — en vez de
// la barra angosta de una sola línea que había antes. Mismo remate azul
// (bg-primary) que el Cierre del Home, sin la barra CMYK que se quitó en el
// pase anterior (rompía la disciplina de color pedida explícitamente).
const SOCIAL_ICON = { instagram: Instagram, facebook: Facebook, linkedin: Linkedin } as const;

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

type ContactInfo = { socials?: { platform: string; url: string }[] };

export function ViewOneFooter({ contact: contactOverride }: { contact?: ContactInfo } = {}) {
  const { meta, branding } = clientConfig;
  const contact = contactOverride ?? clientConfig.contact;
  const year = new Date().getFullYear();
  // Mismo crédito y link que usa el Footer genérico (components/layout/
  // Footer.tsx) — ViewOne lo tiene aprobado (branding.credit: true).
  const mostrarCredito = branding.credit || Boolean(process.env.SITE_NOINDEX);

  return (
    <footer className="bg-primary py-12 sm:py-14">
      <Container className="flex flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          {/* Wordmark en texto — ver nota en ViewOneHeader.tsx sobre
              branding.logoUrl. Acá en una sola tonalidad (text-background):
              el contraste azul-sobre-azul del color primario se pierde en
              este fondo. */}
          <span className="font-heading text-xl font-extrabold uppercase tracking-tight text-background">
            {meta.businessName}
          </span>
          <p className="mt-3 text-sm leading-relaxed text-background/60">Soluciones gráficas para empresas</p>
          <p className="mt-4 text-xs text-background/50">
            {meta.businessName} Chile © {year}. Todos los derechos reservados.
          </p>
        </div>

        <nav className="flex flex-col gap-2.5 text-sm text-background/70 sm:items-start">
          {NAV.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-background">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-start gap-4 sm:flex-col sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            {contact.socials?.map((s) => {
              const Icon = SOCIAL_ICON[s.platform as keyof typeof SOCIAL_ICON];
              if (!Icon) return null;
              return (
                <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" aria-label={s.platform} className="text-background/70 hover:text-background">
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
          {mostrarCredito && (
            // Feedback real: "Confirmar si 'Sitio por HarayaDev' quedará en
            // producción" — queda tal cual (sin decidir por ViewOne) hasta
            // que lo confirmen.
            <a
              href="https://haraya.dev/como-lo-hicimos"
              target="_blank"
              rel="noopener"
              className="text-xs text-background/40 opacity-70 transition-opacity hover:opacity-100 hover:text-background"
            >
              Sitio por HarayaDev
            </a>
          )}
        </div>
      </Container>
    </footer>
  );
}
