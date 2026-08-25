# Content OS · AT WORK

La app que dice qué se publica hoy, con el caption, las láminas y las historias
listas para pegar.

## Cómo se instala en el celular

1. Prender GitHub Pages una sola vez:
   **Settings → Pages → Source: Deploy from a branch → Branch: `claude/ai-builder-weekend-workshop-qy8hpz` → carpeta `/ (root)` → Save.**
2. Esperar un par de minutos y abrir en el celular:
   `https://florenciapersico-ctrl.github.io/brakingbarriersatwork/contenido/`
3. iPhone: compartir → **Agregar a inicio**.
   Android: los tres puntitos → **Instalar aplicación**.

Queda como cualquier otra app: ícono propio, pantalla completa, sin barra de
navegador, y abre sin internet.

## Qué hay acá

| Archivo | Qué es |
|---|---|
| `index.html` | La app entera, con el contenido adentro. No depende de nada externo. |
| `manifest.webmanifest` | Lo que la hace instalable |
| `sw.js` | Cache, para que abra sin internet |
| `memoria-editorial.json` | Todo lo ya publicado y planificado, para no repetir |
| `insights/library.json` | Insights anonimizados sacados de los transcripts |
| `banco.json` | Ideas de los tres Manuales de Contenido (material crudo) |

## Al publicar contenido nuevo

Hay que subir la versión de `CACHE` en `sw.js` (`contentos-v3` → `contentos-v4`).
Si no, el celular sigue mostrando la app vieja.

El criterio completo está en `.claude/skills/contenido/SKILL.md`.
Las fuentes, en `config/content_sources.yaml`.
