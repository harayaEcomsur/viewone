import { put } from "@vercel/blob";
import { currentAdminUser } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

function claveFromRequest(req: Request): string | null {
  return req.headers.get("x-viewone-key") ?? new URL(req.url).searchParams.get("clave");
}

export async function POST(req: Request) {
  const user = await currentAdminUser(claveFromRequest(req));
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "La subida de fotos no está configurada en este sitio (falta Vercel Blob)." }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Falta el archivo" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "La imagen pesa demasiado (máx. 8 MB)" }, { status: 413 });
  if (!file.type.startsWith("image/")) return Response.json({ error: "Solo se aceptan imágenes" }, { status: 400 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const pathname = `viewone/catalogo/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const blob = await put(pathname, file, { access: "public", contentType: file.type });
  return Response.json({ ok: true, url: blob.url });
}
