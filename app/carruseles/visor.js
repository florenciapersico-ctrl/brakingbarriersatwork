/* Carruseles dentro de la app (Flor, 25/11/2026).
   Dibuja cada pieza de Contenido con el motor del estudio «Carruseles Flor» (las 4 recetas, sus fotos, su marca)
   y deja cambiar la receta, las fotos y los textos, subir fotos nuevas y bajar los PNG.
   El carrusel vive en hoy_flor.carrusel: {receta, formato, semilla, placas:[{forma, …campos, foto?, _foto?}]}. */
(function () {
  const BASE = 'carruseles/';
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
      await script(BASE + 'motor.js?v=1');
      M = window.Motor;
      const [cat, fcss, pinc, lo, lc] = await Promise.all([
        fetch(BASE + 'catalogo.json?v=1').then((r) => r.json()), fetch(BASE + 'marca/fuentes.css').then((r) => r.text()),
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
.crs-acc{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.crs-est{font-size:13px;min-height:18px;margin-top:4px;color:#81552e}
.crs-modal{position:fixed;inset:0;z-index:80;background:rgba(30,26,18,.6);display:flex;align-items:center;justify-content:center;padding:12px}
.crs-modal .cm{background:#fffdf8;color:#22201a;border-radius:18px;width:min(980px,100%);max-height:94vh;overflow:auto;padding:16px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}
.crs-modal .lienzo{position:relative;width:100%;overflow:hidden;border-radius:10px;box-shadow:0 14px 34px rgba(60,45,20,.2)}
.crs-modal .lienzo>div{position:absolute;left:0;top:0;transform-origin:0 0}
.crs-modal label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:700;color:#6c6656;margin-top:10px}
.crs-modal textarea,.crs-modal input[type=text],.crs-modal select{font:inherit;font-size:16px;font-weight:400;color:#22201a;border:1.5px solid #e6dcc4;border-radius:10px;padding:8px 10px;background:#f8f5ee;width:100%}
.crs-modal .nav{display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:8px}
.crs-fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px;margin-top:8px;max-height:220px;overflow:auto}
.crs-fotos button{aspect-ratio:3/4;border-radius:8px;overflow:hidden;border:2px solid transparent;padding:0;cursor:pointer;background:#ede5cc}
.crs-fotos button.on{border-color:#c68c6c}
.crs-fotos img{width:100%;height:100%;object-fit:cover;display:block}
#crs-stage{position:fixed;left:-40000px;top:0;width:1080px}
@media(max-width:760px){.crs-modal .cm{grid-template-columns:minmax(0,1fr)}}`;

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
      placas.forEach((p) => {
        if (!M.necesitaFoto(p.forma, c.receta)) { if (p._foto) { delete p._foto; cambio = true; } return; }
        const ok = p._foto && M.catalogo.some((e) => e.archivo === p._foto && !e.excluir);
        if (ok && !rehacer && (!p.foto || p.foto === 'objeto' || p.foto === 'persona' || p.foto === p._foto)) return;
        const forma = p.forma === 'cierre' ? 'foto_frase' : p.forma, pedida = p.forma === 'cierre' ? p.foto || 'objeto' : p.foto;
        let e = M.tomarFoto(forma, H, pedida, usadas, r);
        if (!e && p.forma === 'portada_profundidad') { p.forma = 'portada_foto'; p.titulo = p.titulo || [p.pre, p.palabra].filter(Boolean).join(' '); p.titulo_i = p.titulo_i || p.pill || ''; e = M.tomarFoto('portada_foto', H, null, usadas, r); }
        if (e && e.archivo !== p._foto) { p._foto = e.archivo; cambio = true; }
      });
      if (cambio) cambiadas.push(f);
    });
    return cambiadas;
  }
  // Pasa una lámina a otra forma sin perder el texto (port del estudio).
  function convertir(p, destino) {
    if (p.forma === destino) return p;
    const orig = (M.FORMAS[p.forma] || {}).c || [], dest = M.FORMAS[destino].c;
    const sueltos = orig.filter((c) => c[2] !== 'p' && c[2] !== 'l').map((c) => p[c[0]]).filter(Boolean);
    const listas = orig.filter((c) => c[2] === 'p' || c[2] === 'l').map((c) => p[c[0]]).filter(Boolean);
    const n = { forma: destino, foto: p.foto, _foto: p._foto };
    let i = 0, j = 0;
    dest.forEach(([k, , t]) => { if (t === 'p' || t === 'l') n[k] = listas[j++] || ''; else n[k] = sueltos[i++] || ''; });
    if (sueltos.length > i) { const ult = dest.filter((c) => c[2] !== 'p' && c[2] !== 'l').pop(); if (ult) n[ult[0]] = [n[ult[0]], ...sueltos.slice(i)].filter(Boolean).join(' '); }
    if (destino === 'portada_profundidad' && n.palabra && n.palabra.split(/\s+/).length > 1) { const ws = n.palabra.split(/\s+/); const larga = ws.reduce((a, b) => (b.length > a.length ? b : a)); n.pre = [n.pre, n.palabra.replace(larga, '').trim()].filter(Boolean).join(' '); n.palabra = larga.toUpperCase(); }
    return n;
  }
  const PORTADAS = [['portada_foto', 'Con foto'], ['portada_serif', 'Serif grande'], ['portada_botones', 'Con opciones'], ['portada_profundidad', 'Palabra gigante']];
  const fotoDe = (p) => (p._foto ? M.catalogo.find((e) => e.archivo === p._foto) || null : null);
  function htmlPlaca(c, i, escala) {
    const H = alto(c), p = c.placas[i]; if (!p) return '';
    const forma = c.formato === 'reel' && i === 0 && !p.forma.startsWith('portada_') ? M.RECETAS[c.receta].portadas[0] : p.forma;
    return `<div style="transform:scale(${escala});width:${M.W}px;height:${H}px;transform-origin:0 0">${M.placa(forma, p, H, c.receta, fotoDe(p), p.fondo_img ? M.catalogo.find((e) => e.archivo === p.fondo_img) || null : null)}</div>`;
  }

  /* ---------- la tarjeta dentro de cada pieza ---------- */
  function pintarUno(el) {
    const f = FILAS[el.dataset.crs]; if (!f || !f.carrusel) return;
    const c = f.carrusel; if (!M.RECETAS[c.receta]) c.receta = 'editorial';
    const reel = c.formato === 'reel';
    el.innerHTML = `<div class="crs-rec" role="group" aria-label="Receta">${Object.entries(M.RECETAS).map(([k, R]) => `<button type="button" data-rec="${k}" aria-pressed="${k === c.receta}" title="${esc(R.desc)}">${esc(R.n)}</button>`).join('')}</div>
<details class="crs-port"${c._abrirPortada ? ' open' : ''}><summary>Portada: el hook y su estilo</summary>
  <div class="crs-rec" role="group" aria-label="Estilo de la portada">${PORTADAS.map(([k, n]) => `<button type="button" data-port="${k}" aria-pressed="${!!c.placas[0] && c.placas[0].forma === k}">${n}</button>`).join('')}</div>
  ${((M.FORMAS[(c.placas[0] || {}).forma] || {}).c || []).map(([k, et, t]) => `<label class="crs-campo">${esc(et)}${t === 't' ? `<input type="text" data-pk="${k}" value="${esc(c.placas[0][k] || '')}">` : `<textarea rows="2" data-pk="${k}">${esc(c.placas[0][k] || '')}</textarea>`}</label>`).join('')}
</details>
<div class="crs-tira">${visibles(c).map((i) => `<button type="button" class="crs-mini${reel ? ' reel' : ''}" data-i="${i}" aria-label="Editar lámina ${i + 1}"><div class="marco">${htmlPlaca(c, i, 120 / M.W)}</div>${i + 1}</button>`).join('')}</div>
<div class="crs-acc"><button type="button" class="btn sm" data-crs-png>Bajar PNG</button><button type="button" class="btn ghost sm" data-crs-fotos>Otras fotos</button><button type="button" class="btn ghost sm" data-crs-ed="0">Editar textos y fotos</button></div>
<div class="crs-est" aria-live="polite"></div>`;
    $$('.crs-mini .marco .p', el).forEach((p) => M.fit(p));
    const est = (t) => { el.querySelector('.crs-est').textContent = t || ''; };
    $$('[data-rec]', el).forEach((b) => (b.onclick = async () => { c.receta = b.dataset.rec; asignarFotos(Object.values(FILAS), llave(f)); pintarUno(el); await guardar(f, est); }));
    $$('[data-port]', el).forEach((b) => (b.onclick = async () => { c.placas[0] = convertir(c.placas[0], b.dataset.port); c._abrirPortada = true; asignarFotos(Object.values(FILAS)); pintarUno(el); await guardar(f, est); }));
    let tp = null;
    $$('[data-pk]', el).forEach((inp) => (inp.oninput = () => {
      c.placas[0][inp.dataset.pk] = inp.value;
      const m0 = el.querySelector('.crs-mini[data-i="0"] .marco'); if (m0) { m0.innerHTML = htmlPlaca(c, 0, 120 / M.W); const n = m0.querySelector('.p'); if (n) M.fit(n); }
      clearTimeout(tp); tp = setTimeout(() => guardar(f, est), 900);
    }));
    const dp = el.querySelector('.crs-port'); if (dp) dp.ontoggle = () => { c._abrirPortada = dp.open; };
    el.querySelector('[data-crs-fotos]').onclick = async () => { c.semilla = (+c.semilla || 0) + 1; asignarFotos(Object.values(FILAS), llave(f)); pintarUno(el); await guardar(f, est); };
    $$('.crs-mini,[data-crs-ed]', el).forEach((b) => (b.onclick = () => editor(f, +(b.dataset.i || b.dataset.crsEd || 0), () => pintarUno(el))));
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
    const m = document.createElement('div'); m.className = 'crs-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    document.body.appendChild(m);
    const cerrar = () => { m.remove(); document.removeEventListener('keydown', tecla); alCerrar && alCerrar(); };
    const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', tecla);
    m.onclick = (e) => { if (e.target === m) cerrar(); };
    let timer = null;
    const pintar = () => {
      const p = c.placas[i], F = M.FORMAS[p.forma] || { n: p.forma, c: [] }, conFoto = M.necesitaFoto(p.forma, c.receta);
      const formas = Object.keys(M.FORMAS).filter((k) => (i === 0 ? k.startsWith('portada_') || M.RECETAS[c.receta].formas.includes(k) : !k.startsWith('portada_')));
      const fotos = M.catalogo.filter((e) => e.tipo !== 'fondo' && !e.excluir);
      m.innerHTML = `<div class="cm"><div><div class="lienzo" style="aspect-ratio:1080/${alto(c)}"></div>
  <div class="nav"><button type="button" class="btn ghost sm" data-ant ${i <= 0 ? 'disabled' : ''}>← Anterior</button><span class="small">Lámina ${i + 1} de ${vis.length}</span><button type="button" class="btn ghost sm" data-sig ${i >= vis.length - 1 ? 'disabled' : ''}>Siguiente →</button></div></div>
<div><div class="row between"><h3 style="margin:0">${esc(F.n)}</h3><button type="button" class="btn ghost sm" data-cerrar>Listo</button></div>
  <label>Forma de la lámina<select data-forma>${formas.map((k) => `<option value="${k}"${k === p.forma ? ' selected' : ''}>${esc(M.FORMAS[k].n)}</option>`).join('')}</select></label>
  ${F.c.map(([k, et, t]) => `<label>${esc(et)}${t === 't' ? `<input type="text" data-k="${k}" value="${esc(p[k] || '')}">` : `<textarea rows="${t === 'p' || t === 'l' ? 4 : 2}" data-k="${k}">${esc(p[k] || '')}</textarea>`}</label>`).join('')}
  <p class="small muted" style="margin:6px 0 0">*itálica* · **negrita** · en listas, una línea por renglón y «negrita | resto».</p>
  ${conFoto ? `<label>Foto de esta lámina</label><div class="crs-fotos">${fotos.map((e) => `<button type="button" data-foto="${esc(e.archivo)}" class="${e.archivo === p._foto ? 'on' : ''}" aria-label="${esc(e.archivo)}"><img loading="lazy" src="${esc(e.url || 'carruseles/fotos/' + e.archivo)}" alt=""></button>`).join('')}</div>
  ${subirFn ? `<label>Subir una foto nueva<input type="file" accept="image/*" data-subir></label>` : ''}` : ''}
  <div class="crs-est" aria-live="polite"></div></div></div>`;
      const lz = m.querySelector('.lienzo');
      const dibujar = () => { lz.innerHTML = htmlPlaca(c, i, lz.clientWidth / M.W); const n = lz.querySelector('.p'); if (n) M.fit(n); };
      requestAnimationFrame(dibujar);
      const est = (t) => { m.querySelector('.crs-est').textContent = t || ''; };
      m.querySelector('[data-cerrar]').onclick = cerrar;
      const ant = m.querySelector('[data-ant]'), sig = m.querySelector('[data-sig]');
      ant.onclick = () => { i--; pintar(); }; sig.onclick = () => { i++; pintar(); };
      m.querySelector('[data-forma]').onchange = (e) => { c.placas[i] = convertir(p, e.target.value); asignarFotos(Object.values(FILAS)); pintar(); guardar(f, est); };
      $$('[data-k]', m).forEach((inp) => (inp.oninput = () => { p[inp.dataset.k] = inp.value; dibujar(); clearTimeout(timer); timer = setTimeout(() => guardar(f, est), 900); }));
      $$('[data-foto]', m).forEach((b) => (b.onclick = () => { p._foto = b.dataset.foto; p.foto = b.dataset.foto; pintar(); guardar(f, est); }));
      const sub = m.querySelector('[data-subir]');
      if (sub) sub.onchange = async () => {
        const file = sub.files[0]; if (!file) return;
        try {
          est('Subiendo la foto…');
          const reducida = await reducir(file);
          const meta = await subirFn(reducida.blob, file.name, reducida.ancho, reducida.alto);
          M.catalogo.push(extraACat(meta));
          p._foto = meta.archivo; p.foto = meta.archivo; pintar(); await guardar(f, est); est('Foto subida: ya queda para todos tus carruseles.');
        } catch (e) { est('No se pudo subir: ' + e.message); }
      };
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
    await document.fonts.ready; M.fit(node); return node;
  }
  async function capaFoto(el, H) {
    const im = await cargarImg(el.dataset.src), E = { w: el.offsetWidth || M.W, h: el.offsetHeight || H };
    let dw, dh, x, y;
    if (el.dataset.modo === 'lado') { dh = E.h * 0.88; dw = (im.naturalWidth * dh) / im.naturalHeight; x = (E.w - dw) * 1.75; y = E.h - dh; }
    else { const s = Math.max(E.w / im.naturalWidth, E.h / im.naturalHeight); dw = im.naturalWidth * s; dh = im.naturalHeight * s; x = (E.w - dw) / 2; y = /center\s*$|^center$|50%\s*50%/.test(el.style.backgroundPosition) ? (E.h - dh) / 2 : 0; }
    const cv = document.createElement('canvas'); cv.width = E.w; cv.height = E.h; cv.getContext('2d').drawImage(im, x, y, dw, dh);
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
    const els = $$('[data-crs]', raiz); if (!els.length) return;
    guardarFn = opciones && opciones.guardar; subirFn = opciones && opciones.subir;
    (filas || []).forEach((f) => { if (f && f.carrusel) FILAS[llave(f)] = f; });
    try { await preparar(opciones && opciones.fotos); }
    catch (e) { els.forEach((el) => (el.innerHTML = '<p class="small muted">No pude cargar el diseñador de carruseles. Recargá la página.</p>')); return; }
    const cambiadas = asignarFotos(Object.values(FILAS));
    els.forEach(pintarUno);
    for (const f of cambiadas) await guardar(f); // la primera vez que se ve una pieza, sus fotos quedan fijas
  }
  window.Carruseles = { pintar, llave };
})();
