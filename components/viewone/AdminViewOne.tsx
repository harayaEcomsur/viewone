"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  FolderTree,
  Home,
  Images,
  Lock,
  Phone,
  Plus,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Categoria, Proyecto } from "@/lib/viewone-store";
import type { HomeContent, Servicio } from "@/lib/viewone-content-store";
import { AdminHomeSecciones } from "@/components/viewone/AdminHomeSecciones";
import {
  ImagePicker,
  authHeaders,
  btnPrimary,
  inputClass,
  labelClass,
  patch,
  setSessionAdminKey,
  uploadFile,
} from "@/components/viewone/admin-ui";

type Contacto = {
  phone?: string;
  whatsapp?: string;
  whatsappPrefilledMessage?: string;
  email?: string;
  address?: string;
  mapQuery?: string;
  socials?: { platform: string; url: string }[];
};

type AdminRole = "admin" | "staff";
type AdminUser = { email: string; role: AdminRole; hasPassword?: boolean; invitePending?: boolean };

type Data = {
  categorias: Categoria[];
  proyectos: Proyecto[];
  homeContent: HomeContent;
  clientes: string[];
  contacto: Contacto;
  servicios: Servicio[];
  adminUsers: AdminUser[];
};

// Panel separado por tipo de contenido (pedido 2026-10-20: "no me gusta que
// esté todo en una sola página"): barra lateral con una pestaña por tipo,
// y solo la pestaña activa en pantalla. La pestaña vive en el hash de la URL
// (#inicio, #proyectos…) para que recargar o compartir el link no pierda
// dónde estabas.
type Tab = "inicio" | "servicios" | "proyectos" | "categorias" | "clientes" | "contacto" | "usuarios";

const TABS: { id: Tab; label: string; icon: LucideIcon; grupo: "Sitio" | "Catálogo" | "Configuración"; soloAdmin?: boolean }[] = [
  { id: "inicio", label: "Inicio", icon: Home, grupo: "Sitio" },
  { id: "servicios", label: "Servicios", icon: Briefcase, grupo: "Sitio" },
  { id: "clientes", label: "Clientes", icon: Users, grupo: "Sitio" },
  { id: "proyectos", label: "Proyectos", icon: Images, grupo: "Catálogo" },
  { id: "categorias", label: "Categorías", icon: FolderTree, grupo: "Catálogo" },
  { id: "contacto", label: "Contacto", icon: Phone, grupo: "Configuración", soloAdmin: true },
  { id: "usuarios", label: "Usuarios", icon: Lock, grupo: "Configuración", soloAdmin: true },
];

