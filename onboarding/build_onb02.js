const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const fa = require("react-icons/fa6");

// Breaking Barriers at work — guía de estilos Flor Pérsico
const C = {
  brown: "81552E",     // café profundo (primario)
  dark: "3F1E0D",      // fondo oscuro BB at work
  terra: "C68C6C",     // terracota (acción / acento)
  muted: "8A6A55",
  sand: "EDE5CC",      // crema media
  cream: "F8F5EE",     // crema clara (fondo principal)
  card: "FFFDF9",
  tint: "FBF2D0",      // crema cálida (cajas destacadas)
  ink: "3F1E0D",
};
const TITLE = "Source Serif Pro";
const BODY = "Open Sans";
const BRAND = "BREAKING BARRIERS · AT WORK";

// Zona de cámara (abajo a la izquierda) SIEMPRE libre: x < 4.3", y > 4.2"
const RX = 4.8, RW = 12.63 - 4.8, TOP = 1.4;

const img = (f) => "image/png;base64," + fs.readFileSync(f).toString("base64");
async function icon(name, color, size = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size: String(size) }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}
const shadow = () => ({ type: "outer", color: "3F1E0D", blur: 14, offset: 3, angle: 90, opacity: 0.10 });

// Prompter (Drive: "02 — Cómo vamos a trabajar juntas · PROMPTER LISTO") → notas del orador
const NOTES = [
`Antes de empezar, quiero contarte cómo vamos a trabajar juntas durante estos cinco meses para que puedas aprovechar al máximo todo el acompañamiento que vas a tener dentro de AT WORK.

Quiero que desde el principio sepas qué espacios tienes disponibles, cómo puedes pedirme ayuda, cómo funcionan nuestras sesiones y dónde vamos a ir trabajando cada cosa.

La idea es que te sientas acompañada, contenida y con claridad sobre qué hacer en cada momento, para que puedas enfocarte en tu proceso y en avanzar con tu inglés.`,
`Dentro de esta clase vas a encontrar también tu Acuerdo de Trabajo.

Es un documento simple donde están por escrito algunos aspectos prácticos del programa para que las dos tengamos toda la información clara desde el comienzo.

Si todavía no lo firmaste, descárgalo, complétalo y súbelo a tu carpeta personal de AT WORK, dentro de 01 · MI CONTEXTO PROFESIONAL. Así queda guardado junto con toda la información de inicio de tu proceso.`,
`Nuestras sesiones 1:1 son el espacio donde vamos a poder trabajar con más profundidad sobre lo que esté pasando en tu inglés y en tu trabajo real.

Cada horario queda reservado especialmente para ti. Si en algún momento necesitas cambiar una sesión, puedes hacerlo avisándome con al menos 24 horas de anticipación para que podamos reorganizarnos.

Si el cambio se pide con menos de 24 horas, esa sesión se considera utilizada, simplemente porque ese espacio ya quedó reservado para ti y generalmente no puedo reasignarlo con tan poco tiempo.

Y si un día llegas un poquito más tarde, no pasa nada: trabajamos con el tiempo que nos quede dentro del horario reservado.

Obviamente, si soy yo quien necesita mover una sesión, la reprogramamos sin problema.`,
`También quiero que sepas que durante AT WORK no estás sola entre una sesión y la siguiente.

Si te surge una duda, quieres compartir algo, necesitas feedback o simplemente quieres contarme una situación que pasó en tu trabajo, puedes hacerlo dentro de la comunidad de WhatsApp.

La comunidad va a ser nuestro espacio principal de comunicación durante el programa. Ahí puedes compartir prácticas, hacer preguntas, pedirme feedback, contar un avance o algo que aprendiste durante la semana.

Si se trata de un tema administrativo o de algo que prefieres mantener en privado, ahí sí puedes escribirme directamente.

Y cuando una situación necesita más contexto, análisis o trabajo en profundidad, la llevamos a nuestra sesión 1:1 para poder trabajarla bien.

La idea es que tengas claro dónde llevar cada cosa para que el acompañamiento sea simple, cercano y ordenado durante todo el proceso.`,
`Durante la semana, puedes dejarme tus dudas, prácticas o situaciones en la comunidad siempre que lo necesites.

Yo voy revisando y respondiendo estos mensajes de lunes a viernes, entre las 9 y las 18, horario de Buenos Aires.

Y si algo te surge fuera de ese horario o durante el fin de semana, puedes escribirlo igual con total tranquilidad. El mensaje queda ahí y yo lo retomo cuando vuelva a estar disponible.

La idea es que no tengas que guardarte una duda hasta nuestra próxima sesión ni depender de acordarte después, y que al mismo tiempo podamos sostener un acompañamiento cercano, claro y ordenado durante todo el proceso.`,
`Dentro de AT WORK también vas a poder pedirme feedback entre sesiones.

Puede ser sobre una práctica, una respuesta que estés preparando, un mensaje que quieras comunicar con más claridad o algo puntual que quieras revisar.

Y si aparece una situación más grande —por ejemplo una presentación completa, una conversación compleja o algo que necesita bastante contexto— lo dejamos para nuestra sesión 1:1, porque ahí vamos a poder dedicarle el tiempo y la profundidad que merece.

Más adelante en este onboarding te voy a mostrar exactamente cómo pedir feedback para que puedas aprovechar ese espacio de la mejor manera.`,
`Una de las cosas más importantes de AT WORK es que no vamos a trabajar con un inglés desconectado de tu vida profesional.

Quiero que puedas traer situaciones y materiales reales de tu trabajo: presentaciones, emails, transcripciones, capturas, documentos, reuniones o conversaciones que necesites resolver mejor.

Obviamente, si trabajas con información confidencial o sensible, puedes anonimizar nombres, cifras o cualquier dato interno antes de compartirlo.

No necesito conocer información privada de tu empresa. Lo que necesito es entender la situación comunicativa para poder ayudarte a entrenarla.`,
`Y por último, quiero que tengas algo muy claro: no necesitas llegar sabiendo exactamente qué practicar ni diagnosticar sola qué te está pasando.

Para eso estoy yo.

Tú vas a traer tu realidad: las reuniones que tienes, las situaciones que te cuestan, lo que salió bien, lo que no salió como querías y las dudas que vayan apareciendo.

Y mi trabajo es ayudarte a entender qué está interfiriendo, elegir qué necesitamos entrenar y darte dirección, herramientas y feedback para que puedas seguir avanzando.

No espero semanas perfectas ni que hagas todo impecablemente. Quiero que podamos sostener un proceso real, constante y conectado con lo que necesitas en tu trabajo.`,
`Con esto ya sabes cómo vamos a acompañarnos durante estos cinco meses y qué espacios tienes disponibles dentro de AT WORK.

Ahora descarga el Acuerdo de Trabajo que está adjunto a esta clase, complétalo, fírmalo y súbelo a tu carpeta personal de AT WORK, dentro de 01 · MI CONTEXTO PROFESIONAL.

Y después sigue con la próxima clase, donde te voy a mostrar cómo se organiza todo el ecosistema AT WORK para que sepas exactamente dónde encontrar cada cosa.`,
];

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pres.title = "ONB 02 · Cómo vamos a trabajar juntas";
  pres.author = "Flor Pérsico";

  const TOTAL = 9;
  let n = 0;
  const newSlide = () => { const s = pres.addSlide(); s.addNotes(NOTES[n++]); return s; };

  // Encabezado común: marca a la izquierda, endoso + número a la derecha (nada abajo a la izquierda)
  const chrome = (s, num, bg = C.cream, fg = C.terra, fg2 = C.muted) => {
    s.background = { color: bg };
    // Logo Breaking Barriers at work (versión café sobre fondos claros, según la guía)
    const logo = bg === C.terra ? "logo_dark.png" : "logo_brown.png";
    s.addImage({ data: img(logo), x: 0.7, y: 0.3, w: 1.3, h: 1.3 * 335 / 734, altText: "Breaking Barriers at work" });
    s.addText([
      { text: "by Flor Pérsico", options: { italic: true, fontFace: TITLE } },
      { text: "   ·   " + String(num).padStart(2, "0") + " / " + String(TOTAL).padStart(2, "0"), options: { fontFace: BODY } },
    ], { x: 8.63, y: 0.42, w: 4, h: 0.3, margin: 0, align: "right", isTextBox: true, fontSize: 11, color: fg2 });
  };

  const leftTitle = (s, title, sub, lines, tc = C.brown, sc = C.muted) => {
    s.addText(title, {
      x: 0.7, y: 1.4, w: 3.75, h: 1.95, margin: 0, valign: "top", isTextBox: true,
      fontFace: TITLE, fontSize: 34, bold: true, color: tc, lineSpacingMultiple: 0.92,
    });
    if (sub) s.addText(sub, {
      x: 0.7, y: 1.4 + lines * 0.57 + 0.3, w: 3.6, h: 0.8, margin: 0, valign: "top", isTextBox: true,
      fontFace: TITLE, italic: true, fontSize: 16, color: sc,
    });
  };

  const circleIcon = async (s, name, x, y, d, fill, color) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill } });
    const p = d * 0.27;
    s.addImage({ data: await icon(name, color), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
  };
  const card = (s, x, y, w, h, fill = C.card) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.16, fill: { color: fill }, line: { color: fill }, shadow: shadow() });

  // Helper: fila de pasos numerados
  const stepRows = async (s, steps, y0, h, gap, fs = 18) => {
    for (let i = 0; i < steps.length; i++) {
      const y = y0 + i * (h + gap);
      card(s, RX, y, RW, h);
      const d = 0.6;
      s.addShape(pres.shapes.OVAL, { x: RX + 0.3, y: y + (h - d) / 2, w: d, h: d, fill: { color: C.terra }, line: { color: C.terra } });
      s.addText(String(i + 1), { x: RX + 0.3, y: y + (h - d) / 2, w: d, h: d, margin: 0, align: "center", valign: "middle", isTextBox: true, fontFace: TITLE, fontSize: 18, bold: true, color: C.card });
      s.addText(steps[i][1], { x: RX + 1.15, y, w: RW - 2.1, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: fs, color: C.ink });
      s.addImage({ data: await icon(steps[i][0], C.terra), x: RX + RW - 0.8, y: y + (h - 0.45) / 2, w: 0.45, h: 0.45 });
    }
  };
  // Helper: caja destacada con ícono
  const callout = async (s, y, h, ic, head, body, fill, headC, bodyC, circ) => {
    card(s, RX, y, RW, h, fill);
    const d = 0.85;
    await circleIcon(s, ic, RX + 0.4, y + (h - d) / 2, d, circ, C.card);
    const runs = [];
    if (head) runs.push({ text: head, options: { bold: true, color: headC, fontSize: 17.5, breakLine: true } });
    runs.push({ text: body, options: { fontSize: 15, color: bodyC } });
    s.addText(runs, { x: RX + 1.55, y, w: RW - 1.9, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, paraSpaceAfter: 5 });
  };

  // ---------- 1. Portada ----------
  {
    const s = newSlide();
    s.background = { color: C.dark };
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 0.75, w: 2.05, h: 0.42, rectRadius: 0.21, fill: { color: C.terra }, line: { color: C.terra } });
    s.addText("ONBOARDING · 02", { x: 0.7, y: 0.75, w: 2.05, h: 0.42, margin: 0, align: "center", valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 11, bold: true, charSpacing: 2, color: C.dark });
    s.addText("Cómo vamos a trabajar juntas", { x: 0.7, y: 1.45, w: 6.3, h: 1.95, margin: 0, valign: "top", isTextBox: true, fontFace: TITLE, fontSize: 50, bold: true, color: C.cream, lineSpacingMultiple: 0.9 });
    s.addText("Para que puedas aprovechar al máximo todo el acompañamiento que vas a tener dentro de AT WORK", { x: 0.7, y: 3.35, w: 6.0, h: 0.8, margin: 0, valign: "top", isTextBox: true, fontFace: TITLE, italic: true, fontSize: 17, color: C.sand });

    s.addImage({ data: img("logo_cream.png"), x: 9.55, y: 0.55, w: 3.0, h: 3.0 * 335 / 734 });
    const x = 7.75, w = 4.88;
    s.addText("EN ESTA CLASE VAS A SABER", { x, y: 2.3, w, h: 0.35, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 11, bold: true, charSpacing: 3, color: C.terra });
    const items = [
      ["FaCompass", "Qué espacios tienes disponibles"],
      ["FaHandshake", "Cómo puedes pedirme ayuda"],
      ["FaVideo", "Cómo funcionan nuestras sesiones"],
      ["FaFolderOpen", "Dónde vamos a trabajar cada cosa"],
    ];
    for (let i = 0; i < 4; i++) {
      const y = 2.8 + i * 1.0;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.82, rectRadius: 0.14, fill: { color: C.brown, transparency: 40 }, line: { color: C.brown, transparency: 40 } });
      await circleIcon(s, items[i][0], x + 0.18, y + 0.14, 0.54, C.terra, C.dark);
      s.addText(items[i][1], { x: x + 0.9, y, w: w - 1.0, h: 0.82, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 15.5, color: C.cream });
    }
  }

  // ---------- 2. Acuerdo de Trabajo ----------
  {
    const s = newSlide();
    chrome(s, 2);
    leftTitle(s, "Tu Acuerdo de Trabajo", "Un documento simple para que las dos tengamos toda la información clara desde el comienzo", 2);
    await stepRows(s, [
      ["FaFileLines", [{ text: "Descárgalo" }, { text: "  ·  está dentro de esta clase", options: { color: C.muted, fontSize: 15 } }]],
      ["FaPenNib", [{ text: "Complétalo y fírmalo" }]],
      ["FaFolderOpen", [{ text: "Súbelo a tu carpeta personal de AT WORK, dentro de " }, { text: "01 · MI CONTEXTO PROFESIONAL", options: { bold: true, color: C.brown } }]],
    ], TOP, 1.15, 0.22, 18);
    await callout(s, TOP + 3 * 1.37 + 0.1, 1.2, "FaCircleCheck", null,
      "Así queda guardado junto con toda la información de inicio de tu proceso.", C.tint, C.brown, C.brown, C.terra);
  }

  // ---------- 3. Sesiones 1:1 ----------
  {
    const s = newSlide();
    chrome(s, 3);
    leftTitle(s, "Nuestras sesiones 1:1", "El espacio para trabajar con más profundidad sobre tu inglés y tu trabajo real", 2);
    const items = [
      ["FaCalendarDays", "24 h", "Avísame con al menos 24 horas de anticipación si necesitas cambiar una sesión", true],
      ["FaHourglassHalf", "Menos de 24 h", "La sesión se considera utilizada: ese espacio ya quedó reservado para ti", false],
      ["FaClock", "Si llegas más tarde", "No pasa nada: trabajamos con el tiempo que nos quede", false],
      ["FaHandshake", "Si la muevo yo", "La reprogramamos sin problema", false],
    ];
    const gap = 0.3, w = (RW - gap) / 2, h = 2.55;
    for (let i = 0; i < 4; i++) {
      const x = RX + (i % 2) * (w + gap), y = TOP + Math.floor(i / 2) * (h + gap);
      const hl = items[i][3];
      card(s, x, y, w, h, hl ? C.brown : C.card);
      await circleIcon(s, items[i][0], x + 0.35, y + 0.32, 0.7, hl ? C.terra : C.tint, hl ? C.card : C.brown);
      s.addText(items[i][1], { x: x + 0.35, y: y + 1.1, w: w - 0.6, h: 0.55, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, bold: true, fontSize: hl ? 32 : 21, color: hl ? C.cream : C.brown });
      s.addText(items[i][2], { x: x + 0.35, y: y + 1.7, w: w - 0.6, h: 0.7, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, fontSize: 13.5, color: hl ? C.sand : C.ink });
    }
  }

  // ---------- 4. Dónde llevar cada cosa ----------
  {
    const s = newSlide();
    chrome(s, 4);
    leftTitle(s, "No estás sola entre sesiones", "Dónde llevar cada cosa, para que todo sea simple, cercano y ordenado", 2);
    const cols = [
      ["FaWhatsapp", "Comunidad de WhatsApp", "nuestro espacio principal", C.brown, ["hacer preguntas", "compartir prácticas", "pedirme feedback", "contar un avance o algo que aprendiste", "contarme algo que pasó en tu trabajo"]],
      ["FaLock", "Mensaje privado", "escríbeme directamente", C.terra, ["temas administrativos", "algo que prefieres mantener en privado"]],
      ["FaVideo", "Sesión 1:1", "para trabajarlo bien", C.dark, ["situaciones que necesitan más contexto, análisis o trabajo en profundidad"]],
    ];
    const gap = 0.3, w = (RW - 2 * gap) / 3, h = 4.4, head = 1.75;
    for (let i = 0; i < 3; i++) {
      const x = RX + i * (w + gap);
      const [ic, name, tag, col, items] = cols[i];
      card(s, x, TOP, w, h);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: TOP, w, h: head, rectRadius: 0.16, fill: { color: col }, line: { color: col } });
      s.addShape(pres.shapes.RECTANGLE, { x, y: TOP + head - 0.3, w, h: 0.3, fill: { color: col }, line: { color: col } });
      s.addImage({ data: await icon(ic, C.cream), x: x + 0.3, y: TOP + 0.28, w: 0.4, h: 0.4 });
      s.addText(name, { x: x + 0.3, y: TOP + 0.75, w: w - 0.5, h: 0.6, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, fontSize: 17, bold: true, color: C.cream, lineSpacingMultiple: 0.9 });
      s.addText(tag, { x: x + 0.3, y: TOP + 1.35, w: w - 0.5, h: 0.28, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 10.5, italic: true, color: C.sand });
      s.addText(items.map((t, j) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < items.length - 1 } })), {
        x: x + 0.25, y: TOP + head + 0.25, w: w - 0.45, h: h - head - 0.4, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, fontSize: 13.5, color: C.ink, paraSpaceAfter: 7,
      });
    }
  }

  // ---------- 5. Mensajes durante la semana ----------
  {
    const s = newSlide();
    chrome(s, 5);
    leftTitle(s, "Cuándo reviso tus mensajes", "Deja tus dudas, prácticas o situaciones en la comunidad siempre que lo necesites", 2);
    card(s, RX, TOP, RW, 2.9, C.dark);
    s.addText("REVISO Y RESPONDO LOS MENSAJES", { x: RX + 0.5, y: TOP + 0.4, w: RW - 1, h: 0.35, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 12.5, bold: true, charSpacing: 3, color: C.terra });
    s.addText([
      { text: "de lunes a viernes, ", options: { fontSize: 30, bold: false, italic: true } },
      { text: "9 a 18 h", options: { fontSize: 54, bold: true } },
    ], { x: RX + 0.5, y: TOP + 0.85, w: RW - 1, h: 1.2, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, color: C.cream });
    s.addText("horario de Buenos Aires", { x: RX + 0.5, y: TOP + 2.1, w: RW - 1, h: 0.4, margin: 0, isTextBox: true, fontFace: TITLE, italic: true, fontSize: 17, color: C.sand });
    await callout(s, TOP + 3.2, 1.55, "FaMessage", "¿Fuera de ese horario o el fin de semana?",
      "Escríbelo igual, con total tranquilidad. El mensaje queda ahí y lo retomo cuando vuelva a estar disponible.", C.tint, C.brown, C.ink, C.terra);
    s.addText("No tienes que guardarte una duda hasta nuestra próxima sesión.", { x: RX, y: TOP + 4.95, w: RW, h: 0.45, margin: 0, align: "center", valign: "middle", isTextBox: true, fontFace: TITLE, italic: true, fontSize: 16, color: C.brown });
  }

  // ---------- 6. Feedback entre sesiones ----------
  {
    const s = newSlide();
    chrome(s, 6);
    leftTitle(s, "Feedback entre sesiones", "Más adelante en este onboarding te muestro exactamente cómo pedirlo", 2);
    const tiles = [
      ["FaDumbbell", "Una práctica"],
      ["FaReply", "Una respuesta que estés preparando"],
      ["FaEnvelope", "Un mensaje que quieras comunicar con más claridad"],
      ["FaMagnifyingGlass", "Algo puntual que quieras revisar"],
    ];
    const gap = 0.25, w = (RW - 3 * gap) / 4, h = 2.85;
    for (let i = 0; i < 4; i++) {
      const x = RX + i * (w + gap);
      card(s, x, TOP, w, h);
      await circleIcon(s, tiles[i][0], x + (w - 0.9) / 2, TOP + 0.35, 0.9, C.terra, C.card);
      s.addText(tiles[i][1], { x: x + 0.15, y: TOP + 1.4, w: w - 0.3, h: 1.25, margin: 0, align: "center", valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 13.5, bold: true, color: C.brown });
    }
    await callout(s, TOP + 3.2, 2.15, "FaArrowRight", "¿Algo más grande?",
      "Una presentación completa, una conversación compleja o algo que necesita bastante contexto: lo dejamos para la sesión 1:1, donde le damos el tiempo y la profundidad que merece.", C.brown, C.cream, C.sand, C.terra);
  }

  // ---------- 7. Contexto real ----------
  {
    const s = newSlide();
    chrome(s, 7);
    leftTitle(s, "Trabajamos con tu contexto real", "No con un inglés desconectado de tu vida profesional", 2);
    s.addText("TRAE SITUACIONES Y MATERIALES REALES DE TU TRABAJO", { x: RX, y: TOP, w: RW, h: 0.35, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 11.5, bold: true, charSpacing: 2, color: C.terra });
    const items = [
      ["FaPersonChalkboard", "Presentaciones"], ["FaEnvelope", "Emails"], ["FaFileLines", "Transcripciones"],
      ["FaImage", "Capturas"], ["FaFolderOpen", "Documentos"], ["FaUsers", "Reuniones o conversaciones"],
    ];
    const gap = 0.25, w = (RW - gap) / 2, h = 0.85;
    for (let i = 0; i < 6; i++) {
      const x = RX + (i % 2) * (w + gap), y = TOP + 0.5 + Math.floor(i / 2) * (h + 0.2);
      card(s, x, y, w, h);
      await circleIcon(s, items[i][0], x + 0.22, y + (h - 0.58) / 2, 0.58, C.tint, C.brown);
      s.addText(items[i][1], { x: x + 0.98, y, w: w - 1.15, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 15, bold: true, color: C.brown });
    }
    await callout(s, TOP + 3.7, 1.75, "FaUserShield", "¿Información confidencial o sensible? Anonimízala.",
      "No necesito conocer información privada de tu empresa. Lo que necesito es entender la situación comunicativa para ayudarte a entrenarla.", C.dark, C.cream, C.sand, C.terra);
  }

  // ---------- 8. Para eso estoy yo ----------
  {
    const s = newSlide();
    chrome(s, 8);
    leftTitle(s, "Para eso estoy yo", "No necesitas llegar sabiendo qué practicar ni diagnosticar sola qué te está pasando", 1);
    const cols = [
      ["Tú traes tu realidad", C.card, C.brown, C.ink, ["las reuniones que tienes", "las situaciones que te cuestan", "lo que salió bien", "lo que no salió como querías", "las dudas que vayan apareciendo"]],
      ["Mi trabajo es", C.brown, C.cream, C.cream, ["ayudarte a entender qué está interfiriendo", "elegir qué necesitamos entrenar", "darte dirección, herramientas y feedback"]],
    ];
    const gap = 0.3, w = (RW - gap) / 2, h = 3.95;
    for (let i = 0; i < 2; i++) {
      const x = RX + i * (w + gap);
      const [name, fill, headC, txtC, items] = cols[i];
      card(s, x, TOP, w, h, fill);
      s.addText(name, { x: x + 0.4, y: TOP + 0.3, w: w - 0.8, h: 0.55, margin: 0, isTextBox: true, fontFace: TITLE, fontSize: 22, bold: true, color: headC });
      s.addText(items.map((t, j) => ({ text: t, options: { bullet: { indent: 15 }, breakLine: j < items.length - 1 } })), {
        x: x + 0.4, y: TOP + 1.0, w: w - 0.7, h: h - 1.2, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, fontSize: 14.5, color: txtC, paraSpaceAfter: 8,
      });
    }
    const y2 = TOP + h + 0.3, h2 = 1.15;
    card(s, RX, y2, RW, h2, C.tint);
    await circleIcon(s, "FaLightbulb", RX + 0.4, y2 + 0.22, 0.7, C.terra, C.card);
    s.addText([
      { text: "No espero semanas perfectas. ", options: { bold: true } },
      { text: "Quiero un proceso real, constante y conectado con lo que necesitas en tu trabajo.", options: {} },
    ], { x: RX + 1.35, y: y2, w: RW - 1.7, h: h2, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, italic: true, fontSize: 17, color: C.brown });
  }

  // ---------- 9. Cierre / CTA ----------
  {
    const s = newSlide();
    chrome(s, 9, C.terra, C.dark, C.dark);
    leftTitle(s, "Tu siguiente paso", "Ya sabes cómo vamos a acompañarnos y qué espacios tienes dentro de AT\u00A0WORK", 2, C.dark, C.dark);
    const steps = [
      ["FaFileLines", [{ text: "Descarga el " }, { text: "Acuerdo de Trabajo", options: { bold: true } }, { text: " adjunto a esta clase" }]],
      ["FaFileSignature", [{ text: "Complétalo y fírmalo" }]],
      ["FaFolderOpen", [{ text: "Súbelo a tu carpeta, dentro de " }, { text: "01 · MI CONTEXTO PROFESIONAL", options: { bold: true } }]],
      ["FaArrowRight", [{ text: "Sigue con la próxima clase: " }, { text: "cómo se organiza el ecosistema AT WORK", options: { bold: true } }]],
    ];
    const h = 1.15, gap = 0.22;
    for (let i = 0; i < steps.length; i++) {
      const y = TOP + i * (h + gap);
      card(s, RX, y, RW, h, C.cream);
      await circleIcon(s, steps[i][0], RX + 0.35, y + (h - 0.7) / 2, 0.7, C.dark, C.cream);
      s.addText(steps[i][1], { x: RX + 1.35, y, w: RW - 1.7, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 17, color: C.dark });
    }
  }


  await pres.writeFile({ fileName: "ONB02_Como_vamos_a_trabajar_juntas.pptx" });
  console.log("ok");
})();
