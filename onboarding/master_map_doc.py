# Genera el documento de revisión "Master Delivery Map · 20 sesiones 1:1"
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BROWN, DARK, TERRA, MUTED = "81552E", "3F1E0D", "C68C6C", "8A6A55"
TINT, CARD = "FBF2D0", "F8F5EE"
TITLE, BODY = "Source Serif Pro", "Open Sans"

# estado de la clase en plataforma (base AT WORK de Notion, 23/09/2026)
G, D, N = "Grabada", "En desarrollo", "Todavía no creada"

S = [
 dict(n=1, sem=1, etapa="Onboarding", nombre="Onboarding de la alumna",
  core="Instalar su sistema de trabajo, fijar su punto de partida y definir su objetivo.",
  plat=[("ONB 01–13", "casi todo listo"), ("Recurso «Tu recorrido AT WORK»", "listo")],
  res="Termina la sesión con el sistema configurado, su Starting Point revisado, un objetivo profesional observable y 2–3 situaciones reales de alto impacto elegidas.",
  ev="Starting Point completo (autoevaluación + audio o video de 2–3 min) · objetivo escrito en una frase · lista de 2–3 situaciones reales · horario 1:1 agendado.",
  foco="instalar tu sistema de trabajo y definir desde dónde partes", puede="empezar el Módulo 1 sabiendo cuál es tu prioridad",
  micro=["El recorrido completo de 20 semanas: onboarding + las 4 etapas del método + offboarding, con el recurso «Tu recorrido AT WORK».",
         "El ciclo de cada semana: situación real → producir → diagnóstico → entrenar → retry → aplicar.",
         "Qué va en cada espacio (Skool, AT WORK Community, Drive, sesión 1:1) y cómo funciona el Weekly Report."],
  app="Escuchan juntas un fragmento de su audio del Starting Point y detectas los primeros patrones (comunicación, precisión, pronunciación, listening). Con eso definen su objetivo en conducta observable y eligen las situaciones que serán su campo de entrenamiento. Ej.: Belén, el onboarding de un proveedor nuevo; Sol, el status de su proyecto; Virginia, el update al CEO.",
  retry="Se presenta (rol, equipo, qué hace) en 60 segundos, sin guion. Le das una sola indicación y lo repite.",
  next="Completar lo que falte del checklist de ONB 13, subir 3–5 materiales reales, reservar sus bloques de práctica y traer una situación real para la sesión 2.",
  ya="En esta sesión todavía no se enseña contenido del Módulo 1: se instala el sistema y se deja el punto de partida medible."),

 dict(n=2, sem=2, etapa="Activate Your English", nombre="Produce First · Role Play",
  core="Convertir una situación real en práctica y producir antes de preparar una respuesta perfecta.",
  plat=[("M1.1 My Professional Context", D), ("M1.2 Your AT WORK Practice System", D), ("M1.3 Role Play Method", G), ("M1.7 Acceso y configuración de bots", D)],
  res="Produce una primera versión espontánea de una situación real, sin guion, y sabe repetirla con un bot entre sesiones.",
  ev="Role play grabado sin guion (versión 1 + retry) · puede decir qué le salió fácil y dónde apareció fricción.",
  foco="producir primero, antes de preparar", puede="practicar tu propio trabajo entre sesiones, con o sin bot",
  micro=["Por qué producir primero: el inglés que ya tienes se activa usándolo, no repasándolo. Preparar no es lo mismo que poder hacerlo en el momento.",
         "Cómo se arma un role play: contexto, interlocutor, propósito y presión. 2–3 minutos.",
         "El ciclo AT WORK: Real Situation → Produce → Analyze → Upgrade → Practice → Retry → Apply.",
         "Cómo usar los bots para repetir esa situación."],
  app="Role play en vivo, tú haces del interlocutor. Belén le explica al proveedor los pasos del onboarding; Sol le da el status a su manager; Virginia abre el update al CEO.",
  retry="Mismo role play con un solo ajuste. Presión: el interlocutor hace una pregunta inesperada.",
  next="Repetir con bot un role play de una situación próxima y guardar la primera versión + observaciones en 04 · MIS PRÁCTICAS.",
  ya="Sube la presión: un interlocutor con más poder, menos tiempo o una situación que evita."),

 dict(n=3, sem=3, etapa="Activate Your English", nombre="Narrative Flow · corregir lo que revela tu inglés real",
  core="Convertir su producción espontánea en diagnóstico: autocorregirse y elegir pocos focos.",
  plat=[("M1.4 Narrative Flow", G)],
  res="Revisa una producción propia, se autocorrige antes de recibir corrección y sale con un Error Radar de 1–3 focos.",
  ev="Corrige parte de su producción sin que le des la respuesta primero · Error Radar escrito y priorizado.",
  foco="aprender de tu propia producción", puede="detectar tus errores y saber cuáles importan",
  micro=["Narrative Flow: volver a una producción real y revisarla manteniendo lo que quisiste decir.",
         "Autocorrección primero, corrección externa después.",
         "Error recurrente vs. error aislado: se corrige lo que se repite y lo que interfiere con la claridad.",
         "Error Radar: máximo 1–3 focos a vigilar."],
  app="Toma la grabación de la sesión 2 (o un audio de la semana) y la revisa contigo. Belén: lo que dijo al proveedor. Sol: su status. Virginia: su update.",
  retry="Vuelve a producir la misma situación atenta solo a su Error Radar.",
  next="Aplicar el Error Radar a otra producción breve y traer un ejemplo de autocorrección.",
  ya="Que haga la revisión sola y tú solo validas la prioridad."),

 dict(n=4, sem=4, etapa="Activate Your English", nombre="Color Method + retry · ciclo completo",
  core="Expandir el lenguaje que realmente puede recuperar y cerrar el primer ciclo completo con un retry observable.",
  plat=[("M1.5 Color Method", G), ("M1.6 Your Complete Practice Cycle / Retry", D)],
  res="Mejora una segunda versión de su situación real, sin memorizar un guion, usando su Error Radar y 2–3 piezas de lenguaje nuevo.",
  ev="Versión 1 vs retry con al menos una mejora concreta que ella misma puede nombrar · 2–3 piezas de Active Language registradas.",
  hito="Primer ciclo completo. Pregunta clave: ¿puede practicar sola entre sesiones? Si no, queda como carry-over prioritario durante la etapa 2.",
  foco="cerrar tu primer ciclo completo de práctica", puede="practicar sola, con método, entre sesiones",
  micro=["Color Method: explorar lenguaje útil a partir de tu mensaje real, no coleccionar vocabulario. Pasarlo de reconocerlo a recuperarlo y usarlo.",
         "Elegir 2–3 piezas de Active Language que mejoren claridad, precisión o impacto, y practicarlas en más de una frase.",
         "Retry: volver a la misma situación con Error Radar + Active Language y comparar."],
  app="Retoma la situación de las sesiones 2–3 para poder comparar. Elige su Active Language, lo practica y hace el retry.",
  retry="Retry sin notas. Presión: una pregunta de seguimiento sobre lo que acaba de decir.",
  next="Aplicar el ciclo completo a una situación nueva: Produce → Correct → Upgrade → Practice → Retry → Apply.",
  ya="Que haga el ciclo con una situación nueva en la sesión y tú solo observes."),

 dict(n=5, sem=5, etapa="Communicate in Real Time", nombre="Propósito, mensaje clave y frases claras",
  core="Saber qué quiere lograr con su mensaje y construir una versión simple y estable antes de agregar complejidad.",
  plat=[("M2.1 Build Clear Sentences in Real Time", D)],
  res="Antes de entrar en detalles, formula su propósito y su mensaje clave, y lo dice con oraciones cortas y estables.",
  ev="Propósito y mensaje clave en una frase cada uno · mensaje breve con oraciones claras · menos frases largas encadenadas.",
  foco="saber qué quieres lograr y decirlo simple", puede="decir tu mensaje clave en una frase",
  micro=["Propósito: ¿qué quiero que la otra persona entienda, decida o haga?",
         "Mensaje clave en una frase, antes que el contexto.",
         "Oración clara: sujeto + verbo + información. Una idea por frase. Primero estable, después complejo.",
         "Chunks: «The key point is…», «What I need from you is…»."],
  app="Belén: el mensaje clave para el proveedor («To start working with us, you need to complete three steps this week»). Sol: el mensaje clave de su status. Virginia: lo único que el CEO tiene que saber.",
  retry="La misma intervención, empezando por el mensaje clave y con frases cortas. Presión: «So what do you need from me?».",
  next="Preparar una situación real con propósito + mensaje clave en 2–3 líneas, sin escribir un guion.",
  ya="Que lo haga sin escribir: 10 segundos para pensar y habla."),

 dict(n=6, sem=6, etapa="Communicate in Real Time", nombre="Organize & Prioritize · Main Point First",
  core="Ir al punto y estructurar mensajes fáciles de seguir bajo presión.",
  plat=[("M2.3 Organize & Prioritize Your Message", D)],
  res="Da un update claro de 1–2 minutos: primero el punto principal, después 2–3 puntos de soporte, y cierra con un próximo paso.",
  ev="Message Map de una situación real · update grabado de 1–2 min que empieza por el punto principal y cierra con una acción.",
  foco="empezar por lo importante", puede="dar un update claro en 1–2 minutos",
  micro=["Message Map: mensaje principal → 2–3 puntos de soporte → próximo paso.",
         "Main Point First / BLUF (Bottom Line Up Front).",
         "Evitar el «context dumping»: el contexto va después del punto, no antes."],
  app="Sol: el status de su proyecto. Virginia: el update al CEO. Belén: un resumen para su equipo sobre cómo va el onboarding del proveedor.",
  retry="El mismo update con Message Map, sin leer. Presión: «I only have one minute».",
  next="Grabar un update real aplicando Main Point First y hacer un retry si empieza por el contexto.",
  ya="Que arme el Message Map mentalmente en 30 segundos, sin papel."),

 dict(n=7, sem=7, etapa="Communicate in Real Time", nombre="Flexible Frameworks + Keep Speaking",
  core="Sostener el mensaje con una estructura (no con un guion) y seguir hablando cuando falta una palabra.",
  plat=[("M2.3 Organize & Prioritize Your Message (frameworks)", D), ("M2.2 Keep Speaking When the Word Doesn't Come", G)],
  res="Explica la misma idea de dos maneras distintas y, cuando falta una palabra, la rodea y llega al significado sin frenar ni pasar al español.",
  ev="La misma situación dicha con dos estructuras · resuelve 2–3 bloqueos parafraseando.",
  foco="sostener tu mensaje sin guion", puede="seguir hablando aunque falte una palabra",
  micro=["Frameworks según la situación: STATUS → DELTA → WHY → ACTION → OUTLOOK para updates; Situation → Issue → Action para problemas; Point → Evidence → Implication para recomendaciones.",
         "Una estructura es un mapa, no un texto memorizado.",
         "Cuando falta la palabra: Category / Function / Example / Contrast («It's a kind of…», «It's what we use to…», «For example…», «It's not… but…»).",
         "Reformular sin abandonar la idea: «What I mean is…», «Let me put it another way»."],
  app="Explica una situación con el framework que le corresponde y un término de su trabajo sin usar la palabra clave. Belén: un requisito de compliance del proveedor. Sol: un retraso y una dependencia técnica. Virginia: una recomendación y un indicador financiero.",
  retry="La misma situación con otro framework y otras palabras prohibidas. Presión: «Sorry, I don't understand. Can you explain it differently?».",
  next="Elegir 3 términos de su trabajo y practicar cómo explicarlos sin decir la palabra exacta.",
  ya="Que explique lo mismo a alguien que no es de su área."),

 dict(n=8, sem=8, etapa="Communicate in Real Time", nombre="Gain Time + Repair & Continue",
  core="Ganar segundos útiles, recuperarse de errores o de la pérdida del hilo y continuar sin reiniciar.",
  plat=[("M2.4 Repair & Continue", N)],
  res="Ante un false start, un error o la pérdida del hilo, se recupera y vuelve al punto principal sin empezar de nuevo.",
  ev="Se recupera de al menos 2 interrupciones o errores sin reiniciar la explicación · usa el tiempo para pensar de forma profesional.",
  foco="recuperarte y seguir cuando algo se desarma", puede="volver al punto sin empezar de cero",
  micro=["Ganar tiempo con frases y pausas funcionales, no con fillers vacíos: «That's a good question. Let me think…», «Give me a second».",
         "Recuperar el hilo: «Going back to…», «As I was saying…», «Where was I? Right…».",
         "Repair & Continue: autocorregirse sin frenar («Sorry, I mean…») y volver al main point."],
  app="Role play de su situación con interrupciones controladas. Virginia: el CEO la corta a mitad del update. Sol: un stakeholder cambia de tema. Belén: el proveedor la interrumpe con una duda.",
  retry="La misma intervención con una interrupción nueva.",
  next="Un role play corto con bot con una interrupción deliberada, practicando repair + continue.",
  ya="Dos interrupciones seguidas o una pregunta que la saca de su tema."),

 dict(n=9, sem=9, etapa="Communicate in Real Time", nombre="Manage the Interaction",
  core="Responder, aclarar, preguntar, hacer pushback y adaptarse cuando la conversación cambia.",
  plat=[("M2.5 Manage the Interaction", N), ("Workplace Guides 6 y 7", D)],
  res="Responde una secuencia de preguntas no preparadas manteniendo su propósito, y pide aclaración o hace pushback sin bloquearse.",
  ev="Ronda de preguntas no preparadas respondida con una respuesta directa primero · al menos una aclaración o pushback bien resuelto.",
  foco="manejar la conversación cuando no sale como planeaste", puede="responder preguntas sin perder tu objetivo",
  micro=["Responder preguntas: respuesta directa + una razón.",
         "Aclarar y chequear comprensión: «Do you mean…?», «Just to make sure I understand…».",
         "Pushback y desacuerdo con tono profesional: «I see your point, but…», «I'd suggest a different approach».",
         "Adaptar el nivel de detalle según la reacción del otro."],
  app="Q&A de su situación con la Workplace Guide que corresponda (Disagreeing or Clarifying Politely / Handling Unexpected Questions). Virginia: preguntas incómodas del CEO. Sol: un stakeholder impaciente. Belén: un proveedor que no acepta un plazo.",
  retry="La misma ronda de preguntas. Presión: una objeción o dos preguntas seguidas.",
  next="Aplicar la guía a una interacción real próxima y registrar en el Weekly Report qué funcionó y qué costó.",
  ya="Objeción con desacuerdo: tiene que sostener su postura."),

 dict(n=10, sem=10, etapa="Communicate in Real Time", nombre="Clear, Concise & Specific · integración",
  core="Integrar la etapa en una situación laboral completa: clara, concisa, específica y adaptable.",
  plat=[("M2.6 How to Use Your Workplace Practice Library", N), ("Workplace Guides 1–8", D)],
  res="Completa una situación laboral de principio a fin (mensaje + preguntas) con menos dependencia de guion.",
  ev="Simulación completa grabada y comparada con el Starting Point · puede nombrar 2–3 capacidades que ahora aparecen con más consistencia · 2–3 patrones de precisión elegidos para las sesiones 11–16.",
  hito="Revisión de mitad de programa. Comparan con el Starting Point y la evidencia de las semanas 2–10: qué ya hace sola y qué patrones todavía limitan su claridad. Eso define el foco de Polish.",
  foco="integrar todo lo de esta etapa y mirar cuánto avanzaste", puede="manejar una situación real completa y saber qué pulir",
  micro=["Clara, concisa y específica: cortar repetición, vaguedad y contexto innecesario; usar números y fechas concretas; cerrar con acción, responsable y plazo.",
         "Cómo elegir la Workplace Guide según la situación (Project Update, Problem & Next Steps, Explain a Process, Presentation…)."],
  app="La situación más importante de su mes, con la guía que corresponda. Belén: kickoff completo con el proveedor (Explaining a Process). Sol: status con preguntas (Giving a Clear Project Update). Virginia: update al CEO con Q&A.",
  retry="Una versión más corta y más específica. Presión: preguntas sobre números o fechas.",
  next="Weekly Report de mitad de programa con evidencia concreta y su foco para Polish.",
  ya="—"),

 dict(n=11, sem=11, etapa="Polish Your English", nombre="The English Verb System I · marcos temporales",
  core="Usar el sistema verbal con estabilidad para hablar de presente, pasado y futuro en situaciones reales.",
  plat=[("M3.1 The English Verb System", D)],
  res="Cuenta un update o una situación manteniendo una línea temporal comprensible, sin cambios de tiempo innecesarios.",
  ev="Update con pasado + presente + próximos pasos, con línea temporal clara · baja visible de su patrón verbal recurrente.",
  foco="usar bien los tiempos verbales en tus updates", puede="contar qué hicieron, qué están haciendo y qué viene",
  micro=["Primero la referencia de tiempo, después el nombre del tiempo verbal.",
         "La línea de un update: what we did (past) / what we're doing (present continuous) / how it works (present simple) / what's next (future).",
         "Su Error Radar verbal: el error más frecuente de ella, según la revisión de la sesión 10."],
  app="Sol: qué hicieron, qué están haciendo y cómo sigue. Belén: cómo funciona normalmente el onboarding y qué está pasando con este proveedor. Virginia: resultados de la semana y próximos pasos.",
  retry="El mismo update, atenta a los verbos. Presión: «When did that happen?».",
  next="Grabar un update con pasado + presente + próximos pasos y revisarlo con su Error Radar verbal.",
  ya="Pasa directo al Verb System II."),

 dict(n=12, sem=12, etapa="Polish Your English", nombre="The English Verb System II · aspecto y experiencia",
  core="Elegir formas verbales con precisión al hablar de experiencia, duración, progreso y resultados.",
  plat=[("M3.1 The English Verb System", D), ("Precision Library: Present Perfect", "según necesidad")],
  res="Expresa progreso, duración y resultados hasta ahora con una elección verbal coherente, sin perder fluidez.",
  ev="Update con «so far / already / yet / for / since» bien usados · mantiene fluidez aunque esté corrigiendo un patrón.",
  foco="hablar de resultados, progreso y duración", puede="decir qué está hecho, qué falta y desde cuándo",
  micro=["Present Perfect vs Past Simple: «We've completed…» (resultado hasta ahora) vs «We completed it on Monday» (hecho con fecha).",
         "Progreso y duración: «We've been working on this since March».",
         "Cuándo el perfecto o el continuo cambian el mensaje."],
  app="Virginia: resultados del trimestre hasta ahora. Belén: qué ya completó el proveedor y qué falta. Sol: avances del proyecto desde el último update.",
  retry="El mismo update. Presión: «What's still pending?», «How long has that been an issue?».",
  next="Aplicar los contrastes verbales a un proyecto real y traer 3 ejemplos propios.",
  ya="Que sume condiciones: «If they approve it, we'll…»."),

 dict(n=13, sem=13, etapa="Polish Your English", nombre="Questions & Word Order",
  core="Construir preguntas y oraciones con un orden estable bajo presión.",
  plat=[("M3.2 Questions & Word Order", D), ("Precision Library: Translation Patterns", "según necesidad")],
  res="Formula preguntas claras (directas e indirectas) sin perder tiempo en la estructura y mantiene el orden de la frase al hablar.",
  ev="5 preguntas reales de su trabajo, correctas · role play donde ella conduce con preguntas · mejora del word order en producción espontánea.",
  foco="preguntar bien y ordenar tus frases", puede="conseguir la información que necesitas con preguntas claras",
  micro=["Estructura: (question word) + auxiliar + sujeto + verbo.",
         "Preguntas indirectas, más amables y sin inversión: «Could you tell me when…?», «Do you know if…?».",
         "Orden de la frase: sujeto + verbo + objeto + lugar + tiempo.",
         "Evitar la traducción directa de patrones del español."],
  app="Preguntas de clarificación, de seguimiento y de diagnóstico. Belén le pregunta al proveedor por documentación pendiente. Sol le pide información a otro equipo. Virginia hace preguntas de seguimiento a su equipo.",
  retry="Las mismas preguntas. Presión: el interlocutor responde vago y ella tiene que repreguntar.",
  next="Preparar 5 preguntas reales que va a necesitar esa semana y practicar variaciones.",
  ya="Que conduzca una reunión corta solo con preguntas."),

 dict(n=14, sem=14, etapa="Polish Your English", nombre="Modals for Professional Communication",
  core="Controlar posibilidad, certeza, obligación, recomendación, pedidos y pushback con la fuerza adecuada.",
  plat=[("M3.3 Modals for Professional Communication", N)],
  res="Ajusta el modal a la certeza o la fuerza que quiere comunicar: puede pedir, recomendar o hacer pushback sin sonar ni brusca ni vaga.",
  ev="Un pedido, una recomendación y un límite en la misma interacción, con el modal adecuado · puede explicar por qué eligió esa fuerza.",
  foco="pedir y recomendar con el tono justo", puede="ser firme y cordial a la vez",
  micro=["Certeza y posibilidad: will / should / might / could.",
         "Obligación y recomendación: must / have to / need to / should / I'd recommend.",
         "Pedidos y sugerencias: could you / would you / would it be possible to…?",
         "La escala de fuerza: la misma idea dicha de más suave a más firme."],
  app="Belén: pedirle al proveedor que cumpla un plazo, firme pero cordial. Sol: pedir más recursos. Virginia: recomendarle una decisión al CEO con el nivel de certeza correcto.",
  retry="La misma conversación. Presión: la otra persona dice que no.",
  next="Decir 3 mensajes reales con distintos grados de fuerza y elegir el más adecuado para cada uno.",
  ya="Presión: negociar una alternativa después del no."),

 dict(n=15, sem=15, etapa="Polish Your English", nombre="Causes, Conditions & Consequences",
  core="Expresar relaciones lógicas entre hechos, causas, condiciones, riesgos y consecuencias.",
  plat=[("M3.4 Causes, Conditions & Consequences", N), ("M3.5 High-Frequency Precision Patterns", N)],
  res="Explica un problema o una decisión mostrando causa → impacto → acción, y construye un escenario condicional sin perder claridad.",
  ev="Explicación de un problema real con causa, impacto y acción · al menos un condicional bien construido · su patrón de alta frecuencia baja en el retry.",
  foco="explicar causas y consecuencias con precisión", puede="explicar un problema y su impacto con claridad",
  micro=["Causa: because / because of / due to.",
         "Condición: if / unless / as long as (if + presente, will).",
         "Consecuencia: so / as a result / which means.",
         "Sus patrones de alta frecuencia que aparezcan en la producción, sin convertir cada duda en una clase."],
  app="Riesgos, decisiones, problemas y next steps. Sol: por qué se retrasa algo y qué pasa si no se resuelve. Virginia: el impacto de una decisión. Belén: qué pasa si el proveedor no completa un paso.",
  retry="La misma explicación. Presión: «What if that doesn't work?».",
  next="Aplicar causa / condición / consecuencia a una situación real y hacer un retry oral.",
  ya="Que proponga una solución con condiciones."),

 dict(n=16, sem=16, etapa="Polish Your English", nombre="Precision Audit + integración",
  core="Cerrar Polish: identificar qué patrones de precisión todavía interfieren y sostenerlos en tiempo real.",
  plat=[("Precision Library", "según necesidad"), ("M3.5 High-Frequency Precision Patterns", N)],
  res="Mantiene estables sus 2–3 patrones prioritarios mientras habla en tiempo real, no solo cuando piensa en la gramática.",
  ev="Mapa de patrones: estable / a vigilar / prioritario · mejora en al menos 2 patrones dentro de producción espontánea · comparación con la situación de la sesión 10.",
  hito="Mapa de patrones de precisión. Lo que sigue en «prioritario» pasa a ser track transversal en las sesiones 17–20.",
  foco="sostener tu precisión cuando hablas en tiempo real", puede="hablar con precisión sin frenar",
  micro=["Chequeo rápido (no se enseña todo): articles, countability, prepositions, agreement, -ING / infinitive, passive, collocations, word families, nominalization, translation patterns. Solo se marcan los que aparecen en su evidencia.",
         "Práctica focalizada solo en sus 2–3 patrones de mayor impacto.",
         "Autocorrección rápida: detectar, corregir y seguir."],
  app="Repite la situación del hito de la sesión 10, o una equivalente, integrando verbos, preguntas, modales y relaciones lógicas.",
  retry="Retry final de Polish, más rápido. Presión: interrupciones y preguntas.",
  next="Practicar solo los patrones prioritarios y llevarlos a una situación laboral real.",
  ya="—"),

 dict(n=17, sem=17, etapa="Understand & Be Understood", nombre="How English Really Sounds + Train Your Ear",
  core="Reconocer el inglés real y dejar de esperar una pronunciación palabra por palabra.",
  plat=[("M4.1 How English Really Sounds", D), ("M4.3 Train Your Ear", N)],
  res="Entiende la idea principal y más detalles en la segunda escucha, y reconoce fenómenos de connected speech.",
  ev="Main point + más detalles en la segunda escucha que en la primera · señala al menos 2 fenómenos de connected speech en el audio.",
  foco="entender el inglés como se habla de verdad", puede="seguir una conversación real sin perder lo importante",
  micro=["Por qué no entiende aunque conozca las palabras: linking (turn it off), reductions (gonna, wanna), formas débiles (to, for, of), stress y rhythm.",
         "Ciclo de escucha: Listen → Main Point → Detail → Inspect → Listen Again → Respond.",
         "En una reunión: confirmar lo que entendió en lugar de pedir que repitan todo."],
  app="Un audio de su contexto: una reunión real (si puede compartirla) o un video de su industria, con los acentos con los que trabaja.",
  retry="Segunda escucha para completar lo que faltó; después responde como si estuviera en la reunión.",
  next="Una práctica corta de listening deliberado con el ciclo completo, con notas guardadas como evidencia.",
  ya="Audios más rápidos o con acentos que le cuestan."),

 dict(n=18, sem=18, etapa="Understand & Be Understood", nombre="Pronunciation for Intelligibility + Shadowing",
  core="Mejorar los patrones de pronunciación que más afectan cuánto le cuesta al otro entenderla.",
  plat=[("M4.2 Pronunciation for Intelligibility", N), ("M4.4 Shadowing: Train Your Ear & Mouth", N)],
  res="Transfiere al menos un patrón de pronunciación trabajado a frases propias de su trabajo.",
  ev="Grabación antes / después de un mismo mensaje · reproduce y transfiere al menos un patrón.",
  foco="que te entiendan sin esfuerzo", puede="marcar tu mensaje con énfasis, ritmo y pausas",
  micro=["El objetivo es ser entendida, no sonar nativa.",
         "Diagnóstico individual: word stress, sentence stress, ritmo, linking, finales (-ed, -s) o los sonidos que en su caso cambian el significado.",
         "Shadowing: escuchar y repetir en simultáneo imitando ritmo y entonación.",
         "Record → compare → adjust → record again."],
  app="Sus palabras y frases clave. Belén: vendor, compliance, onboarding. Sol: deliverable, timeline, schedule. Virginia: revenue, forecast, quarterly.",
  retry="El mismo mensaje con el patrón corregido. Presión: a velocidad normal de reunión.",
  next="Shadowing breve + grabar un mensaje propio con 1–2 focos de inteligibilidad.",
  ya="Trabajar entonación en preguntas y recomendaciones."),

 dict(n=19, sem=19, etapa="Understand & Be Understood", nombre="Real-Time Listening + Speaking",
  core="Integrar comprensión, inteligibilidad y respuesta en una interacción laboral completa.",
  plat=[("Workplace Guides", D), ("Revisión integrada M1–M4", "")],
  res="Escucha una intervención real, extrae lo importante, confirma lo que entendió y responde con estructura, precisión e inteligibilidad.",
  ev="Interacción completa con input auditivo + respuesta + follow-up · puede decir qué capacidades ya son autónomas y cuáles todavía necesitan apoyo.",
  foco="escuchar y responder en el momento", puede="participar en una reunión real con más seguridad",
  micro=["Escuchar sin transcript y extraer main point / action / risk.",
         "Escuchar → confirmar → responder: «If I understand correctly…», «So what you're saying is…».",
         "Usar lo de Communicate (estructura), Polish (sus patrones) y Understand (inteligibilidad) sin sobrecontrolarse."],
  app="Reunión simulada completa con variaciones, interrupciones y follow-up. Virginia recibe feedback del CEO y responde. Sol recibe un cambio de prioridad. Belén: el proveedor pone una objeción.",
  retry="La misma reunión. Presión: el interlocutor habla rápido o con otro acento.",
  next="Preparar la sesión 20: volver a grabar la consigna del Starting Point y elegir 3 evidencias del proceso.",
  ya="Dos interlocutores que no están de acuerdo."),

 dict(n=20, sem=20, etapa="Offboarding", nombre="Offboarding · Before → After → Next Level",
  core="Cerrar el ciclo AT WORK con evidencia, consolidar su autonomía y definir el siguiente nivel.",
  plat=[("Starting Point + Weekly Reports + Wins", ""), ("Recurso «Tu recorrido AT WORK»", "listo")],
  res="Compara su punto de partida con el actual, nombra qué capacidades quedaron instaladas y sale con un plan de 90 días.",
  ev="Muestra final comparable con el Starting Point · resumen Before → After basado en evidencia · plan de 90 días.",
  foco="mirar todo tu recorrido y definir cómo sigues", puede="seguir practicando sola, con método",
  micro=["No hay contenido nuevo: cómo seguir sola (ciclo de práctica, bots, su propio Weekly Report)."],
  app="Repite una tarea comparable al Starting Point, sin guion. Escuchan juntas el audio del Starting Point y el de hoy, y revisan Weekly Reports, wins y situaciones reales como evidencia. Identifican 2–3 gaps que todavía necesitan trabajo.",
  retry="Una sola vuelta final: su mejor versión.",
  next="Plan de 90 días: qué mantener, qué seguir entrenando y cómo hacerlo de forma autónoma. Si hay una necesidad real, el siguiente nivel de acompañamiento. Pedir feedback o testimonio si corresponde.",
  ya="—"),
]

