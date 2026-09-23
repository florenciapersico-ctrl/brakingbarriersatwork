module.exports = {
  num: "12", code: "ONB 12", title: "AT WORK Community + Cómo pedir feedback", file: "ONB12_Comunidad_AT_WORK_y_feedback.pptx",
  slides: [
    { type: "cover", sub: "Parte del acompañamiento entre una sesión y la siguiente",
      points: [["FaWhatsapp", "Para qué usar la comunidad"], ["FaHand", "Qué significa participar"], ["FaComments", "Cómo pedir feedback"], ["FaLock", "Qué va por privado o a la sesión"]],
      notes: `Quiero mostrarte ahora cómo vamos a usar AT WORK Community durante estos cinco meses, porque este espacio no está pensado solamente para recibir información. Es parte del acompañamiento que vas a tener entre una sesión y la siguiente.

La idea es que no tengas que guardar todas tus dudas, prácticas o situaciones hasta nuestra próxima clase. Quiero que tengas un lugar donde puedas traer lo que va apareciendo en tu semana y seguir avanzando mientras el proceso está ocurriendo.` },

    { type: "chips", title: "Nuestro espacio principal", sub: "Para todo lo que tiene que ver con tu proceso", cols: 2, label: "ESTE ES EL LUGAR SI…", size: 14,
      items: [["FaBriefcase", "Tuviste una reunión y quieres contar cómo te fue"], ["FaDumbbell", "Hiciste una práctica y quieres que la revise"], ["FaCircleQuestion", "Apareció una duda con algo que estamos trabajando"], ["FaChartLine", "Notaste un avance"]],
      callout: { icon: "FaMicrophone", head: "No necesitas algo perfecto ni súper elaborado", body: "Una pregunta corta, un audio de un minuto o una situación concreta alcanza para seguir trabajando.", h: 1.5 },
      notes: `La comunidad es nuestro espacio principal de comunicación para todo lo que tiene que ver con tu proceso: dudas, prácticas, pedidos de feedback, wins y aprendizajes.

Si tuviste una reunión y quieres contar cómo te fue, si hiciste una práctica y quieres que la revise, si apareció una duda con algo que estamos trabajando o si simplemente notaste un avance, este es el lugar para compartirlo.

No necesitas esperar a tener algo perfecto o súper elaborado. Muchas veces una pregunta corta, un audio de un minuto o una situación concreta alcanza para que podamos seguir trabajando sobre eso.` },

    { type: "statement", title: "Participar es usar el acompañamiento", sub: "No tienes que escribir todo el tiempo",
      style: "tint", caption: "NO QUIERO QUE LLEGUES A LA SESIÓN PENSANDO", quote: "“Esto me pasó hace cuatro días, pero no pregunté porque no sabía si correspondía.”", quoteSize: 20, quoteH: 2.0, quoteItalic: true,
      miniCols: 1, miniH: 1.2, mini: [
        { icon: "FaHandHoldingHeart", text: "Si algo aparece durante la semana y puede ayudarte a avanzar, tráelo." },
        { icon: "FaBookOpenReader", text: "Leer lo que comparten otras alumnas también puede darte ideas para tu propio proceso." },
      ],
      notes: `Y esto es importante: participar no significa que tengas que estar escribiendo todo el tiempo ni que tengas que convertirte en la persona más activa del grupo.

Significa usar el acompañamiento que ya tienes disponible.

Si algo aparece durante la semana y puede ayudarte a avanzar, tráelo. No quiero que llegues a la sesión siguiente pensando: “Esto me pasó hace cuatro días pero no pregunté porque no sabía si correspondía”.

También vas a poder aprender muchísimo leyendo lo que comparten otras alumnas. Muchas veces otra persona está atravesando una situación parecida a la tuya y una pregunta, un feedback o un win de otra alumna también puede darte una idea para tu propio proceso.` },

    { type: "steps", title: "Cómo pedirme feedback", sub: "Contexto · Mi intento · Necesito ayuda con…", rowH: 1.2,
      items: [
        { text: "Contexto", desc: "Para qué es o qué situación estás resolviendo. Solo lo necesario para entender qué quieres comunicar.", icon: "FaBriefcase" },
        { text: "Tu intento", desc: "Audio, video o texto: quiero ver tu producción antes de corregirla.", icon: "FaMicrophone" },
        { text: "Necesito ayuda con…", desc: "Claridad, estructura, vocabulario, pronunciación, precisión, sonar más directa o confirmar si se entiende.", icon: "FaCrosshairs" },
      ],
      callout: { icon: "FaHeart", body: [{ text: "No quiero reemplazar tu voz: ", options: { bold: true } }, { text: "quiero ayudarte a mejorarla." }], h: 1.1, size: 16 },
      notes: `Cuando quieras pedirme feedback, hay una forma muy simple de hacerlo para que yo pueda ayudarte de manera mucho más precisa.

Primero, contexto. Dime para qué es lo que estás preparando o qué situación estás resolviendo. No necesito toda la historia; solamente el contexto necesario para entender qué quieres comunicar.

Segundo, tu intento. Quiero ver tu producción antes de corregirla. Puede ser un audio, un video o un texto. Esto es importante porque dentro de AT WORK no quiero reemplazar tu voz: quiero ayudarte a mejorarla.

Y tercero, dime en qué necesitas ayuda. Por ejemplo: claridad, estructura, vocabulario, pronunciación, precisión, sonar más directa o simplemente confirmar si el mensaje se entiende como tú quieres.

Entonces la estructura es muy simple: contexto, mi intento, necesito ayuda con...` },

    { type: "chat", title: "Por ejemplo", sub: "Intenta primero: si me escribes solo “¿Cómo digo esto?”, te voy a pedir un primer intento",
      bubbles: [
        { tag: "CONTEXTO", icon: "FaBriefcase", text: "“Mañana tengo una reunión con mi manager y necesito explicar este cambio. Este es mi intento.”" },
        { tag: "MI INTENTO", icon: "FaMicrophone", text: "Audio de 45 segundos" },
        { tag: "NECESITO AYUDA CON…", icon: "FaCrosshairs", text: "“Claridad y cómo ir más directo al punto.”" },
      ],
      callout: { icon: "FaCircleCheck", body: "Así te doy un feedback útil, sin que prepares una explicación enorme y sin que yo tenga que adivinar qué quieres mejorar.", h: 1.2 },
      notes: `Por ejemplo, podrías escribir:

“Mañana tengo una reunión con mi manager y necesito explicar este cambio. Este es mi intento.”

Y me mandas un audio de cuarenta y cinco segundos.

Después agregas: “Necesito ayuda con claridad y con cómo ir más directo al punto.”

Eso me da exactamente lo que necesito para darte un feedback útil, sin que tengas que preparar una explicación enorme y sin que yo tenga que adivinar qué quieres mejorar.

También quiero que intentes primero. Si me mandas solamente “¿Cómo digo esto?”, probablemente te voy a pedir que hagas un primer intento. Porque producir, recibir feedback y volver a intentar es parte central de cómo trabajamos dentro de AT WORK.` },

    { type: "grid", title: "Lo que va por privado", sub: "La comunidad existe para darte más acompañamiento, no menos privacidad", cols: 2,
      items: [
        { icon: "FaReceipt", head: "Temas administrativos", body: "Un pago, una reprogramación o algo de tu organización personal conmigo" },
        { icon: "FaLock", head: "Algo sensible", body: "O una situación que, por cualquier motivo, prefieres mantener privada" },
      ],
      callout: { icon: "FaHeart", body: "No tienes que compartir nada que no quieras compartir.", h: 1.1, size: 16 },
      notes: `Hay algunas cosas que no hace falta compartir dentro de la comunidad.

Si es un tema administrativo, por ejemplo un pago, una reprogramación o algo relacionado con tu organización personal conmigo, puedes escribirme por privado.

Y obviamente, si hay algo sensible o una situación que por cualquier motivo prefieres mantener privada, también me escribes directamente.

La idea no es obligarte a compartir nada que no quieras compartir. La comunidad existe para darte más acompañamiento, no menos privacidad.` },

    { type: "columns", title: "Cada espacio para lo que mejor funciona", sub: "No tienes que hacer estos cinco meses sola", size: 13.5,
      items: [
        { icon: "FaWhatsapp", head: "Comunidad", tag: "el proceso vivo entre sesiones", bullets: ["preguntar, practicar y compartir", "contarme que apareció una situación"] },
        { icon: "FaLock", head: "Privado", tag: "escríbeme directamente", bullets: ["lo administrativo", "lo sensible"] },
        { icon: "FaVideo", head: "Sesión 1:1", tag: "el trabajo profundo, juntas", bullets: ["presentaciones completas", "conversaciones difíciles", "reuniones importantes"] },
      ],
      callout: { icon: "FaComments", head: "Cuando necesites feedback, recuerda", body: "Contexto, tu intento y qué necesitas de mí.", h: 1.3 },
      notes: `Y hay un tercer tipo de situación: cosas que necesitan más profundidad.

Si quieres trabajar una presentación completa, una conversación difícil con mucho contexto, una reunión importante o una situación que necesita varias correcciones y práctica, probablemente sea mejor llevarla a nuestra sesión 1:1.

Puedes contarme antes en la comunidad que esa situación apareció, incluso puedes subir el material a tu Drive para que lo tengamos preparado, pero el trabajo profundo lo hacemos juntas en sesión.

Así usamos cada espacio para lo que mejor funciona: la comunidad para mantener el proceso vivo entre sesiones, el privado para lo administrativo o sensible, y nuestras sesiones 1:1 para lo que necesita más profundidad.

Quiero que realmente uses este espacio. Pregunta, practica, comparte lo que vas aprendiendo y cuéntame cuando algo esté cambiando. No tienes que hacer estos cinco meses sola.

Y a partir de ahora, cuando necesites feedback, acuérdate de esta estructura: contexto, tu intento y qué necesitas de mí.` },
  ],
};
