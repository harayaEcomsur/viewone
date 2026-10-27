import type { Metadata } from "next";
import Image from "next/image";
import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getContacto } from "@/lib/viewone-content-store";
import { listProyectosVisibles } from "@/lib/viewone-store";
import { mismoOrigen } from "@/lib/viewone-media";
import { clientConfig } from "@/config/client.config";
import { seoMetadata } from "@/lib/viewone-seo";

export const dynamic = "force-dynamic";

// Landing SEO (2026-10-26): quien busca "carteles publicitarios" o "letreros
// publicitarios" en Chile no encontraba nada en el sitio — la palabra no
// aparecía en ninguna página. En Chile Google trata "carteles" ≈ "letreros"
// (los que rankean son páginas de letreros), así que la página usa "letreros"
// como término principal y "carteles" de forma natural, sin repetirlo.
//
// Regla: solo afirmaciones que ViewOne ya hace en el sitio ("desarrollamos,
// producimos e instalamos", +20 años, proyectos reales). Nada de plazos,
// precios, garantías ni taller propio sin confirmarlo con ellos.
// Título y descripción editables desde el panel (pestaña SEO).
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata("letreros");
}

const TIPOS = [
  {
    titulo: "Letreros de fachada",
    texto:
      "El letrero que identifica tu local, oficina o sucursal desde la calle. Paneles rígidos impresos o con gráfica aplicada, dimensionados para la fachada real y pensados para verse a la distancia desde la que te buscan.",
  },
  {
    titulo: "Letreros luminosos y cajas de luz",
    texto:
      "Para que la marca se vea igual de día y de noche. Cajas de luz con cara impresa e iluminación interior, ideales para fachadas comerciales y accesos que funcionan después de que oscurece.",
  },
  {
    titulo: "Letras corpóreas y logos volumétricos",
    texto:
      "Letras y logos con volumen, montados sobre muro o fachada, para recepciones, edificios corporativos y exteriores. Dan presencia de marca sin necesidad de un panel de fondo.",
  },
  {
    titulo: "Tótems y directorios",
    texto:
      "Estructuras de pie para accesos, estacionamientos y edificios con varias empresas o áreas. Ordenan la llegada y dejan la marca visible antes de entrar.",
  },
  {
    titulo: "Señalética direccional e interior",
    texto:
      "Placas, señales y directorios para orientar a visitas y clientes dentro de oficinas, recintos y espacios corporativos, con la misma línea gráfica de la marca.",
  },
  {
    titulo: "Letreros carreteros y gran formato",
    texto:
      "Letreros de gran tamaño en estructura propia para rutas y vía pública, cuando el mensaje tiene que leerse a velocidad y a varios metros de distancia.",
  },
];

const PASOS = [
  { titulo: "Nos cuentas qué necesitas", texto: "Dónde va, qué medida aproximada tiene y qué quieres comunicar. Con una foto del lugar ya podemos empezar." },
  { titulo: "Desarrollamos la propuesta", texto: "Definimos formato, materiales e iluminación según el uso, y te enviamos la cotización." },
  { titulo: "Producimos", texto: "Imprimimos y armamos el letrero con la gráfica final aprobada." },
  { titulo: "Instalamos", texto: "Nuestro equipo lo instala en el lugar, listo para funcionar." },
];

const FAQ = [
  {
    p: "¿Qué diferencia hay entre un cartel y un letrero publicitario?",
    r: "En Chile se usan casi como sinónimos. \"Letrero\" se usa más para lo que va fijo en una fachada, un muro o una estructura; \"cartel\" también se usa para afiches o piezas impresas más simples. En ambos casos lo que importa es dónde va, a qué distancia se lee y si necesita verse de noche.",
  },
  {
    p: "¿Cuánto cuesta un letrero publicitario?",
    r: "Depende de la medida, los materiales, si lleva iluminación, la estructura y la instalación (altura y acceso al lugar). Por eso cotizamos cada proyecto: cuéntanos qué necesitas y te enviamos una propuesta con el detalle.",
  },
  {
    p: "¿Necesito un permiso para instalar un letrero?",
    r: "En la mayoría de las comunas, un letrero visible desde la vía pública requiere permiso municipal y el pago de derechos de publicidad. Antes de instalar, revisa con la municipalidad de tu comuna qué piden para tu caso.",
  },
  {
    p: "¿Qué archivo de diseño necesito?",
    r: "Lo ideal es el logo o diseño en formato vectorial (AI, PDF o SVG). Si solo tienes una imagen, envíala igual en la mejor resolución que tengas y te decimos si sirve para el tamaño del letrero.",
  },
  {
    p: "¿Ustedes también instalan el letrero?",
    r: "Sí. Desarrollamos, producimos e instalamos: puedes resolver el letrero completo con un solo proveedor, desde la propuesta hasta el montaje.",
  },
];

