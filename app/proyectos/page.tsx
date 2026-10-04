import type { Metadata } from "next";
import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { ProyectosClient } from "@/components/viewone/ProyectosClient";
import { listCategoriasVisibles, listProyectosVisibles } from "@/lib/viewone-store";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { clientConfig } from "@/config/client.config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proyectos — ViewOne",
  description: "Proyectos reales de impresión digital, señalética y publicidad exterior para empresas, organizados por categoría.",
};

export default async function ProyectosPage() {
  const [categorias, proyectos] = await Promise.all([listCategoriasVisibles(), listProyectosVisibles()]);
  const { contact, modules } = clientConfig;
  return (
    <>
      <ViewOneHeader />
      <main className="py-16 sm:py-24">
        <ProyectosClient categorias={categorias} proyectos={proyectos} />
      </main>
      <ViewOneFooter />
      {modules.whatsappButton && contact.whatsapp && (
        <WhatsAppButton phone={contact.whatsapp} message={contact.whatsappPrefilledMessage} />
      )}
    </>
  );
}
