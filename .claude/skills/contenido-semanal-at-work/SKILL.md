---
name: contenido-semanal-at-work
description: Arma la semana de contenido de Instagram de Flor Pérsico (AT WORK · Breaking Barriers at Work) con el criterio de Ann Sahakyan, como se aprobó el 26/10/2026. Plan con una Gran Idea, auditoría de cada pieza, carruseles de lunes, miércoles y viernes con sus formatos fijos, videos de martes y jueves (B-roll con texto en pantalla o a cámara), todo subido a Canva y ordenado en Notion. Usala cuando Flor diga «armá la semana», «el contenido de esta semana», «carrusel del lunes / miércoles / viernes», «wins del viernes», «editá el video del martes / jueves», o cuando corra la tarea semanal de los jueves o la de wins de los martes.
---

# Semana de contenido · AT WORK

Flor (26/10): «que quede todo automatizado con el mismo criterio de Ann y como lo hicimos hoy». **Menos es más:** si una pieza no es significativa, no va. No hay relleno.

## La semana fija
| Día | Pieza | Formato (detalle en `carruseles/FORMATOS.md`) | Modelo aprobado |
|---|---|---|---|
| Lunes | Carrusel personal + creencia | `theme:"ig"`: fotos NUEVAS de Flor a sangre + recuadros blancos | `carruseles/diario/2026-10-31-el-proceso` |
| Martes | Video | B-roll + texto en pantalla (o a cámara con `editar-reels`) | `carruseles/reels/r4-ensayar` |
| Miércoles | Carrusel Problema / Brecha | `bold` / `label` / `plain` (estilos de Instagram de Flor) | `carruseles/diario/2026-10-27-no-estaba-lista` |
| Jueves | Video | igual que martes, con otras tomas | `carruseles/reels/r5-que-se-resolvio` |
| Viernes | Carrusel de wins | `futtitle` + `wachat` con `"source":"report"` + `futend` | `carruseles/diario/2026-10-30-wins` |

Sábado, solo si hay algo real y significativo.

