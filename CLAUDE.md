# ViewOne — contexto del pase de fidelidad visual

Este repo es del cliente real **ViewOne** (impresión digital y publicidad
exterior B2B, Chile), propio y aislado (nunca un branch de `harayadev`, ver
la regla de proyecto-vs-demo en la memoria de `harayadev`). Este archivo
documenta un pase largo de fidelidad visual contra una imagen de
referencia que el cliente mandó, para que cualquier sesión de Claude que
retome este proyecto entienda el porqué de las decisiones, no solo el qué.

**El README.md de este repo es el del motor genérico (starter-kit) del que
se forkeó** — arquitectura config-driven, fábrica de demos, módulos
tienda/agenda/propiedades, etc. Nada de eso aplica a ViewOne en la
práctica: este archivo es el que sí describe lo que ViewOne REALMENTE usa.

## La imagen de referencia

El cliente mandó un mockup de 900×1600px (guardado originalmente en
`/Users/bctecnologia/.claude/uploads/.../ab27673f-image.jpg` — si una
sesión nueva la necesita y ya no está ahí, pedírsela de nuevo al usuario).
Todo este pase fue, literalmente, "que el sitio real se vea igual a esta
imagen" — colores exactos, tipografía, composición, espaciado, logos de
clientes. El pedido explícito fue **"lo mas fiel posible... pixel
perfect"**.

Páginas que SÍ están cubiertas por la referencia: Home completo (hero,
servicios, "+20 años", proyectos destacados, nosotros, clientes, cierre,
footer) y el header. El resto del sitio (`/servicios`, `/proyectos`,
`/contacto`, `/privacidad`, 404) no tiene su propia imagen de referencia
— se les aplicó el MISMO lenguaje visual que terminó de afinarse en el
Home (ver "Qué se emuló en el resto del sitio" abajo), no una fidelidad
pixel a pixel porque no hay contra qué comparar.

## Páginas reales de ViewOne vs. motor genérico heredado

ViewOne usa páginas a medida, no el motor genérico config-driven: la
arquitectura del handoff del cliente no calzaba con `HomeContent.tsx`
genérico (5 servicios en bloques alternados, no cards; `/proyectos` es un
catálogo filtrable con lightbox). Páginas reales:

- `/` → `components/viewone/ViewOneHome.tsx`
- `/servicios` → `app/servicios/page.tsx`
- `/proyectos` → `components/viewone/ProyectosClient.tsx`
- `/contacto` → `components/viewone/ContactoForm.tsx`
- `/privacidad` → política de privacidad + formulario ARCO
- `ViewOneHeader.tsx` / `ViewOneFooter.tsx` — compartidos por todas

Rutas como `/tienda`, `/agenda`, `/propiedades`, `/inmobiliaria`,
`/proveedores`, `/viewone-admin` (y sus componentes genéricos:
`components/sections/*`, `components/agenda/*`, `components/store/*`)
siguen existiendo porque son parte del motor compartido, pero **ViewOne no
las usa ni las linkea desde ningún lado** — son código muerto heredado
del fork, no "el sitio". No tocarlas al hacer pases de diseño: no son
parte de lo que el cliente ve. `components/viewone/AdminViewOne.tsx` (el
panel interno en `/viewone-admin`) sí es específico de ViewOne, pero es
una herramienta interna del negocio, no cara al público — quedó
deliberadamente fuera de este pase de fidelidad visual.

## Decisiones de diseño clave (y el porqué)

### Colores: `primary` para superficies grandes, `accent` para todo lo interactivo

- `primary` (`#0A2F57`, azul marino) — barras oscuras grandes: la franja
  superior del header, el overlay del hero, el fondo de la banda "Cierre"
  (Cuéntanos qué necesitas), y el color de máscara de los logos de
  clientes (ver abajo). Confirmado por muestreo de píxeles directo sobre
  la imagen de referencia.
