# Breaking Barriers at Work · mapa para Claude

Sitio estático de Flor Persico (She Breaks Limits). Sin build, sin tests, sin
dependencias: HTML, CSS y JS a mano, publicado tal cual (GitHub Pages, `.nojekyll`).
Respondé en castellano rioplatense, corto y al grano.

## Dónde está cada cosa

- `BBatW_landing.html` — landing principal.
- `at-work/index.html` — página del programa AT WORK (~1200 líneas).
- `at-work/guia-fuente.html` — guía de fuentes/estilo.
- `coach/index.html` — página de las alumnas para abrir los coaches.
- `app/` — app de alumnas con login (Supabase): `index.html`, `app.js` (vistas), `datos.js`
  (capa de datos real + demo), `programa.js` (módulos, clases, coaches), `config.js`, `LEEME.md`.
- `supabase/` — `schema.sql` (tablas + RLS) y `functions/flor-ai/` (Flor AI, coaches,
  invitaciones y borradores; `prompts.ts` tiene las instrucciones).
- `rutina/` — app instalable (PWA): `index.html`, `sw.js`, `manifest.webmanifest`, íconos, `fonts/`.
- `.claude/skills/meta-ads/` y `.claude/agents/meta-ads.md` — agente de Meta Ads.
  Solo leelo cuando la tarea sea de anuncios.

## Ahorro de tokens (importante)

- `rutina/index.html` (~3300 líneas) y `at-work/index.html` (~1200) son largos:
  Grep primero, después leé solo el tramo con `offset`/`limit`.
- Las tipografías de la app viven en `rutina/fonts/`; nunca las vuelvas a meter en
  base64 dentro del HTML. Si agregás un archivo a `rutina/`, sumalo a `SHELL` en
  `sw.js` y subí la versión de `CACHE`.
- No abras los binarios (`*.pdf`, `*.png`, `*.webp`) salvo que la tarea sea sobre ellos.
- No explores el repo "por las dudas": este mapa ya dice dónde está todo.
- Para cambios chicos, editá directo; no hace falta plan ni subagentes.
- No hay nada que compilar ni testear: no busques `package.json` ni corras instaladores.

## Links de pago (Stripe, fijos desde el 03/11/2026)

Uno por formato; sirven para alumnas nuevas y renovaciones. Cuando Flor pida el link
de pago de una alumna: dale el de su formato, con el mensaje listo para mandarle, y si
la sesión tiene Gmail, mandáselo también por mail a Flor (solo a ella). Nunca a la alumna.

- AT WORK 1:1 · 1 clase semanal · USD 250/mes → https://buy.stripe.com/cNibJ24Bz1WherT5868k81r
- AT WORK 1:1 · 2 clases semanales · USD 444/mes → https://buy.stripe.com/9B6aEY4BzcAV2Jb2ZY8k81s
- AT WORK Lab · USD 250/mes → https://buy.stripe.com/fZu4gA6JHgRb97z1VU8k81t
- Acuerdo de trabajo (va junto con el link, el de su formato):
  1:1 → https://drive.google.com/file/d/14wEuM4_nw0zIB8cpnlDmB2lzF_GWUGoV/view
  Lab → https://drive.google.com/file/d/12q-RaEci4v46SfhKC5tLKAJrhTEfBNXX/view

