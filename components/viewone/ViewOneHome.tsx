import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { clientConfig } from "@/config/client.config";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  SERVICIOS,
  HOME_PROYECTOS_DESTACADOS,
  HOME_HERO_FOTO,
  HOME_NOSOTROS_FOTO,
  CLIENTES_TODOS,
} from "@/lib/viewone-data";
import { slugifyServicio } from "@/lib/viewone-slug";

// Home a medida (handoff sección 07-10): Hero → Clientes → Servicios
// resumidos → Proyectos destacados → Nosotros (incl. "Más de 20 años") →
// Cierre. Contenido exacto del handoff aprobado; la composición/paleta/
// tipografía es la propuesta de HarayaDev.
//
// El handoff repetía la lista de clientes dos veces (destacados + completa,
// ambas como cajas con el nombre en texto). Pase de diseño (impeccable
// critique 2026-10-04): se fusionó en una sola lista, justo después del hero
// — ahí es donde la prueba social pesa más — y se reemplazó la grilla de
// cajas (que sin logos reales se leía como contenido sin terminar) por un
// trato tipográfico deliberado: nombres como texto editorial, no como logos
// fingidos. Cuando ViewOne entregue los logos reales, esta lista es el punto
// de reemplazo.
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

      {/* 02 Clientes */}
      <section className="border-b border-foreground/10 py-12">
        <Container>
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">
            Empresas que han confiado en ViewOne
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-9 gap-y-4">
            {CLIENTES_TODOS.map((nombre) => (
              <span
                key={nombre}
                className="font-heading text-base font-extrabold uppercase tracking-wide text-foreground/35 transition-colors hover:text-foreground/70 sm:text-lg"
              >
                {nombre}
              </span>
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

      {/* 04 Proyectos destacados */}
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

      {/* 05 Nosotros (incl. "Más de 20 años", fusionado del band suelto que
          tenía su propia sección — ver nota de diseño arriba) */}
      <section id="nosotros" className="bg-foreground/[0.02] py-20 sm:py-28">
        <Container className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-foreground">
            <Image src={HOME_NOSOTROS_FOTO} alt="Letrero de ViewOne sobre madera" fill className="object-contain p-10" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Nosotros</p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
              Más de 20 años de experiencia respaldan cada proyecto
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/70">
              En ViewOne desarrollamos soluciones gráficas y publicitarias para empresas y marcas. Producimos e
              implementamos proyectos de impresión, fabricación e instalación, adaptándonos a los requerimientos de
              cada cliente y cada espacio.
            </p>
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
          </div>
        </Container>
      </section>

      {/* 06 Cierre */}
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
