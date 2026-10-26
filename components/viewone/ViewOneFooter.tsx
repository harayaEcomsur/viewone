import { Instagram, Facebook, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { clientConfig } from "@/config/client.config";
import { BotonPreferenciasCookies } from "@/components/viewone/AvisoCookies";

// Footer del handoff (sección 10), ampliado en el pase "pixel perfect" al
// mockup azul (feedback real, imagen de referencia enviada 16-oct-2026):
// tres columnas — wordmark + tagline + copyright / nav / redes.
//
// Fondo propio (no bg-primary): en la referencia la barra del footer es un
// navy más oscuro y neutro que el azul del Cierre/CTA de arriba — un tono
// dedicado (#13263D, medido directo de la imagen), no el primary de marca.
// Nav horizontal (no columna) + separador vertical antes de los íconos
// sociales, igual que la referencia — antes esto era una columna vertical,
// una de las diferencias señaladas al revisar contra la imagen.
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
    <footer className="bg-[#13263d] py-8">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Wordmark en texto — ver nota en ViewOneHeader.tsx sobre
              branding.logoUrl. Acá en una sola tonalidad (text-background):
              el contraste azul-sobre-azul del color primario se pierde en
              este fondo. */}
          <span className="font-heading text-lg font-extrabold uppercase tracking-tight text-background">
            {meta.businessName}
          </span>
          <p className="mt-1.5 text-xs leading-relaxed text-background/60">Soluciones gráficas para empresas</p>
          <p className="mt-1 text-xs text-background/50">
            {meta.businessName} Chile © {year}. Todos los derechos reservados.
          </p>
          {/* Privacidad y cookies: el aviso de cookies tiene que poder reabrirse
              desde cualquier página para cambiar la elección. */}
          <p className="mt-1 flex gap-3 text-xs text-background/50">
            <a href="/privacidad" className="transition-colors hover:text-background">
              Privacidad
            </a>
            <BotonPreferenciasCookies className="transition-colors hover:text-background" />
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-background/70">
          {NAV.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-background">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
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
          {/* Separador vertical antes de los íconos sociales, igual que la
              referencia. */}
          <div className="h-5 w-px bg-background/20" aria-hidden="true" />
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
        </div>
      </Container>
    </footer>
  );
}
