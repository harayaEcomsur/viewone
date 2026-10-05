import { z } from "zod";
import { currentAdminUser } from "@/lib/auth";
import {
  listCategorias,
  listProyectos,
  upsertCategoria,
  setCategoriaVisible,
  deleteCategoria,
  upsertProyecto,
  setProyectoVisible,
  deleteProyecto,
} from "@/lib/viewone-store";
import {
  getHomeContent,
  setHomeContent,
  getClientesContent,
  setClientesContent,
  getContacto,
  setContactoOverride,
  listServicios,
  upsertServicio,
  setServicioVisible,
  deleteServicio,
} from "@/lib/viewone-content-store";

export const runtime = "nodejs";

// Panel /viewone-admin: CMS completo (categorías/proyectos, contenido del
// Home, servicios, lista de clientes, datos de contacto) editable sin
// redeploy. Mismo patrón de auth que el resto del starter-kit (ver
// lib/auth.ts) — cookie de sesión (Google o clave compartida) o
// ?clave=/header directo. A propósito NO incluye nada de paleta/tipografía/
// layout — eso sigue siendo una solicitud a HarayaDev (decisión explícita
// 2026-10-05, para no romper la consistencia de marca).
function claveFromRequest(req: Request): string | null {
  return req.headers.get("x-viewone-key") ?? new URL(req.url).searchParams.get("clave");
}

export async function GET(req: Request) {
  const user = await currentAdminUser(claveFromRequest(req));
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });

  const [categorias, proyectos, homeContent, clientes, contacto, servicios] = await Promise.all([
    listCategorias(),
    listProyectos(),
    getHomeContent(),
    getClientesContent(),
    getContacto(),
    listServicios(),
  ]);
  return Response.json({ categorias, proyectos, homeContent, clientes, contacto, servicios });
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("upsertCategoria"),
    id: z.string().optional(),
    nombre: z.string().min(1),
    imagen: z.string().url().nullable().optional(),
  }),
  z.object({ action: z.literal("setCategoriaVisible"), id: z.string().min(1), visible: z.boolean() }),
  z.object({ action: z.literal("deleteCategoria"), id: z.string().min(1) }),
  z.object({
    action: z.literal("upsertProyecto"),
    id: z.string().optional(),
    cliente: z.string().min(1),
    trabajo: z.string().min(1),
    categorias: z.array(z.string()).min(1),
    portada: z.string().url(),
    galeria: z.array(z.string().url()).optional(),
    material: z.string().nullable().optional(),
    aplicacion: z.string().nullable().optional(),
    whatsappMensaje: z.string().nullable().optional(),
  }),
  z.object({ action: z.literal("setProyectoVisible"), id: z.string().min(1), visible: z.boolean() }),
  z.object({ action: z.literal("deleteProyecto"), id: z.string().min(1) }),
  z.object({
    action: z.literal("setHomeContent"),
    heroTitulo: z.string().min(1).optional(),
    heroBajada: z.string().min(1).optional(),
    heroFotoUrl: z.string().url().optional(),
    nosotrosEyebrow: z.string().min(1).optional(),
    nosotrosTitulo: z.string().min(1).optional(),
    nosotrosTexto: z.string().min(1).optional(),
    nosotrosFotoUrl: z.string().url().optional(),
    badges: z.array(z.string().min(1)).optional(),
    proyectosDestacados: z.array(z.object({ nombre: z.string().min(1), foto: z.string().url() })).optional(),
    cierreTitulo: z.string().min(1).optional(),
  }),
  z.object({ action: z.literal("setClientesContent"), nombres: z.array(z.string().min(1)) }),
  z.object({
    action: z.literal("setContactoOverride"),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    whatsappPrefilledMessage: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    mapQuery: z.string().optional(),
    socials: z.array(z.object({ platform: z.string().min(1), url: z.string().url() })).optional(),
  }),
  z.object({
    action: z.literal("upsertServicio"),
    id: z.string().optional(),
    nombre: z.string().min(1),
    trabajo: z.string().min(1),
    textoCorto: z.string().min(1),
    textoCompleto: z.string().min(1),
    foto: z.string().url(),
    cta: z.string().min(1),
  }),
  z.object({ action: z.literal("setServicioVisible"), id: z.string().min(1), visible: z.boolean() }),
  z.object({ action: z.literal("deleteServicio"), id: z.string().min(1) }),
]);

export async function PATCH(req: Request) {
  const user = await currentAdminUser(claveFromRequest(req));
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Datos inválidos" }, { status: 400 });
  const data = parsed.data;

  switch (data.action) {
    case "upsertCategoria":
      return Response.json({ ok: true, categoria: await upsertCategoria(data) });
    case "setCategoriaVisible":
      await setCategoriaVisible(data.id, data.visible);
      return Response.json({ ok: true });
    case "deleteCategoria":
      await deleteCategoria(data.id);
      return Response.json({ ok: true });
    case "upsertProyecto":
      return Response.json({ ok: true, proyecto: await upsertProyecto(data) });
    case "setProyectoVisible":
      await setProyectoVisible(data.id, data.visible);
      return Response.json({ ok: true });
    case "deleteProyecto":
      await deleteProyecto(data.id);
      return Response.json({ ok: true });
    case "setHomeContent": {
      const { action, ...partial } = data;
      return Response.json({ ok: true, homeContent: await setHomeContent(partial) });
    }
    case "setClientesContent":
      return Response.json({ ok: true, clientes: await setClientesContent(data.nombres) });
    case "setContactoOverride": {
      const { action, ...partial } = data;
      await setContactoOverride(partial);
      return Response.json({ ok: true, contacto: await getContacto() });
    }
    case "upsertServicio":
      return Response.json({ ok: true, servicio: await upsertServicio(data) });
    case "setServicioVisible":
      await setServicioVisible(data.id, data.visible);
      return Response.json({ ok: true });
    case "deleteServicio":
      await deleteServicio(data.id);
      return Response.json({ ok: true });
  }
}
