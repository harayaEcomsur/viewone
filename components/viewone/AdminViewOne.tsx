"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Categoria, Proyecto } from "@/lib/viewone-store";

type Data = { categorias: Categoria[]; proyectos: Proyecto[] };

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.set("file", file);
  const res = await fetch("/api/viewone-admin/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) throw new Error(data?.error ?? "No se pudo subir la imagen.");
  return data.url as string;
}

export function AdminViewOne() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const res = await fetch("/api/viewone-admin");
    if (!res.ok) {
      setError("No se pudo cargar el catálogo.");
      return;
    }
    setData(await res.json());
  }

  useEffect(() => {
    reload();
  }, []);

  if (error) return <p className="text-sm font-semibold text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-foreground/60">Cargando…</p>;

  return (
    <div className="flex flex-col gap-10">
      <CategoriasSection categorias={data.categorias} onChange={reload} />
      <ProyectosSection categorias={data.categorias} proyectos={data.proyectos} onChange={reload} />
    </div>
  );
}

async function patch(body: unknown) {
  const res = await fetch("/api/viewone-admin", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
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
