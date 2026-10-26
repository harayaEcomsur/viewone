"use client";

import { useEffect, useRef, useState } from "react";
import { CLAVE_COTIZACION } from "@/components/viewone/visualizador/productos";
import { registrarEvento } from "@/lib/analitica";

// Formulario exacto del handoff (sección 21): Nombre, Empresa, Teléfono,
// Correo, "¿Qué necesitas?" (con texto de ayuda — el cliente no necesita
// saber material/nombre técnico), Medidas aproximadas, Lugar de uso, Adjunto,
// Comentarios. Envía multipart/form-data a /api/viewone-contacto (adjunto
// real, no solo texto) y muestra éxito/error dentro de la misma página.
//
// Pase de diseño (impeccable critique 2026-10-04, P1): este es el momento de
// mayor ansiedad del comprador — compromete presupuesto real. Se agrupó en
// "Tus datos" / "Detalle del proyecto" en vez de 8 campos sueltos, se agregó
// reassurance copy (tiempo de respuesta, uso de los datos) y guía de tamaño
// de archivo, y el error ya no es genérico cuando se puede diagnosticar antes
// de llegar al servidor (archivo demasiado grande).
const MAX_ADJUNTO_MB = 8;

export function ContactoForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [desdeVisualizador, setDesdeVisualizador] = useState<{ adjunto: string | null } | null>(null);
  const necesidadRef = useRef<HTMLTextAreaElement>(null);
  const medidasRef = useRef<HTMLInputElement>(null);
  const adjuntoRef = useRef<HTMLInputElement>(null);

  // Viniendo del visualizador 3D (?desde=visualizador) el formulario llega
  // con el producto y la medida ya escritos, y el diseño ya adjunto: el
  // cliente no tiene que repetir lo que acaba de elegir.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("desde") !== "visualizador") return;
    if (necesidadRef.current && !necesidadRef.current.value) necesidadRef.current.value = q.get("necesidad") ?? "";
    if (medidasRef.current && !medidasRef.current.value) medidasRef.current.value = q.get("medidas") ?? "";
    let adjunto: string | null = null;
    try {
      const raw = sessionStorage.getItem(CLAVE_COTIZACION);
      if (raw && adjuntoRef.current) {
        const { nombre, tipo, dataUrl } = JSON.parse(raw) as { nombre: string; tipo: string; dataUrl: string };
        const bin = atob(dataUrl.split(",")[1] ?? "");
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const dt = new DataTransfer();
        dt.items.add(new File([bytes], nombre, { type: tipo }));
        adjuntoRef.current.files = dt.files;
        adjunto = nombre;
      }
    } catch {
      // Si no se puede reconstruir el archivo, el cliente lo adjunta a mano.
    }
    setDesdeVisualizador({ adjunto });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot anti-spam: campo oculto que un humano nunca llena.
    if (data.get("empresa_web")) {
      setStatus("ok");
      return;
    }

    const adjunto = data.get("adjunto");
    if (adjunto instanceof File && adjunto.size > MAX_ADJUNTO_MB * 1024 * 1024) {
      setError(`El archivo adjunto pesa demasiado (máx. ${MAX_ADJUNTO_MB} MB). Prueba con una foto más liviana.`);
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/viewone-contacto", { method: "POST", body: data });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "No se pudo enviar la solicitud. Intenta de nuevo o escríbenos directo por WhatsApp.");
        setStatus("error");
        return;
      }
      // La conversión que importa: una solicitud de cotización que llegó.
      registrarEvento("generate_lead", { formulario: "contacto" });
      setStatus("ok");
      form.reset();
      try {
        sessionStorage.removeItem(CLAVE_COTIZACION);
      } catch {}
    } catch {
      setError("No se pudo contactar al servidor. Revisa tu conexión e intenta de nuevo.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8 text-center">
        <p className="font-heading text-lg font-bold text-foreground">¡Listo! Recibimos tu solicitud.</p>
        <p className="mt-2 text-sm text-foreground/60">Te contactaremos a la brevedad para cotizar tu proyecto.</p>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-foreground/15 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent";
  const labelClass = "text-xs font-bold uppercase tracking-wide text-foreground/50";
  const groupLabelClass = "text-xs font-bold uppercase tracking-[0.2em] text-accent";

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <input type="text" name="empresa_web" className="hidden" tabIndex={-1} autoComplete="off" />

      <fieldset className="space-y-4">
        <legend className={groupLabelClass}>Tus datos</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Nombre</span>
            <input name="nombre" required autoComplete="name" className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Empresa</span>
            <input name="empresa" autoComplete="organization" className={inputClass} />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Teléfono</span>
            <input name="telefono" type="tel" required autoComplete="tel" className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Correo</span>
            <input type="email" name="correo" required autoComplete="email" className={inputClass} />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-foreground/10 pt-6">
        <legend className={groupLabelClass}>Detalle del proyecto</legend>

        <label className="block">
          <span className={labelClass}>¿Qué necesitas?</span>
          <p className="mt-1 text-xs text-foreground/50">
            No es necesario que conozcas el material o nombre técnico. Cuéntanos tu idea o describe lo que necesitas.
          </p>
          <textarea ref={necesidadRef} name="necesidad" required rows={4} className={inputClass} />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Medidas aproximadas (si conoce)</span>
            <input ref={medidasRef} name="medidas" className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Lugar de uso/instalación</span>
            <input name="lugar" className={inputClass} />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Adjuntar foto/diseño/referencia</span>
          <p className="mt-1 text-xs text-foreground/50">Opcional. Imagen o PDF, máx. {MAX_ADJUNTO_MB} MB.</p>
          <input ref={adjuntoRef} type="file" name="adjunto" accept="image/*,.pdf" className={`${inputClass} py-2`} />
          {desdeVisualizador && (
            <p className="mt-1 text-xs font-semibold text-accent">
              {desdeVisualizador.adjunto
                ? `Adjuntamos el diseño que usaste en el visualizador (${desdeVisualizador.adjunto}).`
                : "Si tienes el archivo de tu diseño, adjúntalo aquí."}
            </p>
          )}
        </label>

        <label className="block">
          <span className={labelClass}>Comentarios adicionales</span>
          <textarea name="comentarios" rows={2} className={inputClass} />
        </label>
      </fieldset>

      <div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-accent py-3.5 text-sm font-bold text-background shadow-lg shadow-accent/20 transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          {status === "loading" ? "Enviando…" : "Solicitar cotización"}
        </button>
        <p className="mt-3 text-center text-xs text-foreground/50">
          Te respondemos dentro de 24 horas hábiles. Tu información se usa solo para cotizar tu proyecto.
        </p>
        {error && <p className="mt-2 text-center text-sm font-semibold text-red-600">{error}</p>}
      </div>
    </form>
  );
}
