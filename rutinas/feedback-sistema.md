SISTEMA DE FEEDBACK A ESCALA (Flor, 31/10/2026)
Pedido de Flor: "Necesito que automatices este sistema de feedback y que se haga mucho mejor de lo que se hace ahora para poder sumar una cantidad grande de alumnas y que no peligre la calidad de lo que reciben."
Este archivo manda sobre los pasos 6 y 7 de feedback-alumnas.md. El resto de feedback-alumnas.md (qué se corrige, reglas, alumnas del lab) y la skill .claude/skills/feedback-alumnas siguen valiendo.

BASE DE REVISIÓN EN NOTION
- "💬 Feedback para revisar": https://app.notion.com/p/26e9491983c94fa8a54c98ff244ffe0e · data source collection://f4eff02f-31c7-4da7-bb92-b04ec4629db8 (dentro de ECOSISTEMA AT WORK › ALUMNAS).
- Una fila = una entrega de una alumna. Propiedades: Entrega (título: "<Alumna> · <qué entregó> · dd/mm"), Alumna (relación con Alumnas), Formato (1:1 / Lab), Semáforo, Estado (Para revisar / Aprobado / Enviado / No mandar), ✅ Aprobar, Qué revisar, Fuente (Mail / Drive), Link a la entrega, Mail de la alumna, Asunto, Hilo de Gmail (threadId para responder en el mismo hilo), Recibida, Próxima clase o lab, Enviado el, Flor cambió el texto.
- Cuerpo de cada fila, siempre en este orden:
  ## ✉️ Devolución (esto es lo que se manda)
  <texto completo, listo para enviar; Flor lo puede editar acá mismo>
  ## 📝 Notas para Flor (no se manda)
  <qué verificar, dudas, notas del filtro, por qué el semáforo>
  ## 🔒 Borrador original (no tocar)
  <copia exacta del texto de la devolución tal como lo dejó la rutina, para detectar qué cambió Flor>

1 · ENTRADA: LAS DOS VÍAS VALEN (Flor, 31/10: "no importa si suben, si me envían correos con su tarea o si lo suben al Drive")
En cada corrida se revisan las dos vías para TODAS las alumnas activas (1:1 y lab; Lina y Corina no):
- Mail: Gmail de las dos cuentas (florenciapersico@breakingbarriers.site y mariaflorenciaper@gmail.com) desde la última corrida: mails de la alumna con adjuntos, links de Drive, audios, o que digan tarea/homework/weekly/"ya hice", "te mando", etc. El asunto puede ser cualquiera.
- Drive: archivos nuevos o modificados desde la última corrida en TODA su carpeta de VIP STUDENTS (1EKSntEU0pkzws27TxeovcAI1yz58ykTv) o en la carpeta de la alumna que figura en Notion (Carpeta Drive), incluidas subcarpetas (Weekly Reports, 04 · MIS PRÁCTICAS, 05 · MI PROGRESO…). Un Google Doc de weekly modificado cuenta como entrega si tiene respuestas nuevas.
- Si la misma tarea llega por las dos vías, es UNA sola fila (Fuente = la vía por donde llegó primero; en Notas para Flor se nombra la otra).
- Antes de crear una fila, buscá en la base si ya existe para esa entrega (mismo link o mismo hilo): no dupliques. Si ya fue Enviado, solo se arma otra si es una entrega nueva.

2 · ARMADO EN PARALELO (un subagente por alumna con entrega nueva)
Cada subagente, para UNA alumna:
a) Contexto: su ficha de Notion, la transcripción de su última clase 1:1 o de su último lab (solo lo de ella) y del 1:1 mensual si es de lab, sus devoluciones anteriores (filas Enviado de esta base y mails enviados), su roadmap/semana del programa, qué tarea tenía y qué tiene que lograr.
b) Devolución con la skill .claude/skills/feedback-alumnas y la voz de rutinas/estilo-devoluciones.md. Alumnas de lab: más completa y más personal que las 1:1 (ver feedback-alumnas.md), con su historial (qué repite, qué ya mejoró) y el tema del último lab aplicado a su caso.
c) Filtro: pasala por la skill anthropic-skills:filtro-feedback-flor si está disponible. Sus notas van a "Notas para Flor".
d) Audios: transcribí con timestamps; si hay dudas de pronunciación, usá herramientas/pronunciacion (ver LEEME.md) y en Notas para Flor dejá SOLO los segundos exactos que tiene que escuchar.
e) Formato de entrega: mail (texto) o, si hace falta tarea con tablas / Answer key, el doc con branding según la skill (creado en el Drive de Flor, NO en la carpeta de la alumna hasta el ok).

