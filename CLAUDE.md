# Breaking Barriers at Work · mapa para Claude

Sitio estático de Flor Persico (She Breaks Limits). Sin build, sin tests, sin
dependencias: HTML, CSS y JS a mano, publicado tal cual (GitHub Pages, `.nojekyll`).
Respondé en castellano rioplatense, corto y al grano.

## Dónde está cada cosa

- `BBatW_landing.html` — landing principal.
- `at-work/index.html` — página del programa AT WORK (~1200 líneas).
- `at-work/guia-fuente.html` — guía de fuentes/estilo.
- `coach/index.html` — página de las alumnas para abrir los coaches.
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
