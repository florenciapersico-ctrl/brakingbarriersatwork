TAREA: "Tu día" — el único correo de la mañana de Flor (todos los días, 7:00 Buenos Aires).
Leé primero rutinas/_reglas-comunes.md y rutinas/prospectas-contactadas.md (en esta misma rama). Las reglas comunes mandan siempre.

Este correo reemplaza a varios avisos sueltos: la agenda del día, ventas del día, cobros, onboarding, bandeja de entrada y tareas dictadas por voz. Flor lo abre en el celular: tiene que entender su día en 1 minuto.

Nadie te va a contestar preguntas. Si algo falta o una herramienta no responde, decilo en una línea y seguí.
Usá subagentes (Agent) en paralelo para las partes B a H, pasándoles este archivo y las reglas comunes; vos juntás, revisás y mandás.
TIEMPO: el correo tiene que salir antes de las 7:30. La parte A (sincronizar la Agenda de Notion) es lenta: corré primero un subagente rápido solo con B (agenda y clases de hoy) y lanzá A en paralelo, sin esperarla para mandar el correo.
Antes de decir que una clase "no está preparada", buscá SIEMPRE su fila de hoy en la base Clases de Notion (y su ficha): muchas veces el material está ahí aunque la descripción del evento no diga CLASE LISTA. Si hay dos materiales distintos para la misma clase, mostrá los dos y decí cuál es el más reciente.

