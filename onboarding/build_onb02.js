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
const RX = 4.8, RW = 12.63 - 4.8, TOP = 1.25;

const img = (f) => "image/png;base64," + fs.readFileSync(f).toString("base64");
async function icon(name, color, size = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size: String(size) }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}
const shadow = () => ({ type: "outer", color: "3F1E0D", blur: 14, offset: 3, angle: 90, opacity: 0.10 });

// Prompter (Drive: "02 — Cómo vamos a trabajar juntas · PROMPTER LISTO") → notas del orador
const NOTES = [
`Antes de empezar, quiero contarte cómo vamos a trabajar juntas durante estos cinco meses para que puedas aprovechar al máximo todo el acompañamiento que vas a tener dentro de AT WORK.

Quiero que desde el principio sepas qué espacios tenés disponibles, cómo podés pedirme ayuda, cómo funcionan nuestras sesiones y dónde vamos a ir trabajando cada cosa.

La idea es que te sientas acompañada, contenida y con claridad sobre qué hacer en cada momento, para que puedas enfocarte en tu proceso y en avanzar con tu inglés.`,
`Dentro de esta clase vas a encontrar también tu Acuerdo de Trabajo.

Es un documento simple donde están por escrito algunos aspectos prácticos del programa para que las dos tengamos toda la información clara desde el comienzo.

Si todavía no lo firmaste, descargalo, completalo y subilo a tu carpeta personal de AT WORK, dentro de 01 · MI CONTEXTO PROFESIONAL. Así queda guardado junto con toda la información de inicio de tu proceso.`,
`Nuestras sesiones 1:1 son el espacio donde vamos a poder trabajar con más profundidad sobre lo que esté pasando en tu inglés y en tu trabajo real.

Cada horario queda reservado especialmente para vos. Si en algún momento necesitás cambiar una sesión, podés hacerlo avisándome con al menos 24 horas de anticipación para que podamos reorganizarnos.

Si el cambio se pide con menos de 24 horas, esa sesión se considera utilizada, simplemente porque ese espacio ya quedó reservado para vos y generalmente no puedo reasignarlo con tan poco tiempo.

Y si un día llegás un poquito más tarde, no pasa nada: trabajamos con el tiempo que nos quede dentro del horario reservado.

Obviamente, si soy yo quien necesita mover una sesión, la reprogramamos sin problema.`,
`También quiero que sepas que durante AT WORK no estás sola entre una sesión y la siguiente.

Si te surge una duda, querés compartir algo, necesitás feedback o simplemente querés contarme una situación que pasó en tu trabajo, podés hacerlo dentro de la comunidad de WhatsApp.

La comunidad va a ser nuestro espacio principal de comunicación durante el programa. Ahí podés compartir prácticas, hacer preguntas, pedirme feedback, contar un avance o algo que aprendiste durante la semana.

Si se trata de un tema administrativo o de algo que preferís mantener en privado, ahí sí podés escribirme directamente.

Y cuando una situación necesita más contexto, análisis o trabajo en profundidad, la llevamos a nuestra sesión 1:1 para poder trabajarla bien.

La idea es que tengas claro dónde llevar cada cosa para que el acompañamiento sea simple, cercano y ordenado durante todo el proceso.`,
`Durante la semana, podés dejarme tus dudas, prácticas o situaciones en la comunidad siempre que lo necesites.

Yo voy revisando y respondiendo estos mensajes de lunes a viernes, entre las 9 y las 18, horario de Buenos Aires.

Y si algo te surge fuera de ese horario o durante el fin de semana, podés escribirlo igual con total tranquilidad. El mensaje queda ahí y yo lo retomo cuando vuelva a estar disponible.

La idea es que no tengas que guardarte una duda hasta nuestra próxima sesión ni depender de acordarte después, y que al mismo tiempo podamos sostener un acompañamiento cercano, claro y ordenado durante todo el proceso.`,
`Dentro de AT WORK también vas a poder pedirme feedback entre sesiones.

Puede ser sobre una práctica, una respuesta que estés preparando, un mensaje que quieras comunicar con más claridad o algo puntual que quieras revisar.

Y si aparece una situación más grande —por ejemplo una presentación completa, una conversación compleja o algo que necesita bastante contexto— lo dejamos para nuestra sesión 1:1, porque ahí vamos a poder dedicarle el tiempo y la profundidad que merece.

Más adelante en este onboarding te voy a mostrar exactamente cómo pedir feedback para que puedas aprovechar ese espacio de la mejor manera.`,
`Una de las cosas más importantes de AT WORK es que no vamos a trabajar con un inglés desconectado de tu vida profesional.

Quiero que puedas traer situaciones y materiales reales de tu trabajo: presentaciones, emails, transcripciones, capturas, documentos, reuniones o conversaciones que necesites resolver mejor.

Obviamente, si trabajás con información confidencial o sensible, podés anonimizar nombres, cifras o cualquier dato interno antes de compartirlo.

No necesito conocer información privada de tu empresa. Lo que necesito es entender la situación comunicativa para poder ayudarte a entrenarla.`,
`Y por último, quiero que tengas algo muy claro: no necesitás llegar sabiendo exactamente qué practicar ni diagnosticar sola qué te está pasando.

Para eso estoy yo.

Vos vas a traer tu realidad: las reuniones que tenés, las situaciones que te cuestan, lo que salió bien, lo que no salió como querías y las dudas que vayan apareciendo.

Y mi trabajo es ayudarte a entender qué está interfiriendo, elegir qué necesitamos entrenar y darte dirección, herramientas y feedback para que puedas seguir avanzando.

No espero semanas perfectas ni que hagas todo impecablemente. Quiero que podamos sostener un proceso real, constante y conectado con lo que necesitás en tu trabajo.`,
`Con esto ya sabés cómo vamos a acompañarnos durante estos cinco meses y qué espacios tenés disponibles dentro de AT WORK.

Ahora descargá el Acuerdo de Trabajo que está adjunto a esta clase, completalo, firmalo y subilo a tu carpeta personal de AT WORK, dentro de 01 · MI CONTEXTO PROFESIONAL.

Y después seguí con la próxima clase, donde te voy a mostrar cómo se organiza todo el ecosistema AT WORK para que sepas exactamente dónde encontrar cada cosa.`,
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
    s.addText(BRAND, {
      x: 0.7, y: 0.42, w: 5, h: 0.3, margin: 0, isTextBox: true,
      fontFace: BODY, fontSize: 10.5, bold: true, charSpacing: 3, color: fg,
    });
    s.addText([
      { text: "by Flor Pérsico", options: { italic: true, fontFace: TITLE } },
      { text: "   ·   " + String(num).padStart(2, "0") + " / " + String(TOTAL).padStart(2, "0"), options: { fontFace: BODY } },
    ], { x: 8.63, y: 0.42, w: 4, h: 0.3, margin: 0, align: "right", isTextBox: true, fontSize: 11, color: fg2 });
  };

  const leftTitle = (s, title, sub, lines, tc = C.brown, sc = C.muted) => {
    s.addText(title, {
      x: 0.7, y: 1.2, w: 3.75, h: 1.95, margin: 0, valign: "top", isTextBox: true,
      fontFace: TITLE, fontSize: 34, bold: true, color: tc, lineSpacingMultiple: 0.92,
    });
    if (sub) s.addText(sub, {
      x: 0.7, y: 1.2 + lines * 0.57 + 0.3, w: 3.6, h: 0.8, margin: 0, valign: "top", isTextBox: true,
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

  // ---------- 1. Portada ----------
  {
    const s = newSlide();
    s.background = { color: C.dark };
    // arco decorativo + logo a la derecha
    s.addShape(pres.shapes.OVAL, { x: 7.9, y: 0.6, w: 7.2, h: 7.2, fill: { color: C.brown, transparency: 45 }, line: { color: C.brown, transparency: 45 } });
    s.addShape(pres.shapes.OVAL, { x: 8.5, y: 1.2, w: 6.0, h: 6.0, fill: { color: C.dark, transparency: 100 }, line: { color: C.terra, width: 1.25 } });
    s.addImage({ data: img("logo_cream.png"), x: 8.75, y: 2.75, w: 3.9, h: 3.9 * 335 / 734 });

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 0.75, w: 2.05, h: 0.42, rectRadius: 0.21, fill: { color: C.terra }, line: { color: C.terra } });
    s.addText("ONBOARDING · 02", {
      x: 0.7, y: 0.75, w: 2.05, h: 0.42, margin: 0, align: "center", valign: "middle", isTextBox: true,
      fontFace: BODY, fontSize: 11, bold: true, charSpacing: 2, color: C.dark,
    });
    s.addText("Cómo vamos a trabajar juntas", {
      x: 0.7, y: 1.45, w: 6.9, h: 1.95, margin: 0, valign: "top", isTextBox: true,
      fontFace: TITLE, fontSize: 52, bold: true, color: C.cream, lineSpacingMultiple: 0.9,
    });
    s.addText("Para que puedas aprovechar al máximo todo el acompañamiento de AT WORK", {
      x: 0.7, y: 3.45, w: 6.4, h: 0.72, margin: 0, valign: "top", isTextBox: true,
      fontFace: TITLE, italic: true, fontSize: 18, color: C.sand,
    });
  }

  // ---------- 2. Acuerdo de Trabajo ----------
  {
    const s = newSlide();
    chrome(s, 2);
    leftTitle(s, "Tu Acuerdo de Trabajo", "Todo lo práctico, claro y por escrito desde el comienzo", 2);
    const steps = [
      ["FaFileLines", [{ text: "Descargalo desde esta clase" }]],
      ["FaPenNib", [{ text: "Completalo y firmalo" }]],
      ["FaCloudArrowUp", [{ text: "Subilo a tu carpeta personal de AT WORK" }]],
      ["FaFolderOpen", [{ text: "Dentro de " }, { text: "01 · MI CONTEXTO PROFESIONAL", options: { bold: true, color: C.brown } }]],
    ];
    const h = 1.2, gap = 0.2;
    for (let i = 0; i < steps.length; i++) {
      const y = TOP + i * (h + gap);
      card(s, RX, y, RW, h);
      s.addShape(pres.shapes.OVAL, { x: RX + 0.3, y: y + 0.28, w: 0.64, h: 0.64, fill: { color: C.terra }, line: { color: C.terra } });
      s.addText(String(i + 1), {
        x: RX + 0.3, y: y + 0.28, w: 0.64, h: 0.64, margin: 0, align: "center", valign: "middle", isTextBox: true,
        fontFace: TITLE, fontSize: 20, bold: true, color: C.card,
      });
      s.addText(steps[i][1], { x: RX + 1.2, y, w: RW - 2.2, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 19, color: C.ink });
      s.addImage({ data: await icon(steps[i][0], C.terra), x: RX + RW - 0.85, y: y + 0.36, w: 0.48, h: 0.48 });
    }
  }

  // ---------- 3. Sesiones 1:1 ----------
  {
    const s = newSlide();
    chrome(s, 3);
    leftTitle(s, "Tus sesiones 1:1", "Cada horario queda reservado especialmente para vos", 1);
    const items = [
      ["FaCalendarDays", "24 h", "de anticipación para reprogramar una sesión", true],
      ["FaHourglassHalf", "Menos de 24 h", "la sesión se considera utilizada", false],
      ["FaClock", "Si llegás tarde", "trabajamos con el tiempo que quede", false],
      ["FaHandshake", "Si yo la muevo", "la reprogramamos sin problema", false],
    ];
    const gap = 0.3, w = (RW - gap) / 2, h = 2.5;
    for (let i = 0; i < 4; i++) {
      const x = RX + (i % 2) * (w + gap), y = TOP + Math.floor(i / 2) * (h + gap);
      const hl = items[i][3];
      card(s, x, y, w, h, hl ? C.brown : C.card);
      await circleIcon(s, items[i][0], x + 0.35, y + 0.35, 0.75, hl ? C.terra : C.tint, hl ? C.card : C.brown);
      s.addText(items[i][1], {
        x: x + 0.35, y: y + 1.2, w: w - 0.7, h: 0.6, margin: 0, valign: "middle", isTextBox: true,
        fontFace: TITLE, bold: true, fontSize: hl ? 34 : 23, color: hl ? C.cream : C.brown,
      });
      s.addText(items[i][2], {
        x: x + 0.35, y: y + 1.8, w: w - 0.7, h: 0.5, margin: 0, valign: "top", isTextBox: true,
        fontFace: BODY, fontSize: 15.5, color: hl ? C.sand : C.ink,
      });
    }
  }

  // ---------- 4. Comunicación ----------
  {
    const s = newSlide();
    chrome(s, 4);
    leftTitle(s, "Cómo nos comunicamos", "No estás sola entre una sesión y la siguiente", 2);
    const cols = [
      ["FaWhatsapp", "Comunidad", "WhatsApp · espacio principal", C.brown, ["dudas y preguntas", "prácticas", "feedback", "avances y aprendizajes"]],
      ["FaLock", "Privado", "mensaje directo", C.terra, ["temas administrativos", "lo que prefieras mantener en privado"]],
      ["FaVideo", "Sesión 1:1", "trabajo en profundidad", C.dark, ["situaciones que necesitan más contexto y análisis"]],
    ];
    const gap = 0.3, w = (RW - 2 * gap) / 3, h = 4.6, head = 1.75;
    for (let i = 0; i < 3; i++) {
      const x = RX + i * (w + gap);
      const [ic, name, tag, col, items] = cols[i];
      card(s, x, TOP, w, h);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: TOP, w, h: head, rectRadius: 0.16, fill: { color: col }, line: { color: col } });
      s.addShape(pres.shapes.RECTANGLE, { x, y: TOP + head - 0.3, w, h: 0.3, fill: { color: col }, line: { color: col } });
      s.addImage({ data: await icon(ic, C.cream), x: x + 0.35, y: TOP + 0.3, w: 0.42, h: 0.42 });
      s.addText(name, { x: x + 0.35, y: TOP + 0.82, w: w - 0.6, h: 0.45, margin: 0, isTextBox: true, fontFace: TITLE, fontSize: 21, bold: true, color: C.cream });
      s.addText(tag, { x: x + 0.35, y: TOP + 1.25, w: w - 0.5, h: 0.3, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 10.5, color: C.sand });
      s.addText(items.map((t, j) => ({ text: t, options: { bullet: { indent: 15 }, breakLine: j < items.length - 1 } })), {
        x: x + 0.3, y: TOP + head + 0.3, w: w - 0.55, h: h - head - 0.5, margin: 0, valign: "top", isTextBox: true,
        fontFace: BODY, fontSize: 15.5, color: C.ink, paraSpaceAfter: 9,
      });
    }
  }

  // ---------- 5. Horario ----------
  {
    const s = newSlide();
    chrome(s, 5);
    leftTitle(s, "Mi horario de trabajo", "Cuándo reviso y respondo tus mensajes", 2);
    card(s, RX, TOP, RW, 3.05, C.dark);
    s.addImage({ data: await icon("FaClock", C.terra), x: RX + 0.5, y: TOP + 0.45, w: 0.38, h: 0.38 });
    s.addText("LUNES A VIERNES", { x: RX + 1.05, y: TOP + 0.44, w: 5, h: 0.4, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 14, bold: true, charSpacing: 4, color: C.terra });
    s.addText("9:00 – 18:00", { x: RX + 0.5, y: TOP + 1.0, w: RW - 1, h: 1.25, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, fontSize: 70, bold: true, color: C.cream });
    s.addText("horario de Buenos Aires", { x: RX + 0.5, y: TOP + 2.3, w: RW - 1, h: 0.45, margin: 0, isTextBox: true, fontFace: TITLE, italic: true, fontSize: 18, color: C.sand });
    const y2 = TOP + 3.35, h2 = 1.95;
    card(s, RX, y2, RW, h2, C.tint);
    await circleIcon(s, "FaMessage", RX + 0.45, y2 + 0.52, 0.9, C.terra, C.card);
    s.addText([
      { text: "Escribime cuando lo necesites", options: { bold: true, color: C.brown, fontSize: 19, breakLine: true } },
      { text: "Si es fuera de horario o el fin de semana, escribilo igual: el mensaje queda ahí y lo retomo cuando vuelva a estar disponible.", options: { fontSize: 15.5, color: C.ink } },
    ], { x: RX + 1.7, y: y2, w: RW - 2.1, h: h2, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, paraSpaceAfter: 6 });
  }

  // ---------- 6. Feedback entre sesiones ----------
  {
    const s = newSlide();
    chrome(s, 6);
    leftTitle(s, "Feedback entre sesiones", "Algo puntual que quieras revisar", 2);
    const tiles = [
      ["FaDumbbell", "Una práctica"],
      ["FaReply", "Una respuesta que estés preparando"],
      ["FaEnvelope", "Un mensaje que quieras comunicar mejor"],
    ];
    const gap = 0.3, w = (RW - 2 * gap) / 3, h = 2.95;
    for (let i = 0; i < 3; i++) {
      const x = RX + i * (w + gap);
      card(s, x, TOP, w, h);
      await circleIcon(s, tiles[i][0], x + (w - 1.05) / 2, TOP + 0.4, 1.05, C.terra, C.card);
      s.addText(tiles[i][1], { x: x + 0.25, y: TOP + 1.7, w: w - 0.5, h: 1.05, margin: 0, align: "center", valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 16, bold: true, color: C.brown });
    }
    const y2 = TOP + 3.3, h2 = 2.0;
    card(s, RX, y2, RW, h2, C.brown);
    await circleIcon(s, "FaArrowRight", RX + 0.45, y2 + 0.55, 0.9, C.terra, C.card);
    s.addText([
      { text: "¿Algo más grande?", options: { bold: true, color: C.cream, fontSize: 19, breakLine: true } },
      { text: "Una presentación completa, una conversación compleja o algo con mucho contexto: lo llevamos a la sesión 1:1.", options: { fontSize: 15.5, color: C.sand } },
    ], { x: RX + 1.7, y: y2, w: RW - 2.1, h: h2, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, paraSpaceAfter: 6 });
  }

  // ---------- 7. Contexto real ----------
  {
    const s = newSlide();
    chrome(s, 7);
    leftTitle(s, "Trabajamos con tu contexto real", "Nada de inglés desconectado de tu vida profesional", 2);
    const items = [
      ["FaUsers", "Reuniones y conversaciones"],
      ["FaPersonChalkboard", "Presentaciones"],
      ["FaEnvelope", "Emails"],
      ["FaFileLines", "Documentos, transcripciones y capturas"],
    ];
    const gap = 0.3, w = (RW - gap) / 2, h = 1.5;
    for (let i = 0; i < 4; i++) {
      const x = RX + (i % 2) * (w + gap), y = TOP + Math.floor(i / 2) * (h + gap);
      card(s, x, y, w, h);
      await circleIcon(s, items[i][0], x + 0.32, y + 0.35, 0.8, C.tint, C.brown);
      s.addText(items[i][1], { x: x + 1.35, y, w: w - 1.55, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 16.5, bold: true, color: C.brown });
    }
    const y2 = TOP + 2 * (h + gap) + 0.1, h2 = 1.75;
    card(s, RX, y2, RW, h2, C.dark);
    await circleIcon(s, "FaUserShield", RX + 0.45, y2 + 0.44, 0.86, C.terra, C.card);
    s.addText([
      { text: "¿Información confidencial? Anonimizala.", options: { bold: true, color: C.cream, fontSize: 18, breakLine: true } },
      { text: "No necesito datos privados de tu empresa: necesito entender la situación comunicativa.", options: { fontSize: 15, color: C.sand } },
    ], { x: RX + 1.65, y: y2, w: RW - 2.0, h: h2, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, paraSpaceAfter: 6 });
  }

  // ---------- 8. Juntas ----------
  {
    const s = newSlide();
    chrome(s, 8);
    leftTitle(s, "Estamos haciendo esto juntas", "No espero semanas perfectas: quiero un proceso real y constante", 3);
    const cols = [
      ["Tu parte", C.card, C.brown, C.ink, C.terra, ["traer tu realidad", "practicar y probar", "contarme qué salió bien y qué no", "pedir ayuda"]],
      ["Mi parte", C.brown, C.cream, C.cream, C.terra, ["entender qué está interfiriendo", "elegir qué entrenar", "darte dirección y herramientas", "darte feedback"]],
    ];
    const gap = 0.3, w = (RW - gap) / 2, h = 3.85;
    for (let i = 0; i < 2; i++) {
      const x = RX + i * (w + gap);
      const [name, fill, headC, txtC, chkC, items] = cols[i];
      card(s, x, TOP, w, h, fill);
      s.addText(name, { x: x + 0.45, y: TOP + 0.35, w: w - 0.9, h: 0.6, margin: 0, isTextBox: true, fontFace: TITLE, fontSize: 26, bold: true, color: headC });
      const chk = await icon("FaCircleCheck", chkC);
      for (let j = 0; j < items.length; j++) {
        const y = TOP + 1.2 + j * 0.62;
        s.addImage({ data: chk, x: x + 0.45, y: y + 0.11, w: 0.28, h: 0.28 });
        s.addText(items[j], { x: x + 0.92, y, w: w - 1.2, h: 0.5, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 15.5, color: txtC });
      }
    }
    const y2 = TOP + h + 0.3, h2 = 1.15;
    card(s, RX, y2, RW, h2, C.tint);
    await circleIcon(s, "FaLightbulb", RX + 0.4, y2 + 0.23, 0.7, C.terra, C.card);
    s.addText([
      { text: "No necesitás diagnosticar sola qué practicar. ", options: {} },
      { text: "Para eso estoy yo.", options: { bold: true } },
    ], { x: RX + 1.35, y: y2, w: RW - 1.7, h: h2, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, italic: true, fontSize: 21, color: C.brown });
  }

  // ---------- 9. Cierre / CTA (fondo terracota, según guía) ----------
  {
    const s = newSlide();
    chrome(s, 9, C.terra, C.dark, C.dark);
    leftTitle(s, "Tu siguiente paso", "Antes de seguir con la próxima clase", 2, C.dark, C.dark);
    const steps = [
      ["FaFileSignature", [{ text: "Descargá, completá y firmá tu " }, { text: "Acuerdo\u00A0de\u00A0Trabajo", options: { bold: true } }]],
      ["FaFolderOpen", [{ text: "Subilo a " }, { text: "01 · MI CONTEXTO PROFESIONAL", options: { bold: true } }]],
      ["FaArrowRight", [{ text: "Seguí con la próxima clase: " }, { text: "Tu\u00A0ecosistema\u00A0AT\u00A0WORK", options: { bold: true } }]],
    ];
    const h = 1.45, gap = 0.28;
    for (let i = 0; i < steps.length; i++) {
      const y = TOP + 0.3 + i * (h + gap);
      card(s, RX, y, RW, h, C.cream);
      await circleIcon(s, steps[i][0], RX + 0.4, y + 0.32, 0.8, C.dark, C.cream);
      s.addText(steps[i][1], { x: RX + 1.55, y, w: RW - 1.9, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 19, color: C.dark });
    }
  }

  await pres.writeFile({ fileName: "ONB02_Como_vamos_a_trabajar_juntas.pptx" });
  console.log("ok");
})();
