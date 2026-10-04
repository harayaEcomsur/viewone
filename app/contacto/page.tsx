import type { Metadata } from "next";
import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { Container } from "@/components/ui/Container";
import { ContactoForm } from "@/components/viewone/ContactoForm";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { clientConfig } from "@/config/client.config";

export const metadata: Metadata = {
  title: "Contacto — ViewOne",
  description: "Cuéntanos qué necesitas y te ayudamos a definir la solución adecuada para tu proyecto.",
};

// /contacto (handoff sección 21): H1 "Cuéntanos qué necesitas" + bajada +
// formulario. Desktop en dos columnas, mobile en una (el grid se encarga).
export default function ContactoPage() {
  const { contact, modules } = clientConfig;
  return (
    <>
      <ViewOneHeader />
      <main className="py-16 sm:py-24">
        <Container className="grid grid-cols-1 gap-12 sm:grid-cols-2">
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Cuéntanos qué necesitas</h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-foreground/60">
              ¿Tienes una idea, una referencia o una foto de lo que necesitas? Envíanos la información y te ayudamos a
              definir la solución adecuada para tu proyecto.
            </p>
          </div>
          <ContactoForm />
        </Container>
      </main>
      <ViewOneFooter />
      {modules.whatsappButton && contact.whatsapp && (
        <WhatsAppButton phone={contact.whatsapp} message={contact.whatsappPrefilledMessage} />
      )}
    </>
  );
}
