# Breaking Barriers at Work · mapa para Claude

Sitio estático de Flor Persico (She Breaks Limits). Sin build, sin tests, sin
dependencias: HTML, CSS y JS a mano, publicado tal cual (GitHub Pages, `.nojekyll`).
Respondé en castellano rioplatense, corto y al grano.

## Dónde está cada cosa

- `BBatW_landing.html` — landing principal.
- `at-work/index.html` — página del programa AT WORK (~1200 líneas).
- `at-work/guia-fuente.html` — guía de fuentes/estilo.
- `coach/index.html` — página de las alumnas para abrir los coaches.
- `rutina/` — app instalable (PWA): `index.html`, `sw.js`, `manifest.webmanifest`, íconos.
- `.claude/skills/meta-ads/` y `.claude/agents/meta-ads.md` — agente de Meta Ads.
  Solo leelo cuando la tarea sea de anuncios.

## Ahorro de tokens (importante)

- **No leas `rutina/index.html` entero.** Pesa ~310 KB: las líneas 15–17 son fuentes
  en base64 (~155 KB de basura para vos). Buscá con Grep y leé solo el rango que
  necesitás con `offset`/`limit`, siempre salteando esas líneas.
- `at-work/index.html` también es largo: Grep primero, después leé el tramo.
- No abras los binarios (`*.pdf`, `*.png`, `*.webp`) salvo que la tarea sea sobre ellos.
- No explores el repo "por las dudas": este mapa ya dice dónde está todo.
- Para cambios chicos, editá directo; no hace falta plan ni subagentes.
- No hay nada que compilar ni testear: no busques `package.json` ni corras instaladores.
