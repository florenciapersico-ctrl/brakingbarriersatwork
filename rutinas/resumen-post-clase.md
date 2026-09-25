Tu trabajo: que Flor Pérsico (Breaking Barriers) reciba por correo, poco después de cada clase 1:1 AT WORK, el resumen de la clase ya escrito para la alumna (lo que vieron y lo que tiene que hacer). El correo va SOLO a Flor: ella decide si se lo reenvía a la alumna. Y que ese resumen quede también en Notion.

Nadie te va a contestar preguntas. Si algo falta, no lo inventes: salteá esa clase y seguí.

Herramientas: Google Calendar, Google Drive, Gmail y Notion están como herramientas MCP (mcp__Google_Calendar__*, mcp__Google_Drive__*, mcp__Gmail__*, mcp__Notion__*). Si no aparecen cargadas, buscalas con ToolSearch antes de decir que no las tenés.

═══════════════════════════════
PASO 1 — QUÉ CLASES TERMINARON
═══════════════════════════════
Leé el Google Calendar principal de Flor ("BREAKING BARRIERS CON LUCIA!") desde las 00:00 de HOY (hora de Buenos Aires) hasta ahora. Quedate con las clases 1:1 AT WORK (y las clases de dos alumnas juntas) que YA TERMINARON. No son clases: discovery calls, entrevistas de venta, reuniones internas, eventos personales, bloqueos de agenda.
Descartá las que en la descripción ya tienen "RESUMEN ENVIADO · [fecha de hoy]".
EXCLUSIONES (decisión de Flor):
- Alejandra (eventos "alejandra class", "alejandra deco" o con Alejandra como invitada): NO se le manda resumen por ahora. Salteala sin marcar nada.
CLASES DE DOS ALUMNAS (Lina Aguilar y Corina "Cori" Moreyra, evento "cori and lina"): el resumen se escribe SIEMPRE para las dos, aunque se haya conectado una sola (y se le manda a Flor, como todos). En ese caso, decí al principio quién estuvo en la clase ("Hoy estuvo Cori; Lina, esto es lo que vimos para que lo tengas") y los errores son solo de la que habló.
Si no queda ninguna, terminá con UNA línea: "No hay clases nuevas para resumir." (Así Flor no recibe nada relevante.)

═══════════════════════════════
PASO 2 — LAS NOTAS DE GEMINI DE ESA CLASE
═══════════════════════════════
Por cada clase: buscá en Drive las notas de Gemini de ESA clase de HOY (search_files con title contains 'Notas de Gemini' o 'Notes by Gemini' + el título del evento, o el adjunto "Notes by Gemini" del evento). Tienen que ser de hoy y del horario de la clase.
- Si todavía no aparecen, o el doc está vacío o casi vacío (menos de ~2 KB: Gemini todavía lo está generando), NO hagas nada con esa clase: la próxima corrida lo va a reintentar.
- Si pasaron más de 4 horas desde que terminó la clase y sigue sin notas, marcá el evento con "RESUMEN ENVIADO · [fecha] · sin notas de Gemini, no se mandó" y avisale a Flor en el mensaje final.
Leé la TRANSCRIPCIÓN completa (no solo el resumen de Gemini). Si read_file_content trunca, usá download_file_content.

═══════════════════════════════
PASO 3 — QUÉ SACAR DE LA TRANSCRIPCIÓN (todo literal, nada inventado)
═══════════════════════════════
- Qué situación de trabajo real trabajaron (proyecto, interlocutor, reunión, mail) y con qué estructura o framework.
- La VERSIÓN FINAL que la alumna construyó en clase (la última versión corregida, armada con lo que ella dijo y lo que Flor corrigió). Si no hubo un producto final claro, poné las 3 o 4 frases clave que quedaron bien.
- 4 a 6 errores de ELLA (nunca de Flor) que se corrigieron en clase: frase tal como la dijo → cómo va → por qué, en pocas palabras. Priorizá los que Flor corrigió explícitamente o marcó para el post-it.
- La TAREA que Flor le dio al final de la clase, tal como la dio. Si Flor no dio tarea, no inventes una: poné "Seguí practicando [lo trabajado] antes de la próxima clase."
- Alguna frase de ánimo o de feedback que Flor le haya dicho de verdad (opcional; solo si está en la transcripción).

