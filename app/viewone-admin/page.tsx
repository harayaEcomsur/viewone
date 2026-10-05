import type { Metadata } from "next";
import { clientConfig } from "@/config/client.config";
import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { AdminLoginCard } from "@/components/auth/AdminLoginCard";
import { AdminViewOne } from "@/components/viewone/AdminViewOne";
import { currentAdminUser, googleLoginEnabled, claveLoginEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Panel de catálogo — ${clientConfig.meta.businessName}`,
  robots: { index: false, follow: false },
};

// CMS completo (pedido explícito 2026-10-05: "poder modificar todo el
// contenido del sitio, imágenes, texto"): Home, Servicios, catálogo de
// Proyectos/Categorías, lista de Clientes y datos de Contacto. A propósito
// NO incluye paleta/tipografía/layout — eso sigue siendo una solicitud a
// HarayaDev, no autoservicio, para no romper la consistencia de marca.
// Mismo gate de login que el resto del starter-kit (Google u clave
// compartida — ver lib/auth.ts). Único rol admin, sin staff.
export default async function ViewOneAdminPage({ searchParams }: { searchParams: { clave?: string } }) {
  const authorized = Boolean(await currentAdminUser(searchParams.clave ?? null));
  const googleEnabled = googleLoginEnabled();
  const claveEnabled = claveLoginEnabled();

  return (
    <>
      <ViewOneHeader />
      <main className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {!authorized ? (
            <div className="mt-8">
              <AdminLoginCard
                businessName={clientConfig.meta.businessName}
                logoUrl={clientConfig.branding.logoUrl}
                description="Administra las categorías y proyectos que se muestran en viewone.cl — sin tocar código."
                googleEnabled={googleEnabled}
                claveEnabled={claveEnabled}
              />
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Panel del negocio</p>
              <h1 className="mt-3 font-heading text-3xl font-bold text-foreground">Catálogo</h1>
              <p className="mt-2 text-sm text-foreground/60">
                Edita el contenido del Home, Servicios, el catálogo de Proyectos, la lista de Clientes y los datos de
                Contacto. Los cambios se reflejan de inmediato en el sitio.
              </p>
              <div className="mt-8">
                <AdminViewOne />
              </div>
            </>
          )}
        </div>
      </main>
      <ViewOneFooter />
    </>
  );
}
