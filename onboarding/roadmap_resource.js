// Recurso visual "Tu recorrido AT WORK" (acompaña ONB 04 y la carpeta 05 · MI PROGRESO). No es para grabar: usa todo el ancho.
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const fa = require("react-icons/fa6");

const C = { brown: "81552E", dark: "3F1E0D", terra: "C68C6C", muted: "8A6A55", sand: "EDE5CC", cream: "F8F5EE", card: "FFFDF9", tint: "FBF2D0" };
const TITLE = "Source Serif Pro", BODY = "Open Sans";
const img = (f) => "image/png;base64," + fs.readFileSync(__dirname + "/" + f).toString("base64");
async function icon(name, color) {
  const svg = RDS.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size: "160" }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

const STAGES = [
  { weeks: "SEMANA 1", name: "Onboarding", icon: "FaFlagCheckered", result: "Tu sistema de trabajo queda instalado y tienes tu Starting Point." },
  { weeks: "SEMANAS 2–4", name: "Activate Your English", icon: "FaBolt", result: "Conviertes situaciones reales de tu trabajo en práctica y activas el inglés que ya tienes." },
  { weeks: "SEMANAS 5–10", name: "Communicate in Real Time", icon: "FaComments", result: "Organizas y sostienes mensajes claros en tiempo real, sin depender de un guion." },
  { weeks: "SEMANAS 11–16", name: "Polish Your English", icon: "FaGem", result: "Estabilizas los patrones que limitan tu claridad y precisión." },
  { weeks: "SEMANAS 17–19", name: "Understand & Be Understood", icon: "FaHeadphones", result: "Entiendes mejor el inglés hablado y te haces entender con más facilidad." },
  { weeks: "SEMANA 20", name: "Review final / integración", icon: "FaTrophy", result: "Integras todo, comparas con tu Starting Point y defines tu siguiente nivel." },
];

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Tu recorrido AT WORK";
  const s = pres.addSlide();
  s.background = { color: C.cream };
  s.addImage({ data: img("logo_brown.png"), x: 0.6, y: 0.35, w: 1.5, h: 1.5 * 335 / 734 });
  s.addText("by Flor Pérsico", { x: 9.73, y: 0.45, w: 3, h: 0.3, margin: 0, align: "right", isTextBox: true, fontFace: TITLE, italic: true, fontSize: 12, color: C.muted });
  s.addText("Tu recorrido AT WORK", { x: 0.6, y: 1.2, w: 12.1, h: 0.75, margin: 0, isTextBox: true, fontFace: TITLE, fontSize: 36, bold: true, color: C.brown });
  s.addText("5 meses · 20 semanas · qué vas a poder hacer al terminar cada etapa", { x: 0.6, y: 1.9, w: 12.1, h: 0.4, margin: 0, isTextBox: true, fontFace: TITLE, italic: true, fontSize: 16, color: C.muted });

  const n = STAGES.length, gap = 0.18, x0 = 0.6, W = 12.13, w = (W - gap * (n - 1)) / n, y = 2.6, h = 3.35;
  const fills = [C.tint, C.card, C.card, C.card, C.card, C.brown];
  for (let i = 0; i < n; i++) {
    const st = STAGES[i], x = x0 + i * (w + gap), dark = i === n - 1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.14, fill: { color: fills[i] }, line: { color: dark ? C.brown : C.sand, width: 1 } });
    s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.22, w: 0.55, h: 0.55, fill: { color: dark ? C.terra : C.brown }, line: { color: dark ? C.terra : C.brown } });
    s.addImage({ data: await icon(st.icon, C.cream), x: x + 0.34, y: y + 0.36, w: 0.27, h: 0.27 });
    s.addText(st.weeks, { x: x + 0.2, y: y + 0.9, w: w - 0.3, h: 0.28, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 9.5, bold: true, charSpacing: 1.5, color: C.terra });
    s.addText(st.name, { x: x + 0.2, y: y + 1.18, w: w - 0.3, h: 0.72, margin: 0, valign: "top", isTextBox: true, fontFace: TITLE, fontSize: 14.5, bold: true, color: dark ? C.cream : C.brown });
    s.addText([{ text: "AL TERMINAR", options: { fontSize: 8.5, bold: true, charSpacing: 1.5, color: dark ? C.sand : C.muted, breakLine: true } }, { text: st.result, options: { fontSize: 11.5, color: dark ? C.cream : C.dark } }],
      { x: x + 0.2, y: y + 1.95, w: w - 0.35, h: h - 2.05, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, paraSpaceAfter: 3 });
    if (i < n - 1) s.addText("›", { x: x + w - 0.02, y: y + h / 2 - 0.2, w: gap + 0.04, h: 0.4, margin: 0, align: "center", isTextBox: true, fontFace: BODY, fontSize: 16, bold: true, color: C.terra });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 6.2, w: 12.13, h: 0.85, rectRadius: 0.14, fill: { color: C.dark }, line: { color: C.dark } });
  s.addText([
    { text: "Tracks transversales: ", options: { bold: true, color: C.terra } },
    { text: "práctica con situaciones reales, pronunciación y listening, y precisión aparecen durante todo el recorrido cuando tu comunicación real lo necesita. Cada etapa marca el foco principal, no un límite.", options: { color: C.cream } },
  ], { x: 0.9, y: 6.2, w: 11.6, h: 0.85, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 12 });
  await pres.writeFile({ fileName: __dirname + "/recursos/Tu_recorrido_AT_WORK.pptx" });
  console.log("ok");
})();
