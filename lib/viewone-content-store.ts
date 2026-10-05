import { db, withDb, jsonb } from "@/lib/db";
import { clientConfig } from "@/config/client.config";
import {
  SERVICIOS,
  HOME_PROYECTOS_DESTACADOS,
  HOME_HERO_FOTO,
  HOME_NOSOTROS_FOTO,
  CLIENTES_TODOS,
  type Servicio as ServicioSeed,
} from "@/lib/viewone-data";
import { slugifyServicio } from "@/lib/viewone-slug";

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

export interface HomeContent {
  heroTitulo: string;
  heroBajada: string;
  heroFotoUrl: string;
  nosotrosEyebrow: string;
  nosotrosTitulo: string;
  nosotrosTexto: string;
  nosotrosFotoUrl: string;
  badges: string[];
  proyectosDestacados: { nombre: string; foto: string }[];
  cierreTitulo: string;
}

const HOME_CONTENT_DEFAULT: HomeContent = {
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

export async function getHomeContent(): Promise<HomeContent> {
  return withDb(
    async () => {
      const sql = db();
      const rows = await sql`SELECT value FROM settings WHERE key = 'viewone_home_content' LIMIT 1`;
      const stored = rows[0]?.value as Partial<HomeContent> | undefined;
      return { ...HOME_CONTENT_DEFAULT, ...stored };
    },
    () => HOME_CONTENT_DEFAULT
  );
}

export async function setHomeContent(partial: Partial<HomeContent>): Promise<HomeContent> {
  return withDb(
    async () => {
      const sql = db();
      const current = await getHomeContent();
      const next = { ...current, ...partial };
      await sql`
        INSERT INTO settings (key, value) VALUES ('viewone_home_content', ${jsonb(next)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
      return next;
    },
    () => ({ ...HOME_CONTENT_DEFAULT, ...partial })
  );
}

export async function getClientesContent(): Promise<string[]> {
  return withDb(
    async () => {
      const sql = db();
      const rows = await sql`SELECT value FROM settings WHERE key = 'viewone_clientes' LIMIT 1`;
      const stored = rows[0]?.value as { nombres?: string[] } | undefined;
      return stored?.nombres ?? CLIENTES_TODOS;
    },
    () => CLIENTES_TODOS
  );
}

export async function setClientesContent(nombres: string[]): Promise<string[]> {
  return withDb(
    async () => {
      const sql = db();
      await sql`
        INSERT INTO settings (key, value) VALUES ('viewone_clientes', ${jsonb({ nombres })})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
      return nombres;
    },
    () => nombres
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
