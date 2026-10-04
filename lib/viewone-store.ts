import { db, withDb } from "@/lib/db";
import { CATEGORIAS_ORDEN, PROYECTOS, type Proyecto as ProyectoSeed } from "@/lib/viewone-data";
import { slugifyServicio as slugify } from "@/lib/viewone-slug";

// Catálogo autoadministrable de ViewOne (handoff → "CMS/autogestión"): un
// proyecto puede estar en más de una categoría. Con DATABASE_URL persiste en
// Postgres; sin ella (o si la consulta falla) cae a la data real estática de
// lib/viewone-data.ts — nunca un catálogo vacío ni inventado.

export interface Categoria {
  id: string;
  nombre: string;
  imagen: string | null;
  orden: number;
  visible: boolean;
}

export interface Proyecto {
  id: string;
  cliente: string;
  trabajo: string;
  categorias: string[];
  portada: string;
  galeria: string[];
  material: string | null;
  aplicacion: string | null;
  orden: number;
  visible: boolean;
  whatsappMensaje: string | null;
}

function rowToCategoria(r: Record<string, unknown>): Categoria {
  return {
    id: String(r.id),
    nombre: String(r.nombre),
    imagen: (r.imagen as string | null) ?? null,
    orden: Number(r.orden),
    visible: Boolean(r.visible),
  };
}

function rowToProyecto(r: Record<string, unknown>): Proyecto {
  return {
    id: String(r.id),
    cliente: String(r.cliente),
    trabajo: String(r.trabajo),
    categorias: (r.categorias as string[]) ?? [],
    portada: String(r.portada),
    galeria: (r.galeria as string[]) ?? [],
    material: (r.material as string | null) ?? null,
    aplicacion: (r.aplicacion as string | null) ?? null,
    orden: Number(r.orden),
    visible: Boolean(r.visible),
    whatsappMensaje: (r.whatsapp_mensaje as string | null) ?? null,
  };
}

// --- Seed: primera vez que hay DB real, carga el catálogo aprobado del
// handoff (lib/viewone-data.ts) en vez de partir vacío. Solo inserta si la
// tabla está realmente vacía — nunca pisa ediciones que ya haya hecho ViewOne.
async function seedIfEmpty(): Promise<void> {
  const sql = db();
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM viewone_proyectos`;
  if (Number(count) > 0) return;

  for (let i = 0; i < CATEGORIAS_ORDEN.length; i++) {
    const nombre = CATEGORIAS_ORDEN[i];
    await sql`
      INSERT INTO viewone_categorias (id, nombre, orden)
      VALUES (${slugify(nombre)}, ${nombre}, ${i})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  let orden = 0;
  for (const p of PROYECTOS as ProyectoSeed[]) {
    const id = `${slugify(p.cliente)}-${slugify(p.trabajo)}`;
    await sql`
      INSERT INTO viewone_proyectos (id, cliente, trabajo, categorias, portada, galeria, material, aplicacion, orden)
      VALUES (${id}, ${p.cliente}, ${p.trabajo}, ${[p.categoria]}, ${p.foto}, ${p.galeria}, ${p.material ?? null}, ${p.aplicacion ?? null}, ${orden})
      ON CONFLICT (id) DO NOTHING
    `;
    orden++;
  }
}

export async function listCategorias(): Promise<Categoria[]> {
  return withDb(
    async () => {
      await seedIfEmpty();
      const sql = db();
      const rows = await sql`SELECT * FROM viewone_categorias ORDER BY orden ASC`;
      return rows.map((r) => rowToCategoria(r as Record<string, unknown>));
    },
    () => CATEGORIAS_ORDEN.map((nombre, i) => ({ id: slugify(nombre), nombre, imagen: null, orden: i, visible: true }))
  );
}

export async function listProyectos(): Promise<Proyecto[]> {
  return withDb(
    async () => {
      await seedIfEmpty();
      const sql = db();
      const rows = await sql`SELECT * FROM viewone_proyectos ORDER BY orden ASC`;
      return rows.map((r) => rowToProyecto(r as Record<string, unknown>));
    },
    () =>
      PROYECTOS.map((p, i) => ({
        id: `${slugify(p.cliente)}-${slugify(p.trabajo)}`,
        cliente: p.cliente,
        trabajo: p.trabajo,
        categorias: [p.categoria],
        portada: p.foto,
        galeria: p.galeria,
        material: p.material ?? null,
        aplicacion: p.aplicacion ?? null,
        orden: i,
        visible: true,
        whatsappMensaje: null,
      }))
  );
}

