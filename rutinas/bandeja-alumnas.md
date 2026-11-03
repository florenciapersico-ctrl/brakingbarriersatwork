# 📋 Bandeja de alumnas · cómo funciona (desde el 04/11/2026)

Pedido de Flor (03/11/2026): "Quiero que arregles esta automatización para que funcione perfecta." Ese día quedó todo trabado por esto:
- Varias rutinas armaban borradores para la misma alumna: Ester tuvo dos y Ale tuvo dos que se contradecían.
- Los mails de revisión no tenían los links a los borradores.
- Se respondían weekly viejos.
- Los audios quedaban sin feedback.

Este archivo es la ÚNICA fuente de reglas para todo lo que va hacia una alumna. Si otro archivo de rutinas dice otra cosa, manda este.

## 1 · Quién hace qué

| Rutina | Qué arma | Para quién |
|---|---|---|
| 📝 Resúmenes post-clase (14:52 y 23:52) | Borrador "Resumen de tu clase · día DD/MM" | La alumna, con CC a Flor |
| 💬 Feedback de alumnas (10:47) | Borrador de feedback del weekly de la semana en curso, de tareas y de audios | La alumna, con CCO a Flor |
| 📩 Mails de alumnas (13:47 y 20:47) | Borrador de respuesta a lo que pregunta la alumna, que no sea weekly ni tarea | La alumna, en su hilo |
| 📋 Para revisar hoy (11:23) | UN solo mail a Flor con la tabla de todo lo pendiente y el cierre de lo que Flor ya mandó | Flor |
| Lunes semana (08:41) | Recordatorio del weekly. Es lo ÚNICO que sale solo, sin revisión. | Alumnas activas |

Ninguna otra rutina le arma borradores a alumnas ni le manda a Flor mails con borradores. "📬 Para enviar hoy" queda reemplazada por "📋 Para revisar hoy".

## 2 · Reglas de los borradores (para todas las rutinas)

1. **Nunca se envía nada a una alumna.** Solo borradores (mcp__Gmail__create_draft). Flor los revisa y los manda ella. La única excepción es el recordatorio del weekly de los lunes.
2. **Un borrador por alumna y por tema, nunca dos.** Antes de crear uno:
   - Buscá con `list_drafts` (query `to:<mail de la alumna>`, view FULL) si ya hay un borrador para esa alumna sobre el mismo tema (mismo hilo o mismo asunto).
     - Si existe y **Flor no lo tocó**, actualizalo con `update_draft`.
     - Si existe y **Flor lo tocó** (cambió el texto que habías dejado, o lo editó después de la última corrida), no lo pises. Anotalo en "📋 Para revisar hoy" como "Flor lo está editando".
   - Buscá en Enviados (`in:sent to:<mail>` y `bcc:<mail>`, desde las dos cuentas) si ya salió algo sobre ese tema. Si salió, no armes nada.
   - Temas: "resumen de clase DD/MM", "weekly semana DD/MM", "tarea <nombre>", "audio <nombre>", "respuesta a <asunto>". Si hay dos temas del mismo día para la misma alumna (por ejemplo, el weekly y las worksheets), van en UN solo borrador con dos secciones.
3. **Weekly: solo el de la semana en curso.** El lunes sale el weekly nuevo, y el de la semana anterior ya no se responde (regla de Flor, 03/11).
4. **Cuando la alumna pide feedback de algo que todavía no existe** (por ejemplo, "feedback on my recording" de una grabación que va a hacer el jueves), el borrador lo dice así: "Grabate el jueves, mandámela y el viernes trabajamos con ese feedback". Nunca un "trabajamos con el feedback de tu grabación" que no se entiende.
5. **Hilo:** si existe el hilo de la alumna sobre ese tema (el recordatorio del weekly, su mail con la tarea), el borrador va como respuesta en ese hilo (create_draft con threadId). Si no, va como mail nuevo.
6. **Trato:** voseo para argentinas y tú para las demás, según la tabla de `_reglas-comunes.md`. Se firma "Flor".
7. **Privacidad:** nada personal ni sensible (salud, familia, viajes, emociones, problemas en el trabajo), ni nombres de compañeros o clientes. Solo inglés y práctica.
8. **Nada inventado:** cada corrección es una frase que la alumna escribió o dijo de verdad. Lo que falta va como `[FLOR: …]` dentro del borrador, y se lista en "📋 Para revisar hoy".
9. **Link de cada borrador:** guardá el `viewUrl` que devuelven create_draft o update_draft. Si no lo tenés, armalo así: `https://mail.google.com/mail/?authuser=florenciapersico@breakingbarriers.site#all?compose=<messageId>`.
10. **No borres nada.** Un borrador viejo que ya no sirve se lista como "no mandar" con su link. Se borra solo si Flor dice "borralo" en la conversación o respondiendo el mail.