// Proyectos del catálogo que son letreros, señalética o corpóreos: se leen de
// la base (editable desde el panel), así la página se actualiza sola.
const ES_LETRERO = /letrero|se[ñn]al[ée]tica|directorio|corp[óo]re|letras|logo/i;

export default async function LetrerosPage() {
  const { modules } = clientConfig;
  const [contact, proyectos] = await Promise.all([getContacto(), listProyectosVisibles()]);
  const ejemplos = proyectos.filter((p) => ES_LETRERO.test(p.trabajo)).slice(0, 8);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.p, acceptedAnswer: { "@type": "Answer", text: f.r } })),
  };

  return (
    <>
      <ViewOneHeader contact={contact} />
      <main>
        <section className="py-14 sm:py-16">
          <Container>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Señalética y publicidad exterior</p>
            <h1 className="mt-3 max-w-3xl font-heading text-3xl font-extrabold text-primary sm:text-5xl">
              Letreros y carteles publicitarios para empresas
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
              En ViewOne desarrollamos, producimos e instalamos letreros publicitarios para empresas: letreros de fachada,
              luminosos, letras corpóreas, tótems, señalética y letreros carreteros. Más de 20 años haciendo que las marcas se
              vean bien en la calle, en sus oficinas y en la vía pública.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/contacto?desde=letreros"
                className="inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
              >
                Cotiza tu letrero
              </a>
              <a
                href="/proyectos"
                className="inline-flex items-center rounded-lg border border-foreground/20 px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                Ver proyectos
              </a>
            </div>
          </Container>
        </section>

        <section className="bg-foreground/[0.03] py-14 sm:py-16">
          <Container>
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Tipos de letreros publicitarios</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TIPOS.map((t) => (
                <div key={t.titulo} className="rounded-2xl border border-foreground/10 bg-background p-6">
                  <h3 className="font-heading text-lg font-bold text-foreground">{t.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">{t.texto}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {ejemplos.length > 0 && (
          <section className="py-14 sm:py-16">
            <Container>
              <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Letreros que ya hicimos</h2>
              <p className="mt-3 max-w-2xl text-base text-foreground/60">Proyectos reales para empresas que confían en ViewOne.</p>
              <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {ejemplos.map((p) => (
                  <a key={p.id} href="/proyectos" className="group overflow-hidden rounded-2xl">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <Image
                        src={mismoOrigen(p.portada)}
                        alt={`${p.trabajo.replace(/\s*-\s*\d+$/, "")} para ${p.cliente}, proyecto de ViewOne`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-sm font-bold text-foreground">{p.cliente}</p>
                    <p className="text-xs text-foreground/60">{p.trabajo.replace(/\s*-\s*\d+$/, "")}</p>
                  </a>
                ))}
              </div>
            </Container>
          </section>
        )}

        <section className="bg-foreground/[0.03] py-14 sm:py-16">
          <Container>
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Cómo trabajamos</h2>
            <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PASOS.map((paso, i) => (
                <li key={paso.titulo} className="rounded-2xl border border-foreground/10 bg-background p-6">
                  <span className="font-heading text-sm font-extrabold text-accent">0{i + 1}</span>
                  <h3 className="mt-2 font-heading text-lg font-bold text-foreground">{paso.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">{paso.texto}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className="py-14 sm:py-16">
          <Container>
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Preguntas frecuentes</h2>
            <div className="mt-8 max-w-3xl divide-y divide-foreground/10 border-y border-foreground/10">
              {FAQ.map((f) => (
                <details key={f.p} className="group py-5">
                  <summary className="cursor-pointer list-none font-heading text-base font-bold text-foreground marker:hidden">
                    {f.p}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/70">{f.r}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-primary py-14 text-center sm:py-16">
          <Container>
            <h2 className="font-heading text-2xl font-extrabold text-background sm:text-3xl">¿Necesitas un letrero para tu empresa?</h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-background/70">
              Cuéntanos dónde va y qué quieres comunicar. Te ayudamos a definir el formato y te enviamos la cotización.
            </p>
            <a
              href="/contacto?desde=letreros"
              className="mt-7 inline-flex items-center rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
            >
              Cotiza tu letrero
            </a>
          </Container>
        </section>
      </main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {modules.whatsappButton && contact.whatsapp && (
        <WhatsAppButton phone={contact.whatsapp} message={contact.whatsappPrefilledMessage} />
      )}
      <ViewOneFooter contact={contact} />
    </>
  );
}
