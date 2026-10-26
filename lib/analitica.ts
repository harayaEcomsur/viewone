// Evento de GA4 desde el cliente. Si gtag no está cargado (staging, local,
// bloqueador de anuncios) no hace nada: la medición nunca debe romper un flujo.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function registrarEvento(nombre: string, params?: Record<string, unknown>) {
  try {
    window.gtag?.("event", nombre, params);
  } catch {
    // sin medición, sin problema
  }
}