- `accent` (`#1668E3`, azul vívido) — TODO lo interactivo: links, botones,
  eyebrows, íconos, focus states, la línea activa del nav. Antes muchos de
  estos usaban `primary` por error (quedaban apagados/oscuros comparado
  con la referencia, que los muestra en un azul notablemente más claro y
  saturado — confirmado muestreando el botón "Cotiza tu proyecto":
  rgb(16,102,228)).
- **Regla para cualquier botón/link/ícono nuevo**: `bg-accent`/`text-accent`,
  nunca `bg-primary`/`text-primary`. Los botones primarios llevan además
  `shadow-lg shadow-accent/20` (firma visual consistente en hero, Cierre,
  Nosotros, 404, formularios) — replicarla en cualquier CTA nuevo.
- Excepción intencional: el wordmark "View"+"One" del header/footer usa
  `primary` para "View" y `accent` para "One" — ese split de dos tonos
  calza con la referencia, no es un error a corregir.

### Espaciado: escala más ajustada que el default del motor

Medí la altura real de cada sección del Home (`getBoundingClientRect`)
contra la altura implícita de la misma sección en la imagen de referencia
(escalada al mismo ancho de viewport) — varias secciones estaban 30-140%
más altas que en la imagen. Patrón general aplicado en todo el sitio real
de ViewOne: `py-20 sm:py-28`+ pasó a `py-14 sm:py-16` (secciones de
contenido) o `py-10 sm:py-12` (secciones angostas tipo franjas de logos);
`mt-10` antes de grids pasó a `mt-8`. El peor caso fue "Nosotros": la foto
tenía `aspect-[4/3]` cuando la referencia es panorámica (`aspect-[5/2]`)
— ESA era la causa real del exceso de alto, no el padding.

### Logos de clientes: técnica mask-image, no grayscale+opacity

Ver `components/viewone/ClienteLogoMark.tsx` (comentario completo ahí).
Resumen: la referencia recolorea TODOS los logos de clientes (los 8
"destacados" arriba Y los del carrusel de abajo) a un solo tono navy
sólido, a opacidad plena — no es un grayscale neutro ni translúcido como
se implementó al principio. La única técnica que logra eso para un logo
arbitrario sin importar sus colores originales es `mask-image` (usa el
alfa/silueta del archivo como máscara, rellena con `bg-primary`), con
`mask-mode: "alpha"` **explícito** — sin eso, Chrome resuelve mal
"match-source" para archivos rasterizados (vs. SVG) y se ve un recuadro
sólido en vez de la silueta. En hover se revela el color real de cada
marca (cross-fade con un `<img>` debajo) — affordance que la imagen
estática no muestra pero es gratis de agregar.

**Bug recurrente a vigilar**: varios logos descargados de internet llegan
como PNG/JPG completamente OPACOS con fondo blanco o gris claro (no
transparente) — contra la técnica de máscara, eso se ve como un recuadro
de color sólido sobre el logo. Pasó con BICE, Aconcagua (antes del
rebranding) y Salfa. Fix: reprocesar con PIL, alfa = `(255 - luminancia) *
factor`, preservando el color original. Siempre verificar
`Image.open(path).mode == 'RGBA'` y que la esquina tenga alfa≈0 antes de
usar un logo rasterizado nuevo.

### Imágenes: optimización propia, nunca la de Vercel

`next.config.mjs` tiene `images.unoptimized: true` — ver memoria
`image-optimization-own-side-not-vercel` en harayadev para el porqué
completo (evitar el costo facturable del Image Optimization de Vercel).
Esto significa que **cualquier foto nueva que se agregue a
`public/clients/viewone/` debe pre-optimizarse a mano** antes de subirla:
redimensionar al tamaño real en que se muestra (fotos de tarjeta ~1000px
de ancho máx., hero/banda ancha ~1800px, calidad JPEG 75-80 con PIL
`quality=` + `optimize=True`) — Next ya NO lo hace por el navegador.

## La lista de 20/36 clientes: cómo se llegó hasta acá

Esta parte tuvo varias vueltas, documentadas en los commits de
`lib/viewone-data.ts` — resumen para no repetir la arqueología:

1. **Primer pase**: 20 clientes del handoff, logos placeholder recortados
   directo de la imagen de referencia (borrosos a propósito).
2. **Segundo pase**: reemplazo por logos oficiales reales buscados en
   internet, uno por uno, verificando SIEMPRE visualmente antes de usar
   (ver gotchas abajo).
3. **Hallazgo importante**: dos de los 20 nombres del roster real de
   ViewOne ("Andacor / El Colorado", "Anasac") no aparecían en la imagen
   de referencia — mostraba "Agrosuper" y "Falabella" en esas 2
   posiciones en su lugar. Regla final, pedida explícitamente por el
   cliente: **si un nombre no está en la imagen, no se muestra en esta
   sección** (ni como logo ni como texto) — así que se sacaron los 2
   viejos y se agregaron Agrosuper/Falabella con logo real, llegando a
   20/20 con logo real, cero texto placeholder.
4. **Se descubrió un sitio Wix sin publicar** del cliente
   (`ctrlroom7.wixstudio.com/my-site-5` → sección "Nuestros Clientes") —
   una versión vieja/nunca lanzada que tiene el roster real completo de
   ViewOne, más amplio que los 20 de la imagen. Usado SOLO para identificar
   qué otras empresas son clientes reales — nunca se reusaron sus archivos
   de logo directamente (pedido explícito: **"deja los logos actuales, no
   ocupes logos antiguos"** — los logos de ese sitio podían estar
   desactualizados).
5. **Pase final**: se agregaron 16 clientes reales más (de los ~19
   identificados en el Wix), cada uno con su logo buscado de nuevo en el
   sitio oficial VIGENTE de la marca (nunca el archivo del Wix). 3 no se
   agregaron por falta de un asset real usable (Patio Bellavista con sitio
   caído, Deportes Zapallar y Municipalidad de Zapallar sin logo legible
   disponible) — se prefirió dejarlos fuera a inventar o usar un logo de
   mala calidad.

**Total actual: 36 clientes**, todos con logo real verificado. El
carrusel (`components/viewone/ClientesMarquee.tsx`) pagina de a 20 (2
filas de 10, como la referencia) — con flechas prev/next que solo
aparecen si hay más de 20 (con 36 sí aparecen).

### Gotchas de sourcing de logos (para no repetir el error)

- **Verificar SIEMPRE que el dominio es de la empresa correcta**, no
  asumir por el nombre. Pasó dos veces en este proyecto:
  - `Bice-logo.svg` en Wikimedia Commons resultó ser un banco ARGENTINO
    homónimo, no el Banco BICE chileno real.
  - `claro.cl` resultó ser "Claro y Cía.", un estudio jurídico chileno sin
    relación con la telecom — el dominio real de Claro Chile es
    `clarochile.cl`.
- **Los logos de un sitio suelen tener una variante blanca** (pensada para
  fondos oscuros/de color de marca) que es invisible sobre el fondo claro
  del sitio. Con la técnica mask-image esto en realidad NO IMPORTA (el
  color original da igual, solo la silueta) — pero si en algún momento se
  vuelve a usar `<img>` + `grayscale` en vez de la máscara, sí importa y
  hay que buscar la variante de color (pasó con Derco, SuperZoo, Claro).
- Para encontrar el asset real en el sitio oficial de una marca: navegar
  con el browser real (`mcp__claude-in-chrome__*`, no `curl` directo —
  muchos sitios bloquean bots con 403, o el HTML referencia una ruta que
  resuelve distinto tras JS/redirects) y correr en consola:
  ```js
  Array.from(document.querySelectorAll('img')).map(i => ({src:i.src, alt:i.alt})).filter(i => /logo/i.test(i.src) || /logo/i.test(i.alt))
  ```
  Si no aparece nada, buscar `background-image` por CSS computado en el
  elemento visible del logo (`getComputedStyle(el).backgroundImage`).

## Qué se emuló en el resto del sitio (sin imagen de referencia propia)

