# 💸 Plan de ahorro · tres corridas al día (desde el 05/11/2026)

Pedido de Flor (04/11/2026): "Dime cómo puedo gastar lo menos posible pero que el negocio siga funcionando. Deja solo lo realmente importante."

Por qué se gastaba de más:
- Había unas 30 tareas programadas.
- Muchas se repetían, por ejemplo el alta de alumnas 1:1 corría 3 veces por día y los mails de alumnas, 2.
- Casi todas corrían DENTRO de la conversación principal, que es muy larga. Cada vez que una corría, se volvía a procesar esa conversación entera, y eso era lo que más costaba.

Ahora las tareas de alumnas son 3 corridas por día. Cada una arranca en una sesión NUEVA y liviana, clona el repo y lee estas reglas.

## Regla de ahorro (para todas las corridas)
- **Primero se mira rápido y después se trabaja.** Si una parte no tiene novedades (no hay pagos nuevos, no hay mails nuevos de alumnas, no hay entregas, no hay clases), se saltea en una línea, sin abrir documentos largos.
- **Nada de subagentes para buscar.** Se usan solo para transcribir audios o para hojas largas.
- **Los documentos largos se leen una sola vez por corrida.**
- **Un solo mail a Flor por corrida, y solo si hay algo.**

## 🌅 MAÑANA · lun a sáb 09:47 (Buenos Aires)
Reemplaza a: 💬 Feedback (10:47), 📋 Para revisar hoy (11:23), 📩 Mails de alumnas (13:47 y 20:47) y ✅ Alta 1:1 (3 veces por día).

Hace, en este orden:
1. **Alta 1:1.**
   - Revisá los mails de Stripe de las últimas 30 horas (`from:notifications@stripe.com newer_than:30h`) y los pagos de alumnas que no estén en Notion.
   - Si no hay pagos nuevos, la parte termina acá.
   - Si hay, seguí rutinas/alta-alumna-1a1.md con UN cambio: la bienvenida queda como BORRADOR y la manda Flor.
   - Hacé también el control de las alumnas que tienen su primera clase en las próximas 48 h (PASO 7).
2. **Mails de alumnas.**
   - Mails recibidos de alumnas activas desde la corrida anterior que no sean weekly ni tarea: un borrador de respuesta en el hilo.
   - Seguí rutinas/bandeja-alumnas.md.
   - Si una alumna pide cambiar una clase de hoy, va arriba de todo en el mail del día.
3. **Feedback.**
   - Weekly de la semana en curso, tareas, audios y videos: un borrador por alumna, según bandeja-alumnas.md.
   - Si la alumna tiene clase en las próximas 24 h, no se arma borrador: se anotan puntos para la clase.
   - La voz y el criterio de Flor están en `git show origin/claude/hopeful-maxwell-asxs94:rutinas/feedback-alumnas.md` y en `git show origin/claude/hopeful-maxwell-asxs94:rutinas/estilo-devoluciones.md`.
4. **Cierre.** Lo que Flor mandó desde ayer:
   - resumen de clase → se carga en Notion › Clases y se marca el evento;
   - feedback → "📧 dd/mm" en su ficha.
5. **Mail "📋 Para revisar hoy"**, según bandeja-alumnas.md §4. Es el único mail de la mañana.

## 📚 CLASES DE HOY · lun a sáb 02:48
- Sigue rutinas/clases-de-hoy.md, sin cambios.
- Si hoy no hay clases, no hace nada.

## 🌙 NOCHE · todos los días 23:37
Reemplaza a: 📝 Resúmenes (14:52 y 23:52), Notion al día (23:23) y Portales (22:37).

Hace, en este orden:
1. **Resúmenes de las clases de hoy.**
   - Las clases de ayer que todavía no tenían notas también entran.
   - Van como borrador, según resumen-post-clase.md y bandeja-alumnas.md.
   - Ale Rossi: el correo va solo a Flor.
2. **Notion al día.** Sigue rutinas/notion-al-dia.md: clases dadas, asistencia y "🧹 Para revisar".
3. **Portales.** Sigue rutinas/portales-alumnas.md, en modo actualización.
   - Solo se tocan las alumnas que tuvieron clase hoy o mandaron algo nuevo.
   - Lo que está en borrador NO se carga: solo lo que figura en Enviados.

Si hoy no hubo clases ni entregas, termina en una línea. No le manda mail a Flor.

## 🔁 SEMANAL
- **Lunes 08:41 · lunes-semana.md:** el recordatorio del weekly a cada alumna activa (es lo único que sale solo, sin revisión) y el mail de la semana a Flor.
- **Lunes y jueves 09:33 · ciclo + lab:**
  - rutinas/ciclo-alumnas.md;
  - el SOP del lab: `git show origin/claude/busy-darwin-ypcvmj:rutinas/sop-formato-lab.md`.
  - Un solo mail a Flor, y solo si hay algo.
- **Viernes 17:58:** la revisión de mejora continua (rutinas/mejora-continua.md) y el estado de la semana (rutinas/viernes-estado.md), en UN solo mail.
- **Domingo 17:48 · domingo-grabacion.md:** el plan de grabación de la semana.

## Lo que NO se toca
Contenido de Instagram, finanzas personales, menú y CEO Focus: lo decide Flor. Ver la propuesta en el mail del 05/11.
