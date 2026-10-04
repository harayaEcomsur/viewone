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

export const runtime = "nodejs";

// Panel /viewone-admin: catálogo de categorías y proyectos editable sin
// redeploy. Mismo patrón de auth que el resto del starter-kit (ver lib/auth.ts)
// — cookie de sesión (Google o clave compartida) o ?clave=/header directo.
function claveFromRequest(req: Request): string | null {
  return req.headers.get("x-viewone-key") ?? new URL(req.url).searchParams.get("clave");
}

export async function GET(req: Request) {
  const user = await currentAdminUser(claveFromRequest(req));
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });

  const [categorias, proyectos] = await Promise.all([listCategorias(), listProyectos()]);
  return Response.json({ categorias, proyectos });
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
  }
}