COVERAGE = [
 ("Onboarding, Roadmap, How We Work, Acuerdo, Ecosistema, Starting Point, Weekly System", "S1"),
 ("My Professional Context · Practice System · bots", "S1–S2"),
 ("Role Play Method", "S2 · se reutiliza en S8, S9 y S19"),
 ("Narrative Flow · Error Radar", "S3 · transversal"),
 ("Color Method · Active Language", "S4 · transversal"),
 ("Complete Practice Cycle · Retry", "S4 · en todas las sesiones"),
 ("Purpose & Key Message · Build Clear Sentences", "S5"),
 ("Organize & Prioritize · Main Point First · BLUF · Message Map", "S6"),
 ("Flexible Frameworks · Keep Speaking When the Word Doesn't Come", "S7"),
 ("Gain Time to Think · Repair & Continue", "S8"),
 ("Manage the Interaction · preguntas inesperadas · aclarar · pushback", "S9"),
 ("Clear, Concise & Specific · Workplace Practice Library (8 guías)", "S10 · guías aplicadas en S9–S19 según la situación"),
 ("The English Verb System I–II", "S11–S12"),
 ("Questions & Word Order", "S13"),
 ("Modals for Professional Communication", "S14"),
 ("Causes, Conditions & Consequences", "S15"),
 ("High-Frequency Precision Patterns · Precision Library", "S15–S16 · antes si un patrón bloquea"),
 ("How English Really Sounds · Train Your Ear", "S17"),
 ("Pronunciation for Intelligibility · Shadowing", "S18"),
 ("Listening & Pronunciation Practice Library", "S17–S19 · antes si hace falta"),
 ("Integración final · comparación con el Starting Point · autonomía", "S19–S20"),
]

