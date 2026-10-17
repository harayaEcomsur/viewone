import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { Container } from "@/components/ui/Container";

// Checklist "Antes del cierre" (feedback real): "404" figuraba como
// pendiente — no existía not-found.tsx, así que una URL rota caía en la
// página de error genérica de Next (status 404 correcto, pero sin marca).
// A propósito NO usa getContacto() (DB): una página de error no debe
// depender de una llamada que también podría estar fallando — usa
// directamente clientConfig.contact, igual que el resto del sitio cuando no
// hay override.
export default function NotFound() {
  return (
    <>
      <ViewOneHeader />
      <main className="py-28 sm:py-36">
        <Container className="text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-accent">Error 404</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold text-foreground sm:text-5xl">
            No encontramos esta página
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-foreground/60">
            El enlace puede estar roto o la página ya no existe. Volvé al inicio o revisá nuestros proyectos y
            servicios.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/"
              className="inline-flex items-center rounded-lg bg-accent px-7 py-3.5 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
            >
              Volver al inicio
            </a>
            <a
              href="/proyectos"
              className="inline-flex items-center rounded-lg border border-foreground/20 px-7 py-3.5 text-sm font-bold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Ver proyectos
            </a>
          </div>
        </Container>
      </main>
      <ViewOneFooter />
    </>
  );
}
