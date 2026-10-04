"use client";

import { useState } from "react";

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
      setStatus("ok");
      form.reset();
    } catch {
      setError("No se pudo contactar al servidor. Revisa tu conexión e intenta de nuevo.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <p className="font-heading text-lg font-bold text-foreground">¡Listo! Recibimos tu solicitud.</p>
        <p className="mt-2 text-sm text-foreground/60">Te contactaremos a la brevedad para cotizar tu proyecto.</p>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-foreground/15 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary";
  const labelClass = "text-xs font-bold uppercase tracking-wide text-foreground/50";
  const groupLabelClass = "text-xs font-bold uppercase tracking-[0.2em] text-primary";

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
          <textarea name="necesidad" required rows={4} className={inputClass} />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Medidas aproximadas (si conoce)</span>
            <input name="medidas" className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Lugar de uso/instalación</span>
            <input name="lugar" className={inputClass} />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Adjuntar foto/diseño/referencia</span>
          <p className="mt-1 text-xs text-foreground/50">Opcional. Imagen o PDF, máx. {MAX_ADJUNTO_MB} MB.</p>
          <input type="file" name="adjunto" accept="image/*,.pdf" className={`${inputClass} py-2`} />
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
          className="w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-background transition-transform hover:scale-[1.01] disabled:opacity-50"
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
