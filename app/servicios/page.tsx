import type { Metadata } from "next";
import Image from "next/image";
import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { Container } from "@/components/ui/Container";
import { listServiciosVisibles, getContacto } from "@/lib/viewone-content-store";
import { slugifyServicio } from "@/lib/viewone-slug";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { clientConfig } from "@/config/client.config";
import { pageCanonical } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Servicios de impresión digital, señalética y letreros | ViewOne",
  description:
    "Impresión digital, señalética y letreros, estructuras publicitarias, instalación y montaje, y proyectos integrales para empresas en Chile. Cotiza tu proyecto.",
  ...pageCanonical("/servicios"),
};

// /servicios (handoff sección 14-16): una sola página larga con bloques
// alternados foto/texto. H1 único arriba, cada servicio = H2. CTA de cada
// servicio → /contacto. Contenido editable desde /viewone-admin (ver
// lib/viewone-content-store.ts) — fallback al texto real del handoff.
export default async function ServiciosPage() {
  const { modules } = clientConfig;
  const [servicios, contact] = await Promise.all([listServiciosVisibles(), getContacto()]);
  return (
    <>
      <ViewOneHeader contact={contact} />
      {/* py/space-y acá alineados a la escala que quedó en el Home tras la
          auditoría de espaciado (py-14 sm:py-16, no py-20 sm:py-28+) —
          misma lógica, esta página no tiene su propia imagen de referencia
          pero debe sentirse del mismo sitio. */}
      <main className="py-14 sm:py-16">
        <Container>
          <h1 className="max-w-2xl font-heading text-3xl font-extrabold text-primary sm:text-5xl">
            Servicios de impresión y soluciones gráficas
          </h1>
          <p className="mt-4 max-w-2xl text-base text-foreground/70">
            ¿Buscas un letrero para tu empresa?{" "}
            <a href="/letreros-publicitarios" className="font-semibold text-accent underline-offset-2 hover:underline">
              Mira los tipos de letreros publicitarios que hacemos
            </a>
            .
          </p>
        </Container>

        <div className="mt-12 space-y-16 sm:mt-14 sm:space-y-20">
          {servicios.map((s, i) => {
            const fotoFirst = i % 2 === 0;
            return (
              <Container key={s.id} id={slugifyServicio(s.nombre)} className="scroll-mt-24">
                <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2">
                  <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${fotoFirst ? "sm:order-1" : "sm:order-2"}`}>
                    <Image
                      src={s.foto}
                      alt={`${s.nombre} — ${s.trabajo}, proyecto real de ViewOne`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className={fotoFirst ? "sm:order-2" : "sm:order-1"}>
                    <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">{s.nombre}</h2>
                    <p className="mt-4 text-base leading-relaxed text-foreground/70">{s.textoCompleto}</p>
                    <a
                      href="/contacto"
                      className="mt-7 inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
                    >
                      {s.cta}
                    </a>
                  </div>
                </div>
              </Container>
            );
          })}
        </div>

        <Container className="mt-14 text-center sm:mt-16">
          <a
            href="/proyectos"
            className="inline-flex items-center rounded-lg border border-foreground/20 px-7 py-3.5 text-sm font-bold text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Ver todos los proyectos
          </a>
        </Container>
      </main>
      <ViewOneFooter contact={contact} />
      {modules.whatsappButton && contact.whatsapp && (
        <WhatsAppButton phone={contact.whatsapp} message={contact.whatsappPrefilledMessage} />
      )}
    </>
  );
}
