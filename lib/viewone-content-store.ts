import { db, withDb, jsonb } from "@/lib/db";
import { clientConfig } from "@/config/client.config";
import {
  SERVICIOS,
  HOME_PROYECTOS_DESTACADOS,
  HOME_HERO_FOTO,
  HOME_NOSOTROS_FOTO,
  CLIENTES_TODOS as CLIENTES_TODOS_RO,
  type Servicio as ServicioSeed,
} from "@/lib/viewone-data";
import { slugifyServicio } from "@/lib/viewone-slug";
import { clientesDesdeNombres, clientesSchema, type Cliente } from "@/lib/viewone-clientes";
import { seccionesDesdeLegacy, seccionesSchema, type HomeLegacy, type HomeSeccion } from "@/lib/viewone-home-sections";

// CMS completo (pedido explícito: "todo el contenido editable en el admin,
// imágenes, texto"). Los bloques singleton (Home, Clientes, Contacto) usan
// la tabla genérica `settings` (key/value JSONB) — mismo patrón que
// lib/booking-store.ts. Servicios es la única lista nueva y sigue el molde
// de lib/viewone-store.ts (tabla propia + seed desde el contenido real).
//
// A propósito NO se expone nada de paleta/tipografía/layout acá — eso sigue
// siendo una solicitud a HarayaDev, no autoservicio (ver conversación
// 2026-10-05): un panel donde cualquiera cambia el color primario rompe la
// consistencia de marca que cuidamos en los pases de diseño anteriores.

// Home por secciones (ver lib/viewone-home-sections.ts). Lo guardado antes
// en `viewone_home_content` eran campos sueltos; si todavía no hay
// `secciones`, se arman desde esos campos (mezclados con los defaults) —
// el Home se ve igual hasta que alguien guarde desde el panel nuevo.
export interface HomeContent {
  secciones: HomeSeccion[];
}

const HOME_LEGACY_DEFAULT: HomeLegacy = {
  heroTitulo: "Impresión digital y soluciones gráficas para empresas",
  heroBajada:
    "Desarrollamos, producimos e instalamos soluciones gráficas para marcas, empresas y proyectos, desde impresión digital hasta implementaciones integrales.",
  heroFotoUrl: HOME_HERO_FOTO,
  nosotrosEyebrow: "Nosotros",
  nosotrosTitulo: "Experiencia que respalda cada proyecto",
  nosotrosTexto:
    "En ViewOne desarrollamos soluciones gráficas y publicitarias para empresas y marcas. Producimos e implementamos proyectos de impresión, fabricación e instalación, adaptándonos a los requerimientos de cada cliente y cada espacio.",
  nosotrosFotoUrl: HOME_NOSOTROS_FOTO,
  badges: ["Taller propio", "Producción integral", "Experiencia B2B"],
  proyectosDestacados: HOME_PROYECTOS_DESTACADOS,
  cierreTitulo: "Cuéntanos qué necesitas",
};

function homeDesdeGuardado(stored: (Partial<HomeLegacy> & { secciones?: unknown }) | undefined): HomeContent {
  const parsed = seccionesSchema.safeParse(stored?.secciones);
  if (parsed.success) return { secciones: parsed.data };
  return { secciones: seccionesDesdeLegacy({ ...HOME_LEGACY_DEFAULT, ...stored }) };
}

export async function getHomeContent(): Promise<HomeContent> {
  return withDb(
    async () => {
      const sql = db();
      const rows = await sql`SELECT value FROM settings WHERE key = 'viewone_home_content' LIMIT 1`;
      return homeDesdeGuardado(rows[0]?.value as Partial<HomeLegacy> | undefined);
    },
    () => homeDesdeGuardado(undefined)
  );
}

