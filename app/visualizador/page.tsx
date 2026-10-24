import type { Metadata } from "next";
import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { Container } from "@/components/ui/Container";
import { Visualizador } from "@/components/viewone/visualizador/Visualizador";
import { getContacto } from "@/lib/viewone-content-store";
import { listProyectosVisibles } from "@/lib/viewone-store";
import { pageCanonical } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Concepto en staging (2026-10-24): todavía no se linkea desde el menú ni se
// indexa. Cuando ViewOne lo apruebe, sacar el `robots` y sumarlo al NAV.
export const metadata: Metadata = {
  title: "Visualizador 3D — ViewOne",
  description:
    "Sube tu diseño y míralo en 3D, a escala real: señalética, gráfica de muro y piso, vinilo en vidrio, vehículos, letreros, letras corpóreas, stands y letreros carreteros.",
  robots: { index: false, follow: false },
  ...pageCanonical("/visualizador"),
};

export default async function VisualizadorPage() {
  const [contact, proyectos] = await Promise.all([getContacto(), listProyectosVisibles()]);
  // Solo lo que el visualizador necesita para mostrar trabajos reales por categoría.
  const ejemplos = proyectos.map(({ cliente, trabajo, portada, categorias }) => ({ cliente, trabajo, portada, categorias }));
  return (
    <>
      <ViewOneHeader contact={contact} />
      <main className="py-10 sm:py-12">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Visualizador 3D</p>
          <h1 className="mt-2 max-w-2xl font-heading text-3xl font-extrabold text-primary sm:text-4xl">
            Mira tu diseño antes de imprimirlo
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground/60">
            Elige qué quieres hacer, sube tu diseño y ajusta la medida. Lo verás en 3D, a escala real, de día y de noche, junto
            a trabajos que ya hicimos en esa categoría.
          </p>
          <div className="mt-8">
            <Visualizador proyectos={ejemplos} />
          </div>
        </Container>
      </main>
      <ViewOneFooter contact={contact} />
    </>
  );
}
