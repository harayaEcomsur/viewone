"use client";

import { useState } from "react";

// Login con correo + contraseña (ver app/api/auth/password/route.ts). Primero
// pide solo el correo; si es el primer acceso de esa persona, le pide crear
// su contraseña (con confirmación), si no, la contraseña de siempre.
type Paso = "email" | "login" | "setup";

const inputClass =
  "w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function PasswordLoginForm({ endpoint = "/api/auth/password" }: { endpoint?: string }) {
  const [paso, setPaso] = useState<Paso>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(body: Record<string, string>) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, data };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (paso === "setup") {
      if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
      if (password !== confirmacion) return setError("Las contraseñas no coinciden.");
    }
    setLoading(true);
    try {
      if (paso === "email") {
        const { ok, data } = await post({ step: "check", email });
        if (!ok) return setError(data?.error ?? "No se pudo continuar.");
        setPaso(data?.status === "setup" ? "setup" : "login");
        return;
      }
      const { ok, data } = await post({ step: paso, email, password });
      if (ok) {
        window.location.href = window.location.pathname;
        return;
      }
      setError(data?.error ?? "No se pudo ingresar.");
    } catch {
      setError("No se pudo contactar al servidor.");
    } finally {
      setLoading(false);
    }
  }

  function volver() {
    setPaso("email");
    setPassword("");
    setConfirmacion("");
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 text-left">
      <input
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        readOnly={paso !== "email"}
        placeholder="tu@correo.cl"
        className={`${inputClass} ${paso !== "email" ? "bg-foreground/5 text-foreground/60" : ""}`}
      />
      {paso === "setup" && (
        <p className="text-xs text-foreground/60">Es tu primer acceso: crea una contraseña (mínimo 8 caracteres).</p>
      )}
      {paso !== "email" && (
        <input
          type="password"
          autoComplete={paso === "setup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={paso === "setup" ? "Nueva contraseña" : "Contraseña"}
          autoFocus
          className={inputClass}
        />
      )}
      {paso === "setup" && (
        <input
          type="password"
          autoComplete="new-password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          placeholder="Repite la contraseña"
          className={inputClass}
        />
      )}
      <button
        type="submit"
        disabled={loading || !email || (paso !== "email" && !password)}
        className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "…" : paso === "email" ? "Continuar" : paso === "setup" ? "Crear contraseña y entrar" : "Entrar"}
      </button>
      {paso !== "email" && (
        <button type="button" onClick={volver} className="text-xs text-foreground/50 hover:underline">
          Usar otro correo
        </button>
      )}
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </form>
  );
}
