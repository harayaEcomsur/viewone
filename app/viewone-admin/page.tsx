import type { Metadata } from "next";
import { clientConfig } from "@/config/client.config";
import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { AdminLoginCard } from "@/components/auth/AdminLoginCard";
import { AdminViewOne } from "@/components/viewone/AdminViewOne";
import { currentAgendaUser, googleLoginEnabled, claveLoginEnabled, isClaveSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Panel de catálogo — ${clientConfig.meta.businessName}`,
  robots: { index: false, follow: false },
};

// CMS completo (pedido explícito 2026-10-05: "poder modificar todo el
// contenido del sitio, imágenes, texto" + "como superadmin poder agregar
// usuarios admin o algún tipo de rol diferente"): Home, Servicios, catálogo
// de Proyectos/Categorías, lista de Clientes, datos de Contacto y Usuarios.
// A propósito NO incluye paleta/tipografía/layout — eso sigue siendo una
// solicitud a HarayaDev, no autoservicio, para no romper la consistencia de
// marca.
//
// Dos roles reales ahora: "admin" entra a todo; "staff" entra al panel y
// edita catálogo/contenido, pero no ve Contacto ni Usuarios (gate server-side
// en app/api/viewone-admin/route.ts, no solo ocultar la sección en la UI).
export default async function ViewOneAdminPage({ searchParams }: { searchParams: { clave?: string } }) {
  const user = await currentAgendaUser(searchParams.clave ?? null);
  const authorized = Boolean(user);
  // Si entró por clave compartida (link ?clave=… o el form, sin cookie de
  // Google), el cliente necesita la clave real para reenviarla en cada fetch
  // — ver nota en AdminViewOne.tsx. Nunca se expone a una sesión de Google.
  const adminKey = isClaveSession(user) ? process.env.AGENDA_ADMIN_KEY : undefined;
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
                <AdminViewOne adminKey={adminKey} role={user?.role} currentEmail={user?.email} />
              </div>
            </>
          )}
        </div>
      </main>
      <ViewOneFooter />
    </>
  );
}
