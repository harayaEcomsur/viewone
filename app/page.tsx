import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { ViewOneHome } from "@/components/viewone/ViewOneHome";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { clientConfig } from "@/config/client.config";

// Home a medida del handoff aprobado por ViewOne — ver components/viewone/*.
export default function HomePage() {
  const { contact, modules } = clientConfig;
  return (
    <>
      <ViewOneHeader />
      <main>
        <ViewOneHome />
      </main>
      <ViewOneFooter />
      {modules.whatsappButton && contact.whatsapp && (
        <WhatsAppButton phone={contact.whatsapp} message={contact.whatsappPrefilledMessage} />
      )}
    </>
  );
}
