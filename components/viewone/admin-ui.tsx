"use client";

import { useRef, useState } from "react";
import Image from "next/image";

// Piezas compartidas por todas las pestañas del panel (/viewone-admin).

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

export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  return { ...extra, ...(sessionAdminKey ? { "x-viewone-key": sessionAdminKey } : {}) };
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.set("file", file);
  const res = await fetch("/api/viewone-admin/upload", { method: "POST", headers: authHeaders(), body: form });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) throw new Error(data?.error ?? "No se pudo subir la imagen.");
  return data.url as string;
}

export function setSessionAdminKey(key: string | undefined) {
  sessionAdminKey = key;
}

export const inputClass =
  "rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
export const labelClass = "text-xs font-bold uppercase tracking-wide text-foreground/50";

export async function patch(body: unknown) {
  const res = await fetch("/api/viewone-admin", {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "No se pudo guardar.");
  return data;
}

export const btnPrimary =
  "rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50";
export const btnSecondary =
  "rounded-lg border border-foreground/20 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary disabled:opacity-50";

export function ImagePicker({
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