## Paso 1 · Criterio (antes de escribir nada)
1. **Prioridad del negocio** con `anthropic-skills:consultoria-con-ann`: ¿qué necesita el negocio esta semana (conversaciones, cupos, una oferta)? El CTA de la semana sale de ahí.
2. **Plan** con `anthropic-skills:plan-de-contenido-semanal`. Una Gran Idea: «Tu alumna cree que [X], pero la verdad es que [Y]», con una prueba real. Lunes, martes, miércoles y jueves la cuentan desde ángulos distintos; el viernes la prueba con wins. Mezcla 40/40/20.
3. **Solo material real.** La IA formatea, no inventa ideas.
   - Hooks: banco de hooks de outliers (https://app.notion.com/p/4005708d64488114a5b6c99a484449aa) u outliers propios, sin repetir los últimos 21 días.
   - El 80 %: banco de momentos de clase (https://app.notion.com/p/3f15708d644881b2a8fec24504b005b0), notas de clase y weekly reports, siempre como patrón.
   - La vida de Flor: lo que contó esa semana y sus fotos nuevas (Drive › «Contenido semanal skill»).
   - Lo publicado en los últimos 30 días (Windsor `instagram`), para no repetir mensaje, hook ni foto.
4. **Auditoría de cada pieza** con `anthropic-skills:auditoria-de-contenido`: Brecha y no Solución, ICP1 (profesional que ya trabaja en inglés), creencia con prueba real, hook validado, CTA que abre conversación. **Si no pasa, no se diseña:** la fila de Notion dice «⚪ Esta semana no va» y por qué.

## Reglas de Flor (no se rompen)
- **No exponer a las alumnas.** Nunca frases textuales, escenas puntuales, cargos ni números de una alumna. Se cuenta el patrón («lo veo mucho en alumnas que…»). La única excepción son los wins del viernes, que autoriza el contrato.
- **Wins reales, nunca inventados ni recreados.**
  - Se usa la captura real de la sección «01 MY WINS FROM LAST WEEK» del weekly report.
  - Si Flor sube capturas del grupo de WhatsApp, van primero.
  - **Solo las líneas del win.** Lo personal (pareja, salud, visas, redes, LinkedIn, empresa) **se recorta, nunca se desenfoca** («el blur queda feo»).
  - Sin nombre ni fecha. Priorizar logros concretos: ascenso, trabajo nuevo, entrevista, viaje o reunión de trabajo en inglés. No repetir lo de `carruseles/wins/wins.md`.
- **Fotos:** solo fotos nuevas de Flor. Nunca fotos viejas, nunca la misma foto ni el mismo estilo dos días seguidos. Sin fotos nuevas, el lunes no va.
- **Placas sin numeración, sin «AT WORK» y sin «desliza»** (salvo el «(desliza)» de la portada de wins). Texto estilo Instagram. TÚ en el contenido, nada de voseo.
- **Marketing de deseo:** mostrar la profesional que quiere ser. Títulos en segunda persona.
- Nombres solo de Belem, Sol o Lina. Nunca Maribel ni Luz Cañas.
- Nunca publicar ni escribirle a alumnas o prospectas.

## Paso 2 · Carruseles
- Generador: `python3 carruseles/_marca/scrapbook/gen.py spec.json carruseles/diario/AAAA-MM-DD-<slug>` (los specs de los modelos sirven de plantilla; `top:""` en todas las placas).
- Exportar: `bash carruseles/_marca/exportar.sh <ruta absoluta>`. Después, mirar la vista general con Read y corregir textos cortados o capturas ilegibles: tienen que leerse en el celular.
- Empaquetar: `LISTO-PARA-SUBIR/` (PNG + caption.txt) y `AT-WORK_<fecha>_LISTO.zip`. Commit y push a `carrusel-bloqueo-reunion`.

## Paso 3 · Videos
- **No siempre B-roll (Flor 26/10).** Algunas semanas, un video tiene que ser a cámara: se entrega un **prompter** bueno para que Flor lo grabe con su cara (hook de 0 a 3 s, frases cortas para decir con sus palabras, una idea por línea, CTA), y después se edita con `editar-reels`.
- **B-roll de Flor + texto en pantalla:** `python3 .claude/skills/contenido-semanal-at-work/scripts/broll_reel.py spec.json`, dentro de `carruseles/reels/rN-<slug>/`. El spec lleva clips, segmentos (inicio, fin, velocidad), un texto por segmento (el primero es el hook) y la placa final.
  - Unos 3,5 s por placa para que se lea.
  - Tomas sin otras personas. Nunca la misma toma que el video anterior.
  - Funciona sin voz (Flor le pone música en Instagram). Dejá `guion-voz.txt` por si quiere grabar la voz en off, y `descripcion.txt`.
- **Video a cámara:** skill `editar-reels` (formato marco, subtítulos karaoke, hook).
- Mirá fotogramas del MP4 final antes de darlo por listo.
- Si no hay B-roll nuevo ni video de Flor, no se inventa: se le pide.

## Paso 4 · Canva y Notion
- **Canva:** carpeta del día según `carruseles/canva-carpetas.md`. Si no existe, se crea dentro de la del mes y se anota.
  - Subir con `upload-asset-from-url`, usando URLs raw con el **SHA del commit** (no el branch, por la caché) y nombres «DÍA dd-mm …».
  - Si reemplazás una placa, la nueva se llama «USAR ESTE» y la vieja sale de la carpeta.
- **Notion · Smart Creator** (`collection://fc35708d-6448-83bf-9a3e-07edd62e7e62`): una fila por día con la fecha de publicación, con:
  - un callout «🟡 Para revisar» con 🎨 Canva y ⬇️ descarga;
  - la auditoría en dos líneas;
  - el caption o la descripción en un bloque de código;
  - en los videos, el guion de voz.
- **Página de la semana (Flor 26/10: «necesito dónde está toda la semana completa»):** una sola página dentro de CONTENIDO (https://app.notion.com/p/3e35708d644881e4a4ead23570764c5b) llamada «Semana dd/mm – dd/mm · todo listo para subir», igual al modelo https://app.notion.com/p/4055708d6448819cb1d1d27cbaa179ed. Lleva:
  - la Gran Idea;
  - una tabla día → pieza → Canva → fila;
  - por cada día: links de Canva y descarga, la vista general (imagen sola, con línea en blanco antes y después) y el caption en un bloque de código;
  - lo que tiene que hacer Flor.
- **Historias:** NO van encuestas, cajas de preguntas, sliders ni historias de interacción (Ann no las recomienda). Hasta que exista la skill de historias, no se proponen.
  La rutina del jueves la crea con lunes a jueves; la de wins del martes le agrega el viernes. Es lo único que Flor tiene que abrir.
- **Aviso a Flor:** uno solo, con el link a la página de la semana, con qué quedó listo, qué no va y qué necesita mandar (fotos, B-roll, dos líneas de su semana).

## Automatizaciones que usan esta skill
- **Jueves 09:37:** semana siguiente, de lunes a jueves (`rutinas/semana-carruseles.md`).
- **Martes 09:43:** wins del viernes.
- **Diario 07:26:** mail «Para subir hoy». Si no hay pieza, no se manda.