═══════════════════════════════
A — AGENDA → NOTION (silencioso, antes que todo)
═══════════════════════════════
Mantené la base Agenda de Notion (collection://c25e367c-4a77-468d-88a4-c32306c754c0) como espejo del Google Calendar principal de Flor ("BREAKING BARRIERS CON LUCIA!"), ventana: 7 días atrás a 14 días adelante, hora de Buenos Aires.
Propiedades: Evento (título), Fecha (datetime), Tipo (Clase / Bloque de trabajo / Reunión / Pausa / Personal / Otro), Estado (Confirmado / Cancelado / No dada; NUNCA "Movido": si una fila vieja dice Movido, pasala a Confirmado y anotá el cambio en Notas), Clase lista (checkbox), Documento (url), Ficha interna (url), Calendar (url = htmlLink), Alumna (relación a collection://59d40821-721b-4597-9b86-4b856c800e87, solo si la identificás con certeza), Event ID (texto, la llave: el id tal cual de Calendar), Notas.
- Event ID existe → actualizá esa fila. No existe → creala. Nunca dupliques.
- Clase lista / Documento / Ficha interna: solo si la descripción del evento dice "CLASE LISTA" con la fecha de ese evento; de ahí salen los links.
- Filas de la ventana cuyo Event ID ya no está en Calendar → Estado Cancelado, Notas "No aparece en Calendar — corrida del <hoy>". Nunca borres filas.
- Ignorá siempre "Recordatorio de Micropaso" y los avisos automáticos de renovación.
- Excepción fija: la serie de las 20:00 (martes y jueves) "breaking barriers at work class" (recurringEventId b1hjq8s2fcrha2i6msrskda689) es la clase conjunta de Lina Aguilar + Corina Moreyra: Evento "Lina Aguilar + Corina Moreyra — clase", relacioná a las dos.
- No escribas en la base Clases ni toques Google Docs en este paso.

═══════════════════════════════
B — TU DÍA Y TUS CLASES
═══════════════════════════════
Agenda de HOY, hora por hora, una línea por cosa (clases, bloques, reuniones, pausas). Ignorá "Recordatorio de Micropaso".
Para cada clase: hora, alumna, foco en una línea y links que estén en "CLASE LISTA · [hoy]" de la descripción (Google Doc de la clase y guía de Notion). Si no dice CLASE LISTA de hoy, buscá su fila de hoy en la base Clases (collection://6edc592f-a786-4b01-aac8-1f462f058926). Si tampoco está: "no está preparada". No la prepares vos.
Controles: una clase repetida en dos horarios o una recurrencia vieja que choca con un evento puntual más nuevo con las mismas alumnas → una línea en "Ojo".
CONTENIDO DE HOY: filas de la base Contenido (collection://89bd6593-3e6d-4c2d-9363-c5be637f0741) con Fecha = hoy. Una línea por pieza: formato, hook y links (Canva y guion). Si es reel: "grabado el lunes, subilo hoy con esta descripción" + la descripción lista para copiar. Si no hay nada para hoy, no pongas la sección.
Si hoy hay una DISCOVERY CALL (título con "Discovery", "llamada", "consulta" o invitada que no es alumna), agregá debajo de su hora "Prep: llega 1 hora antes por separado" (la prepara otra tarea).

═══════════════════════════════
C — VENTAS (lunes a sábado; el domingo salteala)
═══════════════════════════════
1. Discovery calls de los últimos 14 días: Drive (notas de Gemini con "Discovery Call") y Wispr Flow. Para cada una: nombre, fecha, qué necesita, objeción, cómo terminó (sí / lo piensa / no), con una cita literal corta si la hay.
2. Las que dijeron sí o lo piensan: ¿pagó? Gmail (stripe, pago, payment, receipt, invoice, transferencia) y tracker. ¿Respondió algo después? Gmail con su nombre o mail.
3. Acciones de hoy:
   - Dijo que sí y no pagó en más de 48 h → seguimiento corto listo para copiar, que retome lo que ELLA dijo que quería lograr y resuelva la traba concreta (ej.: cómo pagar desde su país). Sin inventar links: "[link de pago]".
   - No respondió al último mensaje de Flor en más de 3 días → segundo y último seguimiento, pregunta simple de sí/no. Ya hubo dos sin respuesta → "dejar la puerta abierta" y no insistir.
   - Pagó → va a la parte D (onboarding).
4. Prospectas: NUNCA propongas a nadie de rutinas/prospectas-contactadas.md. Si alguna de esa lista escribió por su cuenta (Gmail o lo que veas), sí avisá acá.
5. Mafe Hernández: cerrada como "no por ahora, no tiene el dinero" (25/09). NO la pongas en ventas. Solo el 25/11/2026 agregá una línea: "Hoy se cumplen 2 meses del no de Mafe: ¿querés retomarla con un mensaje sin vender?" con un borrador corto en tú.
Si no hay ninguna acción, esta sección no aparece.

═══════════════════════════════
D — ONBOARDING DE ALUMNA NUEVA (SOP 02)
═══════════════════════════════
Detectá pagos NUEVOS de las últimas 72 h: Gmail (Stripe, "payment", "pago", "receipt", "transferencia", "comprobante") y el tracker de pagos (SOLO LECTURA). Un pago es de alumna nueva si esa persona no tiene carpeta en "VIP STUDENTS 2026" (1EKSntEU0pkzws27TxeovcAI1yz58ykTv) y no figura como activa en el tracker.
Los accesos a la plataforma y los mails automáticos de bienvenida los manda GHL: NO los repitas ni redactes otro mail de bienvenida.
Por cada alumna nueva:
1. Carpeta en Drive: si no existe, creala dentro de VIP STUDENTS 2026 con su nombre y apellido, y adentro las subcarpetas CLASES, MATERIALES, WEEKLY REPORTS y ASISTENCIA. Si ya existe, no crees otra.
2. Horario: proponé 3 opciones de horario semanal fijo de 60 minutos mirando los huecos reales del calendario de Flor de lunes a viernes entre las 8:00 y las 18:00 (no ofrezcas huecos que Flor protege como pausa). Tené en cuenta el país de la alumna si lo sabés, con la hora de ella entre paréntesis. No crees eventos.
3. Mensaje de WhatsApp de bienvenida listo para copiar (corto, cálido, en el trato que corresponda por país), que ofrezca las 3 opciones de horario y le pida terminar el módulo de onboarding antes de la primera sesión.
4. Qué falta en el tracker (fila, fecha de inicio 1:1, modalidad, monto): decilo para que lo cargue Flor. No edites el tracker.
5. Creá en Notion, base "Agenda semanal" (collection://104d3cdb-df0d-4899-b0fd-94837aa0294e), una tarea: Tarea "Onboarding [Nombre]: cargar tracker + fijar horario", Tipo "Ventas / seguimientos", Cuándo = hoy, Entregable "fila en el tracker y horario fijo confirmado". Antes de crearla, buscá si ya existe para no duplicar.
RENOVACIONES: si el pago es de una alumna que YA está en el programa (renovación o extensión), no crees carpeta: poné "✅ [Nombre] renovó" y el recordatorio del tracker de abajo.

RECORDATORIO DEL TRACKER (siempre que entre un pago, nuevo o de renovación, y hasta que Flor lo cargue):
Flor se olvida de cuál es el tracker. Nombralo SIEMPRE así, con el link:
"📋 Cargalo en tu Tracker de alumnas y pagos (es una planilla de Google en tu Drive, NO está en Notion): https://docs.google.com/spreadsheets/d/1UPwl976v7dNxcVhwbZ7YSCIhQnGCpaQ6ijPYdbHqLfs/edit"
y decí exactamente qué cargar: nueva fila (alumna nueva) o nueva fecha de fin / estado de renovación (renovación), monto y modalidad.
Para saber si ya lo cargó, leé la planilla (SOLO LECTURA): si la fila o la nueva fecha ya están, no lo repitas.
Si no hay pagos nuevos ni renovaciones pendientes de cargar, esta sección no aparece.

═══════════════════════════════
E — COBROS DEL MES
═══════════════════════════════
Del tracker (SOLO LECTURA): alumnas activas en cuotas mensuales. Para cada una calculá la próxima cuota (mismo día del mes que su fecha de inicio o de su primer pago, salvo que el tracker diga otra cosa) y cruzá con Gmail si ya entró el pago del mes.
Mostrá solo: cuotas que vencen en los próximos 5 días y cuotas vencidas sin pago registrado. Para cada una, un recordatorio amable listo para copiar (en su trato), sin tono de reclamo. Si el pago es por GHL/Stripe automático y ya entró, no aparece.
Si no hay nada, esta sección no aparece. Nunca inventes montos: usá los del tracker.

═══════════════════════════════
F — BANDEJA DE ENTRADA
═══════════════════════════════
Gmail de las últimas 24 h (los lunes, desde el viernes), bandeja principal. Ignorá newsletters, notificaciones automáticas, promociones, recibos ya cubiertos en C/D/E y los correos que mandan las tareas automáticas a Flor.
Clasificá en: URGENTE (hoy), RESPONDER (esta semana), LEER DESPUÉS.
Para cada URGENTE y RESPONDER que necesite respuesta escrita: creá un BORRADOR en Gmail (create_draft, en el mismo hilo) con la respuesta en el tono y trato de Flor. NUNCA envíes nada.
En el correo: una línea por mail (de quién, sobre qué, "borrador listo" si lo dejaste). LEER DESPUÉS: solo la cantidad.
Nada personal o sensible en el resumen: si un mail es personal, solo "1 mail personal para mirar".

═══════════════════════════════
G — LO QUE DICTASTE (captura por voz)
═══════════════════════════════
Wispr Flow: notas de scratchpad (search_scratchpad_notes) de las últimas 24 h (los lunes, desde el viernes). Separá:
- TAREAS: cada cosa que Flor dijo que tiene que hacer → una fila en "Agenda semanal" (collection://104d3cdb-df0d-4899-b0fd-94837aa0294e): Tarea (verbo + qué, corta), Tipo (el que corresponda: AT WORK, Contenido, Instagram, Ventas / seguimientos, Compromiso, Pausa / Personal), Cuándo (la fecha que ella dijo; si no dijo, dejala sin fecha), Entregable (una línea). Antes de crear, buscá si ya existe una fila parecida: no dupliques.
- IDEAS DE CONTENIDO: van a la sección de contenido de la base de Contenido de Notion si la encontrás (página CONTENIDO: https://app.notion.com/p/3e35708d644881e4a4ead23570764c5b) como idea en estado inicial; si no podés, como tarea Tipo "Contenido".
- Notas de clases o formaciones (Ann, máster, coaching): NO las proceses acá, de eso se encarga "Notion al día".
Respetá la regla de foco de la página HOY / ESTA SEMANA: no conviertas ideas sueltas en tareas con fecha si ella no puso fecha.
En el correo: "Cargué N tareas y N ideas que dictaste" + la lista en una línea cada una.

═══════════════════════════════
H — REFERIDAS (solo los lunes)
═══════════════════════════════
Alumnas activas que esta semana están en la Semana 8 a 10 del programa (del tracker) y cuyas últimas notas de Gemini muestran un avance concreto. Máximo 2 por semana. Para cada una: el logro concreto (con evidencia de clase, sin nada personal) y un mensaje corto listo para copiar que le pida, sin presión, si conoce a alguna colega que esté en la misma situación que ella tenía al empezar. No repitas a una alumna que ya apareció en un "Tu día" anterior (buscá en Gmail tus correos con asunto "Tu día").
Excluí a Alejandra Rossi.

═══════════════════════════════
I — TU CEO: LAS 3 COSAS DE HOY (todos los días, va ARRIBA del correo)
═══════════════════════════════
Flor te pidió que seas su CEO y project manager. Meta: USD 10.000 de ingreso mensual recurrente en marzo 2027.
Leé la página "Plan CEO · USD 10K por mes" (https://app.notion.com/p/3e75708d644881f88264e227ea08fffa): hitos del mes, decisiones pendientes y tablero.
Cruzalo con lo que encontraste en B a H y con su agenda real de hoy (respetá sus bloques protegidos: si hoy es día libre, como mucho 1 cosa de 10 minutos o ninguna).
Elegí como máximo 3 acciones de hoy, las que más acercan a la meta, en este orden de prioridad: (1) plata que se puede cerrar ya (renovación, venta pendiente, cobro), (2) el hito del mes que está atrasado, (3) una decisión pendiente del plan que la frena. Cada acción: verbo + qué + cuánto tiempo lleva (ej.: "Mandar a Belem la propuesta de renovación VIP · 10 min") + el material listo (mensaje para copiar o link).
Los LUNES, además: actualizá el "Tablero semanal" de esa página (MRR y alumnas del tracker, discovery calls y cierres de la semana, renovaciones, contenido publicado) y marcá los hitos cumplidos. No toques las decisiones: las marca Flor.
Nunca inventes números: todo sale del tracker, Gmail, Calendar y Notion. Si un número no está, decilo.

═══════════════════════════════
EL CORREO
═══════════════════════════════
Gmail send_message a florenciapersico@breakingbarriers.site. Asunto: "☀️ Tu día · [día DD/MM]" (si hay algo urgente: "☀️ Tu día · [día DD/MM] · [N] cosas para hoy").
Estilo de las reglas comunes (Open Sans/Arial, títulos #82552E, recuadros crema #FFF8E7 con borde #C68C6C, cada mensaje para copiar en su recuadro). Español rioplatense con voseo hacia Flor.
Orden:
1. Arriba: "🎯 Tu CEO · hoy" con las 3 acciones de la parte I, y debajo una línea: "MRR hoy USD X · meta USD 10.000 · faltan N meses".
2. Tu agenda (B).
3. Ventas (C) · Onboarding (D) · Cobros (E) · Bandeja (F) · Lo que dictaste (G) · Referidas (H, los lunes). Cada sección solo si tiene algo.
4. "Ojo" al final, solo si hay algo que no pudiste hacer o que está mal (una clase sin preparar, una herramienta que no respondió).
El correo siempre sale (aunque sea solo la agenda). Nada técnico: sin IDs, sin nombres de herramientas, sin explicar cómo lo hiciste.
Tu último mensaje de la sesión: el mismo resumen de 3 líneas de arriba (le llega como notificación al celular).