// Reemplaza la lista completa (el panel siempre manda todas las secciones,
// en su orden). Los campos sueltos viejos se descartan al primer guardado.
export async function setHomeSecciones(secciones: HomeSeccion[]): Promise<HomeContent> {
  const next: HomeContent = { secciones };
  return withDb(
    async () => {
      const sql = db();
      await sql`
        INSERT INTO settings (key, value) VALUES ('viewone_home_content', ${jsonb(next)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
      return next;
    },
    () => next
  );
}

// Guardado como { clientes: Cliente[] }; el formato anterior era
// { nombres: string[] } y se convierte al leer (logo desde el código).
const CLIENTES_TODOS: string[] = [...CLIENTES_TODOS_RO];

function clientesDesdeGuardado(stored: { clientes?: unknown; nombres?: string[] } | undefined): Cliente[] {
  const parsed = clientesSchema.safeParse(stored?.clientes);
  if (parsed.success) return parsed.data;
  return clientesDesdeNombres(stored?.nombres ?? CLIENTES_TODOS);
}

export async function getClientesContent(): Promise<Cliente[]> {
  return withDb(
    async () => {
      const sql = db();
      const rows = await sql`SELECT value FROM settings WHERE key = 'viewone_clientes' LIMIT 1`;
      return clientesDesdeGuardado(rows[0]?.value as { clientes?: unknown; nombres?: string[] } | undefined);
    },
    () => clientesDesdeGuardado(undefined)
  );
}

export async function setClientesContent(clientes: Cliente[]): Promise<Cliente[]> {
  return withDb(
    async () => {
      const sql = db();
      await sql`
        INSERT INTO settings (key, value) VALUES ('viewone_clientes', ${jsonb({ clientes })})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
      return clientes;
    },
    () => clientes
  );
}

export interface ContactoOverride {
  phone?: string;
  whatsapp?: string;
  whatsappPrefilledMessage?: string;
  email?: string;
  address?: string;
  mapQuery?: string;
  socials?: { platform: string; url: string }[];
}

// Base real desde client.config.ts (nunca inventada) + lo que el admin haya
// sobrescrito. Header/Footer siguen funcionando igual si nadie tocó nada acá.
export async function getContacto(): Promise<Required<ContactoOverride>> {
  const base = clientConfig.contact;
  return withDb(
    async () => {
      const sql = db();
      const rows = await sql`SELECT value FROM settings WHERE key = 'viewone_contacto_override' LIMIT 1`;
      const override = (rows[0]?.value as ContactoOverride | undefined) ?? {};
      return {
        phone: override.phone ?? base.phone ?? "",
        whatsapp: override.whatsapp ?? base.whatsapp ?? "",
        whatsappPrefilledMessage: override.whatsappPrefilledMessage ?? base.whatsappPrefilledMessage ?? "",
        email: override.email ?? base.email ?? "",
        address: override.address ?? base.address ?? "",
        mapQuery: override.mapQuery ?? base.mapQuery ?? "",
        socials: override.socials ?? base.socials ?? [],
      };
    },
    () => ({
      phone: base.phone ?? "",
      whatsapp: base.whatsapp ?? "",
      whatsappPrefilledMessage: base.whatsappPrefilledMessage ?? "",
      email: base.email ?? "",
      address: base.address ?? "",
      mapQuery: base.mapQuery ?? "",
      socials: base.socials ?? [],
    })
  );
}

