"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Categoria, Proyecto } from "@/lib/viewone-store";
import type { HomeContent, Servicio } from "@/lib/viewone-content-store";

type Contacto = {
  phone?: string;
  whatsapp?: string;
  whatsappPrefilledMessage?: string;
  email?: string;
  address?: string;
  mapQuery?: string;
  socials?: { platform: string; url: string }[];
};

type Data = {
  categorias: Categoria[];
  proyectos: Proyecto[];
  homeContent: HomeContent;
  clientes: string[];
  contacto: Contacto;
  servicios: Servicio[];
};

// Sesión por clave compartida (sin cookie, ej. abriendo /viewone-admin?clave=…
// directo en el celular en vez de pasar por el formulario de login): el SSR
// de page.tsx autoriza esa carga de página, pero un fetch del cliente a
// /api/* no lleva ni cookie ni ?clave=, así que caía en 401 ("No se pudo
// cargar el catálogo"). Mismo arreglo que ya usa AdminAgenda: el server le
// pasa la clave real solo cuando la sesión actual YA es por clave (nunca a
// una sesión de Google), y el cliente la reenvía en el header x-viewone-key
// en cada request — variable de módulo porque solo existe una instancia de
// este panel a la vez, evita hilar el prop por cada sub-formulario.
let sessionAdminKey: string | undefined;

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  return { ...extra, ...(sessionAdminKey ? { "x-viewone-key": sessionAdminKey } : {}) };
}

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.set("file", file);
  const res = await fetch("/api/viewone-admin/upload", { method: "POST", headers: authHeaders(), body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) throw new Error(data?.error ?? "No se pudo subir la imagen.");
  return data.url as string;
}

export function AdminViewOne({ adminKey }: { adminKey?: string } = {}) {
  sessionAdminKey = adminKey;
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const res = await fetch("/api/viewone-admin", { headers: authHeaders() });
    if (!res.ok) {
      setError("No se pudo cargar el catálogo.");
      return;
    }
    setData(await res.json());
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  if (error) return <p className="text-sm font-semibold text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-foreground/60">Cargando…</p>;

  return (
    <div className="flex flex-col gap-10">
      <HomeContentSection content={data.homeContent} onChange={reload} />
      <ServiciosSection servicios={data.servicios} onChange={reload} />
      <CategoriasSection categorias={data.categorias} onChange={reload} />
      <ProyectosSection categorias={data.categorias} proyectos={data.proyectos} onChange={reload} />
      <ClientesSection clientes={data.clientes} onChange={reload} />
      <ContactoSection contacto={data.contacto} onChange={reload} />
    </div>
  );
}

const inputClass =
  "rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
const labelClass = "text-xs font-bold uppercase tracking-wide text-foreground/50";

