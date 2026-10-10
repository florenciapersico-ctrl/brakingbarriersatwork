---
name: carrusel
description: Carruseles de Instagram de Flor Pérsico (Breaking Barriers at Work) con su formato fijo de marca — fondo marrón chocolate, serif, destacados en amarillo manteca, numeración 01/07, pinceladas, círculo a mano, botón final — usando siempre fotos reales de Flor. Usalo cada vez que pida un carrusel, slides o láminas para Instagram, un post en formato carrusel, "armame las slides", pase un texto para convertir en carrusel, o pida cambiar/rehacer uno existente.
---

# Carruseles · formato de marca de Flor

Flor aprobó un formato y quiere que **todos** sus carruseles salgan así, cambiando
solo el texto y sus fotos reales. El diseño vive en `motor/render.py`; vos escribís
el contenido y renderizás. No rediseñes nada salvo que ella lo pida explícitamente.

Referencia aprobada: `carruseles/2026-10-camara/` (mirá `contenido.txt` y
`vista-general.png` antes de armar uno nuevo).

## Cómo trabajás

1. **Texto.** Si Flor te da el texto, respetalo: solo corregís ortografía y tipeos y
   lo repartís en láminas. Si te pide que lo escribas vos, escribilo en su voz
   (directa, cercana, frases cortas, historias propias de clase o de cámara).
   - **Siempre español neutro con tú** (sabes, sientes, quieres, puedes). Nada de
     voseo en el carrusel, aunque Flor te hable en rioplatense.
   - Avisale qué corregiste (tipeos, voseo) en una lista corta.
2. **Fotos reales, siempre.** La portada lleva una foto de Flor. Nunca uses fotos de
   stock ni imágenes generadas con IA.
   - Si sube fotos nuevas, copialas a `carruseles/fotos/` con un nombre descriptivo
     (`cafe-notebook.jpg`, `oficina-sonriendo.jpg`).
   - Si no sube ninguna, usá una del banco `carruseles/fotos/` y **variá**: buscá con
     `grep -h "foto:" carruseles/*/contenido.txt` cuáles se usaron últimamente y elegí
     otra. Si todas ya se usaron, decile cuál vas a repetir o pedile una nueva.
   - Si la foto trae texto o marcas encima (capturas de Instagram o Canva), limpiala
     antes: recortá la parte con texto (y usá `foto-alto:`) o tapá la zona con un
     parche del fondo usando PIL. Mirá el resultado en grande.
3. **Carpeta.** Creá `carruseles/AAAA-MM-tema-corto/contenido.txt`.
4. **Renderizá:** `python3 .claude/skills/carrusel/motor/render.py carruseles/<carpeta>`
   Genera `lamina-01.png…` y `vista-general.png`.
5. **Revisá antes de entregar.** Si el script imprime un `AVISO`, arreglalo (acortá
   líneas o dividí la lámina). Después abrí `vista-general.png` y mirá: que nada se
   corte, que la cara de Flor no quede tapada por el título (ajustá `foto-pos:`), que
   pinceladas y círculo caigan bien. Abrí en grande cualquier lámina dudosa.
6. **Entregá** las láminas con SendUserFile (en orden) y hacé commit + push de la
   carpeta y las fotos nuevas en la rama de trabajo.

## Reglas del formato (no las rompas)

- 1080×1440 (3:4). Entre 6 y 10 láminas; 7 es lo habitual.
- Lámina 1: portada con foto, título grande en amarillo (`##`, 2 líneas) y bajada
  en blanco con una palabra clave subrayada con pincelada.
- Láminas intermedias: fondo liso. Una idea por lámina. **Un solo destacado
  amarillo (`#`) por lámina**, como mucho dos. El resto en blanco.
- Recursos, con moderación (uno por lámina): pincelada `[ ]` bajo una palabra o
  frase clave, círculo `#o` para LA frase del carrusel (una vez), barra lateral `-`
  para listas de 2–4 ítems, línea corta `--` para cerrar o separar.
- Última lámina: conclusión con `#+` y botón (`boton:`) con la pregunta o llamada a
  la acción (¿Te pasa?, Escríbeme «INGLÉS», Guárdalo para tu próxima reunión…).
- Cortes de línea a mano: cada línea del archivo es una línea en la lámina. Cortá
  por sentido, ~22–28 caracteres en texto normal y ~20 en destacados. El motor achica
  la lámina si no entra, pero si avisa que achicó mucho, recortá texto.

## Sintaxis de `contenido.txt`

Láminas separadas por una línea `===`. Las líneas que empiezan con `//` se ignoran.

| Escribís | Sale |
|---|---|
| `foto: ../fotos/x.jpg` (primera línea) | lámina con foto de fondo y texto abajo |
| `foto-pos: center 30%` | encuadre de la foto (mové el % para subir/bajar) |
| `foto-alto: 1191` | la foto ocupa solo esos px de arriba (para fotos recortadas) |
| `## texto` | título gigante amarillo (portada) |
| `texto` | texto normal blanco |
| `# texto` | destacado amarillo en negrita |
| `#+ texto` | destacado más grande (conclusión) |
| `#o texto` | destacado dentro de un círculo a mano |
| `~ texto` | texto chico (láminas densas) |
| `- texto` | ítem con barra lateral amarilla |
| `[texto]` | pincelada debajo (dentro de cualquier línea, puede abarcar dos) |
| `--` | línea corta amarilla |
| `boton: texto` | botón amarillo centrado |
| línea vacía / dos líneas vacías | espacio / espacio grande |

Líneas seguidas del mismo tipo forman un bloque. Espacios al inicio de una línea se
respetan (sirve para la sangría de una cita: `#   explicando lo que haces.”`).

## Si Flor quiere cambiar el diseño

Los colores, fuentes y medidas están en `CSS` dentro de `motor/render.py`. Un cambio
ahí afecta a todos los carruseles futuros: confirmá con ella que es un cambio de
formato y no algo de un solo carrusel, y después volvé a renderizar la referencia
para mostrarle cómo queda.
