import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { ViewOneHome } from "@/components/viewone/ViewOneHome";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { clientConfig } from "@/config/client.config";
import { getHomeContent, getClientesContent, listServiciosVisibles, getContacto } from "@/lib/viewone-content-store";

export const dynamic = "force-dynamic";

// Home a medida del handoff aprobado por ViewOne — ver components/viewone/*.
export default async function HomePage() {
  const { modules } = clientConfig;
  const [content, clientes, servicios, contact] = await Promise.all([
    getHomeContent(),
    getClientesContent(),
    listServiciosVisibles(),
    getContacto(),
  ]);
  return (
    <>
      <ViewOneHeader contact={contact} />
      <main>
        <ViewOneHome content={content} clientes={clientes} servicios={servicios} contact={contact} />
      </main>
      <ViewOneFooter contact={contact} />
      {modules.whatsappButton && contact.whatsapp && (
        <WhatsAppButton phone={contact.whatsapp} message={contact.whatsappPrefilledMessage} />
      )}
    </>
  );
}
