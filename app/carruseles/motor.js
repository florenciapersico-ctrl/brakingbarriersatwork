/* Carruseles Flor · motor de diseño (port fiel de carruseles/motor.py) */
(function () {
const W = 1080;
const C = {olivo:"#4b5624", cafe:"#81552e", terra:"#c68c6c", crema:"#f8f5ee", crema_m:"#ede5cc", calida:"#fbf2d0", negro:"#22201a", bb:"#3f1e0d"};
const HANDLE = "@YSI_SPEAKENGLISH";

const RECETAS = {
  editorial: {n:"Editorial", para:"valor", desc:"Crema con mucho aire, números terracota, nota del celular sobre foto, cierre olivo.",
    portadas:["portada_foto"], fondo:"crema", cierre:"olivo", formas:["texto","numerada","notas_foto","frase","tarjetas","cierre"]},
  tarjetas: {n:"Tarjetas", para:"valor, crecimiento", desc:"Fotos con tarjetas encima (calendario, notas, botones), error tachado con su corrección.",
    portadas:["portada_botones","portada_foto"], fondo:"crema_m", cierre:"foto", formas:["tarjetas","notas_foto","error","foto_frase","calendario","cierre"]},
  historia: {n:"Historia", para:"demanda", desc:"Historia de alumna en café oscuro, palabra detrás de ti, recorte sobre crema.",
    portadas:["portada_profundidad","portada_foto"], fondo:"bb", cierre:"bb", formas:["oscura","foto_frase","tachado","recorte_lado","texto","cierre"]},
  serif: {n:"Serif", para:"crecimiento, inspira", desc:"Serif gigante y fina sobre foto oscurecida, placas de texto grandes.",
    portadas:["portada_serif","portada_foto"], fondo:"crema", cierre:"crema_m", formas:["texto","frase","numerada","foto_frase","tachado","cierre"]}
};

// campos de cada forma: [clave, etiqueta, tipo]  tipo: t (línea), a (párrafo), l (lista de líneas), p (pares "negrita | resto")
const FORMAS = {
  portada_foto: {n:"Portada con foto", c:[["titulo","Título","a"],["titulo_i","Segunda parte en itálica","a"],["bajada","Bajada chica (opcional)","t"]]},
  portada_botones: {n:"Portada con botones", c:[["titulo","Título","a"],["titulo_2","Título, segunda línea","a"],["bajada","Bajada","t"],["opciones","3 opciones (una por línea)","l"]]},
  portada_profundidad: {n:"Palabra detrás de ti", c:[["pre","Frase chica arriba","t"],["palabra","UNA palabra gigante","t"],["pill","Cierre del hook (etiqueta)","a"]]},
  portada_serif: {n:"Portada serif", c:[["pre","Línea chica","t"],["titulo","1 a 3 palabras gigantes","t"],["titulo_i","Itálica debajo","a"]]},
  texto: {n:"Texto", c:[["titulo","Título","a"],["titulo_i","Itálica","a"],["cuerpo","Cuerpo (máx. 30 palabras)","a"]]},
  numerada: {n:"Numerada", c:[["titulo","Título","a"],["items","2 a 4 líneas: frase | nota","p"]]},
  notas_foto: {n:"Nota del celular sobre foto", c:[["titulo","Título de la nota","t"],["lineas","2 a 4 líneas: negrita | resto","p"]]},
  tarjetas: {n:"Tarjetas", c:[["titulo","Título","a"],["sub","Bajada","t"],["tarjetas","2 a 4 tarjetas: negrita | resto","p"]]},
  calendario: {n:"Calendario sobre foto", c:[["titulo","Título","a"],["sub","Bajada","t"],["hora","Hora","t"],["evento","Evento","t"],["detalle","Detalle","t"]]},
  error: {n:"Error tachado + corrección", c:[["intro","Intro (ej.: No digas:)","t"],["mal","Lo que se tacha","t"],["bien","La versión buena (itálica)","a"],["nota","Nota","a"]]},
  frase: {n:"Frase con pincelada", c:[["linea_i","Línea en itálica","a"],["resaltado","Palabra con pincelada","t"]]},
  foto_frase: {n:"Frase sobre foto", c:[["pre","Frase chica","a"],["frase_i","Frase grande en itálica","a"]]},
  tachado: {n:"Creencia tachada", c:[["pre","Intro","a"],["tachado","Lo que se tacha","t"],["verdad_i","La verdad (itálica)","a"]]},
  oscura: {n:"Placa oscura", c:[["texto","Texto","a"],["texto_i","Itálica terracota","a"]]},
  recorte_lado: {n:"Tu recorte al costado", c:[["titulo","Título","a"],["titulo_i","Itálica","a"],["cuerpo","Cuerpo","a"]]},
  cierre: {n:"Cierre", c:[["titulo","Título","a"],["titulo_i","Itálica","a"],["cuerpo","Texto (opcional)","a"],["cta","Botón (opcional): Comenta ENTRENAR / Escribe READY…","t"]]}
};
const CON_FOTO = new Set(["portada_foto","portada_botones","portada_profundidad","portada_serif","notas_foto","foto_frase","calendario","recorte_lado"]);

let A = {pinc:"marca/pincel-terra-c68c6c.png", logoO:"marca/logo-olivo.png", logoC:"marca/logo-crema.png"};
let CAT = [];
let fotoURL = f => "fotos/" + f;
const urlDe = e => e && e.ruta ? e.ruta : fotoURL(e.archivo);
let recorteURL = f => "recortes/" + f.replace(/\.jpg$/, ".webp");

function css(){ return `
.p{position:relative;width:${W}px;overflow:hidden;background:${C.crema};color:${C.negro};font-family:'Sans';-webkit-font-smoothing:antialiased;hyphens:manual;line-height:normal;text-align:left}
.p *{margin:0;padding:0;box-sizing:border-box}
.p .bg{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat}
.p .caja{position:absolute;overflow:hidden;display:flex;flex-direction:column}
.p .s{font-family:'Serif';font-weight:600;letter-spacing:-.03em;line-height:1}
.p .sf{font-family:'Serif';font-weight:400;letter-spacing:-.045em;line-height:.88}
.p .si{font-family:'Serif';font-style:italic;font-weight:400;letter-spacing:-.025em}
.p .g{font-family:'Sans';font-weight:800;letter-spacing:-.045em;line-height:.98}
.p .r{font-family:'Sans';font-weight:500;letter-spacing:-.025em;line-height:1.1}
.p .caps{font-weight:600;letter-spacing:.05em;text-transform:uppercase;font-size:32px}
.p .cuerpo{font-size:42px;line-height:1.45}
.p .sutil{text-shadow:0 1px 3px rgba(0,0,0,.3)}
.p .pinc{white-space:nowrap;background:url(${A.pinc}) no-repeat center 58%/106% 84%;padding:0 .14em;color:${C.crema}}
.p .pinc.larga{white-space:normal;-webkit-box-decoration-break:clone;box-decoration-break:clone;background-size:100% 84%;line-height:1.3}
.p .raya{text-decoration:line-through;text-decoration-color:${C.terra};text-decoration-thickness:.11em;text-decoration-skip-ink:none}
.p .raya:after{content:none}
.p .num{font-family:'Serif';font-weight:600;color:${C.terra};font-size:64px;min-width:110px}
.p .linea{display:flex;align-items:baseline;padding:30px 0;border-top:2px solid rgba(75,86,36,.18)}
.p .tarj{background:#fff;border-radius:28px;box-shadow:0 18px 40px rgba(20,18,12,.2);padding:28px 40px}
.p .tarj .bar{display:flex;justify-content:space-between;color:${C.terra};font-size:26px;font-weight:600;margin-bottom:12px}
.p .etq{display:inline-block;background:${C.terra};color:${C.crema};font-weight:600;font-size:46px;padding:10px 28px;border-radius:12px;box-shadow:0 6px 16px rgba(0,0,0,.2)}
.p .opc{display:flex;justify-content:space-between;align-items:center;background:rgba(248,245,238,.96);border-radius:60px;padding:18px 22px 18px 36px;font-size:36px;margin-top:16px;white-space:nowrap}
.exp-pptx .pinc{background:none!important;color:inherit!important;padding:0!important}
.exp-pptx .raya:after{display:none}
.p .opc b.ok{display:inline-flex;width:54px;height:54px;border-radius:50%;background:${C.terra};color:#fff;align-items:center;justify-content:center;font-size:28px;margin-left:22px}
`; }

function esc(t){ return String(t ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function md(t){
  t = esc(t);
  t = t.replace(/==(.+?)==/g,(x,y) => y.replace(/<[^>]+>/g,"").length > 16 ? `<span class="pinc larga">${y}</span>` : `<span class="pinc">${y}</span>`).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>");
  return t.replace(/\*(.+?)\*/g,'<span class="si">$1</span>').replace(/\n/g,"<br>");
}
function tx(clase, texto, fs, extra=""){ return texto ? `<div class="${clase}" data-fs="${fs}" data-t style="font-size:${fs}px;${extra}">${md(texto)}</div>` : ""; }
const pares = v => (Array.isArray(v) ? v : String(v||"").split("\n")).map(x => Array.isArray(x) ? x : String(x).split("|").map(s => s.trim())).filter(x => x[0]);
const lineas = v => (Array.isArray(v) ? v : String(v||"").split("\n")).map(s => String(s).trim()).filter(Boolean);

function geom(e, H){
  const s = Math.max(W/e.ancho, H/e.alto), offx = (e.ancho*s - W)/2, top = (e.cabeza_arriba||0)*e.alto*s;
  let cara;
  if (e.cara){ const [x,y,w,h] = e.cara; cara = [x*e.ancho*s-offx, y*e.alto*s, (x+w)*e.ancho*s-offx, (y+h)*e.alto*s]; }
  else cara = [W*.25, top, W*.75, top + .30*e.alto*s];
  return [top, cara];
}
function libre(e, H){ const [top, cara] = geom(e, H); return top >= 380 ? ["arriba", 60, Math.max(top-20,0)] : ["abajo", Math.min(cara[3]+30, H-420), H-150]; }
function porNombre(f){ return CAT.find(x => x.archivo === f); }

/* elige fotos sin repetir dentro del carrusel ni las de "evitar" */
function tomarFoto(forma, H, pedida, usadas, rnd){
  if (pedida && pedida !== "objeto" && pedida !== "persona"){ const e = porNombre(pedida); if (e){ usadas.add(e.archivo); return e; } }
  let pool = CAT.filter(e => !e.excluir && e.tipo !== "fondo" && !usadas.has(e.archivo));
  if (!pool.length) pool = CAT.filter(e => !e.excluir && e.tipo !== "fondo");
  let cand;
  if (pedida === "objeto" || forma === "notas_foto") cand = pool.filter(e => e.tipo === "objeto").length ? pool.filter(e => e.tipo === "objeto") : pool.filter(e => e.tipo === "persona");
  else if (forma === "portada_profundidad"){ cand = pool.filter(e => e.tiene_recorte && geom(e,H)[0] >= 300); if (!cand.length) return null; }
  else if (forma === "recorte_lado") cand = pool.filter(e => e.tiene_recorte);
  else cand = pool.filter(e => e.tipo === "persona").length ? pool.filter(e => e.tipo === "persona") : pool;
  if (!cand.length) cand = pool;
  const e = cand[Math.floor(rnd()*cand.length)]; usadas.add(e.archivo); return e;
}

function pie(osc){ return `<div style="position:absolute;left:96px;right:96px;bottom:60px;display:flex;justify-content:space-between;align-items:center"><img src="${osc?A.logoC:A.logoO}" style="height:48px"></div>`; }
function handle(color=C.crema){ return `<div style="position:absolute;left:0;right:0;bottom:56px;text-align:center;color:${color}"><span style="border:2px solid currentColor;border-radius:12px;padding:10px 30px;font-size:24px;font-weight:600;letter-spacing:.14em">${HANDLE}</span></div>`; }
function fondoFoto(e, velo){ return `<div class="bg" data-foto="${e.archivo}" data-modo="cover" data-src="${urlDe(e)}" style="background-image:url(${urlDe(e)});background-position:${e.tipo==="fondo"?"center":"center top"}"></div><div class="bg" style="background:${velo}"></div>`; }
function caja(top, bot, inner, lado=84, just="center", align="stretch", txt="left"){
  return `<div class="caja" style="left:${lado}px;right:${lado}px;top:${top}px;bottom:${bot}px;justify-content:${just};align-items:${align};text-align:${txt}">${inner}</div>`;
}

/* color de fondo de las placas sin foto (para el velo de la foto de fondo) */
function colorFondo(f, receta){
  const R = RECETAS[receta], fondo = C[R.fondo] || C.crema;
  if (f === "texto") return fondo; if (f === "numerada") return R.fondo === "bb" ? C.crema : C.crema_m; if (f === "tarjetas") return C.crema_m;
  if (f === "oscura") return C.bb; if (f === "cierre") return ({olivo:C.olivo, bb:C.bb, crema_m:C.crema_m})[R.cierre] || C.crema;
  return C.crema;
}
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; };
/* placa → HTML. e = foto ya elegida (o null); fe = foto de fondo opcional de una placa de texto */
function placa(f, d, H, receta, e, fe){
  const html = placaBase(f, d, H, receta, e);
  if (!fe || CON_FOTO.has(f) || (f === "cierre" && RECETAS[receta].cierre === "foto")) return html;
  const velo = Math.min(.97, Math.max(.35, +d.velo || .8));
  const capa = `<div class="bg" data-foto="${fe.archivo}" data-modo="cover" data-src="${urlDe(fe)}" style="background-image:url(${urlDe(fe)});background-position:center"></div><div class="bg" style="background:${rgba(colorFondo(f, receta), velo)}"></div>`;
  return html.replace(/^(<div class="p"[^>]*>)/, "$1" + capa);
}
function placaBase(f, d, H, receta, e){
  const R = RECETAS[receta], fondo = C[R.fondo] || C.crema, osc = R.fondo === "bb", col = osc ? C.crema_m : C.olivo;
  const P = inner => `<div class="p" style="height:${H}px">${inner}</div>`;
  if (CON_FOTO.has(f) && !e && f !== "portada_profundidad") return P(`<div class="caja" style="inset:0;align-items:center;justify-content:center;color:${C.cafe};font-size:40px">Sin foto disponible</div>`);
  if (f === "portada_foto"){
    const [zona,a,b] = libre(e,H);
    const velo = zona === "arriba" ? "linear-gradient(180deg,rgba(20,18,12,.5) 0%,rgba(20,18,12,0) 45%)" : "linear-gradient(0deg,rgba(20,18,12,.6) 0%,rgba(20,18,12,.2) 45%,rgba(20,18,12,0) 70%)";
    const inner = tx("s",d.titulo,104) + tx("si",d.titulo_i,104,"line-height:1;margin-top:10px") + tx("caps",d.bajada,32,`margin-top:34px;color:${C.crema}`);
    return P(`${fondoFoto(e,velo)}<div class="sutil" style="color:${C.calida}">${caja(a, H-b, inner, 72, zona==="abajo"?"flex-end":"flex-start")}</div>`);
  }
  if (f === "portada_botones"){
    const [top] = geom(e,H), arriba = top >= 420 && e["claro"+H];
    const inner = tx("g",d.titulo,92) + tx("r",d.titulo_2,92,"margin-top:6px") + tx("r",d.bajada,52,"margin-top:24px");
    const [colt, velo] = arriba ? [C.olivo,"transparent"] : [C.calida,"linear-gradient(180deg,rgba(20,18,12,.55) 0%,rgba(20,18,12,0) 40%)"];
    const ops = lineas(d.opciones).slice(0,3).map(o => `<div class="opc" data-t>${md(o)} <b class="ok">✓</b></div>`).join("");
    return P(`${fondoFoto(e,velo)}<div class="${arriba?"":"sutil"}" style="color:${colt}">${caja(110, H-Math.max(top-10,520), inner, 72, "flex-start")}</div><div style="position:absolute;left:60px;width:640px;bottom:80px">${ops}</div>`);
  }
  if (f === "portada_profundidad"){
    if (!e) return placaBase("portada_foto", {titulo:`${d.pre||""} ${d.palabra||""}`, titulo_i:d.pill}, H, receta, tomarFoto("portada_foto",H,null,new Set(),Math.random));
    const [top] = geom(e,H), fs = Math.min(240, Math.floor(top*.75)), base = top + fs*.12;
    return P(`${fondoFoto(e,"linear-gradient(180deg,rgba(20,18,12,.4) 0%,rgba(20,18,12,0) 35%,rgba(20,18,12,0) 75%,rgba(20,18,12,.35) 100%)")}
      <div class="g una" data-t style="position:absolute;left:0;right:0;top:${base-fs*.98}px;text-align:center;font-size:${fs}px;line-height:1;color:${C.calida};letter-spacing:-.05em;white-space:nowrap">${md(d.palabra)}</div>
      <div class="bg" data-foto="${e.archivo}" data-modo="cover" data-src="${recorteURL(e.archivo)}" style="background-image:url(${recorteURL(e.archivo)});background-position:center top"></div>
      <div class="sutil r" data-t style="position:absolute;left:40px;right:40px;top:${Math.max(30, base-fs*.98-70)}px;text-align:center;color:${C.crema};font-size:46px">${md(d.pre)}</div>
      <div style="position:absolute;left:0;right:0;bottom:${H===1440?120:260}px;text-align:center"><span class="etq" data-t>${md(d.pill)}</span></div>`);
  }
  if (f === "portada_serif"){
    const [zona,a,b] = libre(e,H);
    const inner = tx("r caps",d.pre,30,`color:${C.crema};margin-bottom:24px;text-decoration:underline;text-underline-offset:8px`) + tx("sf",d.titulo,190) + tx("si",d.titulo_i,84,"margin-top:12px");
    return P(`${fondoFoto(e,"rgba(20,18,12,.38)")}<div class="sutil" style="color:${C.calida}">${caja(a, H-b, inner, 64, zona==="abajo"?"flex-end":"flex-start","stretch","center")}</div>`);
  }
  if (f === "texto"){
    const inner = tx("s",d.titulo,116,`color:${col}`) + tx("si",d.titulo_i,116,`color:${osc?C.terra:col};margin-top:6px`) + tx("cuerpo",d.cuerpo,44,"margin-top:60px;max-width:860px");
    return `<div class="p" style="height:${H}px;background:${fondo};color:${osc?C.crema_m:C.negro}">${caja(120,160,inner,96)}${pie(osc)}</div>`;
  }
  if (f === "numerada"){
    const items = pares(d.items).map(([a,b],i) => `<div class="linea"><div class="num" data-t>0${i+1}</div><div>${tx("s",a,60)}${tx("",b,34,"margin-top:8px;opacity:.7")}</div></div>`).join("");
    return `<div class="p" style="height:${H}px;background:${osc?C.crema:C.crema_m}">${caja(110,150, tx("s",d.titulo,92,`color:${C.olivo};margin-bottom:46px`)+items, 96)}${pie(false)}</div>`;
  }
  if (f === "notas_foto" || f === "calendario"){
    const [, cara] = geom(e,H), abajo = e.tipo === "persona" && cara[1] < H*.5, pos = abajo ? "bottom:150px" : "top:140px";
    if (f === "notas_foto"){
      const li = pares(d.lineas).map(([a,b]) => `<div data-fs="38" data-t style="font-size:38px;line-height:1.4;padding:14px 0;border-top:1px solid #eee"><b>${md(a)}</b> ${md(b||"")}</div>`).join("");
      return P(`${fondoFoto(e,"rgba(20,18,12,.15)")}<div class="tarj caja" style="position:absolute;left:70px;right:70px;${pos};max-height:${H*.55}px"><div class="bar"><span>‹ Notas</span><span>Listo</span></div><div data-fs="50" data-t style="font-weight:800;font-size:50px;color:${C.olivo};margin-bottom:4px">${md(d.titulo)}</div>${li}</div>${handle()}`);
    }
    const tarjeta = `<div class="tarj" style="position:absolute;left:70px;right:300px;${pos};padding:24px 34px"><div style="display:flex;gap:26px;align-items:center"><div data-t style="font-size:30px;color:#999">${md(d.hora)}</div><div style="border-left:6px solid ${C.terra};background:${C.crema};padding:16px 24px;flex:1"><div data-t style="font-weight:700;font-size:36px">${md(d.evento)}</div><div data-t style="font-size:28px;color:#777;margin-top:4px">${md(d.detalle)}</div></div></div></div>`;
    const inner = tx("g",d.titulo,100) + tx("r",d.sub,58,`margin-top:16px;color:${C.crema}`), zt = abajo ? 110 : H-560;
    return P(`${fondoFoto(e,"linear-gradient(180deg,rgba(20,18,12,.5) 0%,rgba(20,18,12,.1) 50%,rgba(20,18,12,.5) 100%)")}<div class="sutil" style="color:${C.calida}">${caja(zt, H-zt-360, inner, 72, "flex-start")}</div>${tarjeta}${handle()}`);
  }
  if (f === "tarjetas"){
    const ts = pares(d.tarjetas).map(([a,b],i) => `<div class="tarj" data-fs="44" data-t style="font-size:44px;margin:0 0 24px ${40*(i%2)}px"><b>${md(a)}</b> ${md(b||"")}</div>`).join("");
    const inner = tx("g",d.titulo,96,`color:${C.olivo}`) + tx("r",d.sub,52,`color:${C.olivo};margin:14px 0 46px`) + ts;
    return `<div class="p" style="height:${H}px;background:${C.crema_m}">${caja(110,150,inner,96)}${pie(false)}</div>`;
  }
  if (f === "error"){
    const inner = tx("r",d.intro,52,"opacity:.75") + `<div class="g" data-fs="124" data-t style="font-family:'Serif';font-weight:600;letter-spacing:-.015em;line-height:1.08;color:${C.cafe};font-size:124px;margin-top:30px"><span class="raya">${md(d.mal)}</span></div>` + tx("si",d.bien,124,`color:${C.olivo};margin-top:60px;line-height:1.05`) + tx("cuerpo",d.nota,40,"margin-top:46px");
    return P(`${caja(120,160,inner,96)}${pie(false)}`);
  }
  if (f === "frase"){
    const inner = tx("si",d.linea_i,116,`color:${C.olivo};line-height:1.02`) + `<div class="s" data-fs="104" data-t style="font-size:104px;margin-top:44px"><span class="pinc">${md(d.resaltado)}</span></div>`;
    return P(`${caja(120,160,inner,96,"center","stretch","center")}${pie(false)}`);
  }
  if (f === "foto_frase"){
    const [zona,a,b] = libre(e,H);
    const velo = zona === "arriba" ? "linear-gradient(180deg,rgba(20,18,12,.65) 0%,rgba(20,18,12,.15) 60%)" : "linear-gradient(0deg,rgba(20,18,12,.7) 0%,rgba(20,18,12,.15) 60%)";
    const inner = tx("r",d.pre,58,`color:${C.crema}`) + tx("si",d.frase_i,116,"line-height:1;margin-top:18px");
    return P(`${fondoFoto(e,velo)}<div class="sutil" style="color:${C.calida}">${caja(a,H-b,inner,84,zona==="abajo"?"flex-end":"flex-start","stretch","center")}</div>${handle()}`);
  }
  if (f === "tachado"){
    const inner = tx("r",d.pre,54,"opacity:.8") + `<div class="g" data-fs="146" data-t style="font-family:'Serif';font-weight:600;letter-spacing:-.015em;line-height:1.08;color:${C.cafe};font-size:146px;margin-top:30px"><span class="raya">${md(d.tachado)}</span></div>` + tx("si",d.verdad_i,118,`color:${C.olivo};margin-top:60px;line-height:1.05`);
    return P(`${caja(120,160,inner,96)}${pie(false)}`);
  }
  if (f === "oscura"){
    const inner = tx("s",d.texto,104) + tx("si",d.texto_i,104,`color:${C.terra};margin-top:40px;line-height:1.05`);
    return `<div class="p" style="height:${H}px;background:${C.bb};color:${C.crema_m}">${caja(120,160,inner,96)}${pie(true)}</div>`;
  }
  if (f === "recorte_lado"){
    const inner = tx("s",d.titulo,92,`color:${C.olivo}`) + tx("si",d.titulo_i,92,`color:${C.olivo}`) + tx("cuerpo",d.cuerpo,38,"margin-top:40px");
    return `<div class="p" style="height:${H}px;background:${C.crema_m}"><div class="bg" data-foto="${e.archivo}" data-modo="lado" data-src="${recorteURL(e.archivo)}" style="background-image:url(${recorteURL(e.archivo)});background-size:auto 88%;background-position:175% 100%"></div><div class="caja" style="left:84px;width:500px;top:120px;bottom:150px;justify-content:center">${inner}</div>${pie(false)}</div>`;
  }
  if (f === "cierre"){
    const tipo = R.cierre, cta = d.cta ? `<div style="margin-top:70px"><span class="etq" data-fs="40" data-t style="font-size:40px">${md(d.cta)}</span></div>` : "";
    if (tipo === "foto" && e){
      const inner = tx("g",d.titulo,150) + tx("si",d.titulo_i,96,"margin-top:20px") + tx("cuerpo",d.cuerpo,40,"margin-top:40px") + cta;
      return P(`${fondoFoto(e,"rgba(20,18,12,.52)")}<div class="sutil" style="color:${C.calida}">${caja(120,160,inner,80,"center","stretch","center")}</div>${handle()}`);
    }
    const t2 = tipo === "foto" ? "crema_m" : tipo; // el cierre con foto, si no tiene foto, va crema
    const bgc = {olivo:C.olivo, bb:C.bb, crema_m:C.crema_m}[t2], fg = t2 === "crema_m" ? C.olivo : C.crema_m;
    const inner = tx("s",d.titulo,124) + tx("si",d.titulo_i,124,`margin-top:4px;color:${t2==="bb"?C.calida:fg}`) + tx("cuerpo",d.cuerpo,44,"margin-top:56px;max-width:820px") + cta;
    return `<div class="p" style="height:${H}px;background:${bgc};color:${fg}">${caja(120,160,inner,96)}${pie(t2!=="crema_m")}</div>`;
  }
  return P(`<div class="caja" style="inset:0;align-items:center;justify-content:center">Forma desconocida: ${esc(f)}</div>`);
}
/* el cierre de "tarjetas" usa foto */
function necesitaFoto(f, receta){ return CON_FOTO.has(f) || (f === "cierre" && RECETAS[receta]?.cierre === "foto"); }

/* achica el texto que no entra (mínimo 60 %), igual que FIT del motor */
function fit(root){
  for (const c of root.querySelectorAll(".caja")){ let k = 0;
    while (c.scrollHeight > c.clientHeight + 2 && k < 40){ for (const e of c.querySelectorAll("[data-fs]")){ const f = parseFloat(e.style.fontSize), min = parseFloat(e.dataset.fs)*.6; if (f > min) e.style.fontSize = (f*.96) + "px"; } k++; } }
  for (const e of root.querySelectorAll(".una")){ const w = e.parentElement.clientWidth; let f = parseFloat(e.style.fontSize); while (e.scrollWidth > w && f > 40){ f *= .96; e.style.fontSize = f + "px"; } }
  let chico = false;
  for (const e of root.querySelectorAll("[data-fs]")) if (parseFloat(e.style.fontSize) <= parseFloat(e.dataset.fs)*.62) chico = true;
  for (const c of root.querySelectorAll(".caja")) if (c.scrollHeight > c.clientHeight + 4) chico = true;
  return chico;
}

window.Motor = {W, C, urlDe, colorFondo, RECETAS, FORMAS, CON_FOTO, css, placa, fit, geom, tomarFoto, necesitaFoto, md, esc, pares, lineas,
  set catalogo(v){ CAT = v; }, get catalogo(){ return CAT; },
  set assets(v){ A = Object.assign(A, v); }, get assets(){ return A; },
  set fotoURL(fn){ fotoURL = fn; }, set recorteURL(fn){ recorteURL = fn; }};
})();
