"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Eye, EyeOff, Plus, Trash2, X } from "lucide-react";
import type { Cliente } from "@/lib/viewone-clientes";
import {
  ICONOS,
  clientesDeSeccion,
  TIPOS_SECCION,
  nuevoId,
  seccionNueva,
  type HomeSeccion,
  type IconoKey,
  type SeccionDe,
  type TipoSeccion,
} from "@/lib/viewone-home-sections";
import { ImagePicker, btnPrimary, btnSecondary, inputClass, labelClass, patch } from "@/components/viewone/admin-ui";

// Editor del Home por secciones (estilo WordPress): lista ordenada donde
// cada sección se puede mover, ocultar, duplicar, eliminar y editar; las
// secciones con elementos (atributos, galería) permiten agregar, mover y
// quitar elementos. Todo se edita en borrador local y se publica con un
// solo "Guardar cambios" — así un cambio a medias nunca queda en el sitio.

function mover<T>(lista: T[], i: number, delta: number): T[] {
  const j = i + delta;
  if (j < 0 || j >= lista.length) return lista;
  const copia = [...lista];
  [copia[i], copia[j]] = [copia[j], copia[i]];
  return copia;
}

function resumen(s: HomeSeccion): string {
  if ("titulo" in s && s.titulo) return s.titulo;
  if ("eyebrow" in s && s.eyebrow) return s.eyebrow;
  return TIPOS_SECCION[s.tipo].nombre;
}

// Lo que la API rechazaría igual (imágenes obligatorias), dicho en
// castellano y apuntando a la sección, antes de mandar nada.
function validar(secciones: HomeSeccion[]): string | null {
  for (const [i, s] of secciones.entries()) {
    const n = `Sección ${i + 1} (${TIPOS_SECCION[s.tipo].nombre})`;
    if ((s.tipo === "hero" || s.tipo === "textoImagen") && !s.fotoUrl) return `${n}: falta la foto.`;
    if (s.tipo === "galeria" && s.items.some((it) => !it.foto)) return `${n}: hay un elemento sin foto.`;
    if (s.tipo === "atributos" && s.items.some((it) => !it.titulo.trim())) return `${n}: hay un atributo sin título.`;
  }
  return null;
}

