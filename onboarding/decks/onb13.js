module.exports = {
  num: "13", code: "ONB 13", title: "Antes de empezar el Módulo 1", file: "ONB13_Checklist_final.pptx",
  slides: [
    { type: "cover", sub: "Checklist final: tu sistema de trabajo, listo",
      pointsLabel: "REVISAMOS JUNTAS",
      points: [["FaFileSignature", "Tu onboarding"], ["FaWhatsapp", "Tu comunidad"], ["FaGoogleDrive", "Tu sistema de trabajo"], ["FaCalendarCheck", "Último paso"]],
      notes: `Antes de empezar el Módulo 1, quiero que hagamos una última revisión juntas.

Esta primera semana no era para avanzar rápido ni para consumir contenido. Era para dejar armado tu sistema de trabajo dentro de AT WORK y asegurarnos de que sabes exactamente cómo moverte dentro del programa.

Así que antes de seguir, quiero que revises este checklist conmigo. No se trata solo de haber visto los videos: se trata de haber completado las acciones que te van a permitir empezar el proceso con claridad, organización y un punto de partida real.` },

    { type: "checklist", title: "Tu onboarding", sub: "Si alguno de estos puntos falta, complétalo antes de avanzar", size: 16,
      items: [
        "Haber visto todo el onboarding con atención",
        [{ text: "Haber firmado el " }, { text: "Acuerdo de Trabajo", options: { bold: true } }, { text: " y haberlo subido a tu carpeta personal de AT WORK" }],
        [{ text: "Haber completado tu " }, { text: "Starting Point", options: { bold: true } }, { text: ": autoevaluación inicial + audio o video espontáneo de 2–3 minutos" }],
      ],
      callout: { icon: "FaFlagCheckered", head: "Tu Starting Point es tu punto de partida", body: "Registra cómo estás hoy para que después podamos comparar tu progreso con evidencia real.", h: 1.5 },
      notes: `Primero, revisa que hayas completado bien tu onboarding.

Quiero que confirmes que viste todas las clases con atención, que firmaste tu Acuerdo de Trabajo y lo subiste a tu carpeta personal de AT WORK.

También deberías haber completado tu Starting Point. Ese es tu punto de partida: incluye tu autoevaluación inicial y una producción espontánea en audio o video para que podamos registrar cómo estás hoy y después comparar tu progreso con evidencia real.

Si alguno de estos puntos todavía falta, complétalo antes de avanzar.` },

    { type: "checklist", title: "Tu comunidad", sub: "Para que la uses como parte real de tu proceso", size: 16,
      items: [
        [{ text: "Haberte unido a " }, { text: "AT WORK Community", options: { bold: true } }],
        "Haberte unido a todos los canales",
        [{ text: "Haberte presentado en " }, { text: "Connect & Share", options: { bold: true } }],
      ],
      callout: { icon: "FaHashtag", style: "dark", head: "Los canales", body: "Announcements · Weekly Reports · Wins · Questions & Support · Connect & Share", h: 1.5, size: 16 },
      notes: `Ahora revisemos la comunidad.

A esta altura ya deberías haberte unido a AT WORK Community y también a todos sus canales: Announcements, Weekly Reports, Wins, Questions & Support y Connect & Share.

Y dentro de Connect & Share, deberías haber hecho tu presentación para que el resto de la comunidad pueda conocerte.

La idea es que desde el principio sepas dónde compartir cada cosa y puedas usar la comunidad como parte real de tu proceso, no como un espacio que simplemente está ahí.` },

    { type: "checklist", title: "Tu sistema de trabajo", sub: "No necesitas tenerlo todo resuelto, pero sí saber desde dónde partes", cols: 2, size: 14,
      items: [
        "Haber abierto y ubicado tu carpeta personal de AT WORK",
        "Haber subido 3–5 materiales reales de tu trabajo",
        "Haber reservado tus bloques semanales de práctica",
        "Saber dónde y cómo pedir feedback",
        "Tener claro cómo funciona el Weekly Report y dónde guardarlo",
        [{ text: "Tener claro tu " }, { text: "foco inicial", options: { bold: true } }],
      ],
      notes: `Después, revisa que tengas armado tu sistema de trabajo.

Deberías haber abierto y ubicado tu carpeta personal de AT WORK, subido entre tres y cinco materiales reales de tu trabajo y reservado en tu calendario tus bloques semanales de práctica.

También quiero que tengas claro dónde y cómo pedir feedback, cómo funciona tu Weekly Report y dónde vas a guardarlo cada semana.

Y, sobre todo, que tengas claro cuál es tu foco inicial. No necesitas tener todo resuelto ni saber exactamente qué vas a trabajar durante los próximos cinco meses. Para eso está el proceso. Pero sí quiero que empieces sabiendo desde dónde partes y cuál es la prioridad ahora.` },

    { type: "close", title: "Último paso", sub: "Cuando todo esté listo, tu onboarding está completo",
      items: [
        { icon: "FaCalendarCheck", text: [{ text: "Escríbeme para definir y agendar tu horario recurrente de sesiones 1:1", options: { bold: true } }] },
        { icon: "FaCrosshairs", text: [{ text: "Después, empieza el Módulo 1: " }, { text: "sigue el foco de cada semana", options: { bold: true } }, { text: " y usa tu Weekly System" }] },
        { icon: "FaHandHoldingHeart", text: [{ text: "Trae tu trabajo real", options: { bold: true } }, { text: " al proceso y " }, { text: "pide ayuda", options: { bold: true } }, { text: " cuando la necesites" }] },
      ],
      note: "No avances al Módulo 1 ni marques esta clase como completada hasta haber terminado todos los puntos del checklist.",
      notes: `Y queda un último paso.

Cuando hayas completado todo lo anterior, escríbeme para que definamos y dejemos agendado tu horario recurrente de sesiones 1:1.

No marques esta clase como completada hasta haber terminado todos los puntos del checklist.

Cuando todo esto esté listo, tu onboarding está completo y ya puedes empezar el Módulo 1.

A partir de ahí, no necesitas hacer todo de golpe. Sigue el foco de cada semana, usa tu Weekly System, trae tu trabajo real al proceso y pide ayuda cuando la necesites.` },
  ],
};
