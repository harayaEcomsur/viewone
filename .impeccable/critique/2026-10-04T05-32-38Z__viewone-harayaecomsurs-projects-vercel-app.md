---
target: viewone.cl sitewide (Home/Servicios/Proyectos/Contacto)
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "url:https://viewone-harayaecomsurs-projects.vercel.app/"
timestamp: 2026-10-04T05-32-38Z
slug: viewone-harayaecomsurs-projects-vercel-app
---
Method: dual-agent (A: design-review sub-agent · B: detector/browser-evidence sub-agent)

## Design Health Score

Heuristics 7 (Flexibility/Efficiency) and 10 (Help/Documentation) scored `n/a` — this is a Persuade-mode B2B marketing site, not a tool.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Form has loading/success/error states; no active-page indicator in nav |
| 2 | Match System / Real World | 4 | Plain Spanish, jargon explicitly de-risked for a non-technical procurement buyer |
| 3 | User Control and Freedom | 3 | Lightbox Esc/arrows/click-outside work; category back-link works |
| 4 | Consistency and Standards | 3 | CTA verbs vary slightly; accent color reserved consistently for the hero only |
| 5 | Error Prevention | 2 | Only native `required`; no inline validation, no file-size/type guidance |
| 6 | Recognition Rather Than Recall | 3 | Text-labeled nav; no persistent "where am I" cue |
| 8 | Aesthetic and Minimalist Design | 3 | Clean grids, but a duplicated client-list section adds noise |
| 9 | Error Recovery | 2 | Generic "No se pudo enviar..." — no specifics, no preserved guidance |
| **Total** | | **23/32 (71.9%)** | **Good** |

## Design Specificity Verdict

