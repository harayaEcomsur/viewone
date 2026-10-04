import type { Metadata } from "next";
import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { ProyectosClient } from "@/components/viewone/ProyectosClient";
import { listCategoriasVisibles, listProyectosVisibles } from "@/lib/viewone-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proyectos — ViewOne",
  description: "Proyectos reales de impresión digital, señalética y publicidad exterior para empresas, organizados por categoría.",
};

export default async function ProyectosPage() {
  const [categorias, proyectos] = await Promise.all([listCategoriasVisibles(), listProyectosVisibles()]);
  return (
    <>
      <ViewOneHeader />
      <main className="py-16 sm:py-24">
        <ProyectosClient categorias={categorias} proyectos={proyectos} />
      </main>
      <ViewOneFooter />
    </>
  );
}
