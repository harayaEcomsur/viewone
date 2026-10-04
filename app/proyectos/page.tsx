import type { Metadata } from "next";
import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { ProyectosClient } from "@/components/viewone/ProyectosClient";

export const metadata: Metadata = {
  title: "Proyectos — ViewOne",
  description: "Proyectos reales de impresión digital, señalética y publicidad exterior para empresas, organizados por categoría.",
};

export default function ProyectosPage() {
  return (
    <>
      <ViewOneHeader />
      <main className="py-16 sm:py-24">
        <ProyectosClient />
      </main>
      <ViewOneFooter />
    </>
  );
}
