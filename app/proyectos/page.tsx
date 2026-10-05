import type { Metadata } from "next";
import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { ProyectosClient } from "@/components/viewone/ProyectosClient";
import { listCategoriasVisibles, listProyectosVisibles } from "@/lib/viewone-store";
import { getContacto } from "@/lib/viewone-content-store";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { clientConfig } from "@/config/client.config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proyectos — ViewOne",
  description: "Proyectos reales de impresión digital, señalética y publicidad exterior para empresas, organizados por categoría.",
};

export default async function ProyectosPage() {
  const [categorias, proyectos, contact] = await Promise.all([
    listCategoriasVisibles(),
    listProyectosVisibles(),
    getContacto(),
  ]);
  const { modules } = clientConfig;
  return (
    <>
      <ViewOneHeader contact={contact} />
      <main className="py-16 sm:py-24">
        <ProyectosClient categorias={categorias} proyectos={proyectos} contact={contact} />
      </main>
      <ViewOneFooter contact={contact} />
      {modules.whatsappButton && contact.whatsapp && (
        <WhatsAppButton phone={contact.whatsapp} message={contact.whatsappPrefilledMessage} />
      )}
    </>
  );
}