// Para las páginas públicas: solo lo visible, ya resuelto.
export async function listProyectosVisibles(): Promise<Proyecto[]> {
  return (await listProyectos()).filter((p) => p.visible);
}

export async function listCategoriasVisibles(): Promise<Categoria[]> {
  return (await listCategorias()).filter((c) => c.visible);
}

export async function upsertCategoria(input: { id?: string; nombre: string; imagen?: string | null }): Promise<Categoria> {
  const id = input.id ?? slugify(input.nombre);
  return withDb(
    async () => {
      const sql = db();
      const [{ count }] = await sql`SELECT count(*)::int AS count FROM viewone_categorias`;
      await sql`
        INSERT INTO viewone_categorias (id, nombre, imagen, orden)
        VALUES (${id}, ${input.nombre}, ${input.imagen ?? null}, ${Number(count)})
        ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, imagen = COALESCE(EXCLUDED.imagen, viewone_categorias.imagen)
      `;
      const rows = await sql`SELECT * FROM viewone_categorias WHERE id = ${id}`;
      return rowToCategoria(rows[0] as Record<string, unknown>);
    },
    () => ({ id, nombre: input.nombre, imagen: input.imagen ?? null, orden: 0, visible: true })
  );
}

export async function setCategoriaVisible(id: string, visible: boolean): Promise<void> {
  await withDb(
    async () => {
      const sql = db();
      await sql`UPDATE viewone_categorias SET visible = ${visible} WHERE id = ${id}`;
    },
    () => undefined
  );
}

export async function deleteCategoria(id: string): Promise<void> {
  await withDb(
    async () => {
      const sql = db();
      await sql`DELETE FROM viewone_categorias WHERE id = ${id}`;
    },
    () => undefined
  );
}

export async function upsertProyecto(input: {
  id?: string;
  cliente: string;
  trabajo: string;
  categorias: string[];
  portada: string;
  galeria?: string[];
  material?: string | null;
  aplicacion?: string | null;
  whatsappMensaje?: string | null;
}): Promise<Proyecto> {
  const id = input.id ?? `${slugify(input.cliente)}-${slugify(input.trabajo)}`;
  return withDb(
    async () => {
      const sql = db();
      const [{ count }] = await sql`SELECT count(*)::int AS count FROM viewone_proyectos`;
      await sql`
        INSERT INTO viewone_proyectos (id, cliente, trabajo, categorias, portada, galeria, material, aplicacion, whatsapp_mensaje, orden)
        VALUES (
          ${id}, ${input.cliente}, ${input.trabajo}, ${input.categorias}, ${input.portada},
          ${input.galeria ?? []}, ${input.material ?? null}, ${input.aplicacion ?? null}, ${input.whatsappMensaje ?? null},
          ${Number(count)}
        )
        ON CONFLICT (id) DO UPDATE SET
          cliente = EXCLUDED.cliente, trabajo = EXCLUDED.trabajo, categorias = EXCLUDED.categorias,
          portada = EXCLUDED.portada, galeria = EXCLUDED.galeria, material = EXCLUDED.material,
          aplicacion = EXCLUDED.aplicacion, whatsapp_mensaje = EXCLUDED.whatsapp_mensaje
      `;
      const rows = await sql`SELECT * FROM viewone_proyectos WHERE id = ${id}`;
      return rowToProyecto(rows[0] as Record<string, unknown>);
    },
    () => ({
      id,
      cliente: input.cliente,
      trabajo: input.trabajo,
      categorias: input.categorias,
      portada: input.portada,
      galeria: input.galeria ?? [],
      material: input.material ?? null,
      aplicacion: input.aplicacion ?? null,
      orden: 0,
      visible: true,
      whatsappMensaje: input.whatsappMensaje ?? null,
    })
  );
}

export async function setProyectoVisible(id: string, visible: boolean): Promise<void> {
  await withDb(
    async () => {
      const sql = db();
      await sql`UPDATE viewone_proyectos SET visible = ${visible} WHERE id = ${id}`;
    },
    () => undefined
  );
}

export async function deleteProyecto(id: string): Promise<void> {
  await withDb(
    async () => {
      const sql = db();
      await sql`DELETE FROM viewone_proyectos WHERE id = ${id}`;
    },
    () => undefined
  );
}