TRACKS = [
 ("Precisión", "Se observa desde la sesión 3 con el Error Radar. Polish la trabaja de forma intensiva. Si un patrón bloquea antes, se interviene antes."),
 ("Pronunciación", "Desde el inicio se corrige solo cuando afecta la comprensión. Understand & Be Understood la trabaja de forma intensiva."),
 ("Listening", "Se entrena cuando la situación real lo pide. Understand & Be Understood lo sistematiza."),
 ("Situaciones reales", "Cada sesión usa una situación o material real. Las Workplace Guides entran como escenario, no como un curso paralelo."),
 ("Evidencia y retry", "Toda sesión tiene producción, feedback, retry y evidencia. Ver un video no cuenta como progreso por sí solo."),
]

doc = Document()
sec = doc.sections[0]
sec.left_margin = sec.right_margin = Cm(2.2); sec.top_margin = sec.bottom_margin = Cm(2)

st = doc.styles["Normal"]; st.font.name = BODY; st.font.size = Pt(10.5); st.font.color.rgb = RGBColor.from_string(DARK)
st.element.rPr.rFonts.set(qn("w:eastAsia"), BODY)
st.paragraph_format.space_after = Pt(4); st.paragraph_format.line_spacing = 1.2

def run(p, text, bold=False, italic=False, size=None, color=None, font=None):
    r = p.add_run(text); r.bold = bold; r.italic = italic
    if size: r.font.size = Pt(size)
    if color: r.font.color.rgb = RGBColor.from_string(color)
    if font: r.font.name = font; r._element.rPr.rFonts.set(qn("w:eastAsia"), font)
    return r