- Mismo header/footer (componentes compartidos — se actualizan solos).
- Misma escala de espaciado ajustada (`py-14 sm:py-16` en vez del
  `py-16 sm:py-24` que traía el motor genérico).
- Mismo `accent` para todo botón/link/eyebrow, con el `shadow-lg
  shadow-accent/20` en botones primarios.
- `/privacidad` usaba el `Header`/`Footer` GENÉRICOS del motor (logo
  placeholder circular, sin footer siquiera) en vez de
  `ViewOneHeader`/`ViewOneFooter` — se corrigió para que no quedara
  visualmente desconectada del resto del sitio real.

## Verificación estándar antes de dar por cerrado un cambio

Patrón usado en todo este pase, repetirlo para cualquier cambio futuro:

1. `npx tsc --noEmit` (limpio).
2. `rm -rf .next && npm run build` (sin errores).
3. Verificación visual real en el navegador (`mcp__claude-in-chrome__*`,
   `npm run dev -- -p 3914` o similar) — nunca dar por buena una captura
   mental, siempre mirar el render real, hacer zoom a los detalles chicos
   (los bugs de logo-con-recuadro-gris y el ícono-sólido-sin-wordmark de
   Claro solo se vieron haciendo zoom).
4. `git add -A`, commit descriptivo en español explicando el PORQUÉ (no
   solo el qué — los mensajes de commit de este repo son la bitácora real
   de decisiones, leerlos con `git log` antes de asumir algo), push a la
   rama que corresponda según "Ambientes" abajo (repo propio, sin PR).
5. Confirmar el deploy de Vercel llega a **Ready** antes de reportar
   terminado — usar el MCP de Vercel (`list_deployments`, con `branch`
   o `target: "production"`) para el id del último deploy, luego `vercel
   inspect <id> --wait` (por Bash o envuelto en el tool `Monitor`) para
   esperar el resultado real, nunca asumir que el build local = producción.

## Ambientes: prueba → aprobación → producción (desde 2026-10-24)

`www.viewone.cl` ya es el dominio real (DNS en Vercel; el correo
@viewone.cl es Google Workspace — los registros MX/SPF viven en el DNS de
Vercel, no borrarlos). Por eso los cambios ya NO van directo a `master`:

- **`prueba`** → `viewone-prueba.vercel.app`. Todo cambio para el sitio va
  primero acá. ViewOne lo revisa y aprueba.
- **`master`** → producción (`www.viewone.cl`). Solo se actualiza haciendo
  merge de `prueba` (o del cambio ya aprobado) cuando hay aprobación
  explícita. Excepción: arreglos urgentes de producción, avisando.
- **`demo/<idea>`** → ideas y desarrollos para mostrar. Vercel da un link
  propio por rama (`viewone-git-demo-<idea>-harayaecomsurs-projects.vercel.app`).
  Si la idea se aprueba, se mergea a `prueba`; si no, la rama queda ahí.

Qué está separado de producción (variables "Preview" en Vercel, comparten
prueba y demos):

- `DATABASE_URL`: base `viewone_prueba`, en el mismo proyecto/servidor
  Neon que producción (`neondb`), creada el 2026-10-24 como copia completa
  de producción (esquema + contenido + usuarios del panel). No se
  resincroniza sola: lo que se edita en producción después no aparece en
  prueba. Si alguna vez falta, el preview cae a memoria (`withDb`) —
  funciona pero no guarda nada.
- `SESSION_SECRET`: distinto, una sesión de prueba no sirve en producción.
- `NEXT_PUBLIC_SITE_URL`: `https://viewone-prueba.vercel.app`.
- `CONTACTO_CORREO_PRUEBA`: el formulario de contacto va a ese correo con
  "[PRUEBA]" en el asunto, nunca a ventas@viewone.cl.
- `robots.ts` bloquea la indexación fuera de producción.
- Lo que SÍ se comparte: el Blob store (las fotos que se suben desde prueba
  se agregan con nombre único y el código nunca borra blobs, así que no
  pisan las de producción) y `RESEND_API_KEY`. Los crons de `vercel.json`
  solo corren en producción.
