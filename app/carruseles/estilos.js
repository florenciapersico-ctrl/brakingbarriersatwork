/* Estilos de carrusel (Flor, 25/11/2026). Dirección: «foto real mía a sangre, texto grande encima o al lado, serif o
   script mezclado con sans, aire editorial de revista». Diez estilos inspirados en sus referencias, con SUS colores,
   SUS letras (Source Serif 4, Open Sans y una manuscrita) y en 1080×1440. Un estilo se aplica a TODAS las láminas.
   Regla de oro: el texto nunca tapa la cara (la app sabe dónde está la cara en cada foto). */
(function () {
  const W = 1080, PAD = 92;
  const K = { olivo: '#4b5624', olivoC: '#c9d1a3', cafe: '#81552e', terra: '#c68c6c', crema: '#f8f5ee', cremaM: '#ede5cc', calida: '#fbf2d0', bb: '#3f1e0d', negro: '#1f1c17', blanco: '#fffdf8' };

  // fam: sangre (foto a sangre + texto debajo de la cara) · collage (texto arriba, foto abajo) · esquina (foto chica en la esquina) · tarjeta (foto arriba + tarjeta encima)
  const ESTILOS = {
    lifestyle: { n: 'Lifestyle', fam: 'sangre', resalta: true, velo: 'rgba(63,30,13,.6)', ref: 'foto de fondo, serif con manuscrita y frases resaltadas' },
    revista:   { n: 'Revista', fam: 'sangre', grande: true, italica: true, velo: 'rgba(63,30,13,.6)', ref: 'serif enorme en itálica sobre la foto' },
    collage:   { n: 'Collage', fam: 'collage', bg: K.crema, tit: K.olivo, it: K.cafe, ink: K.negro, numero: true, ref: 'frase arriba, foto abajo, numeración [01]' },
    diario:    { n: 'Día a día', fam: 'sangre', chico: true, velo: 'rgba(63,30,13,.52)', ref: 'foto a sangre con el texto chico abajo' },
    polaroid:  { n: 'Polaroid', fam: 'collage', bg: K.cremaM, tit: K.cafe, it: K.olivo, ink: K.negro, polaroid: true, ref: 'título manuscrito con la foto al centro' },
    tips:      { n: 'Tips', fam: 'esquina', bg: K.cremaM, tit: K.cafe, it: K.cafe, ink: K.negro, ref: 'titular serif grande y foto chica en la esquina' },
    marco:     { n: 'Marco fino', fam: 'sangre', marco: true, velo: 'rgba(63,30,13,.56)', ref: 'foto de fondo con un marco fino y titular serif' },
    trabajo:   { n: 'Tarjeta', fam: 'tarjeta', bg: K.crema, tit: K.olivo, it: K.cafe, ink: K.negro, ref: 'foto arriba y tarjeta con el tip encima' },
    bn:        { n: 'Monocromo cálido', fam: 'sangre', bn: true, velo: 'rgba(63,30,13,.58)', ref: 'foto monocromo cálida, título fuerte en mayúsculas' },
    servicios: { n: 'Editorial', fam: 'sangre', grande: true, desliza: true, velo: 'rgba(63,30,13,.58)', ref: 'foto tuya, titular grande y «desliza» manuscrito' },
  };

  const ROLES = {
    portada: { n: 'Portada (hook)', c: [['sello', 'Serie (etiqueta): CASO REAL, ERROR COMÚN, OPINIÓN…', 't'], ['titulo', 'Hook (3 a 7 palabras)', 'a'], ['titulo_i', 'Segunda línea, en itálica', 'a']] },
    texto: { n: 'Texto', c: [['titulo', 'Título', 'a'], ['titulo_i', 'Itálica', 'a'], ['cuerpo', 'Cuerpo (corto)', 'a']] },
    lista: { n: 'Lista', c: [['titulo', 'Título', 'a'], ['items', '2 a 4 líneas: «negrita | resto»', 'p']] },
    error: { n: 'Error y corrección', c: [['intro', 'Intro (ej.: En español: «…»)', 't'], ['mal', 'Lo que se tacha', 't'], ['bien', 'La versión buena', 'a'], ['nota', 'Nota (opcional)', 'a']] },
    tachado: { n: 'Creencia tachada', c: [['pre', 'Intro', 'a'], ['tachado', 'Lo que se tacha', 't'], ['verdad_i', 'La verdad', 'a']] },
    frase: { n: 'Frase destacada', c: [['pre', 'Frase chica arriba (opcional)', 'a'], ['frase', 'La frase', 'a']] },
    cierre: { n: 'Cierre con CTA', c: [['titulo', 'Título', 'a'], ['titulo_i', 'Itálica', 'a'], ['cuerpo', 'Texto (opcional)', 'a'], ['cta', 'Botón: Comenta ENTRENAR / Guárdalo…', 't']] },
  };

  const j = (...xs) => xs.filter(Boolean).join(' ');
  function desdeForma(p) {
    const b = { _foto: p._foto, foto: p.foto, escala: p.escala, pos: p.pos };
    switch (p.forma) {
      case 'portada_foto': return { ...b, forma: 'portada', titulo: p.titulo || '', titulo_i: p.titulo_i || '', bajada: p.bajada || '' };
      case 'portada_botones': return { ...b, forma: 'portada', titulo: p.titulo || '', titulo_i: p.titulo_2 || '', bajada: p.bajada || '' };
      case 'portada_profundidad': return { ...b, forma: 'portada', titulo: j(p.pre, p.palabra && p.palabra.toLowerCase()), titulo_i: p.pill || '', bajada: '' };
      case 'portada_serif': return { ...b, forma: 'portada', titulo: j(p.pre, p.titulo), titulo_i: p.titulo_i || '', bajada: '' };
      case 'texto': case 'recorte_lado': return { ...b, forma: 'texto', titulo: p.titulo || '', titulo_i: p.titulo_i || '', cuerpo: p.cuerpo || '' };
      case 'oscura': return { ...b, forma: 'texto', titulo: p.texto || '', titulo_i: p.texto_i || '', cuerpo: '' };
      case 'numerada': return { ...b, forma: 'lista', titulo: p.titulo || '', items: p.items || '' };
      case 'tarjetas': return { ...b, forma: 'lista', titulo: j(p.titulo, p.sub), items: p.tarjetas || '' };
      case 'notas_foto': return { ...b, forma: 'lista', titulo: p.titulo || '', items: p.lineas || '' };
      case 'calendario': return { ...b, forma: 'texto', titulo: p.titulo || '', titulo_i: p.sub || '', cuerpo: j(p.hora, p.evento, p.detalle) };
      case 'error': return { ...b, forma: 'error', intro: p.intro || '', mal: p.mal || '', bien: p.bien || '', nota: p.nota || '' };
      case 'tachado': return { ...b, forma: 'tachado', pre: p.pre || '', tachado: p.tachado || '', verdad_i: p.verdad_i || '' };
      case 'frase': return { ...b, forma: 'frase', pre: '', frase: j(p.linea_i, p.resaltado) };
      case 'foto_frase': return { ...b, forma: 'frase', pre: p.pre || '', frase: p.frase_i || '' };
      case 'cierre': return { ...b, forma: 'cierre', titulo: p.titulo || '', titulo_i: p.titulo_i || '', cuerpo: p.cuerpo || '', cta: p.cta || '' };
      default: return ROLES[p.forma] ? p : { ...b, forma: 'texto', titulo: Object.values(p).filter((v) => typeof v === 'string').join(' ') };
    }
  }
  // Estilos de la versión anterior → los nuevos.
  const VIEJOS = { crema: 'tips', olivo: 'lifestyle', cafe: 'servicios', foto: 'revista', papel: 'polaroid', notas: 'trabajo', minimal: 'collage', serif: 'marco', duo: 'diario', editorial: 'tips', tarjetas: 'trabajo', historia: 'servicios' };
  function aEstilos(c) {
    if (!ESTILOS[c.estilo]) c.estilo = VIEJOS[c.estilo] || VIEJOS[c.receta] || 'lifestyle';
    c.placas = (c.placas || []).map((p, i) => { const n = ROLES[p.forma] ? p : desdeForma(p); if (i === 0 && n.forma !== 'portada') { n.forma = 'portada'; n.titulo = n.titulo || [n.pre, n.tachado, n.frase].filter(Boolean).join(' '); } return n; });
    return c;
  }
  function variante(E, p) { return p.variante === 'texto' ? 'texto' : 'completa'; }
  // Plantilla de portada (Flor, 25/11: «cómo mejorarías el feed»): A, B o C. Por defecto, según el estilo.
  const PORTADAS = { A: 'Tu foto a sangre', B: 'Crema con foto de ambiente', C: 'Frase' };
  function tplDe(c) { const t = (c.placas[0] || {}).tpl; if (PORTADAS[t]) return t; const E = ESTILOS[c.estilo] || ESTILOS.lifestyle; return E.fam === 'sangre' ? 'A' : 'B'; }
  // Todos estos estilos van con foto en todas las láminas; cada lámina la puede sacar («Sin foto»).
  // Ritmo de fotos (Flor, 25/11: «son demasiadas fotos mías; alternar con un cafecito, una oficina, paisajes»):
  // portada con ella; adentro se alterna foto suya, foto de ambiente y lámina sin foto (en los estilos de foto a sangre).
  function llevaFoto(c, p, i) {
    if (p.conFoto === false) return false; if (p.conFoto === true) return true;
    if (p.forma === 'portada') return tplDe(c) !== 'C';
    const E = ESTILOS[c.estilo] || ESTILOS.lifestyle;
    if (E.fam !== 'sangre') return true;
    return (i || 0) % 3 !== 2;
  }
  function pide(c, p, i) { if (p.forma === 'portada') return tplDe(c) === 'A' ? 'persona' : 'objeto'; if (p.forma === 'cierre') return 'objeto'; return (i || 0) % 3 === 1 ? 'objeto' : 'persona'; }

  const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const md = (t) => esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
  const tam = (base, txt) => { const n = String(txt || '').length; return Math.round(base * (n > 160 ? 0.72 : n > 110 ? 0.8 : n > 70 ? 0.88 : n > 40 ? 0.95 : 1)); };
  const pares = (t) => String(t || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const i = l.indexOf('|'); return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()]; });

  // Encuadre de la foto: la cara queda centrada en su recuadro (bw × bh) a la altura «alto».
  function encuadre(e, bw, bh, alto) {
    const aw = e.ancho || 1080, ah = e.alto || 1440, k = Math.max(bw / aw, bh / ah), dw = aw * k, dh = ah * k;
    if (e.tipo === 'fondo') return { css: '50% 50%', px: 50, py: 50, dw, dh };
    const cx = e.cara ? e.cara[0] + e.cara[2] / 2 : 0.5, cy = e.cara ? e.cara[1] + e.cara[3] / 2 : (e.cabeza_arriba || 0.22) + 0.1;
    const px = dw > bw + 1 ? Math.min(100, Math.max(0, ((cx * dw - bw / 2) / (dw - bw)) * 100)) : 50;
    const py = dh > bh + 1 ? Math.min(100, Math.max(0, ((cy * dh - bh * alto) / (dh - bh)) * 100)) : 50;
    return { css: `${px.toFixed(1)}% ${py.toFixed(1)}%`, px, py, dw, dh };
  }
  // Dónde termina la cara (px desde arriba del recuadro), con ese encuadre.
  function caraAbajo(e, bw, bh, alto) {
    if (!e || e.tipo === 'objeto' || e.tipo === 'fondo') return 0;
    const q = encuadre(e, bw, bh, alto);
    const top = ((bh - q.dh) * q.py) / 100;
    const fondoCara = e.cara ? e.cara[1] + e.cara[3] : (e.cabeza_arriba || 0.22) + 0.22;
    return top + fondoCara * q.dh;
  }
  function fotoBg(e, url, caja, alto, extra) {
    const q = encuadre(e, caja.w, caja.h, alto);
    const grade = /grayscale/.test(extra || '') ? '' : 'filter:sepia(.14) saturate(.9) contrast(1.03) brightness(1.02);';
    return `<div class="bg" data-foto="${esc(e.archivo)}" data-grade="1" data-modo="cover" data-src="${esc(url)}" style="${grade}left:${caja.x}px;top:${caja.y}px;width:${caja.w}px;height:${caja.h}px;right:auto;bottom:auto;background-image:url('${esc(url)}');background-size:cover;background-position:${q.css};${extra || ''}"></div>`;
  }

  // ---------- el texto de cada rol ----------
  function contenido(C, p, s, E) {
    const fT = E.mayus ? 'Sans' : E.scriptT ? 'Script' : 'Serif';
    const T = (txt, base, o = {}) => { if (!txt) return ''; const f = o.f || fT, z = tam(base, txt) * s * (f === 'Script' && !o.f ? 1.3 : 1); return `<div data-fs="${z}" style="font-family:'${f}';font-weight:${o.w || (f === 'Sans' ? 800 : f === 'Script' ? 400 : 600)};font-size:${z}px;line-height:${o.lh || (f === 'Script' ? 1 : 1.1)};letter-spacing:${o.ls || (f === 'Sans' ? '-.01em' : f === 'Script' ? '0' : '-.02em')};color:${o.col || C.tit};font-style:${o.it ? 'italic' : 'normal'};${E.mayus && !o.f ? 'text-transform:uppercase;' : ''}${o.css || ''}">${md(txt)}</div>`; };
    const IT = (txt, base) => (E.scriptI ? T(txt, base * 1.35, { f: 'Script', w: 400, col: C.it, lh: 1, ls: '0' }) : T(txt, base, { f: 'Serif', w: 400, it: true, col: C.it, ls: '-.015em' }));
    const MARK = (txt, base) => (E.resalta && txt ? `<div data-fs="${tam(base, txt) * s}" style="font-family:'Serif';font-style:italic;font-size:${tam(base, txt) * s}px;line-height:1.5;color:${K.negro}"><span style="background:${K.calida};padding:2px 12px;-webkit-box-decoration-break:clone;box-decoration-break:clone">${md(txt)}</span></div>` : IT(txt, base));
    const BODY = (txt, base = 44) => T(txt, base, { f: 'Sans', w: 400, col: C.ink, lh: 1.42, ls: '0', css: 'text-transform:none;' });
    const g = (n) => `<div style="height:${n * s}px"></div>`;
    const G = E.grande ? 1.25 : E.chico ? 0.78 : 1;
    switch (p.forma) {
      case 'portada': return `${T(p.titulo, 84 * G, E.italica ? { it: true, w: 400 } : {})}${E.scriptI ? IT(p.titulo_i, 62 * G) : MARK(p.titulo_i, 62 * G)}${p.bajada ? `<div style="font-family:'Sans';font-weight:700;font-size:${24 * s}px;letter-spacing:.14em;text-transform:uppercase;color:${C.acc};margin-top:12px">${esc(p.bajada)}</div>` : ''}`;
      case 'texto': return `${T(p.titulo, 70 * G)}${MARK(p.titulo_i, 60 * G)}${p.cuerpo ? g(14) + BODY(p.cuerpo, 42) : ''}`;
      case 'lista': return `${T(p.titulo, 66 * G)}${g(14)}${pares(p.items).map(([a, b], k) => `<div style="display:flex;gap:${20 * s}px;align-items:baseline;padding:${13 * s}px 0;border-top:2px solid ${C.linea}"><div style="font-family:'Serif';font-style:italic;font-size:${46 * s}px;color:${C.acc};min-width:${56 * s}px">${String(k + 1).padStart(2, '0')}</div><div data-fs="${42 * s}" style="font-family:'Sans';font-size:${42 * s}px;line-height:1.35;color:${C.ink}"><b>${md(a)}</b>${b ? ' ' + md(b) : ''}</div></div>`).join('')}`;
      case 'error': return `${BODY(p.intro, 40)}${g(16)}${T(p.mal, 58, { f: 'Sans', w: 700, col: C.ink, css: `text-transform:none;text-decoration:line-through;text-decoration-color:${C.acc};text-decoration-thickness:6px;opacity:.85` })}${g(12)}${MARK(p.bien, 64)}${p.nota ? g(12) + BODY(p.nota, 38) : ''}`;
      case 'tachado': return `${BODY(p.pre, 40)}${g(12)}${T(p.tachado, 66 * G, { css: `text-decoration:line-through;text-decoration-color:${C.acc};text-decoration-thickness:7px` })}${g(16)}${MARK(p.verdad_i, 60 * G)}`;
      case 'frase': return `${p.pre ? BODY(p.pre, 40) + g(14) : ''}${MARK(p.frase, 72 * G)}`;
      case 'cierre': return `${T(p.titulo, 70 * G)}${MARK(p.titulo_i, 60 * G)}${p.cuerpo ? g(10) + BODY(p.cuerpo, 40) : ''}${p.cta ? `<div style="margin-top:${28 * s}px"><span style="display:inline-block;background:${C.acc};color:#fff;font-family:'Sans';font-weight:700;font-size:${36 * s}px;padding:${18 * s}px ${38 * s}px;border-radius:999px">${esc(p.cta)}</span></div>` : ''}`;
      default: return '';
    }
  }

  // ---------- una lámina ----------
  function portada(c, H, foto, url) {
    const p = c.placas[0], tpl = tplDe(c), s = Math.min(1.35, Math.max(0.65, +p.escala || 1));
    const sello = (col, bg) => (p.sello ? `<div style="position:absolute;left:${PAD}px;top:${PAD}px;font-family:'Sans';font-weight:700;font-size:30px;letter-spacing:.16em;text-transform:uppercase;color:${col};background:${bg};padding:12px 24px;border-radius:999px">${esc(p.sello)}</div>` : '');
    const hook = (col, colI, base) => { const z1 = tam(base, p.titulo) * s, z2 = tam(base * 0.62, p.titulo_i) * s; return `<div class="ci" style="display:flex;flex-direction:column;gap:${14 * s}px">${p.titulo ? `<div data-fs="${z1}" style="font-family:'Serif';font-weight:600;font-size:${z1}px;line-height:1.04;letter-spacing:-.025em;color:${col}">${md(p.titulo)}</div>` : ''}${p.titulo_i ? `<div data-fs="${z2}" style="font-family:'Serif';font-style:italic;font-weight:400;font-size:${z2}px;line-height:1.2;letter-spacing:-.01em;color:${colI}">${md(p.titulo_i)}</div>` : ''}</div>`; };
    const cajaHTML = (t, b, just, inner) => `<div class="caja" style="left:${PAD}px;right:${PAD}px;top:${t}px;bottom:${b}px;justify-content:${just};text-align:left">${inner}</div>`;
    if (tpl === 'A' && foto) {
      const alto = 0.26, libre = Math.max(Math.round(H * 0.52), Math.round(caraAbajo(foto, W, H, alto) + 40));
      const t = Math.min(libre, Math.round(H - PAD - H * 0.3));
      return `<div class="p" style="height:${H}px;background:${K.bb}">${fotoBg(foto, url, { x: 0, y: 0, w: W, h: H }, alto)}<div class="bg" style="background:linear-gradient(180deg,rgba(0,0,0,0) ${Math.round((t / H) * 100) - 22}%,rgba(63,30,13,.62) ${Math.round((t / H) * 100) + 10}%)"></div>${sello(K.crema, 'rgba(198,140,108,.92)')}${cajaHTML(t, PAD, 'flex-end', hook(K.crema, K.calida, 100))}</div>`;
    }
    if (tpl === 'B' && foto) {
      const yF = Math.round(H * 0.46);
      return `<div class="p" style="height:${H}px;background:${K.crema}">${sello(K.terra, 'transparent;border:2px solid ' + K.terra)}${cajaHTML(PAD + 90, H - yF + 40, 'flex-end', hook(K.olivo, K.cafe, 96))}${fotoBg(foto, url, { x: PAD, y: yF, w: W - PAD * 2, h: H - yF - PAD }, 0.45, 'border-radius:18px')}</div>`;
    }
    // C · Frase (o A/B sin foto): crema, una frase grande en itálica y una línea terracota.
    const z = tam(124, p.titulo) * s, z2 = tam(66, p.titulo_i) * s;
    return `<div class="p" style="height:${H}px;background:${K.cremaM}">${sello(K.terra, 'transparent;border:2px solid ' + K.terra)}${cajaHTML(PAD + 90, PAD + 40, 'center', `<div class="ci" style="display:flex;flex-direction:column;gap:${22 * s}px"><div style="width:90px;height:6px;background:${K.terra};border-radius:3px"></div>${p.titulo ? `<div data-fs="${z}" style="font-family:'Serif';font-style:italic;font-weight:400;font-size:${z}px;line-height:1.08;letter-spacing:-.02em;color:${K.cafe}">${md(p.titulo)}</div>` : ''}${p.titulo_i ? `<div data-fs="${z2}" style="font-family:'Serif';font-weight:600;font-size:${z2}px;line-height:1.25;color:${K.olivo}">${md(p.titulo_i)}</div>` : ''}</div>`)}</div>`;
  }
  function placa(c, i, H, foto, url, assets) {
    if (i === 0 && c.placas[0] && c.placas[0].forma === 'portada') return portada(c, H, llevaFoto(c, c.placas[0], 0) ? foto : null, url);
    const E = ESTILOS[c.estilo] || ESTILOS.lifestyle, p = c.placas[i], n = c.placas.length;
    const s = Math.min(1.35, Math.max(0.65, +p.escala || 1));
    const conFoto = llevaFoto(c, p, i) && foto;
    const claro = { tit: E.tit || K.negro, it: E.it || K.cafe, ink: E.ink || K.negro, acc: K.terra, linea: K.terra + '66' };
    const oscuroC = { tit: K.crema, it: E.scriptI ? K.calida : K.cremaM, ink: K.cremaM, acc: K.terra, linea: K.cremaM + '55' };
    let capas = '', extra = '', C = claro, fondo = E.bg || K.crema, oscuro = false, just = 'flex-start', centrar = false, tarjeta = false;
    const caja = { l: PAD, r: PAD, t: PAD, b: 150 };
    const pos = p.pos;
    const fam = conFoto ? E.fam : 'liso';
    if (fam === 'sangre') {
      const alto = 0.26;
      capas += fotoBg(foto, url, { x: 0, y: 0, w: W, h: H }, alto, E.bn ? 'filter:grayscale(1) sepia(.35) contrast(1.04);' : '');
      const libre = Math.max(Math.round(H * (p.forma === 'portada' ? 0.55 : 0.5)), Math.round(caraAbajo(foto, W, H, alto) + 46));
      const zona = H * (p.forma === 'portada' ? 0.3 : 0.38), entra = H - libre - caja.b >= zona;
      const velo = E.velo;
      if (pos === 'arriba') { capas += `<div class="bg" style="background:linear-gradient(0deg,rgba(0,0,0,0) 45%,${velo} 85%)"></div>`; just = 'flex-start'; }
      else if (entra || pos === 'abajo') { caja.t = Math.round(Math.min(libre, H - caja.b - zona)); just = 'flex-end'; capas += `<div class="bg" style="background:linear-gradient(180deg,rgba(0,0,0,0) ${Math.round((caja.t / H) * 100) - 20}%,${velo} ${Math.round((caja.t / H) * 100) + 8}%)"></div>`; }
      else { caja.t = Math.round(H - caja.b - zona); just = 'flex-end'; capas += `<div class="bg" style="background:linear-gradient(180deg,rgba(0,0,0,0) 32%,${velo} 58%)"></div>`; }
      if (E.marco) extra += `<div style="position:absolute;left:30px;top:30px;right:30px;bottom:30px;border:3px solid ${K.crema};border-radius:4px"></div>`;
      C = oscuroC; oscuro = true; fondo = K.bb;
    } else if (fam === 'collage') {
      // Texto arriba, foto abajo. Polaroid: foto al centro con borde blanco.
      const largo = ['lista', 'error'].includes(p.forma);
      const yFoto = Math.round(H * (largo ? 0.56 : 0.46)), hFoto = H - yFoto - 170;
      if (E.polaroid) {
        const w = Math.min(W - PAD * 2 - 44, Math.round(hFoto * 0.82)), x = Math.round((W - w) / 2);
        capas += `<div style="position:absolute;left:${x - 22}px;top:${yFoto - 22}px;width:${w + 44}px;height:${hFoto + 80}px;background:#fffdf8;box-shadow:0 14px 36px rgba(40,30,15,.2)"></div>`;
        capas += fotoBg(foto, url, { x, y: yFoto, w, h: hFoto - 14 }, 0.4);
        centrar = true;
      } else capas += fotoBg(foto, url, { x: PAD, y: yFoto, w: W - PAD * 2, h: hFoto }, 0.4, 'border-radius:22px');
      caja.t = PAD + (E.numero ? 64 : 0); caja.b = H - yFoto + 40; just = pos === 'abajo' ? 'flex-end' : pos === 'arriba' ? 'flex-start' : 'center';
      if (E.numero) extra += `<div style="position:absolute;left:${PAD}px;top:${PAD}px;font-family:'Sans';font-weight:700;font-size:26px;letter-spacing:.12em;color:${K.terra}">[${String(i + 1).padStart(2, '0')}]</div>`;
    } else if (fam === 'esquina') {
      const w = 330, h = 440;
      capas += fotoBg(foto, url, { x: W - PAD - w, y: PAD, w, h }, 0.4, 'border-radius:200px 200px 22px 22px');
      caja.t = PAD + h + 44; just = pos === 'abajo' ? 'flex-end' : pos === 'centro' ? 'center' : 'flex-start';
    } else if (fam === 'tarjeta') {
      const hF = Math.round(H * 0.56);
      capas += fotoBg(foto, url, { x: 0, y: 0, w: W, h: hF }, 0.42);
      caja.t = hF - 90; caja.l = PAD - 24; caja.r = PAD - 24; just = 'flex-start'; tarjeta = true;
    } else {
      // Sin foto: el fondo del estilo (crema) o, en los estilos de foto a sangre, un fondo oscuro de la marca.
      if (E.fam === 'sangre') { fondo = i % 2 ? K.cremaM : K.crema; C = { tit: K.cafe, it: K.olivo, ink: K.negro, acc: K.terra, linea: K.terra + '66' }; }
      just = pos === 'arriba' ? 'flex-start' : pos === 'abajo' ? 'flex-end' : 'center';
      centrar = !!E.polaroid;
    }
    let inner = contenido(C, p, s, E);
    if (tarjeta) inner = `<div style="background:#fffdf8;border-radius:28px;padding:52px 58px;box-shadow:0 20px 50px rgba(40,30,15,.22)">${inner}</div>`;
    const logo = (assets || {})[oscuro ? 'logoC' : 'logoO'];
    const der = E.desliza && i < n - 1 ? `<span style="font-family:'Script';font-size:46px;letter-spacing:0;color:${oscuro ? K.crema : K.cafe}">desliza →</span>` : `<span>${i + 1}/${n}</span>`;
    const pie = `<div style="position:absolute;left:${PAD}px;right:${PAD}px;bottom:56px;display:flex;justify-content:space-between;align-items:center;font-family:'Sans';font-size:28px;letter-spacing:.14em;color:${oscuro ? K.cremaM : K.cafe}">${logo ? `<img src="${logo}" style="height:40px">` : '<span>FLOR PÉRSICO</span>'}${der}</div>`;
    return `<div class="p" style="height:${H}px;background:${fondo};color:${C.ink}">${capas}${extra}<div class="caja" style="left:${caja.l}px;right:${caja.r}px;top:${caja.t}px;bottom:${caja.b}px;justify-content:${just};text-align:${centrar ? 'center' : 'left'}"><div class="ci" style="display:flex;flex-direction:column;gap:${8 * s}px">${inner}</div></div>${pie}</div>`;
  }

  window.Estilos = { ESTILOS, ROLES, aEstilos, desdeForma, llevaFoto, placa, variante, pide, PORTADAS, tplDe };
})();