def para(text="", **kw):
    p = doc.add_paragraph()
    if text: run(p, text, **kw)
    return p

def shade(cell, color):
    tcPr = cell._element.get_or_add_tcPr(); sh = OxmlElement("w:shd")
    sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), color); tcPr.append(sh)

def borders(table, color="EDE5CC"):
    tblPr = table._element.tblPr; b = OxmlElement("w:tblBorders")
    for e in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{e}"); el.set(qn("w:val"), "single"); el.set(qn("w:sz"), "4"); el.set(qn("w:color"), color); b.append(el)
    anchor = tblPr.find(qn("w:tblLayout"))
    if anchor is None: anchor = tblPr.find(qn("w:tblLook"))
    anchor.addprevious(b) if anchor is not None else tblPr.append(b)

def widths(t, ws):
    t.autofit = False
    grid = t._element.find(qn("w:tblGrid"))
    for gc, w in zip(grid.findall(qn("w:gridCol")), ws): gc.set(qn("w:w"), str(int(Cm(w).twips)))
    for row in t.rows:
        for c, w in zip(row.cells, ws): c.width = Cm(w)

def label(text):
    p = para(); p.paragraph_format.space_before = Pt(8); p.paragraph_format.space_after = Pt(2)
    run(p, text.upper(), bold=True, size=8.5, color=TERRA)