3 · SEGUNDA REVISIÓN INDEPENDIENTE (otro subagente, sin ver el razonamiento del primero)
Recibe solo: la entrega original (link/transcripción), la ficha de la alumna y la devolución final. Chequea:
- Cada corrección es correcta en inglés (si dos formas son correctas, no se corrige).
- Cada frase citada aparece de verdad en la entrega (nada inventado, nada de otra tarea o de lo que ya se vio en clase).
- No hay "¡" ni "¿" en español, ni frases prohibidas de estilo-devoluciones.md; trato (tú/vos) correcto; nombre correcto de la alumna; trainings nombrados existen en Notion con el nombre exacto.
- Si algo de lo que Flor explicó en clase está mal, va como ⚠️ en Notas para Flor.
Si encuentra un error, se corrige la devolución; si no se puede resolver, pasa a 🟡 con la duda concreta.

4 · SEMÁFORO
- 🟢 Verde: la segunda revisión no encontró dudas. Flor lee y tilda.
- 🟡 Revisar: hay algo puntual que Flor tiene que mirar (un audio, una corrección dudosa, una tarea a medias, algo de clase mal explicado). "Qué revisar" dice exactamente qué y dónde (por ejemplo "escuchá 0:20 y 1:32").
- 🔴 Falta info: no se armó (no se sabe qué tarea era, entrega vacía, no se encuentra la última clase). "Qué revisar" dice qué falta. No hay devolución.

5 · AVISO A FLOR
Un solo mail corto a florenciapersico@breakingbarriers.site, asunto "💬 Feedback para revisar · <día dd/mm> · <n> alumnas", con etiqueta Gmail "AT WORK/Feedback para revisar" (Label_13): link a la base, cuántas 🟢/🟡/🔴, y una línea por alumna (orden: clase o lab más cercano primero) con su link a la fila. Lo mismo, resumido, en la conversación. Si no hubo entregas nuevas, no se manda mail.

6 · ENVÍO (solo lo que Flor aprobó)
Corre al final de la rutina de feedback y en cada corrida de "📨 Respuestas de Flor":
- Buscá filas con ✅ Aprobar = sí y Estado = Para revisar (o Aprobado).
- Leé el cuerpo de la página y mandá EXACTAMENTE el texto de "✉️ Devolución" a "Mail de la alumna", desde florenciapersico@breakingbarriers.site, con Flor en CCO, como respuesta en "Hilo de Gmail" si existe (si no, mail nuevo con "Asunto"). Si la devolución es un doc, primero movelo a la carpeta de la alumna y compartilo, y después mandá el mail con el link.
- Después: Estado = Enviado, Enviado el = ahora, y en la ficha de la alumna ("Notas tracker", al principio) "📧 dd/mm: feedback de <tarea> enviado".
- Si el texto de "✉️ Devolución" es distinto del "🔒 Borrador original": tildá "Flor cambió el texto" y anotá en rutinas/criterio-correccion-log.md una línea con qué cambió y por qué (inferido del cambio). Cada 2 semanas, pasá esos aprendizajes a la skill.
- También vale si Flor responde el mail de aviso con "ok <nombre>" u "ok todas": se marca ✅ en esas filas y se envía igual.
- NUNCA se manda una fila sin ✅ o sin "ok" explícito de Flor. Nunca se manda una 🔴.

7 · CALIDAD A LO LARGO DEL TIEMPO
- Cada domingo, en el resumen semanal: cuántas devoluciones se mandaron, cuántas Flor aprobó sin cambiar (por semáforo), y los 3 cambios más repetidos de Flor (de criterio-correccion-log.md).
- Regla de Flor (31/10, "no quiero perder la humanidad dentro de mi negocio"): TODO feedback (tareas, mails, weekly reports) y toda respuesta a alumnas pasa por el criterio de Flor antes de salir, también las 🟢. El semáforo solo le ordena la revisión. No se propone envío automático.
