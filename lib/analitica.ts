// Eventos de GA4 del sitio (catálogo completo, 2026-10-26). Todo pasa por
// registrarEvento → gtag → window.dataLayer. Si gtag no está cargado (staging,
// local, la persona rechazó cookies, bloqueador) no hace nada: la medición
// nunca debe romper un flujo.
//
// Regla: NUNCA mandar datos personales (nombre, correo, teléfono, ni el texto
// libre del formulario). Solo categorías, flags y textos del propio sitio.
//
// | Evento               | Cuándo                                   | Parámetros                                        |
// |----------------------|------------------------------------------|---------------------------------------------------|
// | generate_lead ★      | formulario de contacto enviado OK         | form_name, origen, tiene_adjunto, tiene_medidas, tiene_lugar |
// | contact_form_start   | primer campo tocado del formulario       | form_name, origen                                 |
// | contact_form_error   | el envío falla                           | form_name, motivo (archivo_grande/servidor/red)   |
// | whatsapp_click ★     | clic en cualquier link a WhatsApp        | ubicacion, texto                                  |
// | phone_click ★        | clic en un tel:                          | ubicacion                                         |
// | email_click ★        | clic en un mailto:                       | ubicacion                                         |
// | social_click         | clic a Instagram/Facebook/LinkedIn       | red, ubicacion                                    |
// | cta_click            | clic en un link a /contacto (botones, nav) | texto, ubicacion                                |
// | project_filter       | elige categoría en /proyectos            | categoria                                         |
// | project_view         | abre un proyecto (lightbox)              | cliente, trabajo, categoria                       |
// | privacy_request      | solicitud ARCO enviada                   | tipo                                              |
// | visualizer_product_select | elige soporte en /visualizador      | producto, categoria                               |
// | visualizer_upload    | sube un diseño al visualizador           | producto, formato, vectorial                      |
// | visualizer_upload_error | el diseño no se pudo usar             | producto, motivo (formato/lectura)                |
// | visualizer_download  | guarda el PNG de la vista 3D             | producto                                          |
// | visualizer_quote     | "Cotizar" desde el visualizador          | producto, con_diseno, calidad, ancho_cm, alto_cm  |
//   (el lead que sigue llega como generate_lead con origen=visualizador)
// ★ = marcar como "evento clave" (conversión) en GA4.
//
// Los clics (whatsapp/phone/email/social/cta) se miden con un solo listener
// global (components/viewone/MedicionClics.tsx), así cualquier botón nuevo
// que se agregue desde el panel queda medido sin tocar código.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function registrarEvento(nombre: string, params?: Record<string, string | number | boolean | undefined>) {
  try {
    window.gtag?.("event", nombre, params);
  } catch {
    // sin medición, sin problema
  }
}
