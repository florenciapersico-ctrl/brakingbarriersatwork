// Generador de presentaciones del onboarding AT WORK (Breaking Barriers at work · Flor Pérsico)
// Zona de cámara (abajo a la izquierda) SIEMPRE libre: x < 4.3", y > 4.2"
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const fa = require("react-icons/fa6");

const C = {
  brown: "81552E", dark: "3F1E0D", terra: "C68C6C", muted: "8A6A55",
  sand: "EDE5CC", cream: "F8F5EE", card: "FFFDF9", tint: "FBF2D0", ink: "3F1E0D",
};
const TITLE = "Source Serif Pro";
const BODY = "Open Sans";
const RX = 4.8, RW = 12.63 - 4.8, TOP = 1.4, BOTTOM = 6.95;
const ASSETS = __dirname;

const img = (f) => "image/png;base64," + fs.readFileSync(path.join(ASSETS, f)).toString("base64");
const iconCache = {};
async function icon(name, color) {
  const k = name + color;
  if (!iconCache[k]) {
    if (!fa[name]) throw new Error("Icono inexistente: " + name);
    const svg = RDS.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size: "160" }));
    iconCache[k] = "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
  }
  return iconCache[k];
}
const shadow = () => ({ type: "outer", color: "3F1E0D", blur: 14, offset: 3, angle: 90, opacity: 0.10 });

// Estimación simple de líneas (para ubicar subtítulos y avisar desbordes)
function lines(text, w, fs, f = 0.5) {
  const cpl = Math.max(1, Math.floor((w * 72) / (fs * f)));
  let n = 1, cur = 0;
  for (const word of String(text).split(/\s+/)) {
    const L = word.length;
    if (cur === 0) cur = L;
    else if (cur + 1 + L <= cpl) cur += 1 + L;
    else { n++; cur = L; }
  }
  return n;
}
const plain = (t) => (Array.isArray(t) ? t.map((r) => r.text).join("") : String(t));
const runs = (t, base = {}) =>
  Array.isArray(t) ? t.map((r) => ({ text: r.text, options: { ...base, ...(r.options || {}) } })) : [{ text: t, options: base }];

