/* Carruseles dentro de la app (Flor, 25/11/2026).
   Dibuja cada pieza de Contenido con el motor del estudio «Carruseles Flor» (las 4 recetas, sus fotos, su marca)
   y deja cambiar la receta, las fotos y los textos, subir fotos nuevas y bajar los PNG.
   El carrusel vive en hoy_flor.carrusel: {receta, formato, semilla, placas:[{forma, …campos, foto?, _foto?}]}. */
(function () {
  const BASE = 'carruseles/';
  let ES = null;
  let listo = null, FONT = '', M = null, guardarFn = null, subirFn = null;
  const FILAS = {};                       // clave|fecha → fila de hoy_flor
  const llave = (f) => f.clave + '|' + f.fecha;
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rng = (seed) => { let h = 1779033703 ^ seed.length; for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } let a = h >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const alto = (c) => (c.formato === 'reel' ? 1920 : 1440);
  const visibles = (c) => (c.formato === 'reel' ? [0] : c.placas.map((_, i) => i));
  const sumarDias = (f, n) => { const d = new Date(f + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const esWebKit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome|CriOS|Android/.test(navigator.userAgent);

  function script(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('No cargó ' + src)); document.head.appendChild(s); }); }
  async function aDataURL(url) { const b = await (await fetch(url)).blob(); return await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); }); }

  function preparar(fotosExtra) {
    if (listo) return listo;
    listo = (async () => {
      await script(BASE + 'motor.js?v=4');
      await script(BASE + 'estilos.js?v=19');
      M = window.Motor; ES = window.Estilos;
      const [cat, fcss, pinc, lo, lc] = await Promise.all([
        fetch(BASE + 'catalogo.json?v=2').then((r) => r.json()), Promise.all([fetch(BASE + 'marca/fuentes.css').then((r) => r.text()), fetch(BASE + 'marca/script.css?v=1').then((r) => (r.ok ? r.text() : '')).catch(() => '')]).then((x) => x.join('\n')),
        aDataURL(BASE + 'marca/pincel-terra-c68c6c.png'), aDataURL(BASE + 'marca/logo-olivo.png'), aDataURL(BASE + 'marca/logo-crema.png')]);
      (fotosExtra || []).forEach((f) => { if (!cat.some((e) => e.archivo === f.archivo)) cat.push(extraACat(f)); });
      M.catalogo = cat; M.assets = { pinc, logoO: lo, logoC: lc };
      M.fotoURL = (f) => { const e = cat.find((x) => x.archivo === f); return e && e.url ? e.url : BASE + 'fotos/' + f; };
      M.recorteURL = (f) => BASE + 'recortes/' + f.replace(/\.jpg$/, '.webp');
      FONT = fcss;
      const st = document.createElement('style'); st.textContent = fcss + M.css() + CSS; document.head.appendChild(st);
      let stage = document.getElementById('crs-stage'); if (!stage) { stage = document.createElement('div'); stage.id = 'crs-stage'; stage.setAttribute('aria-hidden', 'true'); document.body.appendChild(stage); }
    })();
    listo.catch(() => { listo = null; });
    return listo;
  }
  // Una foto subida desde la app: sin recorte ni cara detectada; el motor la usa como foto de fondo «cover».
  const extraACat = (f) => ({ archivo: f.archivo, url: f.url, ancho: f.ancho || 1080, alto: f.alto || 1440, excluir: !!f.excluir, tipo: f.tipo || 'persona', cara: null, cabeza_arriba: 0.25, recorte: false, tiene_recorte: false, claro1440: false, claro1920: false });

  const CSS = `
.crs{margin:10px 0 4px}
.crs:empty{display:none}
.crs-tira{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 10px;scroll-snap-type:x mandatory}
.crs-mini{flex:none;border:0;background:none;padding:0;cursor:pointer;scroll-snap-align:start;text-align:center;font-size:11px;color:inherit;opacity:.85}
.crs-mini .marco{width:120px;height:160px;position:relative;overflow:hidden;border-radius:8px;box-shadow:0 4px 14px rgba(60,45,20,.16)}
.crs-mini.reel .marco{height:213px}
.crs-mini .marco>div{position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none}
.crs-rec{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 8px}
.crs-rec button{min-height:36px;padding:4px 12px;border-radius:999px;border:1.5px solid #e6dcc4;background:#fffdf8;color:#22201a;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
.crs-rec button[aria-pressed=true]{background:#4b5624;border-color:#4b5624;color:#f8f5ee}
.crs-port{border:1.5px solid #e6dcc4;border-radius:12px;padding:8px 12px;margin:4px 0 10px;background:#fffdf8;color:#22201a}
.crs-port summary{cursor:pointer;font-weight:700;font-size:14px;min-height:28px}
.crs-campo{display:flex;flex-direction:column;gap:3px;font-size:12.5px;font-weight:700;color:#6c6656;margin-top:6px}
.crs-campo input,.crs-campo textarea{font:inherit;font-size:16px;font-weight:400;color:#22201a;border:1.5px solid #e6dcc4;border-radius:10px;padding:7px 10px;background:#f8f5ee;width:100%}
.crs-sub{cursor:pointer;display:inline-flex;align-items:center}
.crs-tit{font-weight:700;font-size:14px;margin:4px 0 6px}
.let-serif .p .g{font-family:'Serif'!important;font-weight:700!important;letter-spacing:-.02em!important;line-height:1.04!important}
.let-sans .p .g,.let-sans .p .s{font-family:'Sans'!important;font-weight:800!important;letter-spacing:-.04em!important}
.let-sans .p .si{font-family:'Sans'!important;font-style:normal!important;font-weight:400!important}.crs-tit span{font-weight:400;color:#6c6656;font-size:12.5px;margin-left:6px}
.crs-estilos{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 10px}
.crs-es{flex:none;display:flex;flex-direction:column;align-items:center;gap:4px;border:2px solid transparent;border-radius:12px;background:none;padding:4px;cursor:pointer;font:inherit;color:inherit;width:84px}
.crs-es .m{display:block;width:66px;height:88px;border-radius:6px;overflow:hidden;position:relative;box-shadow:0 3px 10px rgba(60,45,20,.16)}
.crs-es .m.reel{height:117px}
.crs-es .m>div{position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none}
.crs-es .n{font-size:11.5px;line-height:1.2;text-align:center}
.crs-es.on{border-color:#4b5624;background:#4b562414}
.crs-es{width:auto;align-items:flex-start;padding:8px;background:#fffdf8;border:2px solid #eee3cf}
.crs-es .tri{display:flex;gap:3px}
.crs-es .tri .m{width:54px;height:72px;border-radius:4px}
.crs-es .tri .m.reel{width:66px;height:117px}
.crs-es .n{font-weight:700;font-size:12.5px;text-align:left}
.crs-es .d{font-size:11px;color:#6c6656;text-align:left;max-width:168px;line-height:1.25}
.crs-es.on{border-color:#4b5624;background:#eef0e2}
.crs-ctl{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:10px;font-size:13px}
.crs-ctl>span{font-weight:700;color:#6c6656;min-width:44px}
.crs-ctl .on{background:#4b5624;border-color:#4b5624;color:#f8f5ee}
.crs-col.cuad{border-radius:6px}
.crs-modal [hidden]{display:none!important}
.crs-col{width:26px;height:26px;border-radius:50%;border:2px solid #e6dcc4;cursor:pointer;padding:0}
.crs-sel{background:#fbf2d0;border-radius:12px;padding:8px;position:sticky;top:0;z-index:5;box-shadow:0 6px 16px rgba(60,45,20,.12)}
.crs-acc{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.crs-est{font-size:13px;min-height:18px;margin-top:4px;color:#81552e}
.crs-modal{position:fixed;inset:0;z-index:80;background:rgba(30,26,18,.6);display:flex;align-items:center;justify-content:center;padding:12px}
.crs-modal .cm{background:#fffdf8;color:#22201a;border-radius:18px;width:min(980px,100%);max-height:94vh;overflow:auto;padding:16px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}
.crs-modal .lienzo{position:relative;width:100%;overflow:hidden;border-radius:10px;box-shadow:0 14px 34px rgba(60,45,20,.2)}
.crs-modal .lienzo>div{position:absolute;left:0;top:0;transform-origin:0 0}
.crs-modal .lienzo [contenteditable=true]{cursor:text;outline:none;border-radius:4px}
.crs-modal .lienzo [contenteditable=true]:hover{box-shadow:0 0 0 6px rgba(198,140,108,.55)}
.crs-modal .lienzo [contenteditable=true]:focus{box-shadow:0 0 0 8px #c68c6c;background:rgba(255,253,248,.18)}
.crs-modal label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:700;color:#6c6656;margin-top:10px}
.crs-modal textarea,.crs-modal input[type=text],.crs-modal select{font:inherit;font-size:16px;font-weight:400;color:#22201a;border:1.5px solid #e6dcc4;border-radius:10px;padding:8px 10px;background:#f8f5ee;width:100%}
.crs-modal .nav{display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:8px}
.crs-fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px;margin-top:8px;max-height:220px;overflow:auto}
.crs-fotos button{aspect-ratio:3/4;border-radius:8px;overflow:hidden;border:2px solid transparent;padding:0;cursor:pointer;background:#ede5cc}
.crs-fotos button.on{border-color:#c68c6c}
.crs-fotos img{width:100%;height:100%;object-fit:cover;display:block}
#crs-stage{position:fixed;left:-40000px;top:0;width:1080px}
@media(max-width:760px){.crs-modal .cm{grid-template-columns:minmax(0,1fr)}}`;

  // ¿La lámina lleva foto? Con estilos lo decide el estilo (y la lámina puede pedir o sacar la suya).
  const lleva = (c, p, i) => (c.estilo && ES ? ES.llevaFoto(c, p, i) : M.necesitaFoto(p.forma, c.receta) || /foto_frase|recorte_lado/.test(ranura(c, p, i)));
  // Qué forma le toca a una lámina de texto en el ritmo de su receta.
  function ranura(c, p, i) {
    if (p.forma !== 'texto' || p.fijo || c.formato === 'reel') return '';
    const R = RITMO[c.receta]; if (!R) return '';
    let k = 0; for (let j = 1; j < i; j++) if ((c.placas[j] || {}).forma === 'texto') k++;
    return R[k % R.length];
  }
  // Ajuste de la letra para los estilos: mide el bloque de texto real y achica solo lo necesario (mínimo 60 %).
  // Edición por elemento (Flor, 25/11: «seleccionar algo de la slide y subirle el tamaño solo a eso, moverlo, cambiarle el color»).
  function piezasDe(root) {
    return [...root.querySelectorAll('[data-fs], *')].filter((e) => {
      if (e.closest('[data-fs]') && !e.hasAttribute('data-fs')) return false;
      if (!e.hasAttribute('data-fs') && e.children.length) return false;
      if (e.matches('img,svg,path,.bg')) return false;
      return (e.textContent || '').trim().length > 0;
    });
  }
  function aplicarEd(root, datos) {
    const ed = (datos && datos.o) || {}, xs = (datos && datos.x) || [];
    // Textos agregados por Flor: van al final de la lámina, así no cambian el orden de los demás.
    const oscuro = /rgb\((\d+), (\d+), (\d+)\)/.exec(getComputedStyle(root).backgroundColor || '');
    const claro = !oscuro || (+oscuro[1] + +oscuro[2] + +oscuro[3]) / 3 > 140;
    xs.forEach((t, k) => { const d = document.createElement('div'); d.className = 'xtra'; d.dataset.x = k; d.dataset.fs = 64; d.style.cssText = `position:absolute;left:96px;right:96px;top:${Math.round(root.offsetHeight * 0.44)}px;font-family:'Serif';font-weight:600;font-size:64px;line-height:1.1;text-align:center;color:${claro ? '#81552e' : '#f8f5ee'};z-index:40`; d.textContent = (t && t.t) || ''; root.appendChild(d); });
    const ps = piezasDe(root);
    Object.entries(ed || {}).forEach(([k, o]) => {
      const e = ps[+k]; if (!e || !o) return;
      if (o.s && o.s !== 1) { const z = parseFloat(getComputedStyle(e).fontSize) * o.s; e.style.fontSize = z + 'px'; e.querySelectorAll('[data-fs]').forEach((h) => { h.style.fontSize = parseFloat(getComputedStyle(h).fontSize) * o.s + 'px'; }); }
      if (o.x || o.y) { if (getComputedStyle(e).position === 'static') e.style.position = 'relative'; e.style.transform = `translate(${o.x || 0}px,${o.y || 0}px)`; }
      if (o.c) { e.style.color = o.c; e.querySelectorAll('*').forEach((h) => { h.style.color = o.c; }); }
      if (o.f) { e.style.background = o.f; e.style.padding = '.14em .4em'; e.style.borderRadius = '8px'; e.style.width = 'fit-content'; const ta = getComputedStyle(e).textAlign; if (ta === 'center') { e.style.marginLeft = 'auto'; e.style.marginRight = 'auto'; } else if (ta === 'right') e.style.marginLeft = 'auto'; e.style.boxDecorationBreak = 'clone'; }
      if (o.z) { let a = e; while (a.parentElement && a.parentElement !== root) a = a.parentElement; if (getComputedStyle(a).position === 'static') a.style.position = 'relative'; a.style.zIndex = 60; if (getComputedStyle(e).position === 'static') e.style.position = 'relative'; e.style.zIndex = 60; }
    });
  }
  function ajustar(root) {
    ajustarBase(root);
    const w = root && root.parentElement;
    if (w && w.dataset.ed) { try { aplicarEd(root, JSON.parse(w.dataset.ed)); } catch (e) { /* sin cambios por elemento */ } }
  }
  function ajustarBase(root) {
    if (!root) return;
    const w = root.parentElement;
    if (w && w.dataset.esc && !root.dataset.listo) {
      root.dataset.listo = 1;
      const k = +w.dataset.esc || 1;
      if (k !== 1) root.querySelectorAll('[data-fs]').forEach((e) => { e.dataset.fs = parseFloat(e.dataset.fs) * k; e.style.fontSize = parseFloat(e.style.fontSize) * k + 'px'; });
      const J = { arriba: 'flex-start', centro: 'center', abajo: 'flex-end' }[w.dataset.pos];
      if (J) root.querySelectorAll('.caja').forEach((c) => { c.style.justifyContent = J; });
    }
    const cajas = root.querySelectorAll('.caja');
    let usado = false;
    cajas.forEach((c) => {
      const ci = c.querySelector(':scope > .ci'); if (!ci) return; usado = true;
      let k = 0; while (ci.offsetHeight > c.clientHeight + 1 && k < 30) { ci.querySelectorAll('[data-fs]').forEach((e) => { const f = parseFloat(e.style.fontSize), min = parseFloat(e.dataset.fs) * 0.72; if (f > min) e.style.fontSize = f * 0.95 + 'px'; }); k++; }
    });
    if (!usado) {
      M.fit(root);
      root.querySelectorAll('.caja').forEach((c) => { const j0 = c.style.justifyContent; c.style.justifyContent = 'flex-start'; let k = 0; while (c.scrollHeight > c.clientHeight + 2 && k < 40) { c.querySelectorAll('[data-fs]').forEach((e) => { const f = parseFloat(e.style.fontSize), min = parseFloat(e.dataset.fs) * 0.45; if (f > min) e.style.fontSize = f * 0.95 + 'px'; }); k++; } c.style.justifyContent = j0; });
    }
  }
  const defs = (forma, c) => (c && c.estilo ? ES && ES.ROLES[forma] : M.FORMAS[forma]) || M.FORMAS[forma] || (ES && ES.ROLES[forma]) || { n: forma, c: [] };
  /* ---------- fotos: sin repetir en 3 semanas entre todas las piezas cargadas ---------- */
  function asignarFotos(todas, rehacerClave) {
    const cs = todas.filter((f) => f.carrusel && Array.isArray(f.carrusel.placas)).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
    const cambiadas = [];
    cs.forEach((f) => {
      const c = f.carrusel, H = alto(c), rehacer = rehacerClave === llave(f);
      const lim = sumarDias(f.fecha, -21), evitar = new Set();
      cs.forEach((o) => { if (o !== f && o.fecha >= lim && o.fecha <= sumarDias(f.fecha, 21)) o.carrusel.placas.forEach((p) => p._foto && evitar.add(p._foto)); });
      const usadas = new Set(evitar), r = rng(f.clave + (c.semilla || ''));
      let cambio = false;
      const placas = c.formato === 'reel' ? c.placas.slice(0, 1) : c.placas;
      placas.forEach((p) => { if (!rehacer && p._foto && M.catalogo.some((e) => e.archivo === p._foto && !e.excluir)) usadas.add(p._foto); });
      placas.forEach((p, idx) => {
        if (!lleva(c, p, idx)) return; // la foto elegida queda guardada por si vuelve a un estilo con foto
        const ok = p._foto && M.catalogo.some((e) => e.archivo === p._foto && !e.excluir);
        if (ok && !rehacer && (!p.foto || p.foto === 'objeto' || p.foto === 'persona' || p.foto === p._foto)) return;
        const forma = c.estilo ? (p.forma === 'portada' ? (ES.tplDe(c) === 'recorte' ? 'portada_profundidad' : 'portada_foto') : 'foto_frase') : p.forma === 'cierre' ? 'foto_frase' : ranura(c, p, idx) || p.forma, pedida = p.foto && p.foto !== 'persona' && p.foto !== 'objeto' ? p.foto : c.estilo ? p.foto || ES.pide(c, p, idx) : p.forma === 'cierre' ? p.foto || 'objeto' : p.foto;
        let e = M.tomarFoto(forma, H, pedida, usadas, r);
        if (!e && p.forma === 'portada_profundidad') { p.forma = 'portada_foto'; p.titulo = p.titulo || [p.pre, p.palabra].filter(Boolean).join(' '); p.titulo_i = p.titulo_i || p.pill || ''; e = M.tomarFoto('portada_foto', H, null, usadas, r); }
        if (e && e.archivo !== p._foto) { p._foto = e.archivo; cambio = true; }
      });
      if (cambio) cambiadas.push(f);
    });
    return cambiadas;
  }
  // Pasa una lámina a otra forma sin perder el texto (port del estudio).
  function convertir(p, destino, c) {
    if (p.forma === destino) return p;
    const orig = defs(p.forma, c).c || [], dest = defs(destino, c).c;
    const sueltos = orig.filter((c) => c[2] !== 'p' && c[2] !== 'l').map((c) => p[c[0]]).filter(Boolean);
    const listas = orig.filter((c) => c[2] === 'p' || c[2] === 'l').map((c) => p[c[0]]).filter(Boolean);
    const n = { forma: destino, foto: p.foto, _foto: p._foto, escala: p.escala, pos: p.pos, conFoto: p.conFoto };
    if (!dest.some((x) => x[2] === 'p' || x[2] === 'l')) listas.forEach((l) => sueltos.push(String(l).split('\n').map((x) => x.replace(/\s*\|\s*/g, ' ').trim()).filter(Boolean).join(' ')));
    let i = 0, j = 0;
    const usados = new Set();
    dest.forEach(([k]) => { if (p[k] && orig.some((o) => o[0] === k)) { n[k] = p[k]; usados.add(p[k]); } });
    const sueltosL = sueltos.filter((v) => !usados.has(v)), listasL = listas.filter((v) => !usados.has(v));
    dest.forEach(([k, , t]) => { if (n[k]) return; if (t === 'p' || t === 'l') n[k] = listasL[j++] || ''; else n[k] = sueltosL[i++] || ''; });
    const sobran = sueltosL.slice(i); i = sueltos.length - sobran.length;
    if (sobran.length) { const ult = dest.filter((c) => c[2] !== 'p' && c[2] !== 'l').pop(); if (ult) n[ult[0]] = [n[ult[0]], ...sobran].filter(Boolean).join(' '); }
    // Si todo el texto quedó en un solo campo, se reparte por frases (Flor, 25/11: «me aparece todo junto, apretado, sin estilo»).
    const ora = (t) => String(t || '').split(/(?<=[.!?…:])\s+/).map((x) => x.trim()).filter(Boolean);
    const NO = /^(cta|hora|bajada|opciones|evento|detalle)$/;
    const txt = dest.filter((x) => x[2] !== 'p' && x[2] !== 'l' && !NO.test(x[0])).map((x) => x[0]);
    const lis = dest.filter((x) => (x[2] === 'p' || x[2] === 'l') && x[0] !== 'opciones').map((x) => x[0]);
    const llenos = txt.filter((k) => n[k]);
    if (llenos.length === 1 && !lis.some((k) => n[k])) {
      const o = ora(n[llenos[0]]);
      if (o.length >= 2) {
        txt.forEach((k) => { n[k] = ''; });
        if (lis.length) { n[txt[0]] = o.shift(); n[lis[0]] = o.map((x) => x.replace(/\|/g, '/') + ' | ').join('\n'); }
        else { txt.forEach((k, ix) => { if (ix < txt.length - 1) n[k] = o.shift() || ''; else n[k] = o.join(' '); }); }
      }
    }
    if (destino === 'portada_profundidad' && n.palabra && n.palabra.split(/\s+/).length > 1) { const ws = n.palabra.split(/\s+/); const larga = ws.reduce((a, b) => (b.length > a.length ? b : a)); n.pre = [n.pre, n.palabra.replace(larga, '').trim()].filter(Boolean).join(' '); n.palabra = larga.toUpperCase(); }
    return n;
  }
  const PORTADAS = [['portada_foto', 'Con foto'], ['portada_serif', 'Serif grande'], ['portada_botones', 'Con opciones'], ['portada_profundidad', 'Palabra gigante']];
  const fotoDe = (p) => (p._foto ? M.catalogo.find((e) => e.archivo === p._foto) || null : null);
  // Ritmo de adentro de cada receta (Flor, 25/11: «las portadas me encantan, el diseño de adentro todavía no»):
  // las láminas de texto se muestran alternando con las formas propias de la receta, sin cambiar lo guardado.
  // Lo propio de cada portada vuelve adentro (Flor, 25/11): Tarjetas → franjas blancas; Serif → pincelada terracota;
  // Editorial → números terracota; Historia → placa café oscuro. El tachado en color sale de las láminas «tachado».
  var RITMO = { editorial: ['texto', 'foto_frase', 'numerada'], tarjetas: ['tarjetas', 'foto_frase', 'texto'], historia: ['oscura', 'foto_frase', 'recorte_lado', 'texto'], serif: ['foto_frase', 'frase', 'texto'] };
  function vistaTexto(c, i, p) {
    const R = RITMO[c.receta]; if (!R) return null;
    const f = ranura(c, p, i), fo = fotoDe(p), it = [p.titulo_i, p.cuerpo].filter(Boolean).join(' ');
    const pal = [p.titulo, it].filter(Boolean).join(' ').split(/\s+/).length;
    if (f === 'foto_frase' && fo && pal <= 26) return { forma: f, d: { ...p, pre: '', frase_i: [p.titulo, it].filter(Boolean).join(' ') } };
    if (f === 'recorte_lado' && fo && fo.tiene_recorte && pal <= 24) return { forma: f, d: p };
    if (f === 'oscura') return { forma: f, d: { ...p, texto: p.titulo || '', texto_i: it } };
    if (f === 'frase' && pal <= 18) { const w = it.trim().split(/\s+/).filter(Boolean); if (w.length >= 2) { const ult = w.pop().replace(/[.,;:!?…]+$/, ''); return { forma: f, d: { ...p, linea_i: [p.titulo, w.join(' ')].filter(Boolean).join(' '), resaltado: ult } }; } }
    if (f === 'tarjetas' || f === 'numerada') {
      const o = it.split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter(Boolean);
      if (o.length >= 2 && o.length <= 4) {
        const pares = o.map((x) => x.replace(/\|/g, '/') + ' | ').join('\n');
        return f === 'tarjetas' ? { forma: f, d: { ...p, sub: '', tarjetas: pares } } : { forma: f, d: { ...p, items: pares } };
      }
    }
    return null;
  }
  function htmlPlaca(c, i, escala) {
    const H = alto(c), p = c.placas[i]; if (!p) return '';
    const ed = esc(JSON.stringify({ o: p.ed || {}, x: p.extra || [] }));
    if (c.estilo && ES) { const fo = lleva(c, p, i) ? fotoDe(p) : null; return `<div data-ed="${ed}" style="transform:scale(${escala});width:${M.W}px;height:${H}px;transform-origin:0 0">${ES.placa(c, i, H, fo, fo ? M.urlDe(fo) : '', M.assets)}</div>`; }
    let forma = c.formato === 'reel' && i === 0 && !p.forma.startsWith('portada_') ? M.RECETAS[c.receta].portadas[0] : p.forma, d = p;
    let fRec = null;
    if ((forma === 'recorte_lado' || forma === 'portada_profundidad') && !(fotoDe(p) || {}).tiene_recorte) { const rs = M.catalogo.filter((e) => e.tiene_recorte && !e.excluir); if (rs.length) fRec = rs[i % rs.length]; }
    if (forma === 'texto' && c.formato !== 'reel' && !p.fijo) { const v = vistaTexto(c, i, p); if (v) { forma = v.forma; d = v.d; } }
    return `<div class="let-${c.letra === 'sans' ? 'sans' : 'serif'}${i === 0 ? '-portada' : ''}" data-ed="${ed}" data-esc="${+p.escala || 1}" data-pos="${p.pos || ''}" style="transform:scale(${escala});width:${M.W}px;height:${H}px;transform-origin:0 0">${M.placa(forma, d, H, c.receta, fRec || fotoDe(p), p.fondo_img ? M.catalogo.find((e) => e.archivo === p.fondo_img) || null : null)}</div>`;
  }

  /* ---------- la tarjeta dentro de cada pieza ---------- */
  // Miniatura de la portada en el calendario (data-crs-mini="clave|fecha").
  function pintarMinis(clave) {
    $$(clave ? `[data-crs-mini="${clave.replace(/"/g, '\\"')}"]` : '[data-crs-mini]').forEach((el) => {
      const f = FILAS[el.dataset.crsMini]; if (!f || !f.carrusel || !f.carrusel.placas || !f.carrusel.placas.length) return;
      const w = el.clientWidth || 48; el.innerHTML = htmlPlaca(f.carrusel, 0, w / M.W); const n = el.querySelector('.p'); if (n) ajustar(n);
    });
  }
  // Diseños (Flor, 25/11): las 4 recetas del estudio + 6 combos de portada y estilo.
  const COMBOS = [['servicios', 'A', 'Tu foto + Editorial'], ['duo', 'color', 'Bloque de color + Dúo'], ['minimal', 'crema', 'Crema con pregunta + Minimal'], ['revista', 'etiquetas', 'Foto con etiquetas + Revista'], ['lateral', 'recorte', 'Tu recorte + Foto al costado'], ['notas', 'marco', 'Foto enmarcada + Notas']];
  const PARA_C = { 'servicios|A': 'Para casos reales: tu cara frena el scroll', 'duo|color': 'Para frases fuertes y opinión', 'minimal|crema': 'Para errores comunes y creencias', 'revista|etiquetas': 'Para opinión en primera persona', 'lateral|recorte': 'Para promesas y pruebas', 'notas|marco': 'Para reflexiones y hábitos' };
  function aCombo(c, v) { const [e, t] = v.split('|');
    if (!c.estilo) {
      c.placas = c.placas.map((p) => (p.forma === 'frase' && p.frase === undefined ? { ...p, pre: '', frase: [p.linea_i, p.resaltado].filter(Boolean).join(' ') } : p));
      const p0 = c.placas[0]; if (p0 && /^portada_/.test(p0.forma)) { const h = hookDe(p0); c.placas[0] = { forma: 'portada', foto: p0.foto, _foto: p0._foto, pre: h.pre, titulo: h.t, titulo_i: h.ti }; }
    } c.estilo = e; ES.aEstilos(c); if (c.placas[0]) c.placas[0].tpl = t; return c; }
  // Vuelve un carrusel de estilos a las formas del motor (recetas).
  const SACAR = ['tpl', 'escala', 'pos', 'conFoto', 'sello', 'variante'];
  // El hook de cualquier portada, para pasarlo a la portada propia de cada receta (Flor, 25/11: «cada diseño se ve distinto»).
  const jn = (...x) => x.filter(Boolean).join(' ');
  const firma = (p) => ['pre', 'titulo', 'titulo_i', 'titulo_2', 'palabra', 'pill', 'opciones'].map((k) => p[k] || '').join('¦');
  function hookDe(p) {
    if (p._hook && p._firma === firma(p)) return p._hook; // el hook original, si no se editó la portada
    switch (p.forma) {
      case 'portada_foto': return { pre: '', t: p.titulo || '', ti: p.titulo_i || '' };
      case 'portada_botones': return { pre: '', t: p.titulo || '', ti: p.titulo_2 || '' };
      case 'portada_profundidad': return { pre: '', t: p.pre || '', ti: jn(p.palabra && p.palabra.charAt(0) + p.palabra.slice(1).toLowerCase(), p.pill) };
      default: return { pre: p.pre || '', t: p.titulo || '', ti: p.titulo_i || '' };
    }
  }
  function portadaPara(forma, p) {
    if (p.forma === forma) return p;
    const h = hookDe(p), n = portadaArmada(forma, p, h, { foto: p.foto, _foto: p._foto, forma });
    n._hook = h; n._firma = firma(n); return n;
  }
  function portadaArmada(forma, p, h, b) {
    if (forma === 'portada_botones') return { ...b, titulo: jn(h.pre, h.t), titulo_2: '', bajada: '', opciones: p.opciones || h.ti };
    if (forma === 'portada_profundidad') { const w = (h.ti || h.t).trim().split(/\s+/), ult = (w.pop() || '').replace(/[.,;:!?…]+$/, ''); return { ...b, pre: jn(h.pre, h.ti ? h.t : '', w.join(' ')), palabra: ult.toUpperCase(), pill: '' }; }
    if (forma === 'portada_serif') { const w = jn(h.t, h.ti).trim().split(/\s+/), n = w.length > 3 ? 2 : 1, g = w.splice(-n).join(' ').replace(/[.,;:!?…]+$/, ''); return { ...b, pre: w.join(' '), titulo: g.charAt(0).toUpperCase() + g.slice(1), titulo_i: '' }; }
    return { ...b, forma: 'portada_foto', titulo: jn(h.pre, h.t), titulo_i: h.ti, bajada: p.bajada || '' };
  }
  function aMotor(c, receta) {
    c.receta = receta; const R = M.RECETAS[receta];
    if (!c.estilo) { if (c.placas[0]) c.placas[0] = portadaPara(R.portadas[0], c.placas[0]); return c; }
    c.estilo = undefined;
    c.placas = c.placas.map((p) => {
      const b = { foto: p.foto, _foto: p._foto };
      if (p.forma === 'portada') return portadaPara(R.portadas[0], p);
      if (p.forma === 'lista') return { ...b, forma: 'numerada', titulo: p.titulo || '', items: p.items || '' };
      if (p.forma === 'frase') return { ...b, forma: 'texto', titulo: p.pre || '', titulo_i: p.frase || '' };
      const n = {}; Object.keys(p).forEach((k) => { if (!SACAR.includes(k)) n[k] = p[k]; }); return n;
    });
    return c;
  }
  // Edición directa sobre la lámina: cada texto visible se vincula con el campo de donde salió.
  const plano = (t) => String(t ?? '').replace(/\*\*?|__?/g, '').replace(/\s*\|\s*/g, ' ').replace(/\s+/g, ' ').trim();
  function editable(lz, p, campos, alCambiar) {
    const cand = [...lz.querySelectorAll('.p [data-fs], .p *')].filter((e) => {
      if (e.closest('[data-fs]') && !e.hasAttribute('data-fs')) return false; // dentro de un bloque con letra: se edita el bloque
      if (!e.hasAttribute('data-fs') && e.children.length) return false;
      return plano(e.textContent).length > 0;
    });
    cand.forEach((e) => {
      const orig = plano(e.textContent);
      let k = campos.find((c) => plano(p[c]) === orig), linea = -1;
      if (!k) for (const c of campos) { const L = String(p[c] || '').split('\n'); const j = L.findIndex((x) => plano(x) === orig || plano(x).includes(orig)); if (j >= 0) { k = c; linea = j; break; } }
      if (!k) { for (const c of campos) if (orig.length > 3 && plano(p[c]).includes(orig)) { k = c; break; } }
      if (!k) return;
      e.contentEditable = 'true'; e.spellcheck = true; e.title = 'Tocá para editar';
      e.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') e.blur(); });
      e.addEventListener('blur', () => {
        const nuevo = e.innerText.replace(/\s+\n/g, '\n').trim(); if (plano(nuevo) === orig) return;
        const v = String(p[k] || '');
        if (linea >= 0) {
          const L = v.split('\n'), x = L[linea];
          if (plano(x) === orig) L[linea] = x.includes('|') && !nuevo.includes('|') ? nuevo.replace(/^(\S+)\s/, '$1 | ') : nuevo;
          else L[linea] = x.includes(orig) ? x.replace(orig, nuevo) : x.replace(new RegExp(orig.split(' ').map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s*_|]+')), nuevo);
          p[k] = L.join('\n');
        } else if (plano(v) === orig || !v.includes(orig)) p[k] = nuevo;
        else p[k] = v.replace(orig, nuevo);
        alCambiar(k);
      });
    });
  }
  function pintarUno(el) {
    const f = FILAS[el.dataset.crs]; if (!f || !f.carrusel) return;
    const c = f.carrusel; if (!c.estilo && !M.RECETAS[c.receta]) c.receta = 'editorial';
    const reel = c.formato === 'reel', p0 = c.placas[0] || {};
    const VAR = Object.entries(ES.PORTADAS).map(([k, n]) => [k, k + ' · ' + n]);
    const nI = reel ? 1 : Math.min(3, c.placas.length);
    const prev = (k) => `<span class="tri">${[...Array(nI).keys()].map((i) => `<span class="m${reel ? ' reel' : ''}" data-prev="${k}" data-pi="${i}"></span>`).join('')}</span>`;
    const onC = (e, t) => c.estilo === e && ES.tplDe(c) === t;
    el.innerHTML = `<p class="crs-tit">Diseño del posteo <span>se aplica a todas las láminas</span></p><div class="crs-estilos" role="group" aria-label="Diseño">${Object.entries(M.RECETAS).map(([k, R]) => `<button type="button" class="crs-es${!c.estilo && k === c.receta ? ' on' : ''}" data-rec="${k}" title="${esc(R.desc)}">${prev('r:' + k)}<span class="n">${esc(R.n)}</span><span class="d">Para ${esc(R.para)}</span></button>`).join('')}${COMBOS.map(([e, t, n]) => `<button type="button" class="crs-es${onC(e, t) ? ' on' : ''}" data-combo="${e}|${t}">${prev('c:' + e + '|' + t)}<span class="n">${esc(n)}</span><span class="d">${esc(PARA_C[e + '|' + t] || '')}</span></button>`).join('')}</div>
${c.estilo ? '' : `<div class="crs-ctl" style="margin:0 0 8px"><span>Letra de los títulos</span><button type="button" class="btn ghost sm${c.letra === 'sans' ? '' : ' on'}" data-letra="serif" style="font-family:'Source Serif 4',Georgia,serif">Tu serif</button><button type="button" class="btn ghost sm${c.letra === 'sans' ? ' on' : ''}" data-letra="sans" style="font-family:'Open Sans',sans-serif">Open Sans</button></div>`}
<details class="crs-port"${c._abrirPortada ? ' open' : ''}><summary>Portada: el hook, la serie y el tipo de portada</summary>
  <div class="crs-rec" role="group" aria-label="Foto de la portada">${c.estilo ? VAR.map(([k, n]) => `<button type="button" data-tpl="${k}" aria-pressed="${ES.tplDe(c) === k}">${n}</button>`).join('') : PORTADAS.map(([k, n]) => `<button type="button" data-port="${k}" aria-pressed="${p0.forma === k}">${n}</button>`).join('')}</div>
  ${(defs(p0.forma, c).c || []).map(([k, et, t]) => `<label class="crs-campo">${esc(et)}${t === 't' ? `<input type="text" data-pk="${k}" value="${esc(c.placas[0][k] || '')}">` : `<textarea rows="2" data-pk="${k}">${esc(c.placas[0][k] || '')}</textarea>`}</label>`).join('')}
</details>
<div class="crs-tira">${visibles(c).map((i) => `<button type="button" class="crs-mini${reel ? ' reel' : ''}" data-i="${i}" aria-label="Editar lámina ${i + 1}"><div class="marco">${htmlPlaca(c, i, 120 / M.W)}</div>${i + 1}</button>`).join('')}</div>
<div class="crs-acc"><button type="button" class="btn sm" data-crs-ed="0">✏️ Editar cada lámina</button>${subirFn ? `<label class="btn ghost sm crs-sub">📷 Subir fotos mías<input type="file" accept="image/*" multiple data-crs-subir="persona" hidden></label><label class="btn ghost sm crs-sub">☕ Subir fotos de lugares y cosas<input type="file" accept="image/*" multiple data-crs-subir="objeto" hidden></label>` : ''}<button type="button" class="btn ghost sm" data-crs-fotos>Otras fotos</button><button type="button" class="btn ghost sm" data-crs-png>Bajar PNG</button></div>
<p class="small muted" style="margin:6px 0 0">Tocá una lámina para cambiarle el texto, el tamaño de la letra, dónde va, el tipo de lámina o la foto.</p>
<div class="crs-est" aria-live="polite"></div>`;
    $$('.crs-mini .marco .p', el).forEach((p) => ajustar(p));
    // Cada miniatura con una foto distinta, para distinguir bien los 10 diseños (Flor, 25/11).
    const pers = M.catalogo.filter((e) => e.tipo === 'persona' && !e.excluir), recs = pers.filter((e) => e.tiene_recorte), sinRec = pers.filter((e) => !e.tiene_recorte); const usadasPrev = new Set();
    $$('.crs-estilos .crs-es', el).forEach((bt, ix) => { const ms = $$('[data-prev]', bt); if (!ms.length) return; const [tipo, v] = ms[0].dataset.prev.split(':'), cp = JSON.parse(JSON.stringify(c)); if (tipo === 'r') aMotor(cp, v); else aCombo(cp, v);
      const lista = /recorte/.test(v) || v === 'historia' ? recs : sinRec.length >= 10 ? sinRec : pers; let fo = null; for (let t = 0; t < lista.length && !fo; t++) { const e = lista[(ix * 3 + t) % lista.length]; if (!usadasPrev.has(e.archivo)) fo = e; } if (fo) usadasPrev.add(fo.archivo); if (fo && cp.placas[0]) { cp.placas[0]._foto = fo.archivo; cp.placas[0].foto = fo.archivo; }
      ms.forEach((m) => { m.innerHTML = htmlPlaca(cp, +m.dataset.pi, (m.clientWidth || 54) / M.W); const n = m.querySelector('.p'); if (n) ajustar(n); }); });
    pintarMinis(llave(f));
    const est = (t) => { el.querySelector('.crs-est').textContent = t || ''; };
    $$('[data-rec]', el).forEach((b) => (b.onclick = async () => { aMotor(c, b.dataset.rec); asignarFotos(Object.values(FILAS), llave(f)); pintarUno(el); await guardar(f, est); }));
    $$('[data-letra]', el).forEach((b) => (b.onclick = async () => { c.letra = b.dataset.letra; pintarUno(el); await guardar(f, est); }));
    $$('[data-combo]', el).forEach((b) => (b.onclick = async () => { aCombo(c, b.dataset.combo); asignarFotos(Object.values(FILAS)); pintarUno(el); await guardar(f, est); }));
    $$('[data-tpl]', el).forEach((b) => (b.onclick = async () => { c.placas[0].tpl = b.dataset.tpl; c._abrirPortada = true; asignarFotos(Object.values(FILAS)); pintarUno(el); await guardar(f, est); }));
    $$('[data-port]', el).forEach((b) => (b.onclick = async () => { c.placas[0] = convertir(c.placas[0], b.dataset.port, c); c._abrirPortada = true; asignarFotos(Object.values(FILAS)); pintarUno(el); await guardar(f, est); }));
    let tp = null;
    $$('[data-pk]', el).forEach((inp) => (inp.oninput = () => {
      c.placas[0][inp.dataset.pk] = inp.value; pintarMinis(llave(f));
      const m0 = el.querySelector('.crs-mini[data-i="0"] .marco'); if (m0) { m0.innerHTML = htmlPlaca(c, 0, 120 / M.W); const n = m0.querySelector('.p'); if (n) ajustar(n); }
      clearTimeout(tp); tp = setTimeout(() => guardar(f, est), 900);
    }));
    const dp = el.querySelector('.crs-port'); if (dp) dp.ontoggle = () => { c._abrirPortada = dp.open; };
    el.querySelector('[data-crs-fotos]').onclick = async () => { c.semilla = (+c.semilla || 0) + 1; asignarFotos(Object.values(FILAS), llave(f)); pintarUno(el); await guardar(f, est); };
    $$('.crs-mini,[data-crs-ed]', el).forEach((b) => (b.onclick = () => editor(f, +(b.dataset.i || b.dataset.crsEd || 0), () => pintarUno(el))));
    $$('[data-crs-subir]', el).forEach((sub) => (sub.onchange = async () => {
      const tipo = sub.dataset.crsSubir || 'persona';
      const files = [...sub.files]; if (!files.length) return;
      const nuevas = [];
      try {
        for (const [n, file] of files.entries()) { est(`Subiendo ${n + 1} de ${files.length}…`); const rd = await reducir(file); const meta = await subirFn(rd.blob, file.name, rd.ancho, rd.alto, tipo); M.catalogo.push(extraACat(meta)); nuevas.push(meta.archivo); }
        // La primera va a la portada (si la portada lleva foto); el resto queda en tu biblioteca para elegirlas lámina por lámina.
        const p0 = c.placas[0]; if (tipo === 'persona' && p0 && lleva(c, p0, 0) && nuevas[0]) { p0._foto = nuevas[0]; p0.foto = nuevas[0]; }
        pintarUno(el); await guardar(f, (t) => { const e2 = el.querySelector('.crs-est'); if (e2) e2.textContent = t || ''; });
        const e3 = el.querySelector('.crs-est'); if (e3) e3.textContent = `Listo: ${nuevas.length === 1 ? 'la foto quedó' : nuevas.length + ' fotos quedaron'} en tu biblioteca${p0 && lleva(c, p0, 0) ? ' (la primera, en la portada)' : ''}. Elegilas en «Editar cada lámina».`;
      } catch (e) { est('No se pudo subir: ' + e.message); }
    }));
    el.querySelector('[data-crs-png]').onclick = async (e) => { const b = e.currentTarget; b.disabled = true; try { await bajarZip(f, est); } catch (er) { est('No pude armar los PNG: ' + er.message); } b.disabled = false; };
  }
  async function guardar(f, est) {
    if (!guardarFn) return;
    try { est && est('Guardando…'); const { _abrirPortada, ...limpio } = f.carrusel; await guardarFn(f.fecha, f.clave, limpio); est && est('Guardado'); setTimeout(() => est && est(''), 1600); }
    catch (e) { est && est('No se guardó: ' + e.message); }
  }

  /* ---------- editor: una lámina grande + sus textos + elegir o subir foto ---------- */
  function editor(f, i, alCerrar) {
    const c = f.carrusel, vis = visibles(c);
    let sel = null; // { i, idx } el texto tocado en la lámina
    const m = document.createElement('div'); m.className = 'crs-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    document.body.appendChild(m);
    const cerrar = () => { m.remove(); document.removeEventListener('keydown', tecla); alCerrar && alCerrar(); };
    const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', tecla);
    m.onclick = (e) => { if (e.target === m) cerrar(); };
    let timer = null;
    const pintar = () => {
      const p = c.placas[i], F = defs(p.forma, c), conFoto = lleva(c, p, i), E = c.estilo ? ES.ESTILOS[c.estilo] : null;
      const RR = M.RECETAS[c.receta] || M.RECETAS.editorial;
      const formas = c.estilo ? Object.keys(ES.ROLES) : i === 0 ? Object.keys(M.FORMAS).filter((k) => k.startsWith('portada_')) : [...new Set(['texto', ...RR.formas.filter((k) => !k.startsWith('portada_')), 'tachado', 'cierre'])].filter((k) => M.FORMAS[k] && k !== 'calendario');
      const pct = Math.round((+p.escala || 1) * 100), posA = p.pos || '';
      const fotos = M.catalogo.filter((e) => e.tipo !== 'fondo' && !e.excluir && (!['recorte_lado', 'portada_profundidad'].includes(p.forma) || e.tiene_recorte));
      m.innerHTML = `<div class="cm"><div><div class="lienzo" style="aspect-ratio:1080/${alto(c)}"></div>
  <div class="nav"><button type="button" class="btn ghost sm" data-ant ${i <= 0 ? 'disabled' : ''}>← Anterior</button><span class="small">Lámina ${i + 1} de ${vis.length} · tocá el texto para editarlo</span><button type="button" class="btn ghost sm" data-sig ${i >= vis.length - 1 ? 'disabled' : ''}>Siguiente →</button></div></div>
<div><div class="row between"><h3 style="margin:0">${esc(F.n)}</h3><button type="button" class="btn ghost sm" data-cerrar>Listo</button></div>
  <button type="button" class="btn sm" data-xadd style="margin-bottom:8px">＋ Agregar texto</button>
  <div class="crs-ctl crs-sel"${sel && sel.i === i ? '' : ' hidden'}><span>Solo lo que tocaste <b class="crs-selpct">${sel && sel.i === i && p.ed && p.ed[sel.idx] && p.ed[sel.idx].s ? Math.round(p.ed[sel.idx].s * 100) : 100}%</b></span><button type="button" class="btn ghost sm" data-ted="s-" aria-label="Más chico">A−</button><button type="button" class="btn ghost sm" data-ted="s+" aria-label="Más grande">A+</button><button type="button" class="btn ghost sm" data-ted="u" aria-label="Subir">↑</button><button type="button" class="btn ghost sm" data-ted="d" aria-label="Bajar">↓</button><button type="button" class="btn ghost sm" data-ted="l" aria-label="A la izquierda">←</button><button type="button" class="btn ghost sm" data-ted="r" aria-label="A la derecha">→</button>${[['#4b5624', 'Olivo'], ['#81552e', 'Café'], ['#3f1e0d', 'Café oscuro'], ['#c68c6c', 'Terracota'], ['#f8f5ee', 'Crema'], ['#1f1c17', 'Negro']].map(([h, n]) => `<button type="button" class="crs-col" data-ted="c:${h}" title="${n}" aria-label="Letra ${n}" style="background:${h}"></button>`).join('')}<span style="margin-left:4px">Fondo</span>${[['#f8f5ee', 'Crema'], ['#fbf2d0', 'Cálida'], ['#ede5cc', 'Crema media'], ['#c68c6c', 'Terracota'], ['#81552e', 'Café'], ['#4b5624', 'Olivo']].map(([h, n]) => `<button type="button" class="crs-col cuad" data-ted="f:${h}" title="Fondo ${n}" aria-label="Fondo ${n}" style="background:${h}"></button>`).join('')}<button type="button" class="btn ghost sm" data-ted="f:">Sin fondo</button><button type="button" class="btn ghost sm" data-ted="zf">Adelante de la foto</button><button type="button" class="btn ghost sm" data-ted="zb">Atrás de la foto</button><button type="button" class="btn ghost sm" data-ted="x">Como estaba</button></div>
  <p class="small muted" style="margin:4px 0 0">Tocá un texto para escribir; arrastralo para moverlo a donde quieras; con la barra, agrandalo o cambiale el color.</p>
  <label>Tipo de lámina<select data-forma>${formas.map((k) => `<option value="${k}"${k === p.forma ? ' selected' : ''}>${esc(defs(k, c).n)}</option>`).join('')}</select></label>
  <div class="crs-ctl crs-toda"${sel && sel.i === i ? ' hidden' : ''}><span>Toda la lámina</span><button type="button" class="btn ghost sm" data-esc="-0.1" aria-label="Toda la letra más chica">A−</button><b>${pct}%</b><button type="button" class="btn ghost sm" data-esc="0.1" aria-label="Toda la letra más grande">A+</button></div>
  
  ${E ? (p.forma === 'portada' ? `<div class="crs-ctl"><span>Portada</span>${Object.entries(ES.PORTADAS).map(([k, n]) => `<button type="button" class="btn ghost sm${ES.tplDe(c) === k ? ' on' : ''}" data-tpl="${k}" title="${esc(n)}">${k} · ${esc(n)}</button>`).join('')}</div>` : `<div class="crs-ctl"><span>Foto</span><button type="button" class="btn ghost sm${conFoto ? ' on' : ''}" data-confoto="1">Con foto</button><button type="button" class="btn ghost sm${conFoto ? '' : ' on'}" data-confoto="0">Sin foto</button></div>`) : ''}
  ${F.c.map(([k, et, t]) => `<label>${esc(et)}${t === 't' ? `<input type="text" data-k="${k}" value="${esc(p[k] || '')}">` : `<textarea rows="${t === 'p' || t === 'l' ? 4 : 2}" data-k="${k}">${esc(p[k] || '')}</textarea>`}</label>`).join('')}
  <p class="small muted" style="margin:6px 0 0">*itálica* · **negrita** · en listas, una línea por renglón y «negrita | resto».</p>
  ${E ? (conFoto ? `<label>Foto de esta lámina</label>` : '') : conFoto ? `<label>Foto de esta lámina</label>` : `<label>Foto de fondo (opcional: va detrás del texto, con un velo de color)</label><div class="row" style="gap:6px;margin-top:4px"><button type="button" class="btn ghost sm" data-fondo="">${p.fondo_img ? 'Sacar la foto de fondo' : 'Sin foto de fondo ✓'}</button></div>`}
  ${E && !conFoto ? '' : `<div class="crs-fotos">${(conFoto ? fotos : M.catalogo.filter((e) => !e.excluir)).map((e) => `<button type="button" ${conFoto ? 'data-foto' : 'data-fondo'}="${esc(e.archivo)}" class="${e.archivo === (conFoto ? p._foto : p.fondo_img) ? 'on' : ''}" aria-label="${esc(e.titulo || e.archivo)}"><img loading="lazy" src="${esc(e.url || (e.ruta ? e.ruta : 'carruseles/fotos/' + e.archivo))}" alt=""></button>`).join('')}</div>`}
  ${subirFn ? `<label>Subir una foto mía<input type="file" accept="image/*" data-subir="persona"></label><label>Subir una foto de un lugar o una cosa<input type="file" accept="image/*" data-subir="objeto"></label>` : ''}
  <div class="crs-est" aria-live="polite"></div></div></div>`;
      const lz = m.querySelector('.lienzo');
      const dibujar = () => {
        lz.innerHTML = htmlPlaca(c, i, lz.clientWidth / M.W); const n = lz.querySelector('.p'); if (n) ajustar(n);
        editable(lz, p, F.c.map((x) => x[0]), (k) => { const t = m.querySelector(`[data-k="${k}"]`); if (t) t.value = p[k]; dibujar(); clearTimeout(timer); timer = setTimeout(() => guardar(f, est), 300); });
        if (n) n.querySelectorAll('.bg').forEach((b) => { b.style.pointerEvents = 'none'; });
        if (n) n.querySelectorAll('.xtra').forEach((x) => {
          x.contentEditable = 'true'; x.spellcheck = true;
          x.addEventListener('blur', () => { const k = +x.dataset.x, v = x.innerText.trim(); if (!p.extra || !p.extra[k] || v === p.extra[k].t) return; p.extra[k].t = v; dibujar(); clearTimeout(timer); timer = setTimeout(() => guardar(f, est), 300); });
        });
        if (n) piezasDe(n).forEach((e, idx) => {
          if (sel && sel.i === i && sel.idx === idx) e.style.outline = '8px dashed #c68c6c';
          e.style.cursor = 'pointer';
          // Tocar = seleccionar (y escribir); arrastrar = moverlo a donde quieras.
          e.addEventListener('pointerdown', (ev) => {
            sel = { i, idx }; piezasDe(n).forEach((x) => { x.style.outline = ''; }); e.style.outline = '8px dashed #c68c6c'; const bar = m.querySelector('.crs-sel'); if (bar) bar.hidden = false; const toda = m.querySelector('.crs-toda'); if (toda) toda.hidden = true;
            const sp = m.querySelector('.crs-selpct'); if (sp) sp.textContent = Math.round((((p.ed || {})[idx] || {}).s || 1) * 100) + '%';
            const k = lz.clientWidth / M.W, o0 = (p.ed && p.ed[idx]) || {}, x0 = o0.x || 0, y0 = o0.y || 0, sx = ev.clientX, sy = ev.clientY; let mov = false;
            if (getComputedStyle(e).position === 'static') e.style.position = 'relative';
            const mv = (v) => { const dx = (v.clientX - sx) / k, dy = (v.clientY - sy) / k; if (!mov && Math.hypot(v.clientX - sx, v.clientY - sy) < 6) return; if (!mov) { mov = true; e.blur(); const sl = window.getSelection(); if (sl) sl.removeAllRanges(); } v.preventDefault(); e.style.transform = `translate(${x0 + dx}px,${y0 + dy}px)`; };
            const up = (v) => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); if (!mov) return; p.ed = p.ed || {}; const o = (p.ed[idx] = p.ed[idx] || {}); o.x = Math.round(x0 + (v.clientX - sx) / k); o.y = Math.round(y0 + (v.clientY - sy) / k); dibujar(); clearTimeout(timer); timer = setTimeout(() => guardar(f, est), 400); };
            document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
          });
          e.style.touchAction = 'none';
        });
        // Tocar fuera de los textos: se suelta la selección y vuelve «Toda la lámina».
        lz.onpointerdown = (ev) => { if (!n || (ev.target !== n && !ev.target.classList.contains('bg') && ev.target !== lz)) return; sel = null; piezasDe(n).forEach((x) => { x.style.outline = ''; }); const bar = m.querySelector('.crs-sel'); if (bar) bar.hidden = true; const toda = m.querySelector('.crs-toda'); if (toda) toda.hidden = false; };
      };
      const xadd = m.querySelector('[data-xadd]');
      if (xadd) xadd.onclick = () => {
        p.extra = p.extra || []; p.extra.push({ t: 'Tu texto' }); dibujar();
        const n2 = lz.querySelector('.p'); if (n2) { const ps = piezasDe(n2); sel = { i, idx: ps.length - 1 }; dibujar(); const bar = m.querySelector('.crs-sel'); if (bar) bar.hidden = false; }
        clearTimeout(timer); timer = setTimeout(() => guardar(f, est), 400);
      };
      $$('[data-ted]', m).forEach((b) => (b.onmousedown = (ev) => ev.preventDefault()));
      $$('[data-ted]', m).forEach((b) => (b.onclick = () => {
        if (!sel || sel.i !== i) return;
        const a = b.dataset.ted; p.ed = p.ed || {}; const o = (p.ed[sel.idx] = p.ed[sel.idx] || {});
        if (a === 's+') o.s = Math.round(Math.min(3, (o.s || 1) * 1.1) * 100) / 100;
        else if (a === 's-') o.s = Math.round(Math.max(0.3, (o.s || 1) / 1.1) * 100) / 100;
        else if (a === 'u') o.y = (o.y || 0) - 24; else if (a === 'd') o.y = (o.y || 0) + 24;
        else if (a === 'l') o.x = (o.x || 0) - 24; else if (a === 'r') o.x = (o.x || 0) + 24;
        else if (a.startsWith('c:')) o.c = a.slice(2);
        else if (a.startsWith('f:')) { if (a.length > 2) o.f = a.slice(2); else delete o.f; }
        else if (a === 'zf') o.z = 1; else if (a === 'zb') delete o.z;
        else if (a === 'x') {
          delete p.ed[sel.idx];
          const n3 = lz.querySelector('.p'), el3 = n3 && piezasDe(n3)[sel.idx];
          if (el3 && el3.classList.contains('xtra') && p.extra) { p.extra.splice(+el3.dataset.x, 1); sel = null; const bar = m.querySelector('.crs-sel'); if (bar) bar.hidden = true; }
        }
        const sp = m.querySelector('.crs-selpct'); if (sp) sp.textContent = Math.round((((p.ed || {})[sel ? sel.idx : -1] || {}).s || 1) * 100) + '%';
        dibujar(); clearTimeout(timer); timer = setTimeout(() => guardar(f, est), 400);
      }));
      requestAnimationFrame(dibujar);
      const est = (t) => { m.querySelector('.crs-est').textContent = t || ''; };
      m.querySelector('[data-cerrar]').onclick = cerrar;
      const ant = m.querySelector('[data-ant]'), sig = m.querySelector('[data-sig]');
      ant.onclick = () => { i--; pintar(); }; sig.onclick = () => { i++; pintar(); };
      m.querySelector('[data-forma]').onchange = (e) => { c.placas[i] = convertir(p, e.target.value, c); asignarFotos(Object.values(FILAS)); pintar(); guardar(f, est); };
      $$('[data-k]', m).forEach((inp) => (inp.oninput = () => { p[inp.dataset.k] = inp.value; dibujar(); clearTimeout(timer); timer = setTimeout(() => guardar(f, est), 900); }));
      $$('[data-esc]', m).forEach((b) => (b.onclick = () => { p.escala = Math.round(Math.min(1.35, Math.max(0.65, (+p.escala || 1) + Number(b.dataset.esc))) * 100) / 100; pintar(); guardar(f, est); }));
      $$('[data-pos]', m).forEach((b) => (b.onclick = () => { p.pos = b.dataset.pos; pintar(); guardar(f, est); }));
      $$('[data-tpl]', m).forEach((b) => (b.onclick = () => { p.tpl = b.dataset.tpl; asignarFotos(Object.values(FILAS)); pintar(); guardar(f, est); }));
      $$('[data-confoto]', m).forEach((b) => (b.onclick = () => { p.conFoto = b.dataset.confoto === '1'; asignarFotos(Object.values(FILAS)); pintar(); guardar(f, est); }));
      $$('[data-fondo]', m).forEach((b) => (b.onclick = () => { if (b.dataset.fondo) p.fondo_img = b.dataset.fondo; else delete p.fondo_img; pintar(); guardar(f, est); }));
      $$('[data-foto]', m).forEach((b) => (b.onclick = () => { p._foto = b.dataset.foto; p.foto = b.dataset.foto; pintar(); guardar(f, est); }));
      $$('[data-subir]', m).forEach((sub) => (sub.onchange = async () => {
        const file = sub.files[0]; if (!file) return;
        try {
          est('Subiendo la foto…');
          const reducida = await reducir(file);
          const meta = await subirFn(reducida.blob, file.name, reducida.ancho, reducida.alto, sub.dataset.subir);
          M.catalogo.push(extraACat(meta));
          if (c.estilo && p.forma !== 'portada') p.conFoto = true;
          if (lleva(c, p, i)) { p._foto = meta.archivo; p.foto = meta.archivo; } else p.fondo_img = meta.archivo; pintar(); await guardar(f, est); est('Foto subida: ya queda para todos tus carruseles.');
        } catch (e) { est('No se pudo subir: ' + e.message); }
      }));
    };
    pintar();
  }
  // Las fotos del celular pesan mucho: se achican a 1400 px de alto, JPG.
  async function reducir(file) {
    const url = URL.createObjectURL(file);
    const im = await new Promise((r, j) => { const x = new Image(); x.onload = () => r(x); x.onerror = j; x.src = url; });
    const k = Math.min(1, 1400 / im.naturalHeight), w = Math.round(im.naturalWidth * k), h = Math.round(im.naturalHeight * k);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(im, 0, 0, w, h);
    URL.revokeObjectURL(url);
    return { blob: await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.86)), ancho: w, alto: h };
  }

  /* ---------- PNG listos para subir (mismo método que el estudio: fotos en canvas, diseño con html-to-image) ---------- */
  const cacheImg = {};
  function cargarImg(url) {
    if (!cacheImg[url]) cacheImg[url] = new Promise(async (res, rej) => { try { const d = url.startsWith('data:') ? url : await aDataURL(url); const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = d; } catch (e) { rej(e); } });
    return cacheImg[url];
  }
  async function montarFull(c, i) {
    const st = document.getElementById('crs-stage'); st.innerHTML = htmlPlaca(c, i, 1); const node = st.querySelector('.p');
    await document.fonts.ready; ajustar(node); return node;
  }
  async function capaFoto(el, H) {
    const im = await cargarImg(el.dataset.src), E = { w: el.offsetWidth || M.W, h: el.offsetHeight || H };
    let dw, dh, x, y;
    if (el.dataset.modo === 'contain-br') { const k = Math.min(E.w / im.naturalWidth, E.h / im.naturalHeight); dw = im.naturalWidth * k; dh = im.naturalHeight * k; x = E.w - dw; y = E.h - dh; const cv0 = document.createElement('canvas'); cv0.width = E.w; cv0.height = E.h; cv0.getContext('2d').drawImage(im, x, y, dw, dh); return { cv: cv0, x: el.offsetLeft, y: el.offsetTop }; }
    if (el.dataset.modo === 'lado') { dh = E.h * 0.88; dw = (im.naturalWidth * dh) / im.naturalHeight; x = (E.w - dw) * 1.75; y = E.h - dh; }
    else {
      const s = Math.max(E.w / im.naturalWidth, E.h / im.naturalHeight); dw = im.naturalWidth * s; dh = im.naturalHeight * s;
      const m = String(el.style.backgroundPosition || '').match(/(-?[\d.]+)%\s+(-?[\d.]+)%/);
      if (m) { x = ((E.w - dw) * +m[1]) / 100; y = ((E.h - dh) * +m[2]) / 100; }
      else { x = (E.w - dw) / 2; y = /center\s*$|^center$|50%\s*50%/.test(el.style.backgroundPosition) ? (E.h - dh) / 2 : 0; }
    }
    const cv = document.createElement('canvas'); cv.width = E.w; cv.height = E.h; const g = cv.getContext('2d'); g.drawImage(im, x, y, dw, dh);
    if (el.dataset.grade && !/grayscale/.test(el.style.filter || '')) { const d = g.getImageData(0, 0, E.w, E.h), a = d.data; for (let k = 0; k < a.length; k += 4) { const l = 0.299 * a[k] + 0.587 * a[k + 1] + 0.114 * a[k + 2]; let rr = a[k] * 0.9 + l * 0.1, gg = a[k + 1] * 0.9 + l * 0.1, bb = a[k + 2] * 0.9 + l * 0.1; rr = (rr - 128) * 1.03 + 128 + 9; gg = (gg - 128) * 1.03 + 128 + 4; bb = (bb - 128) * 1.03 + 128 - 6; a[k] = Math.max(0, Math.min(255, rr)); a[k + 1] = Math.max(0, Math.min(255, gg)); a[k + 2] = Math.max(0, Math.min(255, bb)); } g.putImageData(d, 0, 0); }
    if (/grayscale/.test(el.style.filter || '')) { const d = g.getImageData(0, 0, E.w, E.h), a = d.data; for (let k = 0; k < a.length; k += 4) { const v = Math.min(255, (0.299 * a[k] + 0.587 * a[k + 1] + 0.114 * a[k + 2] - 128) * 1.04 + 128); a[k] = Math.min(255, v * 1.08); a[k + 1] = v * 0.98; a[k + 2] = v * 0.84; } g.putImageData(d, 0, 0); }
    if (/border-radius/.test(el.getAttribute('style') || '')) { const rr = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, rb = parseFloat(getComputedStyle(el).borderBottomLeftRadius) || 0; if (rr || rb) { const m = document.createElement('canvas'); m.width = E.w; m.height = E.h; const h = m.getContext('2d'); h.beginPath(); h.moveTo(rr, 0); h.lineTo(E.w - rr, 0); h.arcTo(E.w, 0, E.w, rr, rr); h.lineTo(E.w, E.h - rb); h.arcTo(E.w, E.h, E.w - rb, E.h, rb); h.lineTo(rb, E.h); h.arcTo(0, E.h, 0, E.h - rb, rb); h.lineTo(0, rr); h.arcTo(0, 0, rr, 0, rr); h.closePath(); h.clip(); h.drawImage(cv, 0, 0); return { cv: m, x: el.offsetLeft, y: el.offsetTop }; } }
    return { cv, x: el.offsetLeft, y: el.offsetTop };
  }
  async function capaDiseno(node, hijos) {
    const todos = [...node.children], vis = todos.map((ch) => ch.style.visibility);
    todos.forEach((ch) => { if (!hijos.includes(ch)) ch.style.visibility = 'hidden'; });
    const bg = node.style.background; node.style.background = 'transparent';
    const o = { width: M.W, height: node.offsetHeight, pixelRatio: 1, fontEmbedCSS: FONT, cacheBust: false };
    let url = ''; for (let k = 0; k < (esWebKit ? 3 : 1); k++) url = await window.htmlToImage.toPng(node, o);
    todos.forEach((ch, k) => (ch.style.visibility = vis[k])); node.style.background = bg;
    return url;
  }
  async function aPNG(c, i) {
    const node = await montarFull(c, i), H = node.offsetHeight, fondo = getComputedStyle(node).backgroundColor, out = [];
    let tramo = [];
    const cerrarT = async () => { if (!tramo.length) return; out.push({ url: await capaDiseno(node, tramo) }); tramo = []; };
    for (const ch of [...node.children]) { if (ch.dataset.foto !== undefined && ch.dataset.src) { await cerrarT(); out.push(await capaFoto(ch, H)); } else tramo.push(ch); }
    await cerrarT();
    const cv = document.createElement('canvas'); cv.width = M.W; cv.height = H; const g = cv.getContext('2d');
    g.fillStyle = fondo && fondo !== 'rgba(0, 0, 0, 0)' ? fondo : '#f8f5ee'; g.fillRect(0, 0, M.W, H);
    for (const k of out) { if (k.cv) g.drawImage(k.cv, k.x, k.y); else g.drawImage(await cargarImg(k.url), 0, 0); }
    return await new Promise((r) => cv.toBlob(r, 'image/png'));
  }
  async function bajarZip(f, est) {
    if (!window.htmlToImage) await script('https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js');
    if (!window.JSZip) await script('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
    const c = f.carrusel, zip = new window.JSZip(), vis = visibles(c);
    for (const i of vis) { est(`Armando la lámina ${i + 1} de ${vis.length}…`); zip.file(c.formato === 'reel' ? 'portada-reel.png' : `${String(i + 1).padStart(2, '0')}.png`, await aPNG(c, i)); }
    const blob = await zip.generateAsync({ type: 'blob' });
    const nombre = (`${f.fecha} ${String(f.titulo || 'carrusel').replace(/^Carrusel · /, '')}`).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (nombre || 'carrusel') + '.zip'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    est('Listo: se bajó el .zip con las láminas.');
  }

  /* ---------- API para app.js ---------- */
  // filas: todas las de hoy_flor que están en pantalla; opciones: {guardar(fecha, clave, carrusel), subir(blob, nombre, ancho, alto) → meta, fotos: [...]}
  async function pintar(raiz, filas, opciones) {
    const els = $$('[data-crs]', raiz); if (!els.length && !$$('[data-crs-mini]', raiz).length) return;
    guardarFn = opciones && opciones.guardar; subirFn = opciones && opciones.subir;
    try { await preparar(opciones && opciones.fotos); await Promise.all([...document.fonts].map((x) => x.load().catch(() => null))); await document.fonts.ready; }
    catch (e) { els.forEach((el) => (el.innerHTML = '<p class="small muted">No pude cargar el diseñador de carruseles. Recargá la página.</p>')); return; }
    // Todo carrusel pasa a los estilos nuevos (Flor, 25/11): un estilo para todo el posteo.
    const SELLO = { demanda: 'Caso real', valor: 'Error común', 'valor + crecimiento': 'Error común', crecimiento: 'Opinión', 'conversión': 'AT WORK', inspira: 'Mi historia', autoridad: 'Caso real' };
    (filas || []).forEach((f) => { if (f && f.carrusel && Array.isArray(f.carrusel.placas)) { if (f.carrusel.estilo) ES.aEstilos(f.carrusel); const p0 = f.carrusel.placas[0]; if (f.carrusel.estilo && p0 && p0.sello === undefined) { const m = String(f.detalle || '').match(/^(Valor \+ Crecimiento|Valor|Crecimiento|Demanda|Inspira|Conversión|Autoridad)/i); p0.sello = m ? SELLO[m[1].toLowerCase()] || '' : ''; } FILAS[llave(f)] = f; } });
    const cambiadas = asignarFotos(Object.values(FILAS));
    els.forEach(pintarUno);
    pintarMinis();
    for (const f of cambiadas) await guardar(f); // la primera vez que se ve una pieza, sus fotos quedan fijas
  }
  window.Carruseles = { pintar, llave, minis: () => pintarMinis() };
})();
