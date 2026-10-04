import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/IconResolver";
import type { ClientConfig } from "@/config/schema";

// Sección "Ecosistema": para negocios con más de una línea bajo la misma marca
// (ver config/schema.ts → verticals). Cada línea se presenta como una tarjeta
// propia — misma paleta y tipografía del sitio, para que se lea como un solo
// negocio con varias caras, no como tres sitios pegados.
export function Verticals({ verticals }: { verticals: NonNullable<ClientConfig["verticals"]> }) {
  if (!verticals.length) return null;

  return (
    <section id="ecosistema" className="py-16 sm:py-24">
      <Container>
        <h2 className="text-center font-heading text-3xl font-bold text-foreground">Un ecosistema, tres caras</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {verticals.map((v) => (
            <Link
              key={v.title}
              href={v.ctaHref}
              className="group flex flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02] transition-colors hover:border-accent/50"
            >
              {v.imageUrl ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={v.imageUrl}
                    alt={v.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 text-accent">
                  <Icon name={v.icon} className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{v.tagline}</span>
                </div>
                <h3 className="mt-3 font-heading text-xl font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 flex-1 text-sm text-foreground/70">{v.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {v.ctaLabel}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