export function AdminViewOne({
  adminKey,
  role,
  currentEmail,
}: { adminKey?: string; role?: AdminRole; currentEmail?: string } = {}) {
  setSessionAdminKey(adminKey);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("inicio");
  const isAdmin = role !== "staff"; // clave compartida y Google admin → true; solo "staff" explícito lo baja.
  const tabs = TABS.filter((t) => isAdmin || !t.soloAdmin);

  async function reload() {
    const res = await fetch("/api/viewone-admin", { headers: authHeaders() });
    if (!res.ok) {
      setError("No se pudo cargar el panel.");
      return;
    }
    setData(await res.json());
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  useEffect(() => {
    const leer = () => {
      const h = window.location.hash.slice(1) as Tab;
      if (tabs.some((t) => t.id === h)) setTab(h);
    };
    leer();
    window.addEventListener("hashchange", leer);
    return () => window.removeEventListener("hashchange", leer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  function irA(t: Tab) {
    setTab(t);
    history.replaceState(null, "", `#${t}`);
    window.scrollTo({ top: 0 });
  }

  if (error) return <p className="text-sm font-semibold text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-foreground/60">Cargando…</p>;

  const grupos = Array.from(new Set(tabs.map((t) => t.grupo)));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr] lg:gap-10">
      <nav aria-label="Secciones del panel" className="lg:sticky lg:top-20 lg:self-start">
        {/* Mobile: fila horizontal deslizable; desktop: lista agrupada. */}
        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-5 lg:overflow-visible lg:px-0">
          {grupos.map((g) => (
            <div key={g} className="flex gap-1 lg:flex-col">
              <p className="hidden px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-foreground/40 lg:block">{g}</p>
              {tabs
                .filter((t) => t.grupo === g)
                .map((t) => {
                  const Icon = t.icon;
                  const activo = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => irA(t.id)}
                      aria-current={activo ? "page" : undefined}
                      className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                        activo ? "bg-primary text-white" : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      {t.label}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
        {!isAdmin && (
          <p className="mt-4 hidden px-3 text-xs text-foreground/40 lg:block">
            Contacto y Usuarios son solo para administradores — tu cuenta tiene acceso de staff.
          </p>
        )}
      </nav>

      <div className="min-w-0">
        {tab === "inicio" && <AdminHomeSecciones secciones={data.homeContent.secciones} onSaved={reload} />}
        {tab === "servicios" && <ServiciosSection servicios={data.servicios} onChange={reload} />}
        {tab === "clientes" && <ClientesSection clientes={data.clientes} onChange={reload} />}
        {tab === "proyectos" && <ProyectosSection categorias={data.categorias} proyectos={data.proyectos} onChange={reload} />}
        {tab === "categorias" && <CategoriasSection categorias={data.categorias} onChange={reload} />}
        {tab === "contacto" && isAdmin && <ContactoSection contacto={data.contacto} onChange={reload} />}
        {tab === "usuarios" && isAdmin && <UsuariosSection adminUsers={data.adminUsers} currentEmail={currentEmail} onChange={reload} />}
      </div>
    </div>
  );
}

// "Agregar …" plegado detrás de un botón: el formulario vacío ya no ocupa
// media pestaña debajo de la lista.
function AgregarPlegable({ label, children }: { label: string; children: (cerrar: () => void) => React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  return abierto ? (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
      <div className="mt-2">{children(() => setAbierto(false))}</div>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setAbierto(true)}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-foreground/25 px-4 py-3 text-sm font-semibold text-foreground/60 hover:border-primary hover:text-primary"
    >
      <Plus size={16} /> {label}
    </button>
  );
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

      <AgregarPlegable label="Agregar proyecto">
        {(cerrar) => (
          <ProyectoForm
            categorias={categorias}
            onSaved={() => {
              cerrar();
              onChange();
            }}
            onCancel={cerrar}
          />
        )}
      </AgregarPlegable>
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
      <AgregarPlegable label="Agregar servicio">
        {(cerrar) => (
          <ServicioForm
            onSaved={() => {
              cerrar();
              onChange();
            }}
            onCancel={cerrar}
          />
        )}
      </AgregarPlegable>
    </section>
  );
}

// Clientes como lista de elementos (agregar, mover, quitar) en vez de un
// textarea. El logo sale del mapa CLIENTE_LOGO del código: un nombre nuevo
// sin logo ahí se muestra como texto — subir el logo es un pedido a
// HarayaDev, porque cada logo se reprocesa a mano (silueta con alfa real
// para la técnica de máscara, ver ClienteLogoMark.tsx).
function ClientesSection({ clientes, onChange }: { clientes: string[]; onChange: () => void }) {
  const [lista, setLista] = useState(clientes);
  const [nuevo, setNuevo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setLista(clientes), [clientes]);
  const dirty = JSON.stringify(lista) !== JSON.stringify(clientes);

  function mover(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= lista.length) return;
    const copia = [...lista];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    setLista(copia);
  }

  async function guardar() {
    setSaving(true);
    try {
      await patch({ action: "setClientesContent", nombres: lista.map((n) => n.trim()).filter(Boolean) });
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
      <p className="mt-1 max-w-2xl text-xs text-foreground/50">
        Se muestran en el Home en este orden: los primeros en la fila de logos destacados y todos en el carrusel. Un
        cliente nuevo aparece como texto hasta que HarayaDev cargue su logo.
      </p>
      <div className="mt-4 flex flex-col gap-1.5">
        {lista.map((nombre, i) => (
          <div key={`${nombre}-${i}`} className="flex items-center gap-2 rounded-lg border border-foreground/10 px-3 py-1.5">
            <span className="w-6 shrink-0 text-xs font-bold text-foreground/30">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{nombre}</span>
            <button type="button" aria-label="Subir" title="Subir" disabled={i === 0} onClick={() => mover(i, -1)} className="rounded-md p-1.5 text-foreground/50 hover:bg-foreground/5 disabled:opacity-25">
              <ArrowUp size={14} />
            </button>
            <button type="button" aria-label="Bajar" title="Bajar" disabled={i === lista.length - 1} onClick={() => mover(i, 1)} className="rounded-md p-1.5 text-foreground/50 hover:bg-foreground/5 disabled:opacity-25">
              <ArrowDown size={14} />
            </button>
            <button
              type="button"
              aria-label="Quitar"
              title="Quitar"
              onClick={() => setLista((l) => l.filter((_, idx) => idx !== i))}
              className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const n = nuevo.trim();
          if (!n) return;
          if (lista.some((x) => x.toLowerCase() === n.toLowerCase())) {
            alert(`"${n}" ya está en la lista.`);
            return;
          }
          setLista((l) => [...l, n]);
          setNuevo("");
        }}
        className="mt-3 flex gap-2"
      >
        <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Nombre del nuevo cliente" className={`min-w-0 flex-1 ${inputClass}`} />
        <button type="submit" disabled={!nuevo.trim()} className={`shrink-0 ${btnPrimary}`}>
          Agregar
        </button>
      </form>
      {dirty && (
        <div className="sticky bottom-4 z-30 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-background px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground">Tienes cambios sin guardar</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setLista(clientes)} className="rounded-lg px-4 py-2 text-xs font-semibold text-foreground/60 hover:underline">
              Descartar
            </button>
            <button type="button" onClick={guardar} disabled={saving} className={btnPrimary}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
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

const ADMIN_ROLES = ["admin", "staff"] as const;

function UsuariosSection({
  adminUsers,
  currentEmail,
  onChange,
}: {
  adminUsers: AdminUser[];
  currentEmail?: string;
  onChange: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");
  const [saving, setSaving] = useState(false);

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    try {
      await patch({ action: "addAdminUser", email: email.trim(), role });
      setEmail("");
      setRole("admin");
      onChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function cambiarRol(u: AdminUser, nuevoRol: AdminRole) {
    try {
      await patch({ action: "addAdminUser", email: u.email, role: nuevoRol });
      onChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  }

  async function restablecer(u: AdminUser) {
    const msg = u.hasPassword
      ? `¿Restablecer la contraseña de ${u.email}? Deberá crear una nueva en su próximo acceso.`
      : `¿Permitir que ${u.email} cree una contraseña en su próximo acceso?`;
    if (!confirm(msg)) return;
    try {
      await patch({ action: "resetAdminPassword", email: u.email });
      onChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  }

  async function eliminar(u: AdminUser) {
    if (!confirm(`¿Quitar a ${u.email} del panel de administración?`)) return;
    try {
      await patch({ action: "removeAdminUser", email: u.email });
      onChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">Usuarios</h2>
      <p className="mt-1 text-xs text-foreground/50">
        Correos autorizados para entrar a este panel, con Google o con correo y contraseña (en su primer acceso cada
        persona crea su propia contraseña). "Admin" ve y edita todo (incluido Contacto y Usuarios); "Staff" edita
        catálogo y contenido, pero no esas dos secciones.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {adminUsers.map((u) => (
          <div key={u.email} className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {u.email}
                {u.email === currentEmail && <span className="ml-2 text-xs text-foreground/40">(tú)</span>}
              </p>
              <p className="mt-0.5 text-xs text-foreground/50">
                {u.hasPassword
                  ? "Contraseña creada"
                  : u.invitePending
                    ? "Pendiente: crea su contraseña en el primer acceso"
                    : "Sin contraseña (entra con Google o clave)"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={u.role}
                onChange={(e) => cambiarRol(u, e.target.value as AdminRole)}
                className="rounded-lg border border-foreground/20 bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r === "admin" ? "Admin" : "Staff"}
                  </option>
                ))}
              </select>
              {!u.invitePending && (
                <button
                  type="button"
                  className="text-xs font-semibold text-foreground/60 hover:underline"
                  onClick={() => restablecer(u)}
                >
                  {u.hasPassword ? "Restablecer contraseña" : "Habilitar contraseña"}
                </button>
              )}
              <button
                type="button"
                disabled={u.email === currentEmail}
                className="text-xs font-semibold text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-foreground/30 disabled:no-underline"
                onClick={() => eliminar(u)}
                title={u.email === currentEmail ? "No puedes quitarte a ti mismo" : undefined}
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={agregar} className="mt-4 flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@empresa.cl"
          className={`min-w-0 flex-1 ${inputClass}`}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as AdminRole)}
          className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          {ADMIN_ROLES.map((r) => (
            <option key={r} value={r}>
              {r === "admin" ? "Admin" : "Staff"}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving || !email.trim()}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Agregar
        </button>
      </form>
    </section>
  );
}