export function AdminHomeSecciones({
  secciones,
  clientes,
  onSaved,
}: {
  secciones: HomeSeccion[];
  clientes: Cliente[];
  onSaved: () => void;
}) {
  const [lista, setLista] = useState(secciones);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => setLista(secciones), [secciones]);

  const dirty = useMemo(() => JSON.stringify(lista) !== JSON.stringify(secciones), [lista, secciones]);
  const fotoPorDefecto = useMemo(() => {
    const hero = secciones.find((s) => s.tipo === "hero");
    return hero && hero.tipo === "hero" ? hero.fotoUrl : "";
  }, [secciones]);

  // Avisar antes de salir de la página con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function actualizar(id: string, cambio: Partial<HomeSeccion>) {
    setLista((l) => l.map((s) => (s.id === id ? ({ ...s, ...cambio } as HomeSeccion) : s)));
  }

  function agregar(tipo: TipoSeccion, posicion: number) {
    const nueva = seccionNueva(tipo, fotoPorDefecto);
    setLista((l) => [...l.slice(0, posicion), nueva, ...l.slice(posicion)]);
    setAbierta(nueva.id);
    setAgregando(false);
  }

  async function guardar() {
    const error = validar(lista);
    if (error) {
      alert(error);
      return;
    }
    setSaving(true);
    try {
      await patch({ action: "setHomeSecciones", secciones: lista });
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Inicio</h2>
          <p className="mt-1 max-w-2xl text-xs text-foreground/50">
            Las secciones del Home, en el orden en que aparecen. Muévelas con las flechas, ocúltalas sin borrarlas con el
            ojo, o ábrelas para editar su contenido. Nada se publica hasta que apretes &quot;Guardar cambios&quot;.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="text-xs font-semibold text-accent hover:underline">
          Ver el Home →
        </a>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {lista.map((s, i) => {
          const open = abierta === s.id;
          return (
            <div
              key={s.id}
              className={`rounded-xl border bg-background ${open ? "border-primary/40 shadow-sm" : "border-foreground/10"} ${s.visible ? "" : "opacity-60"}`}
            >
              <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
                <button
                  type="button"
                  onClick={() => setAbierta(open ? null : s.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  aria-expanded={open}
                >
                  <span className="w-5 shrink-0 text-xs font-bold text-foreground/30">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-accent">
                      {TIPOS_SECCION[s.tipo].nombre}
                      {!s.visible && <span className="ml-2 text-foreground/40">· Oculta</span>}
                    </span>
                    <span className="block truncate text-sm font-semibold text-foreground">{resumen(s)}</span>
                  </span>
                  <ChevronDown size={16} className={`ml-auto shrink-0 text-foreground/40 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                <div className="flex shrink-0 items-center">
                  <IconBtn label="Subir" disabled={i === 0} onClick={() => setLista((l) => mover(l, i, -1))}>
                    <ArrowUp size={15} />
                  </IconBtn>
                  <IconBtn label="Bajar" disabled={i === lista.length - 1} onClick={() => setLista((l) => mover(l, i, 1))}>
                    <ArrowDown size={15} />
                  </IconBtn>
                  <IconBtn label={s.visible ? "Ocultar" : "Mostrar"} onClick={() => actualizar(s.id, { visible: !s.visible })}>
                    {s.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </IconBtn>
                  <IconBtn
                    label="Duplicar"
                    onClick={() =>
                      setLista((l) => [...l.slice(0, i + 1), { ...structuredClone(s), id: nuevoId() }, ...l.slice(i + 1)])
                    }
                  >
                    <Copy size={15} />
                  </IconBtn>
                  <IconBtn
                    label="Eliminar"
                    danger
                    onClick={() => {
                      if (!confirm(`¿Eliminar la sección "${resumen(s)}"? Puedes deshacerlo con "Descartar" antes de guardar.`)) return;
                      setLista((l) => l.filter((x) => x.id !== s.id));
                    }}
                  >
                    <Trash2 size={15} />
                  </IconBtn>
                </div>
              </div>
              {open && (
                <div className="border-t border-foreground/10 px-3 py-4 sm:px-4">
                  <EditorSeccion s={s} clientes={clientes} onChange={(cambio) => actualizar(s.id, cambio)} />
                </div>
              )}
            </div>
          );
        })}
        {lista.length === 0 && (
          <p className="rounded-xl border border-dashed border-foreground/20 px-4 py-8 text-center text-sm text-foreground/50">
            El Home no tiene secciones. Agrega una para empezar.
          </p>
        )}
      </div>

      {agregando ? (
        <AgregarSeccion total={lista.length} titulos={lista.map(resumen)} onElegir={agregar} onCancel={() => setAgregando(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setAgregando(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-foreground/25 px-4 py-3 text-sm font-semibold text-foreground/60 hover:border-primary hover:text-primary"
        >
          <Plus size={16} /> Agregar sección
        </button>
      )}

      {/* Barra de guardado: fija abajo mientras haya cambios pendientes. */}
      {dirty && (
        <div className="sticky bottom-4 z-30 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-background px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground">Tienes cambios sin guardar</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm("¿Descartar todos los cambios sin guardar?")) setLista(secciones);
              }}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-foreground/60 hover:underline"
            >
              Descartar
            </button>
            <button type="button" onClick={guardar} disabled={saving} className={btnPrimary}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-25 ${
        danger ? "text-red-600 hover:bg-red-50" : "text-foreground/50 hover:bg-foreground/5 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function AgregarSeccion({
  total,
  titulos,
  onElegir,
  onCancel,
}: {
  total: number;
  titulos: string[];
  onElegir: (tipo: TipoSeccion, posicion: number) => void;
  onCancel: () => void;
}) {
  const [posicion, setPosicion] = useState(total);
  return (
    <div className="mt-3 rounded-xl border border-primary/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-foreground">¿Qué sección quieres agregar?</p>
        <div className="flex items-center gap-2">
          <label className="text-xs text-foreground/60" htmlFor="posicion-seccion">
            Ubicación
          </label>
          <select
            id="posicion-seccion"
            value={posicion}
            onChange={(e) => setPosicion(Number(e.target.value))}
            className="max-w-[16rem] rounded-lg border border-foreground/20 bg-background px-2 py-1 text-xs text-foreground"
          >
            <option value={0}>Al principio</option>
            {titulos.map((t, i) => (
              <option key={i} value={i + 1}>
                {i + 1 === total ? "Al final" : `Después de ${i + 1}. ${t}`}
              </option>
            ))}
          </select>
          <button type="button" onClick={onCancel} aria-label="Cancelar" className="rounded-md p-1 text-foreground/50 hover:text-foreground">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(TIPOS_SECCION) as TipoSeccion[]).map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => onElegir(tipo, posicion)}
            className="rounded-lg border border-foreground/10 px-3 py-2.5 text-left hover:border-primary hover:bg-primary/5"
          >
            <span className="block text-sm font-semibold text-foreground">{TIPOS_SECCION[tipo].nombre}</span>
            <span className="mt-0.5 block text-xs text-foreground/55">{TIPOS_SECCION[tipo].descripcion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={placeholder} className={`mt-1 w-full ${inputClass}`} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`mt-1 w-full ${inputClass}`} />
      )}
    </label>
  );
}

function Foto({ label, url, onChange, opcional }: { label: string; url: string; onChange: (v: string) => void; opcional?: boolean }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="mt-1 flex items-center gap-3">
        <ImagePicker url={url} label="foto" onUploaded={onChange} />
        {opcional && url && (
          <button type="button" onClick={() => onChange("")} className="text-xs font-semibold text-red-600 hover:underline">
            Quitar foto
          </button>
        )}
      </div>
    </div>
  );
}

function Boton({
  label,
  texto,
  href,
  onChange,
}: {
  label: string;
  texto: string;
  href: string;
  onChange: (texto: string, href: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Campo label={`${label}: texto (vacío = sin botón)`} value={texto} onChange={(v) => onChange(v, href)} />
      <Campo label={`${label}: link`} value={href} onChange={(v) => onChange(texto, v)} placeholder="/contacto" />
    </div>
  );
}

function EditorSeccion({
  s,
  clientes,
  onChange,
}: {
  s: HomeSeccion;
  clientes: Cliente[];
  onChange: (cambio: Partial<HomeSeccion>) => void;
}) {
  const set = (cambio: Record<string, unknown>) => onChange(cambio as Partial<HomeSeccion>);
  const grid = "grid grid-cols-1 gap-3 sm:grid-cols-2";

  switch (s.tipo) {
    case "hero":
      return (
        <div className="flex flex-col gap-4">
          <div className={grid}>
            <Campo label="Etiqueta superior" value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <Campo label="Titular" value={s.titulo} onChange={(v) => set({ titulo: v })} />
          </div>
          <Campo label="Bajada" value={s.bajada} onChange={(v) => set({ bajada: v })} multiline />
          <Foto label="Foto de fondo" url={s.fotoUrl} onChange={(v) => set({ fotoUrl: v })} />
          <Boton label="Botón principal" texto={s.botonTexto} href={s.botonHref} onChange={(t, h) => set({ botonTexto: t, botonHref: h })} />
          <Boton label="Botón secundario" texto={s.boton2Texto} href={s.boton2Href} onChange={(t, h) => set({ boton2Texto: t, boton2Href: h })} />
        </div>
      );
    case "logos":
      return (
        <div className="flex flex-col gap-4">
          <Campo label="Etiqueta" value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} />
          <SelectorClientes
            clientes={clientes}
            elegidos={clientesDeSeccion(s, clientes).map((c) => c.id)}
            onChange={(ids) => set({ clientes: ids })}
            ayuda="Se ven en una sola fila; con más de 8 pasan a una segunda fila."
          />
        </div>
      );
    case "servicios":
      return (
        <div className="flex flex-col gap-3">
          <div className={grid}>
            <Campo label="Etiqueta" value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <Campo label="Título" value={s.titulo} onChange={(v) => set({ titulo: v })} />
          </div>
          <Campo label='Texto del link a /servicios (vacío = sin link)' value={s.linkTexto} onChange={(v) => set({ linkTexto: v })} />
          <p className="text-xs text-foreground/50">Las tarjetas son los servicios visibles de la pestaña Servicios.</p>
        </div>
      );
    case "atributos":
      return <EditorAtributos s={s} set={set} />;
    case "galeria":
      return <EditorGaleria s={s} set={set} />;
    case "textoImagen":
      return (
        <div className="flex flex-col gap-4">
          <div className={grid}>
            <Campo label="Etiqueta" value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <Campo label="Título" value={s.titulo} onChange={(v) => set({ titulo: v })} />
          </div>
          <Campo label="Texto" value={s.texto} onChange={(v) => set({ texto: v })} multiline />
          <div className={grid}>
            <Foto label="Foto" url={s.fotoUrl} onChange={(v) => set({ fotoUrl: v })} />
            <label className="block">
              <span className={labelClass}>Foto a la</span>
              <select value={s.lado} onChange={(e) => set({ lado: e.target.value })} className={`mt-1 w-full ${inputClass}`}>
                <option value="izquierda">Izquierda</option>
                <option value="derecha">Derecha</option>
              </select>
            </label>
          </div>
          <Boton label="Botón" texto={s.botonTexto} href={s.botonHref} onChange={(t, h) => set({ botonTexto: t, botonHref: h })} />
          <Campo
            label="Ancla (para links tipo /#nosotros; opcional)"
            value={s.ancla}
            onChange={(v) => set({ ancla: v.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
            placeholder="nosotros"
          />
          {s.ancla === "nosotros" && (
            <p className="text-xs text-foreground/50">El link &quot;Nosotros&quot; del menú lleva a esta sección.</p>
          )}
        </div>
      );
    case "texto":
      return (
        <div className="flex flex-col gap-4">
          <div className={grid}>
            <Campo label="Etiqueta" value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <Campo label="Título" value={s.titulo} onChange={(v) => set({ titulo: v })} />
          </div>
          <Campo label="Texto" value={s.texto} onChange={(v) => set({ texto: v })} multiline />
          <Boton label="Botón" texto={s.botonTexto} href={s.botonHref} onChange={(t, h) => set({ botonTexto: t, botonHref: h })} />
          <label className="block sm:max-w-xs">
            <span className={labelClass}>Fondo</span>
            <select value={s.fondo} onChange={(e) => set({ fondo: e.target.value })} className={`mt-1 w-full ${inputClass}`}>
              <option value="claro">Celeste (como la página)</option>
              <option value="blanco">Blanco</option>
            </select>
          </label>
        </div>
      );
    case "clientes":
      return (
        <div className="flex flex-col gap-4">
          <Campo label="Etiqueta" value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} />
          <div className="flex flex-col gap-1.5 text-sm text-foreground/80">
            <label className="flex items-center gap-2">
              <input type="radio" checked={!s.clientes} onChange={() => set({ clientes: undefined })} />
              Todos los clientes (incluye los que se agreguen después)
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={!!s.clientes} onChange={() => set({ clientes: clientes.map((c) => c.id) })} />
              Solo los que elija
            </label>
          </div>
          {s.clientes && (
            <SelectorClientes
              clientes={clientes}
              elegidos={clientesDeSeccion(s, clientes).map((c) => c.id)}
              onChange={(ids) => set({ clientes: ids })}
              ayuda="Se muestran de a 20 (2 filas de 10), con flechas si son más."
            />
          )}
        </div>
      );
    case "cta":
      return (
        <div className="flex flex-col gap-4">
          <div className={grid}>
            <Campo label="Etiqueta" value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} />
            <Campo label="Título" value={s.titulo} onChange={(v) => set({ titulo: v })} />
          </div>
          <Foto label="Foto de fondo (opcional, bajo el azul)" url={s.fotoUrl} onChange={(v) => set({ fotoUrl: v })} opcional />
          <Boton label="Botón" texto={s.botonTexto} href={s.botonHref} onChange={(t, h) => set({ botonTexto: t, botonHref: h })} />
          <label className="flex items-center gap-2 text-sm text-foreground/70">
            <input type="checkbox" checked={s.mostrarContacto} onChange={(e) => set({ mostrarContacto: e.target.checked })} />
            Mostrar dirección, correo y WhatsApp (de la pestaña Contacto)
          </label>
        </div>
      );
  }
}

// Fila de un elemento dentro de una sección: contenido + mover/quitar.
function ElementoFila({
  i,
  total,
  onMover,
  onQuitar,
  children,
}: {
  i: number;
  total: number;
  onMover: (delta: number) => void;
  onQuitar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-foreground/10 p-2.5">
      <div className="min-w-0 flex-1">{children}</div>
      <div className="flex shrink-0 flex-col items-center sm:flex-row">
        <IconBtn label="Subir" disabled={i === 0} onClick={() => onMover(-1)}>
          <ArrowUp size={14} />
        </IconBtn>
        <IconBtn label="Bajar" disabled={i === total - 1} onClick={() => onMover(1)}>
          <ArrowDown size={14} />
        </IconBtn>
        <IconBtn label="Quitar" danger onClick={onQuitar}>
          <Trash2 size={14} />
        </IconBtn>
      </div>
    </div>
  );
}

function EditorAtributos({ s, set }: { s: SeccionDe<"atributos">; set: (c: Record<string, unknown>) => void }) {
  const items = s.items;
  const setItem = (i: number, cambio: Partial<(typeof items)[number]>) =>
    set({ items: items.map((it, idx) => (idx === i ? { ...it, ...cambio } : it)) });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Campo label="Etiqueta" value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Campo label="Dato grande" value={s.titulo} onChange={(v) => set({ titulo: v })} placeholder="+20 años" />
        <Campo label="Bajada del dato" value={s.subtitulo} onChange={(v) => set({ subtitulo: v })} />
      </div>
      <Foto label="Foto de fondo (opcional)" url={s.fotoUrl} onChange={(v) => set({ fotoUrl: v })} opcional />
      <div>
        <p className={labelClass}>Atributos ({items.length})</p>
        <div className="mt-2 flex flex-col gap-2">
          {items.map((it, i) => (
            <ElementoFila
              key={i}
              i={i}
              total={items.length}
              onMover={(d) => set({ items: mover(items, i, d) })}
              onQuitar={() => set({ items: items.filter((_, idx) => idx !== i) })}
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto]">
                <input value={it.titulo} onChange={(e) => setItem(i, { titulo: e.target.value })} placeholder="Título" className={inputClass} />
                <input
                  value={it.descripcion}
                  onChange={(e) => setItem(i, { descripcion: e.target.value })}
                  placeholder="Descripción (opcional)"
                  className={inputClass}
                />
                <select value={it.icono} onChange={(e) => setItem(i, { icono: e.target.value as IconoKey })} className={inputClass} aria-label="Ícono">
                  {(Object.keys(ICONOS) as IconoKey[]).map((k) => (
                    <option key={k} value={k}>
                      {ICONOS[k]}
                    </option>
                  ))}
                </select>
              </div>
            </ElementoFila>
          ))}
        </div>
        <button
          type="button"
          disabled={items.length >= 12}
          onClick={() => set({ items: [...items, { titulo: "", descripcion: "", icono: "check" }] })}
          className={`mt-2 inline-flex items-center gap-1.5 ${btnSecondary}`}
        >
          <Plus size={14} /> Agregar atributo
        </button>
      </div>
    </div>
  );
}

function EditorGaleria({ s, set }: { s: SeccionDe<"galeria">; set: (c: Record<string, unknown>) => void }) {
  const items = s.items;
  const setItem = (i: number, cambio: Partial<(typeof items)[number]>) =>
    set({ items: items.map((it, idx) => (idx === i ? { ...it, ...cambio } : it)) });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo label="Etiqueta" value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Campo label="Título" value={s.titulo} onChange={(v) => set({ titulo: v })} />
      </div>
      <Boton label='Link "Ver todos"' texto={s.linkTexto} href={s.linkHref} onChange={(t, h) => set({ linkTexto: t, linkHref: h })} />
      <div>
        <p className={labelClass}>Fotos ({items.length}) — se ven de a 4 por fila</p>
        <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
          {items.map((it, i) => (
            <ElementoFila
              key={i}
              i={i}
              total={items.length}
              onMover={(d) => set({ items: mover(items, i, d) })}
              onQuitar={() => set({ items: items.filter((_, idx) => idx !== i) })}
            >
              <div className="flex flex-col gap-2">
                <input value={it.nombre} onChange={(e) => setItem(i, { nombre: e.target.value })} placeholder="Nombre (ej. cliente)" className={inputClass} />
                <input value={it.href} onChange={(e) => setItem(i, { href: e.target.value })} placeholder="Link (ej. /proyectos)" className={inputClass} />
                <ImagePicker url={it.foto} label="foto" onUploaded={(url) => setItem(i, { foto: url })} />
              </div>
            </ElementoFila>
          ))}
        </div>
        <button
          type="button"
          disabled={items.length >= 24}
          onClick={() => set({ items: [...items, { nombre: "", foto: "", href: "/proyectos" }] })}
          className={`mt-2 inline-flex items-center gap-1.5 ${btnSecondary}`}
        >
          <Plus size={14} /> Agregar foto
        </button>
      </div>
    </div>
  );
}

// Checklist de clientes para las secciones de logos/carrusel. El orden es
// siempre el de la pestaña Clientes (acá solo se elige cuáles).
function SelectorClientes({
  clientes,
  elegidos,
  onChange,
  ayuda,
}: {
  clientes: Cliente[];
  elegidos: string[];
  onChange: (ids: string[]) => void;
  ayuda: string;
}) {
  const set = new Set(elegidos);
  const toggle = (id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(clientes.filter((c) => next.has(c.id)).map((c) => c.id));
  };
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={labelClass}>
          Clientes que se muestran ({set.size} de {clientes.length})
        </p>
        <div className="flex gap-3 text-xs font-semibold">
          <button type="button" className="text-accent hover:underline" onClick={() => onChange(clientes.map((c) => c.id))}>
            Marcar todos
          </button>
          <button type="button" className="text-foreground/50 hover:underline" onClick={() => onChange([])}>
            Ninguno
          </button>
        </div>
      </div>
      <p className="mt-0.5 text-xs text-foreground/50">{ayuda} El orden se cambia en la pestaña Clientes.</p>
      <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
        {clientes.map((c) => (
          <label
            key={c.id}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm ${
              set.has(c.id) ? "border-primary/40 bg-primary/5 text-foreground" : "border-foreground/10 text-foreground/60"
            }`}
          >
            <input type="checkbox" checked={set.has(c.id)} onChange={() => toggle(c.id)} />
            <span className="truncate">{c.nombre}</span>
            {!c.logo && <span className="ml-auto shrink-0 text-[10px] uppercase text-foreground/35">sin logo</span>}
          </label>
        ))}
      </div>
    </div>
  );
}
