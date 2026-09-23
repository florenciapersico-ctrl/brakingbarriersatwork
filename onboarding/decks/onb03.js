module.exports = {
  num: "03", code: "ONB 03", title: "Tu ecosistema AT WORK", file: "ONB03_Tu_ecosistema_AT_WORK.pptx",
  slides: [
    { type: "cover", sub: "Cuatro espacios, cada uno con una función específica",
      pointsLabel: "LOS CUATRO ESPACIOS",
      points: [["FaBookOpen", "Skool"], ["FaWhatsapp", "Comunidad de WhatsApp"], ["FaGoogleDrive", "Tu carpeta personal de Drive"], ["FaVideo", "Nuestras sesiones 1:1"]],
      notes: `Durante AT WORK vas a usar cuatro espacios distintos. Cada uno tiene una función específica y quiero que desde el principio sepas dónde hacer cada cosa para que tu proceso sea simple y ordenado.` },

    { type: "grid", title: "Skool", sub: "Tu biblioteca de entrenamiento", cols: 3,
      items: [
        { icon: "FaLayerGroup", head: "Módulos", body: "El recorrido del programa" },
        { icon: "FaToolbox", head: "Herramientas", body: "Para usar en tu trabajo real" },
        { icon: "FaBookOpen", head: "Recursos", body: "Para consultar durante estos cinco meses" },
      ],
      callout: { icon: "FaCompass", head: "No necesitas recorrerlo todo de golpe", body: "Más adelante te explico cómo avanzar por el programa y dónde poner el foco en cada etapa.", h: 1.6 },
      notes: `Skool es tu biblioteca de entrenamiento. Ahí vas a encontrar los módulos, las herramientas y los recursos que puedes consultar durante estos cinco meses.

No necesitas recorrerlo todo de golpe. Más adelante te voy a explicar cómo avanzar por el programa y dónde poner el foco en cada etapa.` },

    { type: "chips", title: "Comunidad de WhatsApp", sub: "El espacio vivo entre sesiones", cols: 2,
      items: [["FaHand", "Presentarte"], ["FaChartLine", "Compartir avances"], ["FaCircleQuestion", "Hacer preguntas"], ["FaComments", "Pedir feedback cuando corresponda"], ["FaUsers", "Conectar con otras alumnas"], ["FaUserGroup", "Encontrar compañeras de práctica"]],
      callout: { icon: "FaHeart", body: "No todo tiene que quedar en conversaciones privadas conmigo. Muchas dudas y aprendizajes pueden servirle también a otra persona que está atravesando un desafío parecido.", h: 1.5 },
      notes: `La comunidad de WhatsApp es el espacio vivo entre sesiones.

Ahí vas a poder presentarte, compartir avances, hacer preguntas, pedir feedback cuando corresponda, conectar con otras alumnas y encontrar compañeras de práctica.

La idea es que no todo quede en conversaciones privadas conmigo. Muchas dudas y aprendizajes pueden servirle también a otra persona que está atravesando un desafío parecido.` },

    { type: "iconsteps", title: "Tu carpeta personal de Drive", sub: "Nuestro archivo de trabajo durante los cinco meses",
      items: [
        { icon: "FaUserTie", text: "Tu contexto profesional" },
        { icon: "FaBriefcase", text: "Materiales reales de tu trabajo" },
        { icon: "FaChalkboardUser", text: "Materiales de nuestras sesiones" },
        { icon: "FaDumbbell", text: "Tus prácticas" },
        { icon: "FaChartLine", text: "Evidencia de progreso" },
      ],
      notes: `También vas a tener una carpeta personal de Drive creada especialmente para tu proceso.

Ahí vamos a guardar tu contexto profesional, materiales reales de tu trabajo, materiales de nuestras sesiones, tus prácticas y evidencia de progreso.

Este va a ser nuestro archivo de trabajo durante los cinco meses.` },

    { type: "statement", title: "Nuestras sesiones 1:1", sub: "No son clases desconectadas del resto del programa",
      caption: "EN CADA SESIÓN", quote: "Traemos tu inglés real, vemos qué está pasando, entrenamos lo que necesitas y volvemos a probar.", quoteSize: 22, quoteH: 2.1,
      miniCols: 2, mini: [
        { icon: "FaLaptop", text: [{ text: "La plataforma ", options: { bold: true } }, { text: "te da herramientas" }] },
        { icon: "FaDumbbell", text: [{ text: "La práctica ", options: { bold: true } }, { text: "genera evidencia" }] },
        { icon: "FaUsers", text: [{ text: "La comunidad ", options: { bold: true } }, { text: "te mantiene acompañada" }] },
        { icon: "FaBullseye", text: [{ text: "Las sesiones ", options: { bold: true } }, { text: "intervienen exactamente donde lo necesitas" }] },
      ],
      notes: `Y finalmente están nuestras sesiones 1:1.

No son clases desconectadas del resto del programa. Son el lugar donde traemos tu inglés real, vemos qué está pasando, entrenamos lo que necesitas y volvemos a probar.

La plataforma te da herramientas. La práctica genera evidencia. La comunidad te mantiene acompañada. Y nuestras sesiones nos permiten intervenir exactamente donde lo necesitas.` },

    { type: "grid", title: "¿Dónde va cada cosa?", sub: "Si alguna vez dudas, usa esta regla simple", cols: 2,
      items: [
        { icon: "FaBookOpen", head: "Skool", body: "Si quieres aprender o revisar una herramienta" },
        { icon: "FaWhatsapp", head: "Comunidad", body: "Si quieres compartir, preguntar o pedir feedback breve" },
        { icon: "FaGoogleDrive", head: "Drive", body: "Si quieres guardar material o evidencia de tu proceso" },
        { icon: "FaVideo", head: "Sesión 1:1", body: "Si necesitamos trabajar algo en profundidad", hl: true },
      ],
      notes: `Si alguna vez dudas dónde va algo, usa esta regla simple.

Si quieres aprender o revisar una herramienta, Skool.

Si quieres compartir, preguntar o pedir feedback breve, comunidad.

Si quieres guardar material o evidencia de tu proceso, Drive.

Y si necesitamos trabajar algo en profundidad, sesión 1:1.` },

    { type: "close", title: "Tu siguiente paso", sub: "En las próximas clases te muestro cómo recorrer el programa y usar estos espacios",
      items: [
        { icon: "FaWhatsapp", text: [{ text: "Asegúrate de tener acceso a la " }, { text: "comunidad", options: { bold: true } }] },
        { icon: "FaGoogleDrive", text: [{ text: "Asegúrate de tener acceso a tu " }, { text: "carpeta personal", options: { bold: true } }] },
        { icon: "FaEnvelope", text: [{ text: "Confirma que recibes los " }, { text: "emails de AT WORK", options: { bold: true } }, { text: ": revisa bandeja de entrada, Spam y Promociones" }] },
        { icon: "FaShieldHalved", text: "Si encuentras uno ahí, marca el remitente como seguro o agrégalo a tus contactos" },
      ],
      notes: `Tu siguiente paso es asegurarte de tener acceso a la comunidad y a tu carpeta personal.

Y antes de seguir, confirma también que estás recibiendo correctamente los emails de AT WORK. Revisa tu bandeja de entrada, Spam y Promociones. Si encuentras un email ahí, marca el remitente como seguro o agrégalo a tus contactos para no perder avisos importantes.

En las próximas clases te voy a mostrar cómo recorrer el programa y cómo utilizar estos espacios de manera concreta.` },
  ],
};