def box(text, fill=TINT, lab=None):
    t = doc.add_table(rows=1, cols=1); borders(t, fill); c = t.cell(0, 0); shade(c, fill)
    p = c.paragraphs[0]
    if lab: run(p, lab + "  ", bold=True, size=9, color=BROWN)
    run(p, text, size=10)
    para().paragraph_format.space_after = Pt(0)

# Portada
p = para(); run(p, "BREAKING BARRIERS AT WORK", bold=True, size=9, color=TERRA)
p = para(); run(p, "Master Delivery Map", bold=True, size=28, color=BROWN, font=TITLE)
p = para(); run(p, "20 sesiones 1:1 · la columna vertebral del programa", italic=True, size=14, color=MUTED, font=TITLE)
p = para(); run(p, "Borrador para revisar antes de subir a Notion · by Flor Pérsico", size=9, color=MUTED)

label("Cómo leer este documento")
para("Cada alumna tiene una sesión 1:1 por semana: 20 sesiones en total. La sesión 1 es su onboarding, las sesiones 2–19 recorren el método completo y la sesión 20 es el offboarding.")
para("Principio: THE PATH IS STRUCTURED. THE INTERVENTION IS PERSONALIZED.", bold=True, size=10, color=BROWN)
para("La plataforma es soporte. La sesión 1:1 garantiza que cada alumna pase por todas las etapas y todas las habilidades esenciales, aunque no haya visto un video.")
t = doc.add_table(rows=1, cols=2); borders(t)
for i, (h, b) in enumerate([("LO FIJO", "Etapa · Core Skill · resultado esperado · evidencia observable · microenseñanza"),
                             ("LO QUE VARÍA", "Su situación real: lo que trae en el Weekly Report o lo que tiene esa semana en el trabajo. Si el Weekly Report pide una situación concreta, esa situación manda; la habilidad se mantiene.")]):
    c = t.cell(0, i); shade(c, TINT if i == 0 else CARD); cp = c.paragraphs[0]
    run(cp, h + "\n", bold=True, size=9, color=BROWN); run(cp, b, size=10)
