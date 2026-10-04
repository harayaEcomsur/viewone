import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { clientConfig } from "@/config/client.config";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  SERVICIOS,
  HOME_PROYECTOS_DESTACADOS,
  HOME_HERO_FOTO,
  HOME_NOSOTROS_FOTO,
  CLIENTES_DESTACADOS,
  CLIENTES_TODOS,
} from "@/lib/viewone-data";
import { slugifyServicio } from "@/lib/viewone-slug";

// Home a medida (handoff sección 07-10): Hero → Clientes destacados →
// Servicios resumidos → Más de 20 años → Proyectos destacados → Nosotros →
// Clientes (completo) → Cierre. Orden y contenido exactos del handoff
// aprobado; la composición/paleta/tipografía es la propuesta de HarayaDev.
export function ViewOneHome() {
  const { contact } = clientConfig;
  const whatsappHref = contact.whatsapp ? buildWhatsAppLink(contact.whatsapp, contact.whatsappPrefilledMessage) : undefined;

  return (
    <>
      {/* 01 Hero */}
      <section className="relative overflow-hidden py-28 sm:py-36">
        <Image src={HOME_HERO_FOTO} alt="Boletería de Andacor con señalética e impresión instalada por ViewOne" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/55 to-foreground/30" />
        <Container className="relative">
          <h1 className="max-w-2xl font-heading text-4xl font-extrabold leading-[1.05] text-background sm:text-6xl">
            Impresión digital y soluciones gráficas para empresas
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-background/85 sm:text-lg">
            Desarrollamos, producimos e instalamos soluciones gráficas para marcas, empresas y proyectos, desde
            impresión digital hasta implementaciones integrales.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="/contacto"
              className="inline-flex items-center rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-foreground shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
            >
              Cotiza tu proyecto
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

      {/* 02 Clientes destacados */}
      <section className="border-b border-foreground/10 py-10">
        <Container>
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">
            Empresas que han confiado en ViewOne
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {CLIENTES_DESTACADOS.map((nombre) => (
              <div
                key={nombre}
                className="flex h-14 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/[0.02] px-2 text-center text-xs font-bold text-foreground/50"
              >
                {nombre}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 03 Servicios resumidos */}
      <section id="servicios" className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Servicios</h2>
            <a href="/servicios" className="text-sm font-bold text-primary hover:underline">
              Ver todos los servicios →
            </a>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {SERVICIOS.map((s) => (
              <a
                key={s.nombre}
                href={`/servicios#${slugifyServicio(s.nombre)}`}
                className="group overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02] transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.foto}
                    alt={`${s.nombre} — ${s.trabajo}, proyecto real de ViewOne`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-sm font-bold text-foreground">{s.nombre}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground/60">{s.textoCorto}</p>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* 04 Más de 20 años */}
      <section className="bg-foreground/[0.02] py-16">
        <Container>
          <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">Más de 20 años de experiencia</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Taller propio", "Producción integral", "Experiencia B2B"].map((a) => (
              <span
                key={a}
                className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary"
              >
                {a}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* 05 Proyectos destacados */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Proyectos destacados</h2>
            <a href="/proyectos" className="text-sm font-bold text-primary hover:underline">
              Ver todos los proyectos →
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {HOME_PROYECTOS_DESTACADOS.map((p) => (
              <a key={p.nombre} href="/proyectos" className="group overflow-hidden rounded-2xl">
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src={p.foto}
                    alt={`Proyecto de ViewOne para ${p.nombre}`}
                    fill
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

      {/* 06 Nosotros */}
      <section id="nosotros" className="py-20 sm:py-28">
        <Container className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-foreground">
            <Image src={HOME_NOSOTROS_FOTO} alt="Letrero de ViewOne sobre madera" fill className="object-contain p-10" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Nosotros</p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
              Experiencia que respalda cada proyecto
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/70">
              En ViewOne contamos con más de 20 años de experiencia desarrollando soluciones gráficas y publicitarias
              para empresas y marcas. Producimos e implementamos proyectos de impresión, fabricación e instalación,
              adaptándonos a los requerimientos de cada cliente y cada espacio.
            </p>
          </div>
        </Container>
      </section>

      {/* 07 Clientes (completo) */}
      <section className="bg-foreground/[0.02] py-16">
        <Container>
          <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Experiencia con empresas de distintos rubros
          </h2>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {CLIENTES_TODOS.map((nombre) => (
              <div
                key={nombre}
                className="flex h-12 items-center justify-center rounded-lg border border-foreground/10 px-2 text-center text-xs font-semibold text-foreground/50"
              >
                {nombre}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 08-09 Cierre */}
      <section className="py-20 sm:py-28">
        <Container className="text-center">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Cuéntanos qué necesitas</h2>
          <div className="mt-5 flex flex-col items-center gap-1 text-foreground/70">
            <p>Santiago, Chile</p>
            {contact.email && <a href={`mailto:${contact.email}`} className="hover:text-primary">{contact.email}</a>}
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="hover:text-primary">
                {contact.phone}
              </a>
            )}
          </div>
          <a
            href="/contacto"
            className="mt-8 inline-flex items-center rounded-lg bg-primary px-8 py-4 text-sm font-bold text-background shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
          >
            Contáctanos
          </a>
        </Container>
      </section>
    </>
  );
}
