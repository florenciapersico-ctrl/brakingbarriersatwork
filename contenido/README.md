# Content OS

El mes de contenido de Instagram, armado con criterio propio y listo para publicar.

**Se usa desde el celular:** abrir la URL de GitHub Pages, compartir → "Agregar a
pantalla de inicio". Queda como una app y funciona sin internet.

## Qué hace

- Arma el mes entero: 4 piezas por semana, con tipo, subtipo, formato, copy y brief
  de diseño.
- Cada día dice cuál toca, y qué quedó sin publicar.
- Nunca repite una idea.
- El copy está listo para pegar en Instagram; el brief de diseño listo para pegar en Canva.

## Qué hay acá

| Archivo | Qué es |
|---|---|
| `index.html` | La app entera: interfaz y generador |
| `banco.json` | 248 ideas de los tres Manuales de Contenido de Flor |
| `canva.json` | Links de diseños ya hechos, por fecha (opcional) |
| `sw.js` | Cache para que ande sin internet |

## Importante

Al editar `banco.json` hay que subir la versión de `CACHE` en `sw.js`, si no el
celular sigue mostrando el banco viejo.

El criterio real está en `.claude/skills/contenido/SKILL.md`. La app que usa Flor en el celular es el artifact, no este `index.html` — este quedó con el criterio viejo.
`.claude/skills/contenido/SKILL.md`.