═══════════════════════════════
PASO 4 — EL CORREO (Gmail, send_message)
═══════════════════════════════
- Para: SOLO florenciapersico@breakingbarriers.site. NUNCA a la alumna, ni en copia. Flor lo reenvía si quiere.
- Asunto: "Resumen para [Alumna] · [tema corto de la clase]" (en la clase de Lina y Cori: "Resumen para Lina y Cori · …").
- El cuerpo va escrito PARA LA ALUMNA (empieza con "Hola [nombre]!"), listo para que Flor lo reenvíe tal cual. Arriba de todo, antes del saludo, una sola línea en gris chico: "Para reenviar a [nombre] · [mail(s) de la alumna]". En la clase de Lina y Cori, escrito para las dos, con los errores de cada una identificados con su nombre (ver PASO 1).
- Idioma: español rioplatense con voseo, cálido y breve. Las frases, el framework y la versión final, en inglés.
- Firmá "Flor". Nada que suene a sistema automático, nada de "Claude", nada técnico.
- Mandá htmlBody (y body en texto plano como alternativa). Estructura:
  Hola [nombre]!
  Una línea: qué practicaron hoy y con qué situación real.
  "La estructura que usamos" (si hubo una), en un recuadro.
  "Tu versión final (la construiste vos)", en un recuadro, en inglés.
  "Tus frases para el post-it": tabla Lo que dijiste (rojo) · Cómo va (verde) · Por qué.
  La frase de ánimo de Flor, si la hubo.
  "Tu tarea para la semana": 1 a 3 puntos, tal como la dio Flor.
  "Nos vemos la semana que viene! 💙 Flor"
  Estilo: tipografía Open Sans/Arial, títulos marrón #82552E, recuadros con fondo crema #FFF8E7 y borde terracota #C68C6C, tabla con bordes #C68C6C, errores en rojo #b3261e y correcciones en verde #1e7b34.
- Si la alumna no tiene mail en el evento, mandalo igual a Flor y poné en la línea de arriba que falta el mail.

═══════════════════════════════
PASO 5 — EL RESUMEN EN NOTION
═══════════════════════════════
En la base Clases de Notion (collection://6edc592f-a786-4b01-aac8-1f462f058926) buscá la fila de esa alumna para hoy (la creó la preparación de la mañana; el link suele estar en la descripción del evento como "Tu página:"). Si no existe, creá una fila: Clase ("[Nombre] · [DD MMM]"), Fecha con hora, Calendar (link al evento).
Agregá AL FINAL del cuerpo de la página (sin borrar la guía que ya está) una sección:
## Resumen de la clase · [DD MMM]
- Notas de Gemini: [link]
- Qué trabajamos: una línea.
- Versión final: el texto en inglés.
- Errores corregidos: la misma lista del correo (dijo → va).
- Tarea: la misma del correo.
- Resumen enviado a Flor para reenviar · [hora].
No cambies otras propiedades de la fila. No escribas en el Student Delivery Tracker ni en otras bases. No guardes nada en Drive.

═══════════════════════════════
PASO 6 — MARCAR EL EVENTO
═══════════════════════════════
Agregá al principio de la descripción del evento, sin notificar a los invitados (notificationLevel / sendUpdates NONE) y conservando lo que ya tenía:
RESUMEN ENVIADO · [DD MMM AAAA]

═══════════════════════════════
PASO 7 — MENSAJE FINAL
═══════════════════════════════
Tu último mensaje le llega a Flor. Si mandaste correos: una línea por clase, "[hora] · [alumna] · resumen listo en tu mail · [link a la página de Notion]". Más una línea si algo no se pudo. Si no hubo nada nuevo: "No hay clases nuevas para resumir."

═══════════════════════════════
REGLAS FIJAS
═══════════════════════════════
- Nunca inventes errores, frases, versiones finales ni tareas: todo sale de la transcripción de ESA clase.
- Nunca mandes dos veces el mismo resumen: la marca "RESUMEN ENVIADO" en el evento es la que manda.
- Nunca le escribas a la alumna ni a nadie más: el correo va SOLO a Flor.
- Nunca incluyas a Maribel en contenido ni materiales de marketing.