para()

label("Estructura fija de cada sesión")
steps = [("Apertura", "Etapa + foco + resultado: «Estamos en…, hoy el foco es…, al terminar vas a poder…»."),
         ("Situación real y primer intento", "Produce antes de recibir ayuda. Sin frameworks ni frases antes del primer intento."),
         ("Diagnóstico", "Un solo gap prioritario: comunicación, lenguaje disponible, precisión, pronunciación o listening."),
         ("Microenseñanza (5–10 min)", "Si no vio la clase de la plataforma, si todavía no está disponible o si el primer intento muestra que no la incorporó. Si ya la vio: una pregunta de chequeo y directo a la aplicación."),
         ("Aplicación a su situación real", "La herramienta aplicada a su trabajo, no a un ejemplo inventado."),
         ("Retry + presión", "La misma tarea otra vez para comparar intento 1 vs intento 2; después, algo de imprevisibilidad."),
         ("Cierre", "Evidencia + gap + siguiente acción: qué logró hoy, qué falta y qué hace esta semana."),
         ("Next step", "Continúa exactamente la habilidad de la sesión. Nada de tarea desconectada.")]
t = doc.add_table(rows=len(steps), cols=2); borders(t)
for i, (a, b) in enumerate(steps):
    c0, c1 = t.cell(i, 0), t.cell(i, 1); shade(c0, TINT)
    run(c0.paragraphs[0], f"{i+1} · {a}", bold=True, size=10, color=BROWN); run(c1.paragraphs[0], b, size=10)
