# 🗓️ Semana de contenido · lunes y miércoles (jueves 09:37, para la semana siguiente)

Pedido de Flor (26/10): «que se dejen listos semanalmente con contenido auditado primero con plan-de-contenido-semanal y auditoria-de-contenido, después armar los diseños, dejarlos en Canva y todo ordenado en Notion. Si no es algo significativo, no lo ponemos. Menos es más.»

Reemplaza a la Tarea 1 diaria (05:52) de `contenido-diario.md`, que quedó apagada. Las reglas de `contenido-diario.md` (reglas de Flor, «Reglas que no se rompen», Canva, Notion) y los formatos de `carruseles/FORMATOS.md` siguen valiendo.

Flor no está mirando cuando corre: no le hagas preguntas. Nunca publiques ni le escribas a alumnas o prospectas.

## Qué deja listo
| Día | Pieza | Quién la arma |
|---|---|---|
| Lunes | Carrusel personal + creencia (formato LUNES) | esta rutina |
| Martes | Reel A CÁMARA: prompter con criterio de Ann (`.claude/skills/contenido-semanal-at-work/PROMPTER.md`) | esta rutina; Flor graba y después se edita con `editar-reels`. Plan B: B-roll + texto |
| Miércoles | Carrusel Problema / Brecha (formato MIÉRCOLES) | esta rutina |
| Jueves | Reel A CÁMARA: prompter | igual que martes |
| Viernes | Carrusel de wins | rutina de los martes (necesita los reports del lunes) |

## Pasos
1. `cd /home/user/brakingbarriersatwork && git fetch origin carrusel-bloqueo-reunion && git checkout carrusel-bloqueo-reunion && git pull origin carrusel-bloqueo-reunion`. Leé `carruseles/FORMATOS.md` y `rutinas/contenido-diario.md`.
1b. Seguí la skill `.claude/skills/contenido-semanal-at-work/SKILL.md` (criterio, formatos, videos con `scripts/broll_reel.py`). Antes del plan, mirá la prioridad del negocio con `consultoria-con-ann`.
2. **Insumos reales, nunca inventados.** Juntá:
   - Banco de hooks de outliers: https://app.notion.com/p/4005708d64488114a5b6c99a484449aa (sin los de «Usados» ni los de los últimos 21 días).
   - Banco de momentos de clase: https://app.notion.com/p/3f15708d644881b2a8fec24504b005b0 y las notas de clase de los últimos 7 días (solo patrones, nunca escenas ni frases de una alumna).
   - Los weekly reports de esta semana: lo que más les cuesta (como patrón, nunca citado).
   - Lo que Flor contó de su semana: Drive › «Contenido semanal skill» (fotos nuevas y notas) y esta conversación.
   - Lo publicado en los últimos 30 días (Windsor, connector `instagram`) para no repetir mensaje, hook ni foto.
3. **Plan con la skill `plan-de-contenido-semanal`.** Una Gran Idea: «Tu alumna cree que [X], pero la verdad es que [Y]», con una prueba real. El lunes, el miércoles y los videos la cuentan desde ángulos distintos. El viernes la prueba con wins.
4. **Guiones** de lunes y miércoles con la estructura de FORMATOS.md, y prompter de martes y jueves (texto en pantalla corto y, si es a cámara, 5 a 8 líneas para decir con sus palabras).
5. **Auditoría con la skill `auditoria-de-contenido`, pieza por pieza.** Tiene que ser Brecha y no Solución, hablarle a la profesional que ya trabaja en inglés (ICP1), instalar una creencia con prueba real y tener un hook validado. **Si una pieza no pasa, no se diseña:** su fila de Notion dice «⚪ Esta semana no va» con el motivo en una línea y qué haría falta. Menos es más: no hay relleno.
   - **El lunes necesita fotos NUEVAS de Flor y algo real de su semana.** Si no hay, el lunes no va (no se usan fotos viejas ni se inventa su vida).
6. **Diseño** con `carruseles/_marca/scrapbook/gen.py` y el formato fijo de cada día (lunes `ig`; miércoles `bold`/`label`/`plain`). Carpeta `carruseles/diario/AAAA-MM-DD-<slug>/`. Exportá con `carruseles/_marca/exportar.sh` (ruta absoluta), mirá la vista general con Read y corregí. Empaquetá LISTO-PARA-SUBIR + zip. Commit y push. Anotá en `carruseles/registro.md` (tema, estilo, fotos y ropa, mensaje central).
7. **Canva:** subí las placas a la carpeta del día (`carruseles/canva-carpetas.md`; si no existe, creala dentro de la del mes y anotala), con URLs raw del commit (SHA) para evitar caché.
8. **Notion · Smart Creator** (`collection://fc35708d-6448-83bf-9a3e-07edd62e7e62`): una fila por pieza con la fecha de publicación (lun, mar, mié, jue). Callout «🟡 Para revisar» con: Gran Idea de la semana, 📁 link de Canva, ⬇️ zip, el caption completo para copiar (o el prompter del video). Status «Not started». Si la pieza no va, la fila dice por qué.
8b. **Página de la semana** en CONTENIDO, «Semana dd/mm – dd/mm · todo listo para subir», igual al modelo https://app.notion.com/p/4055708d6448819cb1d1d27cbaa179ed: Gran Idea, tabla, y por cada día Canva, descarga, vista general, caption e historias. Es lo único que Flor tiene que abrir.
9. **Un solo aviso a Flor**, con el link a esa página,, en esta conversación: la Gran Idea, qué quedó listo (con links de Canva y Notion), qué no va y por qué, y lo que necesita mandar (fotos, B-roll, voz en off). Voseo, corto.

Terminá en dos líneas: qué quedó listo y qué falló.