export async function setContactoOverride(partial: ContactoOverride): Promise<void> {
  await withDb(
    async () => {
      const sql = db();
      const rows = await sql`SELECT value FROM settings WHERE key = 'viewone_contacto_override' LIMIT 1`;
      const current = (rows[0]?.value as ContactoOverride | undefined) ?? {};
      const next = { ...current, ...partial };
      await sql`
        INSERT INTO settings (key, value) VALUES ('viewone_contacto_override', ${jsonb(next)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    },
    () => undefined
  );
}

export interface Servicio {
  id: string;
  nombre: string;
  trabajo: string;
  textoCorto: string;
  textoCompleto: string;
  foto: string;
  cta: string;
  orden: number;
  visible: boolean;
}

function rowToServicio(r: Record<string, unknown>): Servicio {
  return {
    id: String(r.id),
    nombre: String(r.nombre),
    trabajo: String(r.trabajo),
    textoCorto: String(r.texto_corto),
    textoCompleto: String(r.texto_completo),
    foto: String(r.foto),
    cta: String(r.cta),
    orden: Number(r.orden),
    visible: Boolean(r.visible),
  };
}

async function seedServiciosIfEmpty(): Promise<void> {
  const sql = db();
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM viewone_servicios`;
  if (Number(count) > 0) return;
  let orden = 0;
  for (const s of SERVICIOS as ServicioSeed[]) {
    const id = slugifyServicio(s.nombre);
    await sql`
      INSERT INTO viewone_servicios (id, nombre, trabajo, texto_corto, texto_completo, foto, cta, orden)
      VALUES (${id}, ${s.nombre}, ${s.trabajo}, ${s.textoCorto}, ${s.textoCompleto}, ${s.foto}, ${s.cta}, ${orden})
      ON CONFLICT (id) DO NOTHING
    `;
    orden++;
  }
}

export async function listServicios(): Promise<Servicio[]> {
  return withDb(
    async () => {
      await seedServiciosIfEmpty();
      const sql = db();
      const rows = await sql`SELECT * FROM viewone_servicios ORDER BY orden ASC`;
      return rows.map((r) => rowToServicio(r as Record<string, unknown>));
    },
    () =>
      SERVICIOS.map((s, i) => ({
        id: slugifyServicio(s.nombre),
        nombre: s.nombre,
        trabajo: s.trabajo,
        textoCorto: s.textoCorto,
        textoCompleto: s.textoCompleto,
        foto: s.foto,
        cta: s.cta,
        orden: i,
        visible: true,
      }))
  );
}

export async function listServiciosVisibles(): Promise<Servicio[]> {
  return (await listServicios()).filter((s) => s.visible);
}

export async function upsertServicio(input: {
  id?: string;
  nombre: string;
  trabajo: string;
  textoCorto: string;
  textoCompleto: string;
  foto: string;
  cta: string;
}): Promise<Servicio> {
  const id = input.id ?? slugifyServicio(input.nombre);
  return withDb(
    async () => {
      const sql = db();
      const [{ count }] = await sql`SELECT count(*)::int AS count FROM viewone_servicios`;
      await sql`
        INSERT INTO viewone_servicios (id, nombre, trabajo, texto_corto, texto_completo, foto, cta, orden)
        VALUES (${id}, ${input.nombre}, ${input.trabajo}, ${input.textoCorto}, ${input.textoCompleto}, ${input.foto}, ${input.cta}, ${Number(count)})
        ON CONFLICT (id) DO UPDATE SET
          nombre = EXCLUDED.nombre, trabajo = EXCLUDED.trabajo, texto_corto = EXCLUDED.texto_corto,
          texto_completo = EXCLUDED.texto_completo, foto = EXCLUDED.foto, cta = EXCLUDED.cta
      `;
      const rows = await sql`SELECT * FROM viewone_servicios WHERE id = ${id}`;
      return rowToServicio(rows[0] as Record<string, unknown>);
    },
    () => ({ id, ...input, orden: 0, visible: true })
  );
}

export async function setServicioVisible(id: string, visible: boolean): Promise<void> {
  await withDb(
    async () => {
      const sql = db();
      await sql`UPDATE viewone_servicios SET visible = ${visible} WHERE id = ${id}`;
    },
    () => undefined
  );
}

export async function deleteServicio(id: string): Promise<void> {
  await withDb(
    async () => {
      const sql = db();
      await sql`DELETE FROM viewone_servicios WHERE id = ${id}`;
    },
    () => undefined
  );
}

// Usuarios admin con login propio (2026-10-05: "como superadmin poder
// agregar usuarios admin o algún tipo de rol diferente"). Reemplaza la
// dependencia exclusiva de clientConfig.admin.users (que sigue funcionando
// como respaldo de emergencia a nivel de código) por una lista editable
// desde /viewone-admin. Sembrada con el superadmin real para que el primer
// login con Google ya tenga a alguien autorizado sin tocar código.
export type AdminRole = "admin" | "staff";
export interface AdminUser {
  email: string;
  role: AdminRole;
  hasPassword?: boolean;
  // true = puede crear su contraseña en el próximo acceso (invitación nueva
  // o contraseña restablecida por un admin).
  invitePending?: boolean;
}

const SUPERADMIN_SEED: AdminUser = { email: "hector.tazdevil@gmail.com", role: "admin" };

// Usuarios del equipo de ViewOne pedidos explícitamente (2026-10-20), con
// acceso por correo + contraseña creada en su primer ingreso. Se insertan UNA
// sola vez (marca en `settings`): si después alguien los quita desde el
// panel, no reaparecen solos en el próximo request.
const INVITES_2026_10_20: AdminUser[] = [
  { email: "constanza@viewone.cl", role: "admin" },
  { email: "mgl@viewone.cl", role: "admin" },
];
const INVITES_FLAG = "viewone_admin_invites_2026_10_20";
// Producción ya sembró las 2 invitaciones como staff; después se pidió que
// fueran admin. Se promueven UNA vez (con su propia marca) para que, si
// luego alguien les cambia el rol desde el panel, no se pise en cada request.
const PROMOTE_FLAG = "viewone_admin_promote_2026_10_20";

async function seedAdminUsersIfEmpty(): Promise<void> {
  const sql = db();
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM viewone_admin_users`;
  if (Number(count) === 0) {
    await sql`
      INSERT INTO viewone_admin_users (email, role) VALUES (${SUPERADMIN_SEED.email}, ${SUPERADMIN_SEED.role})
      ON CONFLICT (email) DO NOTHING
    `;
  }
  const flag = await sql`SELECT 1 FROM settings WHERE key = ${INVITES_FLAG} LIMIT 1`;
  if (flag.length === 0) {
    for (const u of INVITES_2026_10_20) {
      await sql`
        INSERT INTO viewone_admin_users (email, role, invite_pending) VALUES (${u.email}, ${u.role}, true)
        ON CONFLICT (email) DO NOTHING
      `;
    }
    await sql`INSERT INTO settings (key, value) VALUES (${INVITES_FLAG}, ${jsonb({ done: true })}) ON CONFLICT (key) DO NOTHING`;
  }
  const promoted = await sql`SELECT 1 FROM settings WHERE key = ${PROMOTE_FLAG} LIMIT 1`;
  if (promoted.length === 0) {
    for (const u of INVITES_2026_10_20) {
      await sql`UPDATE viewone_admin_users SET role = 'admin' WHERE email = ${u.email}`;
    }
    await sql`INSERT INTO settings (key, value) VALUES (${PROMOTE_FLAG}, ${jsonb({ done: true })}) ON CONFLICT (key) DO NOTHING`;
  }
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  return withDb(
    async () => {
      await seedAdminUsersIfEmpty();
      const sql = db();
      const rows = await sql`
        SELECT email, role, (password_hash IS NOT NULL) AS has_password, invite_pending
        FROM viewone_admin_users ORDER BY created_at ASC
      `;
      return rows.map((r) => ({
        email: String(r.email),
        role: r.role as AdminRole,
        hasPassword: Boolean(r.has_password),
        invitePending: Boolean(r.invite_pending),
      }));
    },
    () => [SUPERADMIN_SEED]
  );
}

export async function addAdminUser(email: string, role: AdminRole): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await withDb(
    async () => {
      const sql = db();
      await sql`
        INSERT INTO viewone_admin_users (email, role, invite_pending) VALUES (${normalized}, ${role}, true)
        ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
      `;
    },
    () => undefined
  );
}

// No deja sacar al último admin — evitaría que cualquiera pueda volver a
// entrar al panel con un rol que administre usuarios.
export async function removeAdminUser(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  return withDb(
    async () => {
      const sql = db();
      const [{ count }] = await sql`SELECT count(*)::int AS count FROM viewone_admin_users WHERE role = 'admin'`;
      const [target] = await sql`SELECT role FROM viewone_admin_users WHERE email = ${normalized}`;
      if (target?.role === "admin" && Number(count) <= 1) {
        return { ok: false, error: "No puedes eliminar al único administrador." };
      }
      await sql`DELETE FROM viewone_admin_users WHERE email = ${normalized}`;
      return { ok: true };
    },
    () => ({ ok: false, error: "Sin base de datos disponible." })
  );
}

// --- Login con correo + contraseña (ver app/api/auth/password/route.ts) ---

// null = el correo no está autorizado. `canSetup` = tiene una invitación
// pendiente y puede crear su contraseña ahora.
export async function getAdminPasswordHash(
  email: string
): Promise<{ hash: string | null; canSetup: boolean } | null> {
  const normalized = email.trim().toLowerCase();
  return withDb(
    async () => {
      await seedAdminUsersIfEmpty();
      const sql = db();
      const [row] = await sql`SELECT password_hash, invite_pending FROM viewone_admin_users WHERE email = ${normalized}`;
      if (!row) return null;
      const hash = (row.password_hash as string | null) ?? null;
      return { hash, canSetup: Boolean(row.invite_pending) && hash === null };
    },
    () => null
  );
}

// Solo fija la contraseña si hay invitación pendiente y todavía no tiene
// una (UPDATE condicional, atómico): un segundo "primer acceso" no puede
// pisar una contraseña ya creada, y una cuenta sin invitación no se puede
// "reclamar".
export async function setInitialAdminPassword(email: string, hash: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  return withDb(
    async () => {
      const sql = db();
      const rows = await sql`
        UPDATE viewone_admin_users SET password_hash = ${hash}, invite_pending = false
        WHERE email = ${normalized} AND password_hash IS NULL AND invite_pending = true
        RETURNING email
      `;
      return rows.length > 0;
    },
    () => false
  );
}

// Vuelve la cuenta a "primer acceso": la persona crea una contraseña nueva
// la próxima vez que entre (también sirve para habilitar contraseña a alguien
// que hasta ahora solo entraba con Google). Solo admin (ver
// ADMIN_ONLY_ACTIONS en la ruta).
export async function resetAdminPassword(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await withDb(
    async () => {
      const sql = db();
      await sql`UPDATE viewone_admin_users SET password_hash = NULL, invite_pending = true WHERE email = ${normalized}`;
    },
    () => undefined
  );
}