widths(t, [5, 11.6])
para()
box("El calendario no se mueve: las 20 sesiones mantienen su número y su etapa. Stable no es requisito para avanzar. El recorrido avanza y el aprendizaje tiene carry-over.", lab="REGLA DE AVANCE")
box("Si la skill anterior dificulta significativamente la nueva, la sesión mantiene su número y su etapa, pero: la skill anterior sigue como foco prioritario (carry-over); la nueva se introduce en el nivel mínimo posible; se registra el estado real de ambas; y la pendiente sigue apareciendo de forma transversal en las sesiones siguientes.", lab="SI UNA SKILL BLOQUEA")
box("Solo si el gap anterior hace materialmente imposible trabajar la nueva skill, esa sesión se dedica al gap bloqueante y la nueva queda como «Not yet introduced», para incorporarla en la siguiente oportunidad compatible. El calendario de 20 sesiones no cambia.", lab="CASO EXCEPCIONAL")
para("Se evitan así dos extremos: «no dominó S4, entonces nunca llegamos a S5» y «llegó la semana 5, marco S4 completada aunque no pueda hacerlo».", italic=True, size=9.5, color=MUTED)

label("Sesión recorrida no es lo mismo que skill consolidada")
para("Que una sesión esté completada significa que la alumna pasó por esa habilidad, no que la domina. Por eso cada sesión se registra con cuatro datos separados:")
reg = [("Estado de la sesión", "Pending / Completed"),
       ("Estado de la skill", "Not yet introduced (quedó pendiente por un gap bloqueante) · Introduced (la vio, la entendió y la probó) · In Progress (aparece con ayuda, prompting o de forma irregular) · Stable (aparece sola y de manera repetible: la evidencia observable aparece de forma espontánea, sin prompting ni ayuda directa, en al menos dos ocasiones separadas; idealmente una de ellas en una situación nueva, bajo presión o en una aplicación real de trabajo. Dos evidencias distintas, no dos repeticiones seguidas del mismo ejercicio)"),
       ("Evidencia", "Qué observaste: una frase concreta, no una opinión."),
       ("Carry-over", "Sí / No. Si es «sí», qué se arrastra a las próximas sesiones como foco transversal.")]
