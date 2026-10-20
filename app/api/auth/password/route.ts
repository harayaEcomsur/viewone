import { z } from "zod";
import { createSessionCookie } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getAdminPasswordHash, setInitialAdminPassword } from "@/lib/viewone-content-store";

// Login con correo + contraseña para el panel (pedido 2026-10-20: que
// constanza@viewone.cl y mgl@viewone.cl entren y, en su primer acceso, creen
// su propia contraseña). Tres pasos:
//  - "check": ¿este correo ya tiene contraseña o es su primer acceso? Un
//    correo NO autorizado responde igual que uno con contraseña ("login"),
//    para no revelar qué correos están en la lista.
//  - "setup": primer acceso — solo para cuentas con invitación pendiente
//    (invite_pending, ver lib/db.ts) y sin contraseña; fija la contraseña con
//    un UPDATE condicional y abre sesión.
//  - "login": verifica la contraseña y abre sesión.
// La sesión es la misma cookie que usa el login con Google (lib/auth.ts), así
// que el rol (admin/staff) se resuelve igual en cada request.
export const runtime = "nodejs";

const email = z.string().trim().toLowerCase().email().max(200);
const password = z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(200);
const bodySchema = z.discriminatedUnion("step", [
  z.object({ step: z.literal("check"), email }),
  z.object({ step: z.literal("setup"), email, password }),
  z.object({ step: z.literal("login"), email, password: z.string().min(1).max(200) }),
]);

const CREDENCIALES_INVALIDAS = "Correo o contraseña incorrectos.";

export async function POST(req: Request) {
  if (!process.env.SESSION_SECRET) {
    return Response.json({ error: "El acceso con contraseña no está configurado." }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message;
    return Response.json({ error: msg && msg !== "Required" ? msg : "Datos inválidos." }, { status: 400 });
  }
  const data = parsed.data;
  const record = await getAdminPasswordHash(data.email);

  if (data.step === "check") {
    return Response.json({ status: record?.canSetup ? "setup" : "login" });
  }

  if (data.step === "setup") {
    // Mismo mensaje para "no autorizado" y "sin invitación pendiente": no
    // revela qué correos existen.
    if (!record?.canSetup) {
      return Response.json({ error: "Este correo no tiene un primer acceso pendiente." }, { status: 401 });
    }
    const ok = await setInitialAdminPassword(data.email, await hashPassword(data.password));
    if (!ok) return Response.json({ error: "Este correo no tiene un primer acceso pendiente." }, { status: 401 });
    await createSessionCookie(data.email);
    return Response.json({ ok: true });
  }

  if (!record?.hash || !(await verifyPassword(data.password, record.hash))) {
    return Response.json({ error: CREDENCIALES_INVALIDAS }, { status: 401 });
  }
  await createSessionCookie(data.email);
  return Response.json({ ok: true });
}