async function patch(body: unknown) {
  const res = await fetch("/api/viewone-admin", {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "No se pudo guardar.");
  return data;
}

function CategoriasSection({ categorias, onChange }: { categorias: Categoria[]; onChange: () => void }) {
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      await patch({ action: "upsertCategoria", nombre: nombre.trim() });
      setNombre("");
      onChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">Categorías</h2>
      <div className="mt-4 flex flex-col gap-2">
        {categorias.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-4 py-3">
            <span className="text-sm font-medium text-foreground">{c.nombre}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-foreground/60">
                <input
                  type="checkbox"
                  checked={c.visible}
                  onChange={async (e) => {
                    await patch({ action: "setCategoriaVisible", id: c.id, visible: e.target.checked });
                    onChange();
                  }}
                />
                Visible
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-red-600 hover:underline"
                onClick={async () => {
                  if (!confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
                  await patch({ action: "deleteCategoria", id: c.id });
                  onChange();
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={crear} className="mt-4 flex gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la nueva categoría"
          className="min-w-0 flex-1 rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={saving || !nombre.trim()}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Agregar
        </button>
      </form>
    </section>
  );
}

function ProyectoForm({
  categorias,
  proyecto,
  onSaved,
  onCancel,
}: {
  categorias: Categoria[];
  proyecto?: Proyecto;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [cliente, setCliente] = useState(proyecto?.cliente ?? "");
  const [trabajo, setTrabajo] = useState(proyecto?.trabajo ?? "");
  const [cats, setCats] = useState<string[]>(proyecto?.categorias ?? []);
  const [portada, setPortada] = useState(proyecto?.portada ?? "");
  const [galeria, setGaleria] = useState<string[]>(proyecto?.galeria ?? []);
  const [material, setMaterial] = useState(proyecto?.material ?? "");
  const [aplicacion, setAplicacion] = useState(proyecto?.aplicacion ?? "");
  const [whatsappMensaje, setWhatsappMensaje] = useState(proyecto?.whatsappMensaje ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const portadaInput = useRef<HTMLInputElement>(null);
  const galeriaInput = useRef<HTMLInputElement>(null);

  async function handlePortada(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setPortada(await uploadFile(file));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function handleGaleria(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setGaleria((g) => [...g, ...urls]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cliente.trim() || !trabajo.trim() || !portada || !cats.length) {
      alert("Cliente, trabajo, al menos una categoría y la foto de portada son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await patch({
        action: "upsertProyecto",
        id: proyecto?.id,
        cliente: cliente.trim(),
        trabajo: trabajo.trim(),
        categorias: cats,
        portada,
        galeria,
        material: material.trim() || null,
        aplicacion: aplicacion.trim() || null,
        whatsappMensaje: whatsappMensaje.trim() || null,
      });
      onSaved();
      if (!proyecto) {
        setCliente("");
        setTrabajo("");
        setCats([]);
        setPortada("");
        setGaleria([]);
        setMaterial("");
        setAplicacion("");
        setWhatsappMensaje("");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-foreground/10 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Cliente"
          className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <input
          value={trabajo}
          onChange={(e) => setTrabajo(e.target.value)}
          placeholder="Trabajo realizado"
          className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {categorias.map((c) => (
          <label key={c.id} className="flex items-center gap-1.5 text-xs text-foreground/70">
            <input
              type="checkbox"
              checked={cats.includes(c.nombre)}
              onChange={(e) =>
                setCats((prev) => (e.target.checked ? [...prev, c.nombre] : prev.filter((n) => n !== c.nombre)))
              }
            />
            {c.nombre}
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => portadaInput.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-foreground/20 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary disabled:opacity-50"
          >
            {portada ? "Cambiar portada" : "Subir portada"}
          </button>
          {portada && <Image src={portada} alt="Portada" width={64} height={48} className="rounded object-cover" />}
          <input ref={portadaInput} type="file" accept="image/*" className="hidden" onChange={handlePortada} />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => galeriaInput.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-foreground/20 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary disabled:opacity-50"
          >
            Agregar a galería
          </button>
          <input ref={galeriaInput} type="file" accept="image/*" multiple className="hidden" onChange={handleGaleria} />
          <div className="flex gap-1">
            {galeria.map((url, i) => (
              <div key={url} className="relative">
                <Image src={url} alt="" width={48} height={36} className="rounded object-cover" />
                <button
                  type="button"
                  onClick={() => setGaleria((g) => g.filter((_, idx) => idx !== i))}
                  className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1 text-[10px] text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          placeholder="Material (opcional)"
          className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <input
          value={aplicacion}
          onChange={(e) => setAplicacion(e.target.value)}
          placeholder="Aplicación (opcional)"
          className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
      </div>
      <input
        value={whatsappMensaje}
        onChange={(e) => setWhatsappMensaje(e.target.value)}
        placeholder="Mensaje de WhatsApp para 'Quiero algo similar' (opcional)"
        className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {proyecto ? "Guardar cambios" : "Agregar proyecto"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-xs font-semibold text-foreground/60 hover:underline">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function ProyectosSection({
  categorias,
  proyectos,
  onChange,
}: {
  categorias: Categoria[];
  proyectos: Proyecto[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">Proyectos</h2>
      <div className="mt-4 flex flex-col gap-3">
        {proyectos.map((p) =>
          editing === p.id ? (
            <ProyectoForm
              key={p.id}
              categorias={categorias}
              proyecto={p}
              onSaved={() => {
                setEditing(null);
                onChange();
              }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <Image src={p.portada} alt="" width={56} height={42} className="rounded object-cover" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {p.cliente} — {p.trabajo}
                  </p>
                  <p className="text-xs text-foreground/50">{p.categorias.join(", ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-foreground/60">
                  <input
                    type="checkbox"
                    checked={p.visible}
                    onChange={async (e) => {
                      await patch({ action: "setProyectoVisible", id: p.id, visible: e.target.checked });
                      onChange();
                    }}
                  />
                  Visible
                </label>
                <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => setEditing(p.id)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-red-600 hover:underline"
                  onClick={async () => {
                    if (!confirm(`¿Eliminar "${p.cliente} — ${p.trabajo}"?`)) return;
                    await patch({ action: "deleteProyecto", id: p.id });
                    onChange();
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground">Agregar proyecto</h3>
        <div className="mt-2">
          <ProyectoForm categorias={categorias} onSaved={onChange} />
        </div>
      </div>
    </section>
  );
}

function ImagePicker({
  url,
  onUploaded,
  label,
}: {
  url: string;
  onUploaded: (url: string) => void;
  label: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onUploaded(await uploadFile(file));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg border border-foreground/20 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary disabled:opacity-50"
      >
        {uploading ? "Subiendo…" : url ? `Cambiar ${label}` : `Subir ${label}`}
      </button>
      {url && <Image src={url} alt={label} width={64} height={48} className="rounded object-cover" />}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
}

function HomeContentSection({ content, onChange }: { content: HomeContent; onChange: () => void }) {
  const [form, setForm] = useState(content);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(content), [content]);

  function updateDestacado(i: number, patchPart: Partial<{ nombre: string; foto: string }>) {
    setForm((f) => ({
      ...f,
      proyectosDestacados: f.proyectosDestacados.map((p, idx) => (idx === i ? { ...p, ...patchPart } : p)),
    }));
  }

  async function guardar() {
    setSaving(true);
    try {
      await patch({ action: "setHomeContent", ...form });
      onChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">Contenido del Home</h2>
      <div className="mt-4 flex flex-col gap-5 rounded-xl border border-foreground/10 p-4">
        <div>
          <p className={labelClass}>Titular del hero</p>
          <input
            value={form.heroTitulo}
            onChange={(e) => setForm((f) => ({ ...f, heroTitulo: e.target.value }))}
            className={`mt-1 w-full ${inputClass}`}
          />
        </div>
        <div>
          <p className={labelClass}>Bajada del hero</p>
          <textarea
            value={form.heroBajada}
            onChange={(e) => setForm((f) => ({ ...f, heroBajada: e.target.value }))}
            rows={3}
            className={`mt-1 w-full ${inputClass}`}
          />
        </div>
        <div>
          <p className={labelClass}>Foto del hero</p>
          <div className="mt-1">
            <ImagePicker url={form.heroFotoUrl} label="foto" onUploaded={(url) => setForm((f) => ({ ...f, heroFotoUrl: url }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-foreground/10 pt-5 sm:grid-cols-2">
          <div>
            <p className={labelClass}>Etiqueta "Nosotros"</p>
            <input
              value={form.nosotrosEyebrow}
              onChange={(e) => setForm((f) => ({ ...f, nosotrosEyebrow: e.target.value }))}
              className={`mt-1 w-full ${inputClass}`}
            />
          </div>
          <div>
            <p className={labelClass}>Título "Nosotros"</p>
            <input
              value={form.nosotrosTitulo}
              onChange={(e) => setForm((f) => ({ ...f, nosotrosTitulo: e.target.value }))}
              className={`mt-1 w-full ${inputClass}`}
            />
          </div>
        </div>
        <div>
          <p className={labelClass}>Texto "Nosotros"</p>
          <textarea
            value={form.nosotrosTexto}
            onChange={(e) => setForm((f) => ({ ...f, nosotrosTexto: e.target.value }))}
            rows={3}
            className={`mt-1 w-full ${inputClass}`}
          />
        </div>
        <div>
          <p className={labelClass}>Foto "Nosotros"</p>
          <div className="mt-1">
            <ImagePicker
              url={form.nosotrosFotoUrl}
              label="foto"
              onUploaded={(url) => setForm((f) => ({ ...f, nosotrosFotoUrl: url }))}
            />
          </div>
        </div>
        <div>
          <p className={labelClass}>Badges (uno por línea)</p>
          <textarea
            value={form.badges.join("\n")}
            onChange={(e) => setForm((f) => ({ ...f, badges: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }))}
            rows={3}
            className={`mt-1 w-full ${inputClass}`}
          />
        </div>

        <div className="border-t border-foreground/10 pt-5">
          <p className={labelClass}>Proyectos destacados (Home)</p>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {form.proyectosDestacados.map((p, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-foreground/10 p-2">
                <input
                  value={p.nombre}
                  onChange={(e) => updateDestacado(i, { nombre: e.target.value })}
                  placeholder="Nombre"
                  className={`min-w-0 flex-1 ${inputClass}`}
                />
                <ImagePicker url={p.foto} label="foto" onUploaded={(url) => updateDestacado(i, { foto: url })} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className={labelClass}>Título del cierre</p>
          <input
            value={form.cierreTitulo}
            onChange={(e) => setForm((f) => ({ ...f, cierreTitulo: e.target.value }))}
            className={`mt-1 w-full ${inputClass}`}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={guardar}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ServicioForm({
  servicio,
  onSaved,
  onCancel,
}: {
  servicio?: Servicio;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [nombre, setNombre] = useState(servicio?.nombre ?? "");
  const [trabajo, setTrabajo] = useState(servicio?.trabajo ?? "");
  const [textoCorto, setTextoCorto] = useState(servicio?.textoCorto ?? "");
  const [textoCompleto, setTextoCompleto] = useState(servicio?.textoCompleto ?? "");
  const [foto, setFoto] = useState(servicio?.foto ?? "");
  const [cta, setCta] = useState(servicio?.cta ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !trabajo.trim() || !textoCorto.trim() || !textoCompleto.trim() || !foto || !cta.trim()) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    setSaving(true);
    try {
      await patch({
        action: "upsertServicio",
        id: servicio?.id,
        nombre: nombre.trim(),
        trabajo: trabajo.trim(),
        textoCorto: textoCorto.trim(),
        textoCompleto: textoCompleto.trim(),
        foto,
        cta: cta.trim(),
      });
      onSaved();
      if (!servicio) {
        setNombre("");
        setTrabajo("");
        setTextoCorto("");
        setTextoCompleto("");
        setFoto("");
        setCta("");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-foreground/10 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del servicio" className={inputClass} />
        <input value={trabajo} onChange={(e) => setTrabajo(e.target.value)} placeholder="Trabajo de referencia (ej. Cliente - Trabajo)" className={inputClass} />
      </div>
      <textarea value={textoCorto} onChange={(e) => setTextoCorto(e.target.value)} placeholder="Texto corto (tarjeta resumida en Home)" rows={2} className={inputClass} />
      <textarea value={textoCompleto} onChange={(e) => setTextoCompleto(e.target.value)} placeholder="Texto completo (página /servicios)" rows={3} className={inputClass} />
      <div className="flex items-center gap-3">
        <ImagePicker url={foto} label="foto" onUploaded={setFoto} />
      </div>
      <input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Texto del botón (ej. Cotizar impresión)" className={inputClass} />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {servicio ? "Guardar cambios" : "Agregar servicio"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-xs font-semibold text-foreground/60 hover:underline">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function ServiciosSection({ servicios, onChange }: { servicios: Servicio[]; onChange: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">Servicios</h2>
      <div className="mt-4 flex flex-col gap-3">
        {servicios.map((s) =>
          editing === s.id ? (
            <ServicioForm
              key={s.id}
              servicio={s}
              onSaved={() => {
                setEditing(null);
                onChange();
              }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <Image src={s.foto} alt="" width={56} height={42} className="rounded object-cover" />
                <p className="text-sm font-semibold text-foreground">{s.nombre}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-foreground/60">
                  <input
                    type="checkbox"
                    checked={s.visible}
                    onChange={async (e) => {
                      await patch({ action: "setServicioVisible", id: s.id, visible: e.target.checked });
                      onChange();
                    }}
                  />
                  Visible
                </label>
                <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => setEditing(s.id)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-red-600 hover:underline"
                  onClick={async () => {
                    if (!confirm(`¿Eliminar "${s.nombre}"?`)) return;
                    await patch({ action: "deleteServicio", id: s.id });
                    onChange();
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          )
        )}
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-foreground">Agregar servicio</h3>
        <div className="mt-2">
          <ServicioForm onSaved={onChange} />
        </div>
      </div>
    </section>
  );
}

function ClientesSection({ clientes, onChange }: { clientes: string[]; onChange: () => void }) {
  const [text, setText] = useState(clientes.join("\n"));
  const [saving, setSaving] = useState(false);

  useEffect(() => setText(clientes.join("\n")), [clientes]);

  async function guardar() {
    const nombres = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setSaving(true);
    try {
      await patch({ action: "setClientesContent", nombres });
      onChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">Clientes</h2>
      <p className="mt-1 text-xs text-foreground/50">Un nombre por línea. Se muestran en el Home, en el orden que los escribas.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className={`mt-3 w-full ${inputClass}`} />
      <button
        type="button"
        onClick={guardar}
        disabled={saving}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </section>
  );
}

const SOCIAL_PLATFORMS = ["instagram", "facebook", "linkedin"] as const;

function ContactoSection({ contacto, onChange }: { contacto: Contacto; onChange: () => void }) {
  const [form, setForm] = useState(contacto);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(contacto), [contacto]);

  function socialUrl(platform: string) {
    return form.socials?.find((s) => s.platform === platform)?.url ?? "";
  }

  function setSocialUrl(platform: string, url: string) {
    setForm((f) => {
      const rest = (f.socials ?? []).filter((s) => s.platform !== platform);
      return { ...f, socials: url ? [...rest, { platform, url }] : rest };
    });
  }

  async function guardar() {
    setSaving(true);
    try {
      await patch({ action: "setContactoOverride", ...form });
      onChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">Contacto</h2>
      <div className="mt-4 flex flex-col gap-4 rounded-xl border border-foreground/10 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className={labelClass}>Teléfono (mostrado en el sitio)</p>
            <input value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={`mt-1 w-full ${inputClass}`} />
          </div>
          <div>
            <p className={labelClass}>WhatsApp (solo números, con código de país)</p>
            <input value={form.whatsapp ?? ""} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} className={`mt-1 w-full ${inputClass}`} />
          </div>
        </div>
        <div>
          <p className={labelClass}>Mensaje precargado de WhatsApp</p>
          <input
            value={form.whatsappPrefilledMessage ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, whatsappPrefilledMessage: e.target.value }))}
            className={`mt-1 w-full ${inputClass}`}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className={labelClass}>Correo de ventas (recibe las cotizaciones)</p>
            <input value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={`mt-1 w-full ${inputClass}`} />
          </div>
          <div>
            <p className={labelClass}>Dirección</p>
            <input value={form.address ?? ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={`mt-1 w-full ${inputClass}`} />
          </div>
        </div>
        <div className="border-t border-foreground/10 pt-4">
          <p className={labelClass}>Redes sociales</p>
          <div className="mt-2 flex flex-col gap-2">
            {SOCIAL_PLATFORMS.map((platform) => (
              <div key={platform} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs capitalize text-foreground/60">{platform}</span>
                <input
                  value={socialUrl(platform)}
                  onChange={(e) => setSocialUrl(platform, e.target.value)}
                  placeholder={`https://${platform}.com/...`}
                  className={`min-w-0 flex-1 ${inputClass}`}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={guardar}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </section>
  );
}