t = doc.add_table(rows=len(reg), cols=2); borders(t)
for i, (a, b) in enumerate(reg):
    c0, c1 = t.cell(i, 0), t.cell(i, 1); shade(c0, TINT)
    run(c0.paragraphs[0], a, bold=True, size=9.5, color=BROWN); run(c1.paragraphs[0], b, size=9.5)
widths(t, [4.2, 12.4])
para()

label("Mapa general")
etapas = [("Semana 1", "Onboarding", "Sesión 1"), ("Semanas 2–4", "Activate Your English", "Sesiones 2–4 · hito en la 4"),
          ("Semanas 5–10", "Communicate in Real Time", "Sesiones 5–10 · hito en la 10"), ("Semanas 11–16", "Polish Your English", "Sesiones 11–16 · hito en la 16"),
          ("Semanas 17–19", "Understand & Be Understood", "Sesiones 17–19"), ("Semana 20", "Offboarding · review final", "Sesión 20")]
t = doc.add_table(rows=len(etapas), cols=3); borders(t)
for i, row in enumerate(etapas):
    for j, v in enumerate(row):
        c = t.cell(i, j); run(c.paragraphs[0], v, bold=(j == 1), size=10, color=BROWN if j == 1 else DARK)
        if j == 0: shade(c, TINT)
widths(t, [3.6, 6.5, 6.5])
para("Tracks transversales durante todo el recorrido: práctica con situaciones reales, pronunciación y listening, y precisión.", italic=True, size=9.5, color=MUTED)

# Sesiones
for s in S:
    doc.add_page_break()
    p = para(); run(p, f"SESIÓN {s['n']} · SEMANA {s['sem']} · {s['etapa'].upper()}", bold=True, size=9, color=TERRA)
    p = para(); run(p, s["nombre"], bold=True, size=20, color=BROWN, font=TITLE)
    plat = " · ".join(f"{a} ({b.lower()})" if b else a for a, b in s["plat"])
    rows = [("Core Skill", s["core"]), ("En la plataforma", plat), ("Resultado esperado", s["res"]), ("Evidencia observable", s["ev"])]
    if s.get("hito"): rows.append(("Hito", s["hito"]))
    t = doc.add_table(rows=len(rows), cols=2); borders(t)
    for i, (a, b) in enumerate(rows):
        c0, c1 = t.cell(i, 0), t.cell(i, 1); shade(c0, TINT if a != "Hito" else "F3E3D8")
        run(c0.paragraphs[0], a, bold=True, size=9.5, color=BROWN); run(c1.paragraphs[0], b, size=10)
    widths(t, [4.2, 12.4])
    label("Apertura")
    para(f"«Estamos en {s['etapa'] if s['etapa'] not in ('Onboarding','Offboarding') else 'tu ' + s['etapa'].lower()}. Hoy el foco es {s['foco']}. Al terminar, vas a poder {s['puede']}.»", italic=True, color=MUTED)
    pend = any(b in (N, D) for a, b in s["plat"])
    label("Microenseñanza · 5–10 min" + (" · obligatoria si la clase todavía no está disponible" if pend else " · si no vio la clase"))
    for m in s["micro"]:
        doc.add_paragraph(m, style="List Bullet")
    label("Aplicación a su situación real")
    para(s["app"])
    label("Retry + presión")
    para(s["retry"])
    label("Next step")
    para(s["next"])
    if s["ya"] != "—":
        label("Si ya lo domina")
        para(s["ya"], italic=True, color=MUTED)

# Anexos
doc.add_page_break()
p = para(); run(p, "ANEXOS", bold=True, size=9, color=TERRA)
p = para(); run(p, "Coverage Matrix", bold=True, size=20, color=BROWN, font=TITLE)
para("Control de que ninguna habilidad esencial dependa de haber visto un video.", italic=True, color=MUTED)
t = doc.add_table(rows=len(COVERAGE), cols=2); borders(t)
for i, (a, b) in enumerate(COVERAGE):
    c0, c1 = t.cell(i, 0), t.cell(i, 1); shade(c1, TINT)
    run(c0.paragraphs[0], a, size=9.5); run(c1.paragraphs[0], b, bold=True, size=9.5, color=BROWN)
widths(t, [10.6, 6])
p = para(); p.paragraph_format.space_before = Pt(14); run(p, "Tracks transversales", bold=True, size=16, color=BROWN, font=TITLE)
t = doc.add_table(rows=len(TRACKS), cols=2); borders(t)
for i, (a, b) in enumerate(TRACKS):
    c0, c1 = t.cell(i, 0), t.cell(i, 1); shade(c0, TINT)
    run(c0.paragraphs[0], a, bold=True, size=9.5, color=BROWN); run(c1.paragraphs[0], b, size=9.5)
widths(t, [4.2, 12.4])
p = para(); p.paragraph_format.space_before = Pt(14); run(p, "Cómo se va a ver en Notion", bold=True, size=16, color=BROWN, font=TITLE)
para("Master Delivery Map: 20 registros estándar, uno por sesión, con lo fijo (etapa, Core Skill, resultado, evidencia, microenseñanza).")
para("Student Delivery Tracker: cada alumna tiene sus 20 sesiones, relacionadas con el Master Map, con estado de la sesión, estado de la skill, evidencia y carry-over. La vista por alumna muestra, por ejemplo:")
box("Belén — 8/20 · Etapa actual: Communicate in Real Time · Última completada: S8 Gain Time + Repair & Continue · Skill: In Progress · Carry-over: recuperar el hilo · Próxima: S9 Manage the Interaction")
p = para(); p.paragraph_format.space_before = Pt(14); run(p, "Criterio de calidad final", bold=True, size=16, color=BROWN, font=TITLE)
para("Una alumna que completa las 20 sesiones atravesó el método completo aunque no haya visto todos los videos. La plataforma acelera y profundiza; las sesiones 1:1 garantizan la transformación.")

out = "recursos/Master_Delivery_Map_20_sesiones.docx"
doc.save(out); print(out)
