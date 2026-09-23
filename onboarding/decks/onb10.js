module.exports = {
  num: "10", code: "ONB 10", title: "Cómo organizar tu práctica semanal", file: "ONB10_Como_organizar_tu_practica_semanal.pptx",
  slides: [
    { type: "cover", sub: "Constancia y claridad sobre qué vas a hacer y cuándo",
      points: [["FaCalendarPlus", "Reservar espacio antes de la semana"], ["FaLayerGroup", "Learn · Apply · Practice"], ["FaFileLines", "Tu Weekly Report"], ["FaArrowsRotate", "Si la semana se desordena"]],
      notes: `Hay algo muy simple que puede hacer una diferencia enorme en cómo vives AT WORK: darle un lugar real en tu semana.

No quiero que este programa se convierta en otra cosa que sabes que quieres hacer, pero que siempre queda para cuando tengas tiempo.

No necesitas estudiar todos los días ni hacer sesiones larguísimas. Necesitas constancia y claridad sobre qué vas a hacer y cuándo.` },

    { type: "grid", title: "“Algún momento” casi nunca llega", sub: "Reserva espacio antes de que empiece la semana", cols: 3, label: "NO DEPENDAS DE “CUANDO TENGA TIEMPO”. ELIGE:",
      items: [
        { icon: "FaCalendarDay", head: "Un día" },
        { icon: "FaClock", head: "Una hora" },
        { icon: "FaBullseye", head: "Una acción concreta" },
      ],
      callout: { icon: "FaSeedling", body: [{ text: "La organización no tiene que ser perfecta. ", options: { bold: true } }, { text: "Tiene que ser realista y sostenible." }], h: 1.15, size: 16 },
      notes: `Cuando dejamos la práctica para “algún momento”, ese momento casi nunca llega.

Por eso quiero que reserves espacio antes de que empiece la semana.

No dependas de “cuando tenga tiempo”. Elige un día, una hora y una acción concreta.

La organización no tiene que ser perfecta. Tiene que ser realista y sostenible.` },

    { type: "stat", title: "Tus bloques de práctica", sub: "Con un lugar real en tu calendario",
      label: "COMO REFERENCIA, CADA SEMANA", big: "2 o 3 bloques", sub2: "", sub: "de entre 20 y 30 minutos",
      callout: { icon: "FaShieldHalved", head: "Protégelos como protegerías cualquier otra cita", body: "Si una semana va a estar más complicada, ajusta la cantidad o la duración. Pero no desaparezcas del proceso porque la semana no fue ideal.", h: 1.75 },
      notes: `Como referencia, quiero que reserves dos o tres bloques de entre 20 y 30 minutos por semana.

No hace falta que sean todos iguales ni que duren exactamente lo mismo.

Lo importante es que tengan un lugar real en tu calendario y que los protejas como protegerías cualquier otra cita.

Si una semana va a estar más complicada, ajusta la cantidad o la duración. Pero no desaparezcas del proceso porque la semana no fue ideal.` },

    { type: "grid", title: "Learn · Apply · Practice", sub: "Una manera simple de organizar esos bloques", cols: 3,
      items: [
        { icon: "FaPlay", head: "Learn", body: "Ver una clase o revisar una herramienta" },
        { icon: "FaBriefcase", head: "Apply", body: "Llevar esa herramienta a una situación real de tu trabajo" },
        { icon: "FaRotateRight", head: "Practice / Retry", body: "Practicar, grabarte, volver a intentar o pedir feedback", hl: true },
      ],
      callout: { icon: "FaLightbulb", body: [{ text: "Mirar una clase te da una herramienta. ", options: { bold: true } }, { text: "El cambio aparece cuando la usas." }], h: 1.15, size: 16 },
      notes: `Una manera simple de organizar esos bloques es ésta.

Un bloque para Learn: ver una clase o revisar una herramienta.

Un bloque para Apply: llevar esa herramienta a una situación real de tu trabajo.

Y un bloque para Practice o Retry: practicar, grabarte, volver a intentar o pedir feedback.

La clave es que no confundas mirar una clase con practicar. Mirar una clase te da una herramienta. El cambio aparece cuando la usas.` },

    { type: "steps", title: "Tu Weekly Report", sub: "Reserva un momento específico: no lo hagas apurada antes de una sesión",
      items: [
        { text: "Mira tu semana", icon: "FaEye" },
        { text: "Registra qué pasó, qué funcionó y qué te costó", icon: "FaPen" },
        { text: "Define qué necesitas trabajar después", icon: "FaCrosshairs" },
        { text: [{ text: "Súbelo a " }, { text: "05 · MI PROGRESO", options: { bold: true, color: "81552E" } }, { text: " en tu Drive" }], icon: "FaFolderOpen" },
      ],
      callout: { icon: "FaWhatsapp", body: "¿Algo para celebrar, preguntar o trabajar conmigo? También puedes compartirlo en la comunidad.", h: 1.1 },
      notes: `También quiero que reserves un momento específico para completar tu Weekly Report.

No quiero que lo hagas apurada cinco minutos antes de una sesión.

El Weekly Report es el momento en el que miras tu semana, registras qué pasó, qué funcionó, qué te costó y qué necesitas trabajar después.

Una vez completo, súbelo a 05 · MI PROGRESO dentro de tu Drive.

Y si hay algo que quieres celebrar, preguntar o trabajar conmigo, también puedes compartirlo en la comunidad.` },

    { type: "twocol", title: "Drive y WhatsApp", sub: "Esta diferencia te ayuda a mantenerte organizada",
      left: { head: "Drive · la memoria del proceso", items: ["tus Weekly Reports", "tus prácticas", "materiales", "evidencia de progreso"] },
      right: { head: "WhatsApp · el movimiento del proceso", items: ["compartir un win", "hacer una pregunta", "pedir feedback", "contar algo que pasó en la semana"] },
      callout: { icon: "FaFileLines", body: "Aunque compartas algo por WhatsApp, el Weekly Report completo siempre queda guardado en tu Drive.", h: 1.15 },
      notes: `Quiero que entiendas esta diferencia porque te va a ayudar mucho a mantenerte organizada.

Tu Drive es la memoria del proceso. Ahí quedan tus Weekly Reports, tus prácticas, materiales y evidencia de progreso.

WhatsApp es el movimiento del proceso. Ahí compartes un win, haces una pregunta, pides feedback o cuentas algo que pasó durante la semana.

Aunque compartas algo por WhatsApp, el Weekly Report completo siempre queda guardado en tu Drive.` },

    { type: "steps", title: "Si la semana se desordena", sub: "No intentes recuperar todo de golpe",
      items: [
        { text: "Vuelve al foco actual", icon: "FaCrosshairs" },
        { text: "Elige la herramienta más relevante para lo que vives en tu trabajo", icon: "FaToolbox" },
        { text: "Haz una práctica concreta", icon: "FaDumbbell" },
        { text: "Sigue desde ahí", icon: "FaArrowRight" },
      ],
      callout: { icon: "FaTv", head: "Nada de binge watching", body: "Consistencia no es hacerlo perfecto cada semana: es volver al proceso cada vez que una semana se desordena.", h: 1.45 },
      notes: `Si una semana no pudiste hacer lo que habías planeado, no intentes recuperar todo de golpe.

No hagas binge watching ni mires cinco clases juntas para sentir que te pusiste al día.

Vuelve al foco actual. Elige la herramienta más relevante para lo que estás viviendo en tu trabajo. Haz una práctica concreta y sigue desde ahí.

Consistencia no significa hacerlo perfecto todas las semanas. Significa volver al proceso cada vez que una semana se desordena.` },

    { type: "close", title: "Tu acción ahora", sub: "No busques la semana perfecta",
      items: [
        { icon: "FaCalendarDays", text: [{ text: "Abre tu calendario", options: { bold: true } }] },
        { icon: "FaCalendarPlus", text: [{ text: "Reserva " }, { text: "dos o tres bloques realistas", options: { bold: true } }, { text: " de entre 20 y 30 minutos para esta semana" }] },
        { icon: "FaFileLines", text: [{ text: "Reserva un momento para completar tu " }, { text: "Weekly Report", options: { bold: true } }, { text: " y subirlo a tu Drive" }] },
      ],
      note: "Busca una estructura que puedas sostener.",
      notes: `Tu acción ahora es muy concreta.

Abre tu calendario y reserva tus bloques de práctica para esta semana.

Elige dos o tres momentos realistas de entre 20 y 30 minutos.

Y reserva también un momento específico para completar tu Weekly Report y subirlo a tu Drive.

No busques la semana perfecta. Busca una estructura que puedas sostener.` },
  ],
};
