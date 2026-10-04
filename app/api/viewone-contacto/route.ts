import { z } from "zod";
import { clientConfig } from "@/config/client.config";

// Formulario de /contacto (handoff sección 21/26): valida, acepta un adjunto
// real (foto/diseño/referencia) y lo manda por Resend al correo de ventas.
// Antispam: honeypot en el form (ver ContactoForm.tsx) + límites de tamaño.
export const runtime = "nodejs";

const MAX_ADJUNTO_BYTES = 8 * 1024 * 1024; // 8 MB

const fieldsSchema = z.object({
  nombre: z.string().min(1).max(120),
  empresa: z.string().max(120).optional(),
  telefono: z.string().min(1).max(40),
  correo: z.string().email(),
  necesidad: z.string().min(1).max(2000),
  medidas: z.string().max(200).optional(),
  lugar: z.string().max(200).optional(),
  comentarios: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  if (!formData) return Response.json({ error: "Datos inválidos." }, { status: 400 });

  const parsed = fieldsSchema.safeParse({
    nombre: formData.get("nombre"),
    empresa: formData.get("empresa") || undefined,
    telefono: formData.get("telefono"),
    correo: formData.get("correo"),
    necesidad: formData.get("necesidad"),
    medidas: formData.get("medidas") || undefined,
    lugar: formData.get("lugar") || undefined,
    comentarios: formData.get("comentarios") || undefined,
  });
  if (!parsed.success) return Response.json({ error: "Revisa los datos del formulario." }, { status: 400 });

  const destination = clientConfig.contact.email;
  const apiKey = process.env.RESEND_API_KEY;
  if (!destination || !apiKey) {
    console.error("[viewone-contacto] falta RESEND_API_KEY o contact.email");
    return Response.json({ error: "El formulario no está configurado todavía." }, { status: 501 });
  }

  const { nombre, empresa, telefono, correo, necesidad, medidas, lugar, comentarios } = parsed.data;

  const adjunto = formData.get("adjunto");
  const attachments: { filename: string; content: string }[] = [];
  if (adjunto instanceof File && adjunto.size > 0) {
    if (adjunto.size > MAX_ADJUNTO_BYTES) {
      return Response.json({ error: "El adjunto no puede superar 8 MB." }, { status: 400 });
    }
    const buffer = Buffer.from(await adjunto.arrayBuffer());
    attachments.push({ filename: adjunto.name || "adjunto", content: buffer.toString("base64") });
  }

  const lineas = [
    `Nombre: ${nombre}`,
    empresa ? `Empresa: ${empresa}` : null,
    `Teléfono: ${telefono}`,
    `Correo: ${correo}`,
    "",
    "¿Qué necesita?",
    necesidad,
    medidas ? `\nMedidas aproximadas: ${medidas}` : null,
    lugar ? `Lugar de uso/instalación: ${lugar}` : null,
    comentarios ? `\nComentarios adicionales:\n${comentarios}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Sitio web ViewOne <onboarding@resend.dev>",
      to: destination,
      reply_to: correo,
      subject: `Nueva cotización de ${nombre}${empresa ? ` (${empresa})` : ""}`,
      text: lineas,
      attachments: attachments.length ? attachments : undefined,
    }),
  });

  if (!res.ok) {
    console.error("[viewone-contacto] Resend falló", res.status, await res.text().catch(() => ""));
    return Response.json({ error: "No se pudo enviar la solicitud. Intenta más tarde." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