## 3 · Audios y videos de alumnas

Cuando una alumna sube un audio o un video (a su carpeta de Drive o por mail) y Flor no le dio feedback:
1. Probá `read_file_content`, por si Drive ya tiene la transcripción.
2. Si no la tiene, descargalo en un directorio nuevo y vacío del scratchpad y transcribilo con faster-whisper.
   - Instalación: `pip install faster-whisper`. Usá el modelo "small" para todo el audio y "medium" para los tramos de la alumna.
   - Si hay varias voces, separalas, por ejemplo con resemblyzer, y citá SOLO frases de la alumna que den igual en los dos modelos.
   - Si el archivo pesa más de 10 MB, la descarga por MCP falla: avisalo en "📋 Para revisar hoy" como "audio de X: no se pudo bajar, necesita que Flor lo abra". Nunca uses links públicos como atajo.
3. Con la transcripción, el borrador de feedback lleva:
   - qué hizo bien, con citas;
   - 5 a 8 frases para el post-it, con las columnas Lo que dijiste / Cómo va / Por qué;
   - 1 o 2 tips de pronunciación, solo si son claros;
   - el próximo paso.
   Si hace falta (por ejemplo, si la alumna no tiene clase la semana siguiente), sumá una hoja de práctica en su carpeta "<mes>", sin compartir. En el borrador va el placeholder `[FLOR: link a la hoja, compartila antes de mandar]`.

## 4 · "📋 Para revisar hoy": el único mail diario a Flor sobre alumnas (11:23, lun a sáb)

Paso 1 · Cierre de lo que Flor ya mandó:
- Buscá en Enviados (desde la corrida anterior) los mails a alumnas que salieron de un borrador:
  - **Resumen de clase:** agregá "## Resumen de la clase · DD MMM" al final de la página de esa clase en Notion › Clases, con el texto que Flor mandó de verdad, y marcá el evento con "RESUMEN ENVIADO · DD MMM AAAA" al principio de la descripción (notificationLevel NONE).
  - **Feedback (weekly, tarea o audio):** agregá al principio de "Notas tracker" de su ficha "📧 dd/mm: feedback de <tema> enviado".
  - **Si Flor cambió el texto antes de mandarlo:** anotá en `rutinas/criterio-correccion-log.md`, en una línea, qué cambió y por qué (inferido).

Paso 2 · Tabla del día:
- Un mail SOLO a florenciapersico@breakingbarriers.site, con asunto `📋 Para revisar hoy · <día dd/mm> · <n> para mandar`, en HTML, en voseo y corto.
- Arriba, una línea: "Tocá cada link, revisá y mandá. Si algo no va, respondé este mail con «no va X»."
- La tabla tiene una fila por alumna con algo para hoy, ordenadas por la clase más cercana primero:

| Alumna | Qué | Estado | Link |
|---|---|---|---|
| Laura M. | Weekly 02/11 | ✉️ Borrador listo | [Abrir borrador] |
| Georgina | Resumen clase 02/11 | ✏️ Flor lo está editando | [Abrir borrador] |
| Gaby | Audio reunión | ⚠️ Falta [FLOR: link a la hoja] | [Abrir borrador] |

  Estados posibles: ✉️ listo · ✏️ Flor lo está editando · ⚠️ tiene [FLOR: …] · 🎧 audio que no se pudo transcribir (link al archivo).
- Debajo de la tabla, en una línea:
  - "Ya salió (desde ayer): …", con los nombres de lo que se cerró en el paso 1;
  - "Sin entrega esta semana: …", con los nombres.
- "Necesito que decidas": máximo 5 líneas. Son cosas que solo sabe Flor, como asistencias sin confirmar, cancelaciones o pagos que vencen. Cada una se responde en una línea; por ejemplo: "Brenda no vino", "Gaby 10/11 cancelada".
- "Borradores que no hay que mandar": la lista con sus links, si hay alguno.
- Si no hay nada para mandar ni para decidir, no se manda mail.
- Etiqueta: ponele al mail la etiqueta "AT WORK/Feedback para revisar" (Label_13).

## 5 · Cuando Flor responde

La rutina "📨 Respuestas de Flor" (13:41 y 20:41) lee las respuestas de Flor a "📋 Para revisar hoy" y hace lo que dice:
- **"no va X":** el borrador queda listado como "no mandar".
- **"borralo":** borrá ese borrador.
- **"Brenda no vino":** Notion › Clases, Asistencia = Ausente.
- **"Gaby 10/11 cancelada":** cancelá el evento con notificationLevel NONE, solo si Flor lo dijo explícitamente.
- **"mandalo":** mandá exactamente el borrador como está.
Nunca hagas nada que Flor no haya escrito.