async function build(deck, outFile) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = deck.code + " · " + deck.title;
  pres.author = "Flor Pérsico";
  const TOTAL = deck.slides.length;

  const card = (s, x, y, w, h, fill = C.card, sh = true) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.16, fill: { color: fill }, line: { color: fill }, ...(sh ? { shadow: shadow() } : {}) });
  const circleIcon = async (s, name, x, y, d, fill, color) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill } });
    const p = d * 0.27;
    s.addImage({ data: await icon(name, color), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
  };
  const numCircle = (s, n, x, y, d, fill, color) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill } });
    s.addText(String(n), { x, y, w: d, h: d, margin: 0, align: "center", valign: "middle", isTextBox: true, fontFace: TITLE, fontSize: d * 28, bold: true, color });
  };

  const chrome = (s, num, bg = C.cream) => {
    s.background = { color: bg };
    const onTerra = bg === C.terra;
    s.addImage({ data: img(onTerra ? "logo_dark.png" : "logo_brown.png"), x: 0.7, y: 0.3, w: 1.3, h: 1.3 * 335 / 734, altText: "Breaking Barriers at work" });
    s.addText([
      { text: "by Flor Pérsico", options: { italic: true, fontFace: TITLE } },
      { text: "   ·   " + String(num).padStart(2, "0") + " / " + String(TOTAL).padStart(2, "0"), options: { fontFace: BODY } },
    ], { x: 8.63, y: 0.42, w: 4, h: 0.3, margin: 0, align: "right", isTextBox: true, fontSize: 11, color: onTerra ? C.dark : C.muted });
  };

  const leftTitle = (s, title, sub, tc = C.brown, sc = C.muted) => {
    let fsz = 34, n = lines(title, 3.75, fsz, 0.56);
    if (n > 3) { fsz = 28; n = lines(title, 3.75, fsz, 0.56); }
    const longest = Math.max(...title.split(/\s+/).map((w) => w.length));
    while (longest > (3.75 * 72) / (fsz * 0.6)) { fsz -= 2; n = lines(title, 3.75, fsz, 0.56); }
    const lh = (fsz / 72) * 1.12;
    s.addText(title, { x: 0.7, y: 1.4, w: 3.75, h: n * lh + 0.15, margin: 0, valign: "top", isTextBox: true, fontFace: TITLE, fontSize: fsz, bold: true, color: tc, lineSpacingMultiple: 0.92 });
    if (sub) {
      const y = 1.4 + n * lh + 0.3;
      const sn = lines(sub, 3.6, 16, 0.45);
      const h = sn * 0.3 + 0.1;
      if (y + h > 4.15) console.warn(`  ⚠ subtítulo invade zona de cámara: "${title}"`);
      s.addText(sub, { x: 0.7, y, w: 3.6, h, margin: 0, valign: "top", isTextBox: true, fontFace: TITLE, italic: true, fontSize: 16, color: sc });
    }
  };

  // Caja destacada
  const callout = async (s, y, h, c) => {
    const style = c.style || "tint";
    const fill = { tint: C.tint, brown: C.brown, dark: C.dark }[style];
    const headC = style === "tint" ? C.brown : C.cream;
    const bodyC = style === "tint" ? C.ink : C.sand;
    card(s, RX, y, RW, h, fill);
    const d = Math.min(0.85, h - 0.3);
    await circleIcon(s, c.icon || "FaLightbulb", RX + 0.4, y + (h - d) / 2, d, C.terra, C.card);
    const r = [];
    if (c.head) r.push({ text: c.head, options: { bold: true, color: headC, fontSize: c.headSize || 17, breakLine: !!c.body } });
    if (c.body) r.push(...runs(c.body, { fontSize: c.size || 15, color: bodyC }));
    s.addText(r, { x: RX + 0.4 + d + 0.35, y, w: RW - d - 1.1, h, margin: 0, valign: "middle", isTextBox: true, fontFace: c.serif ? TITLE : BODY, italic: !!c.serif, paraSpaceAfter: 5 });
  };
  const calloutH = (c) => (c ? c.h || 1.45 : 0);

  const L = {};

  L.cover = async (s, d) => {
    s.background = { color: C.dark };
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 0.75, w: 2.05, h: 0.42, rectRadius: 0.21, fill: { color: C.terra }, line: { color: C.terra } });
    s.addText("ONBOARDING · " + deck.num, { x: 0.7, y: 0.75, w: 2.05, h: 0.42, margin: 0, align: "center", valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 11, bold: true, charSpacing: 2, color: C.dark });
    let fsz = 50, n = lines(deck.title, 6.3, fsz, 0.56);
    if (n > 2) { fsz = 40; n = lines(deck.title, 6.3, fsz, 0.56); }
    const lh = (fsz / 72) * 1.05;
    s.addText(deck.title, { x: 0.7, y: 1.45, w: 6.3, h: n * lh + 0.2, margin: 0, valign: "top", isTextBox: true, fontFace: TITLE, fontSize: fsz, bold: true, color: C.cream, lineSpacingMultiple: 0.9 });
    const sy = 1.45 + n * lh + 0.3;
    const sh = lines(d.sub, 6.0, 17, 0.45) * 0.32 + 0.1;
    if (sy + sh > 4.15) console.warn("  ⚠ subtítulo de portada cerca de la zona de cámara");
    s.addText(d.sub, { x: 0.7, y: sy, w: 6.0, h: sh, margin: 0, valign: "top", isTextBox: true, fontFace: TITLE, italic: true, fontSize: 17, color: C.sand });
    s.addImage({ data: img("logo_cream.png"), x: 9.55, y: 0.55, w: 3.0, h: 3.0 * 335 / 734 });
    const x = 7.75, w = 4.88;
    s.addText(d.pointsLabel || "EN ESTA CLASE", { x, y: 2.3, w, h: 0.35, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 11, bold: true, charSpacing: 3, color: C.terra });
    for (let i = 0; i < d.points.length; i++) {
      const y = 2.8 + i * 1.0;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.82, rectRadius: 0.14, fill: { color: C.brown, transparency: 40 }, line: { color: C.brown, transparency: 40 } });
      await circleIcon(s, d.points[i][0], x + 0.18, y + 0.14, 0.54, C.terra, C.dark);
      s.addText(d.points[i][1], { x: x + 0.9, y, w: w - 1.0, h: 0.82, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 15, color: C.cream });
    }
  };

  // Filas numeradas (pasos). items: [{icon?, text, desc?}]
  L.steps = async (s, d, opt = {}) => {
    const cH = calloutH(d.callout), gap = 0.2;
    const avail = BOTTOM - TOP - (cH ? cH + 0.3 : 0);
    const n = d.items.length;
    const h = Math.min(d.rowH || 1.15, (avail - gap * (n - 1)) / n);
    const fill = opt.fill || C.card, txt = opt.txt || C.ink, circ = opt.circ || C.terra, circTxt = opt.circTxt || C.card;
    const fsz = d.size || (h < 0.8 ? 15 : 17.5);
    for (let i = 0; i < n; i++) {
      const it = d.items[i], y = TOP + i * (h + gap);
      card(s, RX, y, RW, h, fill);
      const dd = Math.min(0.6, h - 0.25);
      if (opt.iconCircles) await circleIcon(s, it.icon, RX + 0.3, y + (h - dd) / 2, dd, circ, circTxt);
      else numCircle(s, it.num || i + 1, RX + 0.3, y + (h - dd) / 2, dd, circ, circTxt);
      const r = runs(it.text, { fontSize: fsz, color: txt, bold: !!it.desc });
      if (it.desc) { r[r.length - 1].options.breakLine = true; r.push(...runs(it.desc, { fontSize: fsz - 3, color: opt.descC || C.muted, bold: false })); }
      const iconW = !opt.iconCircles && it.icon ? 0.75 : 0;
      s.addText(r, { x: RX + 0.3 + dd + 0.3, y, w: RW - dd - 0.95 - iconW, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, paraSpaceAfter: 2 });
      if (!opt.iconCircles && it.icon) s.addImage({ data: await icon(it.icon, C.terra), x: RX + RW - 0.8, y: y + (h - 0.42) / 2, w: 0.42, h: 0.42 });
    }
    if (d.callout) await callout(s, BOTTOM - cH, cH, d.callout);
  };

  // Tarjetas en grilla. items: [{icon?, num?, head, body?, hl?}]
  L.grid = async (s, d) => {
    const cols = d.cols || 2, n = d.items.length, rows = Math.ceil(n / cols), gap = 0.28;
    const cH = calloutH(d.callout);
    const avail = BOTTOM - TOP - (cH ? cH + 0.3 : 0) - (d.label ? 0.5 : 0);
    const w = (RW - gap * (cols - 1)) / cols;
    const hasBody = d.items.some((it) => it.body);
    const h = Math.min(d.cardH || (hasBody ? 3.2 : 2.3), (avail - gap * (rows - 1)) / rows);
    const y0 = TOP + (d.label ? 0.5 : 0);
    if (d.label) s.addText(d.label, { x: RX, y: TOP, w: RW, h: 0.35, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 11.5, bold: true, charSpacing: 2, color: C.terra });
    const narrow = w < 2.6;
    for (let i = 0; i < n; i++) {
      const it = d.items[i];
      const x = RX + (i % cols) * (w + gap), y = y0 + Math.floor(i / cols) * (h + gap);
      const hl = !!it.hl;
      card(s, x, y, w, h, hl ? C.brown : C.card);
      const dd = narrow ? 0.62 : 0.7, px = narrow ? 0.25 : 0.35;
      if (it.num) numCircle(s, it.num, x + px, y + 0.3, dd, hl ? C.terra : C.terra, C.card);
      else await circleIcon(s, it.icon, x + px, y + 0.3, dd, hl ? C.terra : C.tint, hl ? C.card : C.brown);
      const hy = y + 0.3 + dd + 0.15;
      const headFs = it.headSize || d.headSize || (!it.body ? 18 : narrow ? 16 : 19);
      const hh = it.body ? lines(it.head, w - 2 * px, headFs, 0.56) * headFs / 72 * 1.22 + 0.08 : h - (hy - y) - 0.2;
      s.addText(it.head, { x: x + px, y: hy, w: w - 2 * px, h: hh, margin: 0, valign: "top", isTextBox: true, fontFace: it.body ? TITLE : BODY, bold: true, fontSize: headFs, color: hl ? C.cream : C.brown });
      if (it.body) s.addText(runs(it.body), { x: x + px, y: hy + hh + 0.05, w: w - 2 * px, h: y + h - (hy + hh + 0.05) - 0.15, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, fontSize: d.bodySize || (narrow ? 13 : 14.5), color: hl ? C.sand : C.ink });
    }
    if (d.callout) await callout(s, BOTTOM - cH, cH, d.callout);
  };

  // Columnas con encabezado de color y viñetas. items: [{icon, head, tag, bullets, color?}]
  L.columns = async (s, d) => {
    const n = d.items.length, gap = 0.3, w = (RW - gap * (n - 1)) / n;
    const cH = calloutH(d.callout);
    const h = BOTTOM - TOP - (cH ? cH + 0.3 : 0), head = 1.7;
    const palette = [C.brown, C.terra, C.dark];
    for (let i = 0; i < n; i++) {
      const it = d.items[i], x = RX + i * (w + gap), col = it.color || palette[i % 3];
      card(s, x, TOP, w, h);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: TOP, w, h: head, rectRadius: 0.16, fill: { color: col }, line: { color: col } });
      s.addShape(pres.shapes.RECTANGLE, { x, y: TOP + head - 0.3, w, h: 0.3, fill: { color: col }, line: { color: col } });
      s.addImage({ data: await icon(it.icon, C.cream), x: x + 0.3, y: TOP + 0.25, w: 0.4, h: 0.4 });
      s.addText(it.head, { x: x + 0.3, y: TOP + 0.72, w: w - 0.5, h: 0.6, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, fontSize: 17, bold: true, color: C.cream, lineSpacingMultiple: 0.9 });
      if (it.tag) s.addText(it.tag, { x: x + 0.3, y: TOP + 1.32, w: w - 0.5, h: 0.28, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 10.5, italic: true, color: C.sand });
      s.addText(it.bullets.map((t, j) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: j < it.bullets.length - 1 } })), {
        x: x + 0.25, y: TOP + head + 0.25, w: w - 0.45, h: h - head - 0.4, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, fontSize: d.size || 14, color: C.ink, paraSpaceAfter: 7,
      });
    }
    if (d.callout) await callout(s, BOTTOM - cH, cH, d.callout);
  };

  // Frase grande + (opcional) mini tarjetas + (opcional) caja. {quote, caption?, style?, mini?:[{icon,text}], callout?}
  L.statement = async (s, d) => {
    const cH = calloutH(d.callout);
    const dark = (d.style || "dark") === "dark";
    const qh = d.quoteH || 2.2;
    card(s, RX, TOP, RW, qh, dark ? C.dark : C.tint);
    let y = TOP + 0.35;
    if (d.caption) { s.addText(d.caption, { x: RX + 0.5, y, w: RW - 1, h: 0.3, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 11.5, bold: true, charSpacing: 3, color: C.terra }); y += 0.35; }
    s.addText(runs(d.quote), { x: RX + 0.5, y, w: RW - 1, h: TOP + qh - y - 0.3, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, fontSize: d.quoteSize || 24, bold: !d.quoteLight, italic: !!d.quoteItalic, color: dark ? C.cream : C.brown });
    if (d.mini) {
      const n = d.mini.length, cols = d.miniCols || Math.min(n, 3), rows = Math.ceil(n / cols), gap = 0.28;
      const my = TOP + qh + 0.3;
      const avail = BOTTOM - my - (cH ? cH + 0.3 : 0);
      const w = (RW - gap * (cols - 1)) / cols, h = Math.min(d.miniH || 1.6, (avail - gap * (rows - 1)) / rows);
      for (let i = 0; i < n; i++) {
        const it = d.mini[i], x = RX + (i % cols) * (w + gap), yy = my + Math.floor(i / cols) * (h + gap);
        card(s, x, yy, w, h);
        const dd = 0.6;
        if (cols >= 3 || h > 1.5) {
          await circleIcon(s, it.icon, x + 0.25, yy + 0.25, dd, C.tint, C.brown);
          s.addText(runs(it.text), { x: x + 0.25, y: yy + 0.25 + dd + 0.1, w: w - 0.45, h: h - dd - 0.55, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, fontSize: d.miniSize || 13.5, bold: !!d.miniBold, color: C.ink });
        } else {
          await circleIcon(s, it.icon, x + 0.25, yy + (h - dd) / 2, dd, C.tint, C.brown);
          s.addText(runs(it.text), { x: x + 1.05, y: yy, w: w - 1.25, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: d.miniSize || 14, bold: !!d.miniBold, color: C.ink });
        }
      }
    }
    if (d.callout) await callout(s, BOTTOM - cH, cH, d.callout);
  };

  // Etiquetas compactas en 1 o 2 columnas. {label?, cols, items:[[icon,text]], callout?}
  L.chips = async (s, d) => {
    const cols = d.cols || 2, n = d.items.length, rows = Math.ceil(n / cols), gap = 0.22;
    const cH = calloutH(d.callout);
    const y0 = TOP + (d.label ? 0.5 : 0);
    if (d.label) s.addText(d.label, { x: RX, y: TOP, w: RW, h: 0.35, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 11.5, bold: true, charSpacing: 2, color: C.terra });
    const avail = BOTTOM - y0 - (cH ? cH + 0.3 : 0);
    const w = (RW - gap * (cols - 1)) / cols, h = Math.min(d.rowH || 1.2, (avail - gap * (rows - 1)) / rows);
    for (let i = 0; i < n; i++) {
      const x = RX + (i % cols) * (w + gap), y = y0 + Math.floor(i / cols) * (h + gap);
      card(s, x, y, w, h);
      const dd = Math.min(0.58, h - 0.22);
      await circleIcon(s, d.items[i][0], x + 0.22, y + (h - dd) / 2, dd, C.tint, C.brown);
      s.addText(runs(d.items[i][1]), { x: x + 0.22 + dd + 0.25, y, w: w - dd - 0.65, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: d.size || 14.5, bold: d.bold !== false, color: C.brown });
    }
    if (d.callout) await callout(s, BOTTOM - cH, cH, d.callout);
  };

  // Dos columnas: tu parte / mi parte. {left:{head,items}, right:{head,items}, callout?}
  L.twocol = async (s, d) => {
    const cH = calloutH(d.callout), gap = 0.3, w = (RW - gap) / 2;
    const h = BOTTOM - TOP - (cH ? cH + 0.3 : 0);
    const cols = [[d.left, C.card, C.brown, C.ink], [d.right, C.brown, C.cream, C.cream]];
    for (let i = 0; i < 2; i++) {
      const [c, fill, hc, tc] = cols[i], x = RX + i * (w + gap);
      card(s, x, TOP, w, h, fill);
      const hn = lines(c.head, w - 0.7, 19, 0.56), hh = hn * 0.33 + 0.1;
      s.addText(c.head, { x: x + 0.4, y: TOP + 0.3, w: w - 0.7, h: hh, margin: 0, valign: "top", isTextBox: true, fontFace: TITLE, fontSize: 19, bold: true, color: hc });
      s.addText(c.items.map((t, j) => ({ text: t, options: { bullet: { indent: 15 }, breakLine: j < c.items.length - 1 } })), {
        x: x + 0.4, y: TOP + 0.3 + hh + 0.25, w: w - 0.7, h: h - hh - 0.75, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, fontSize: d.size || 14.5, color: tc, paraSpaceAfter: 8,
      });
    }
    if (d.callout) await callout(s, BOTTOM - cH, cH, d.callout);
  };

  // Ciclo / flujo horizontal. {nodes:[text], list?:{head,items}, callout?}
  L.cycle = async (s, d) => {
    const n = d.nodes.length, gap = 0.34, w = (RW - gap * (n - 1)) / n;
    const h = d.nodeH || Math.min(2.6, BOTTOM - TOP - (d.callout ? calloutH(d.callout) + 0.3 : 0));
    for (let i = 0; i < n; i++) {
      const x = RX + i * (w + gap);
      const last = i === n - 1 && d.highlightLast;
      card(s, x, TOP, w, h, last ? C.brown : C.card);
      numCircle(s, i + 1, x + (w - 0.5) / 2, TOP + 0.22, 0.5, C.terra, C.card);
      s.addText(d.nodes[i], { x: x + 0.12, y: TOP + 0.85, w: w - 0.24, h: h - 1.05, margin: 0, align: "center", valign: "middle", isTextBox: true, fontFace: BODY, fontSize: d.size || (w < 1.5 ? 14 : 15.5), bold: true, color: last ? C.cream : C.brown });
      if (i < n - 1) s.addImage({ data: await icon("FaChevronRight", C.terra), x: x + w + gap / 2 - 0.1, y: TOP + h / 2 - 0.1, w: 0.2, h: 0.2 });
    }
    let y = TOP + h + 0.3;
    const cH = calloutH(d.callout);
    if (d.list) {
      const lh = BOTTOM - y - (cH ? cH + 0.3 : 0);
      card(s, RX, y, RW, lh);
      s.addText(d.list.head, { x: RX + 0.4, y: y + 0.25, w: RW - 0.8, h: 0.4, margin: 0, isTextBox: true, fontFace: TITLE, fontSize: 18, bold: true, color: C.brown });
      s.addText(d.list.items.map((t, j) => ({ text: t, options: { bullet: { indent: 15 }, breakLine: j < d.list.items.length - 1 } })), {
        x: x0(RX), y: y + 0.75, w: RW - 0.8, h: lh - 0.9, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, fontSize: d.listSize || 14, color: C.ink, paraSpaceAfter: 5,
      });
    }
    if (d.callout) await callout(s, BOTTOM - cH, cH, d.callout);
    function x0(v) { return v + 0.4; }
  };

  // Escalera de exposición. {steps:[{head, body}], callout?}
  L.ladder = async (s, d) => {
    const n = d.steps.length, gap = 0.18, w = (RW - gap * (n - 1)) / n;
    const cH = calloutH(d.callout);
    const base = BOTTOM - (cH ? cH + 0.3 : 0);
    const minH = 1.7, maxH = base - TOP;
    for (let i = 0; i < n; i++) {
      const h = minH + (maxH - minH) * (i / (n - 1));
      const x = RX + i * (w + gap), y = base - h;
      const fill = [C.tint, C.sand, C.terra, C.brown, C.dark][Math.min(4, Math.round((i / (n - 1)) * 4))];
      const lightTxt = i / (n - 1) > 0.45;
      card(s, x, y, w, h, fill);
      s.addText(String(i + 1), { x: x + 0.15, y: y + 0.12, w: w - 0.3, h: 0.45, margin: 0, isTextBox: true, fontFace: TITLE, fontSize: 22, bold: true, color: lightTxt ? C.cream : C.brown });
      s.addText([
        { text: d.steps[i].head, options: { bold: true, fontSize: 12.5, breakLine: !!d.steps[i].body } },
        ...(d.steps[i].body ? [{ text: d.steps[i].body, options: { fontSize: 11 } }] : []),
      ], { x: x + 0.15, y: y + 0.6, w: w - 0.3, h: h - 0.75, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, color: lightTxt ? C.cream : C.ink, paraSpaceAfter: 4 });
    }
    if (d.callout) await callout(s, BOTTOM - cH, cH, d.callout);
  };

  // Transformación de una etapa: DE → A + qué trabajamos. {weeks, from, to, work:[..], note?}
  L.fromto = async (s, d) => {
    s.addText(d.weeks, { x: RX, y: TOP, w: RW, h: 0.35, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 11.5, bold: true, charSpacing: 2, color: C.terra });
    const y = TOP + 0.5, h = 2.05, gap = 0.55, w = (RW - gap) / 2;
    card(s, RX, y, w, h, C.card);
    card(s, RX + w + gap, y, w, h, C.brown);
    s.addText([{ text: "DE", options: { bold: true, fontSize: 11, charSpacing: 3, color: C.terra, breakLine: true } }, { text: d.from, options: { fontSize: 16, italic: true, color: C.ink } }],
      { x: RX + 0.35, y, w: w - 0.7, h, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, paraSpaceAfter: 6 });
    s.addText([{ text: "A", options: { bold: true, fontSize: 11, charSpacing: 3, color: C.sand, breakLine: true } }, { text: d.to, options: { fontSize: 16, bold: true, color: C.cream } }],
      { x: RX + w + gap + 0.35, y, w: w - 0.7, h, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, paraSpaceAfter: 6 });
    await circleIcon(s, "FaArrowRight", RX + w + gap / 2 - 0.25, y + h / 2 - 0.25, 0.5, C.terra, C.card);
    const y2 = y + h + 0.3, h2 = BOTTOM - y2;
    card(s, RX, y2, RW, h2, C.tint);
    s.addText(d.workLabel || "QUÉ VAMOS A TRABAJAR", { x: RX + 0.4, y: y2 + 0.25, w: RW - 0.8, h: 0.3, margin: 0, isTextBox: true, fontFace: BODY, fontSize: 11, bold: true, charSpacing: 2, color: C.brown });
    s.addText(d.work.map((t, j) => ({ text: t, options: { bullet: { indent: 15 }, breakLine: j < d.work.length - 1 } })), {
      x: RX + 0.4, y: y2 + 0.65, w: RW - 0.8, h: h2 - 0.8, margin: 0, valign: "top", isTextBox: true, fontFace: BODY, fontSize: d.size || 14.5, color: C.ink, paraSpaceAfter: 5,
    });
  };

  // Número o dato grande. {label, big, bigSmall?, sub, callout?, foot?}
  L.stat = async (s, d) => {
    const h = 2.9;
    card(s, RX, TOP, RW, h, C.dark);
    s.addText(d.label, { x: RX + 0.5, y: TOP + 0.4, w: RW - 1, h: 0.35, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: 12.5, bold: true, charSpacing: 3, color: C.terra });
    const r = [];
    if (d.pre) r.push({ text: d.pre, options: { fontSize: 30, italic: true } });
    r.push({ text: d.big, options: { fontSize: d.bigSize || 58, bold: true } });
    s.addText(r, { x: RX + 0.5, y: TOP + 0.85, w: RW - 1, h: 1.2, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, color: C.cream });
    s.addText(d.sub, { x: RX + 0.5, y: TOP + 2.1, w: RW - 1, h: 0.4, margin: 0, isTextBox: true, fontFace: TITLE, italic: true, fontSize: 17, color: C.sand });
    if (d.callout) await callout(s, TOP + h + 0.3, d.callout.h || 1.55, d.callout);
    if (d.foot) s.addText(d.foot, { x: RX, y: BOTTOM - 0.5, w: RW, h: 0.45, margin: 0, align: "center", valign: "middle", isTextBox: true, fontFace: TITLE, italic: true, fontSize: 16, color: C.brown });
  };

  // Mensajes tipo chat. {bubbles:[{tag, text, icon}], callout?}
  L.chat = async (s, d) => {
    const cH = calloutH(d.callout), gap = 0.25, n = d.bubbles.length;
    const avail = BOTTOM - TOP - (cH ? cH + 0.3 : 0);
    const h = (avail - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const b = d.bubbles[i], y = TOP + i * (h + gap), x = RX + (i % 2 ? 0.6 : 0), w = RW - 0.6;
      card(s, x, y, w, h, i === 1 ? C.tint : C.card);
      await circleIcon(s, b.icon, x + 0.3, y + (h - 0.62) / 2, 0.62, C.terra, C.card);
      s.addText([
        { text: b.tag, options: { fontSize: 10.5, bold: true, charSpacing: 2, color: C.terra, breakLine: true } },
        ...runs(b.text, { fontSize: 16, color: C.ink, italic: !!b.italic }),
      ], { x: x + 1.2, y, w: w - 1.5, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, paraSpaceAfter: 4 });
    }
    if (d.callout) await callout(s, BOTTOM - cH, cH, d.callout);
  };

  // Checklist. {cols, items:[text], note?}
  L.checklist = async (s, d) => {
    const cols = d.cols || 1, n = d.items.length, rows = Math.ceil(n / cols), gap = 0.2;
    const cH = calloutH(d.callout);
    const avail = BOTTOM - TOP - (cH ? cH + 0.3 : 0);
    const w = (RW - 0.28 * (cols - 1)) / cols, h = Math.min(1.0, (avail - gap * (rows - 1)) / rows);
    const chk = await icon("FaSquareCheck", C.terra);
    for (let i = 0; i < n; i++) {
      const col = cols === 1 ? 0 : Math.floor(i / rows), row = cols === 1 ? i : i % rows;
      const x = RX + col * (w + 0.28), y = TOP + row * (h + gap);
      card(s, x, y, w, h);
      s.addImage({ data: chk, x: x + 0.3, y: y + (h - 0.38) / 2, w: 0.38, h: 0.38 });
      s.addText(runs(d.items[i]), { x: x + 0.9, y, w: w - 1.1, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: d.size || 15, color: C.ink });
    }
    if (d.callout) await callout(s, BOTTOM - cH, cH, d.callout);
  };

  // Cierre sobre terracota. {items:[{icon, text}], note?}
  L.close = async (s, d) => {
    const noteH = d.note ? 0.75 : 0, gap = 0.22, n = d.items.length;
    const h = Math.min(1.2, (BOTTOM - TOP - noteH - gap * (n - 1)) / n);
    for (let i = 0; i < n; i++) {
      const y = TOP + i * (h + gap);
      card(s, RX, y, RW, h, C.cream);
      await circleIcon(s, d.items[i].icon, RX + 0.35, y + (h - 0.66) / 2, 0.66, C.dark, C.cream);
      s.addText(runs(d.items[i].text), { x: RX + 1.3, y, w: RW - 1.6, h, margin: 0, valign: "middle", isTextBox: true, fontFace: BODY, fontSize: d.size || 16.5, color: C.dark });
    }
    if (d.note) s.addText(runs(d.note), { x: RX, y: BOTTOM - noteH + 0.1, w: RW, h: noteH - 0.1, margin: 0, valign: "middle", isTextBox: true, fontFace: TITLE, italic: true, fontSize: 15, color: C.dark });
  };

  for (let i = 0; i < deck.slides.length; i++) {
    const d = deck.slides[i], s = pres.addSlide();
    s.addNotes(d.notes);
    if (d.type === "cover") { await L.cover(s, d); continue; }
    if (d.type === "close") {
      chrome(s, i + 1, C.terra);
      leftTitle(s, d.title, d.sub, C.dark, C.dark);
      await L.close(s, d);
      continue;
    }
    chrome(s, i + 1);
    leftTitle(s, d.title, d.sub);
    if (d.type === "iconsteps") await L.steps(s, d, { iconCircles: true });
    else await L[d.type](s, d);
  }
  await pres.writeFile({ fileName: outFile });
}

module.exports = { build, C };
