"use client";

import { useEffect, useState } from "react";
import { PAGINAS_SEO, type PaginaSeoId, type SeoOverrides } from "@/lib/viewone-seo-paginas";
import { btnPrimary, btnSecondary, inputClass, labelClass, patch } from "@/components/viewone/admin-ui";

// Pestaña SEO del panel (2026-10-27): título y descripción que Google muestra
// para cada página. Cada campo arranca con el texto actual; si se borra, la
// página vuelve al texto por defecto (no queda sin título). La vista previa
// imita el resultado de Google para que se note cuándo un texto se corta.
const MAX_TITULO = 60;
const MAX_DESCRIPCION = 160;

type Form = Record<PaginaSeoId, { titulo: string; descripcion: string }>;

function armarForm(seo: SeoOverrides): Form {
  return Object.fromEntries(
    PAGINAS_SEO.map((p) => [p.id, { titulo: seo[p.id]?.titulo ?? p.titulo, descripcion: seo[p.id]?.descripcion ?? p.descripcion }])
  ) as Form;
}

function Contador({ largo, max }: { largo: number; max: number }) {
  return (
    <span className={`text-xs ${largo > max ? "font-semibold text-amber-600" : "text-foreground/40"}`}>
      {largo}/{max}
      {largo > max && " · Google lo puede cortar"}
    </span>
  );
}

export function AdminSeo({ seo, onSaved }: { seo: SeoOverrides; onSaved: () => void }) {
  const [form, setForm] = useState<Form>(() => armarForm(seo));
  const [saving, setSaving] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => setForm(armarForm(seo)), [seo]);

  function set(id: PaginaSeoId, campo: "titulo" | "descripcion", valor: string) {
    setGuardado(false);
    setForm((f) => ({ ...f, [id]: { ...f[id], [campo]: valor } }));
  }

  async function guardar() {
    setSaving(true);
    try {
      // Solo se guarda lo que difiere del texto por defecto: así, si más
      // adelante se mejora el por defecto en código, las páginas que nadie
      // tocó lo toman solas.
      const overrides: SeoOverrides = {};
      for (const p of PAGINAS_SEO) {
        const v = form[p.id];
        const titulo = v.titulo.trim() !== p.titulo ? v.titulo : undefined;
        const descripcion = v.descripcion.trim() !== p.descripcion ? v.descripcion : undefined;
        if (titulo || descripcion) overrides[p.id] = { titulo, descripcion };
      }
      await patch({ action: "setSeo", seo: overrides });
      setGuardado(true);
      onSaved();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-foreground">SEO</h2>
      <p className="mt-1 max-w-2xl text-sm text-foreground/60">
        El título y la descripción que muestra Google para cada página. Pon primero lo que la gente busca (por ejemplo
        “letreros publicitarios”) y termina con “| ViewOne”. Los cambios se ven en Google recién cuando vuelve a pasar por
        el sitio, en días o semanas.
      </p>

      <div className="mt-5 flex flex-col gap-5">
        {PAGINAS_SEO.map((p) => {
          const v = form[p.id];
          const titulo = v.titulo.trim() || p.titulo;
          const descripcion = v.descripcion.trim() || p.descripcion;
          const cambiado = v.titulo !== p.titulo || v.descripcion !== p.descripcion;
          return (
            <div key={p.id} className="rounded-xl border border-foreground/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-base font-bold text-foreground">
                  {p.nombre} <span className="text-xs font-normal text-foreground/40">{p.ruta}</span>
                </p>
                {cambiado && (
                  <button
                    type="button"
                    onClick={() => {
                      setGuardado(false);
                      setForm((f) => ({ ...f, [p.id]: { titulo: p.titulo, descripcion: p.descripcion } }));
                    }}
                    className={btnSecondary}
                  >
                    Volver al texto original
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={labelClass}>Título en Google</p>
                    <Contador largo={v.titulo.length} max={MAX_TITULO} />
                  </div>
                  <input value={v.titulo} onChange={(e) => set(p.id, "titulo", e.target.value)} maxLength={120} className={`mt-1 w-full ${inputClass}`} />
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={labelClass}>Descripción en Google</p>
                    <Contador largo={v.descripcion.length} max={MAX_DESCRIPCION} />
                  </div>
                  <textarea
                    value={v.descripcion}
                    onChange={(e) => set(p.id, "descripcion", e.target.value)}
                    maxLength={320}
                    rows={2}
                    className={`mt-1 w-full ${inputClass}`}
                  />
                </div>

                {/* Vista previa aproximada del resultado en Google. */}
                <div className="rounded-lg bg-foreground/[0.03] p-3">
                  <p className="text-xs text-foreground/50">www.viewone.cl{p.ruta === "/" ? "" : ` › ${p.ruta.slice(1)}`}</p>
                  <p className="mt-0.5 truncate text-lg leading-snug text-[#1a0dab]">{titulo}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-foreground/70">{descripcion}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={guardar} disabled={saving} className={btnPrimary}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {guardado && <span className="text-sm text-foreground/60">Guardado. Ya se ve en el sitio.</span>}
      </div>
    </section>
  );
}