**Design-review assessment**: Mixed. The *content* is genuinely specific — real project photography (Havas Group, Koyam, LarrainVial, Andacor), a real B2B client roster (Coca-Cola, BCI, Peugeot, Mazda, Santander, CCU, Entel...), and copy written directly to a non-technical procurement buyer ("No es necesario que conozcas el material o nombre técnico"). The Archivo+Inter pairing and the disciplined blue (#0034A1) / gold (#F2A900) palette reads geometric and industrial, not generic SaaS. But the *shell* is template-interchangeable — hero-photo-with-gradient-and-two-CTAs, card grids — and most damaging: client "logos" are plain grey text pills, repeated twice on the home page. That one choice makes an otherwise-specific site look like placeholder content at its most trust-critical moment.

**Deterministic scan**: Clean. `impeccable detect --json` ran against 59 source files in `app/` and `components/viewone/` and returned zero rule violations — a genuine clean scan, not a skip. No raw JS console errors on any of the 4 pages either (only unrelated browser-extension noise). This confirms the site's problems are design/content-judgment issues, not mechanical code defects.

**Visual overlays**: Not available this run. The live-server that serves the detector overlay script runs on plain HTTP (`localhost:8400`); the production site is HTTPS, so the browser blocked the script as mixed content on all 4 pages (confirmed via network-request tracking showing zero fetch attempts, not assumed). Page-mutation capability itself was independently confirmed working on every page, so this is a tooling/protocol limitation specific to auditing a remote HTTPS deployment, not a finding about the site.

## Overall Impression

The bones are good — real content, a real palette, no technical defects. The gap between "good" and "genuinely persuasive" is concentrated in two spots: the client-logo treatment (the single highest-leverage trust signal on the page, currently wasted) and the contact form (the one moment a prospect commits budget, currently the coldest part of the site). Fix those two and this moves from 23/32 into the low 30s.

## What's Working

1. The lightbox's "Quiero algo similar" WhatsApp CTA carries the specific project's client/material context straight into the prefilled message — turns passive browsing into a warm, pre-qualified lead.
2. The contact form's copy explicitly lowers the technical-fluency bar for the actual buyer persona (marketing/procurement, not fabricators) — "no necesitas saber el nombre técnico del material."
3. The palette and Archivo weight give real brand specificity against the real logo, instead of falling back to a generic navy-SaaS default.

## Priority Issues

**[P1] Client logos rendered as plain grey text pills, duplicated twice on Home**
Why it matters: recognizing Coca-Cola, BCI, Peugeot by name is the single biggest trust lever this site has, and a grey text box reads as unfinished placeholder content — it undersells real clients.
Fix: real grayscale logo lockups (even a simple wordmark-style SVG per brand beats a text pill); collapse the two client sections (destacados + completo) into one.
Suggested command: `$impeccable polish`

**[P1] Contact form is cognitive overload at the highest-stakes moment**
Why it matters: 8 fields shown simultaneously with no grouping, no progressive disclosure, no reassurance copy (no response-time promise, nothing about the file upload), and a generic failure message. This is exactly the moment a buyer is most anxious about committing budget, and it's the coldest part of the site.
Fix: group into "tus datos" vs "detalle del proyecto," add inline validation and a response-time/privacy microcopy line, make the error message specific.
Suggested command: `$impeccable clarify`

**[P2] No active-page indicator in navigation**
Why it matters: no persistent "where am I" cue, most noticeable on the long /servicios scroll.
Fix: underline or weight change on the current route in `ViewOneHeader.tsx`.
Suggested command: `$impeccable polish`

**[P2] Home page section fatigue — 8 stacked same-weight sections**
Why it matters: hero → clientes → servicios → badge → proyectos → nosotros → clientes (again) → cierre, differentiated only by background tint, causes scroll fatigue and duplicates the client list.
Fix: merge the two clientes sections, vary visual treatment beyond background color, consider folding the "Más de 20 años" badge band into Nosotros (it currently reads as an orphaned thin section).
Suggested command: `$impeccable distill`

**[P3] Project images show a visible delayed-paint moment on /proyectos**
Why it matters: confirmed via instrumentation that a card's `<img>` was `complete:true` yet still showed a gray gradient in an earlier frame before repainting with the real photo ~2s later — reads as a glitch even though nothing is actually broken.
Fix: add a blur/skeleton placeholder (`placeholder="blur"` or a shimmer) so the transition never shows a bare gradient.
Suggested command: `$impeccable polish`

## Persona Red Flags

**Jordan (first-time procurement buyer)**: "Medidas aproximadas" and "Lugar de uso/instalación" fields give no example format to anchor what's expected. The only phone number lives in the header's top bar, which disappears on scroll — exactly when Jordan, mid-form, might want to bail out to a phone call instead of finishing the form.

**Riley (stress tester)**: the file input (`accept="image/*,.pdf"`) gives no size-limit messaging up front; a failed large upload only surfaces the generic "no se pudo enviar" error with zero diagnosis. Separately, `ProyectosClient.tsx` silently drops any category with no visible project (`if (!cover) return null`) — a category can vanish from the public page with no "próximamente" signal if the admin panel's content for it gets hidden or deleted.

**Casey (mobile, one-handed, distracted)**: the `telefono` input has no `type="tel"` / `autoComplete`, so mobile keyboards won't default to the numeric pad. The header's tap-to-call affordance hides after ~8px of scroll with nothing replacing it — there's no persistent floating WhatsApp/call button, despite WhatsApp being the de facto CTA channel in the header, hero, and lightbox everywhere else.

## Minor Observations

- Footer is bare — name, copyright, socials only; a missed final trust/contact touch.
- `modules.whatsappButton: false` in `client.config.ts` is inconsistent with WhatsApp being the primary conversion mechanism used everywhere else on the site.
- The "Más de 20 años" badge band between Servicios and Proyectos is a thin, orphaned section.

## Questions to Consider

- If Coca-Cola, BCI, and Peugeot are real clients, why are they shown as grey text boxes instead of their logos?
- The contact form is the one moment a prospect commits real budget — does it currently feel as confident as the rest of the site, or like homework?
- WhatsApp is the de facto contact channel in every CTA on the site — why isn't it a persistent floating affordance?

## Run Notes

- Target slug: `viewone-harayaecomsurs-projects-vercel-app` — resolved cleanly.
- Ignore list: none present, nothing dropped.
- Assessment independence: both ran as isolated parallel sub-agents, no shared context.
- CLI detector: ran clean, 0 findings across 59 files.
- Browser visibility: confirmed on all 4 pages (desktop 1440px); mobile viewport screenshots were not captured live — mobile/Casey findings are grounded in source-level responsive classes and attribute inspection, not a live 390px render.
- Overlay injection: unavailable on all 4 pages (HTTP overlay script blocked by HTTPS page — mixed content), confirmed via network-request tracking, not assumed; page-mutation capability itself was independently confirmed working.
- Live-server cleanup: confirmed stopped (process killed, port verified closed).
- Tab cleanup: confirmed, no tabs left open.
