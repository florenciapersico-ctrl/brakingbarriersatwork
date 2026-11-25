/* Estilos de carrusel (Flor, 25/11/2026): «diez estilos diferentes; cuando elijo uno, se aplica a todo el posteo.
   Que la letra no sea enorme ni tape toda la slide. Después yo edito el tamaño, dónde lo pongo, el hook y las fotos.»
   Cada estilo es un sistema completo (fondo, colores, tipografías, tamaños, dónde va la foto) y todas las láminas lo comparten.
   Una lámina tiene un ROL (portada, texto, lista, error, tachado, frase, cierre) y el estilo decide cómo se ve. */
(function () {
  const W = 1080, PAD = 96;
  const K = { olivo: '#4b5624', olivoC: '#b7c28a', cafe: '#81552e', terra: '#c68c6c', crema: '#f8f5ee', cremaM: '#ede5cc', calida: '#fbf2d0', bb: '#3f1e0d', negro: '#22201a', blanco: '#fffdf8' };

  // ---------- los 10 estilos ----------
  // portada: 'completa' (foto de fondo con degradé), 'mitad' (foto arriba, texto abajo) o 'texto' (sin foto).
  const ESTILOS = {
    crema:     { n: 'Crema editorial', bg: K.crema, ink: K.negro, tit: K.olivo, it: K.cafe, acc: K.terra, fT: 'Serif', pT: 600, portada: 'mitad', logo: 'O' },
    olivo:     { n: 'Olivo profundo', bg: K.olivo, ink: K.crema, tit: K.crema, it: K.olivoC, acc: K.terra, fT: 'Serif', pT: 600, portada: 'completa', velo: 'rgba(43,50,18,.72)', logo: 'C' },
    cafe:      { n: 'Café cálido', bg: K.bb, ink: K.cremaM, tit: K.crema, it: K.terra, acc: K.terra, fT: 'Serif', pT: 600, portada: 'completa', velo: 'rgba(40,18,6,.74)', logo: 'C' },
    foto:      { n: 'Foto y velo', bg: K.negro, ink: K.crema, tit: K.crema, it: K.calida, acc: K.terra, fT: 'Serif', pT: 600, portada: 'completa', fotoTodas: true, velo: 'rgba(28,22,14,.62)', logo: 'C' },
    papel:     { n: 'Papel', bg: K.calida, ink: K.negro, tit: K.negro, it: K.cafe, acc: K.terra, fT: 'Serif', pT: 600, portada: 'mitad', textura: 'carruseles/fondos/papel-crema.jpg', logo: 'O' },
    notas:     { n: 'Notas', bg: K.cremaM, ink: K.negro, tit: K.negro, it: K.cafe, acc: K.terra, fT: 'Sans', pT: 700, portada: 'completa', tarjeta: true, velo: 'rgba(28,22,14,.35)', logo: 'O' },
    minimal:   { n: 'Minimal', bg: K.blanco, ink: K.negro, tit: K.negro, it: K.cafe, acc: K.terra, fT: 'Sans', pT: 800, portada: 'texto', subraya: true, logo: 'O' },
    serif:     { n: 'Serif suave', bg: K.cremaM, ink: K.negro, tit: K.olivo, it: K.cafe, acc: K.terra, fT: 'Serif', pT: 400, portada: 'mitad', centrado: true, logo: 'O' },
    duo:       { n: 'Dúo crema y olivo', bg: K.crema, ink: K.negro, tit: K.olivo, it: K.cafe, acc: K.terra, fT: 'Serif', pT: 600, portada: 'completa', velo: 'rgba(43,50,18,.7)', alterna: { bg: K.olivo, ink: K.crema, tit: K.crema, it: K.olivoC }, logo: 'O' },
    revista:   { n: 'Revista', bg: K.crema, ink: K.negro, tit: K.cafe, it: K.olivo, acc: K.terra, fT: 'Serif', pT: 600, portada: 'mitad', lateral: true, logo: 'O' },
  };

  // ---------- roles (lo que dice cada lámina) ----------
  // campos: [clave, etiqueta, tipo] · t = línea, a = párrafo, p = una por línea «negrita | resto»
  const ROLES = {
    portada: { n: 'Portada (hook)', c: [['titulo', 'Hook', 'a'], ['titulo_i', 'Segunda parte, en itálica', 'a'], ['bajada', 'Bajada chica (opcional)', 't']] },
    texto: { n: 'Texto', c: [['titulo', 'Título', 'a'], ['titulo_i', 'Itálica', 'a'], ['cuerpo', 'Cuerpo (corto)', 'a']] },
    lista: { n: 'Lista', c: [['titulo', 'Título', 'a'], ['items', '2 a 4 líneas: «negrita | resto»', 'p']] },
    error: { n: 'Error y corrección', c: [['intro', 'Intro (ej.: En español: «…»)', 't'], ['mal', 'Lo que se tacha', 't'], ['bien', 'La versión buena', 'a'], ['nota', 'Nota (opcional)', 'a']] },
    tachado: { n: 'Creencia tachada', c: [['pre', 'Intro', 'a'], ['tachado', 'Lo que se tacha', 't'], ['verdad_i', 'La verdad', 'a']] },
    frase: { n: 'Frase destacada', c: [['pre', 'Frase chica arriba (opcional)', 'a'], ['frase', 'La frase', 'a']] },
    cierre: { n: 'Cierre con CTA', c: [['titulo', 'Título', 'a'], ['titulo_i', 'Itálica', 'a'], ['cuerpo', 'Texto (opcional)', 'a'], ['cta', 'Botón: Comenta ENTRENAR / Guárdalo…', 't']] },
  };

  // De las formas del motor viejo a los roles nuevos (no se pierde texto).
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
  const DE_RECETA = { editorial: 'crema', tarjetas: 'notas', historia: 'cafe', serif: 'olivo' };
  function aEstilos(c) {
    if (!ESTILOS[c.estilo]) c.estilo = DE_RECETA[c.receta] || 'crema';
    c.placas = (c.placas || []).map((p, i) => { const n = ROLES[p.forma] ? p : desdeForma(p); if (i === 0 && n.forma !== 'portada') { n.forma = 'portada'; n.titulo = n.titulo || [n.pre, n.tachado, n.frase].filter(Boolean).join(' '); } return n; });
    return c;
  }

  // ---------- qué láminas llevan foto ----------
  function variante(E, p) { return p.variante || E.portada; }
  function llevaFoto(c, p, i) {
    const E = ESTILOS[c.estilo] || ESTILOS.crema;
    if (p.conFoto === false) return false;
    if (p.forma === 'portada') return variante(E, p) !== 'texto';
    return !!(E.fotoTodas || E.lateral || p.conFoto);
  }

  // ---------- dibujo ----------
  const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const md = (t) => esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
  // Tamaño según el largo del texto: nunca enorme. Después lo ajusta la escala de la lámina.
  const tam = (base, txt) => { const n = String(txt || '').length; return Math.round(base * (n > 140 ? 0.62 : n > 100 ? 0.7 : n > 70 ? 0.8 : n > 40 ? 0.9 : 1)); };
  const pares = (t) => String(t || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const i = l.indexOf('|'); return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()]; });

  function colores(E, i) { return E.alterna && i % 2 === 1 ? { ...E, ...E.alterna } : E; }
  function fotoBg(e, url, modo, estilo) { return `<div class="bg" data-foto="${esc(e.archivo)}" data-modo="${modo || 'cover'}" data-src="${esc(url)}" style="background-image:url('${esc(url)}');background-position:${e.tipo === 'fondo' ? 'center' : 'center top'};${estilo || ''}"></div>`; }

  function contenido(C, p, i, n, H, s) {
    const T = (txt, base, opt = {}) => (txt ? `<div data-fs="${tam(base, txt) * s}" style="font-family:'${opt.f || C.fT}';font-weight:${opt.w || C.pT};font-size:${tam(base, txt) * s}px;line-height:${opt.lh || 1.14};letter-spacing:${opt.ls || '-.02em'};color:${opt.col || C.tit};font-style:${opt.it ? 'italic' : 'normal'};${opt.css || ''}">${md(txt)}</div>` : '');
    const IT = (txt, base) => T(txt, base, { f: 'Serif', w: 400, it: true, col: C.it, ls: '-.015em' });
    const BODY = (txt, base = 38) => T(txt, base, { f: 'Sans', w: 400, col: C.ink, lh: 1.42, ls: '0' });
    const subr = C.subraya ? `text-decoration:underline;text-decoration-color:${C.acc};text-decoration-thickness:6px;text-underline-offset:10px;` : '';
    switch (p.forma) {
      case 'portada': return `${T(p.titulo, 86, { css: subr })}${IT(p.titulo_i, 74)}${p.bajada ? `<div data-fs="${26 * s}" style="font-family:'Sans';font-weight:700;font-size:${26 * s}px;letter-spacing:.12em;text-transform:uppercase;color:${C.acc};margin-top:10px">${esc(p.bajada)}</div>` : ''}`;
      case 'texto': return `${T(p.titulo, 72)}${IT(p.titulo_i, 64)}${p.cuerpo ? `<div style="height:${14 * s}px"></div>${BODY(p.cuerpo)}` : ''}`;
      case 'lista': return `${T(p.titulo, 62)}<div style="height:${18 * s}px"></div>${pares(p.items).map(([a, b], k) => `<div style="display:flex;gap:${22 * s}px;align-items:baseline;padding:${16 * s}px 0;border-top:2px solid ${C.acc}55"><div style="font-family:'Serif';font-style:italic;font-size:${40 * s}px;color:${C.acc};min-width:${48 * s}px">${String(k + 1).padStart(2, '0')}</div><div data-fs="${34 * s}" style="font-family:'Sans';font-size:${36 * s}px;line-height:1.35;color:${C.ink}"><b>${md(a)}</b>${b ? ' ' + md(b) : ''}</div></div>`).join('')}`;
      case 'error': return `${BODY(p.intro, 30)}<div style="height:${18 * s}px"></div>${T(p.mal, 60, { f: 'Sans', w: 700, col: C.ink, css: `text-decoration:line-through;text-decoration-color:${C.acc};text-decoration-thickness:6px;opacity:.75` })}<div style="height:${14 * s}px"></div>${IT(p.bien, 64)}${p.nota ? `<div style="height:${14 * s}px"></div>${BODY(p.nota, 30)}` : ''}`;
      case 'tachado': return `${BODY(p.pre, 32)}<div style="height:${14 * s}px"></div>${T(p.tachado, 66, { css: `text-decoration:line-through;text-decoration-color:${C.acc};text-decoration-thickness:7px` })}<div style="height:${18 * s}px"></div>${IT(p.verdad_i, 60)}`;
      case 'frase': return `${p.pre ? BODY(p.pre, 30) + `<div style="height:${16 * s}px"></div>` : ''}${IT(p.frase, 74)}`;
      case 'cierre': return `${T(p.titulo, 70)}${IT(p.titulo_i, 62)}${p.cuerpo ? `<div style="height:${12 * s}px"></div>${BODY(p.cuerpo, 32)}` : ''}${p.cta ? `<div style="margin-top:${30 * s}px"><span style="display:inline-block;background:${C.acc};color:#fff;font-family:'Sans';font-weight:700;font-size:${30 * s}px;padding:${16 * s}px ${34 * s}px;border-radius:999px">${esc(p.cta)}</span></div>` : ''}`;
      default: return '';
    }
  }

  // Dibuja una lámina. foto = entrada del catálogo (o null), url = su URL, assets = {logoO, logoC}.
  function placa(c, i, H, foto, url, assets) {
    const E = ESTILOS[c.estilo] || ESTILOS.crema, p = c.placas[i], n = c.placas.length;
    const C = colores(E, i), s = Math.min(1.35, Math.max(0.65, +p.escala || 1));
    const conFoto = llevaFoto(c, p, i) && foto;
    const v = p.forma === 'portada' ? variante(E, p) : null;
    let capas = '', caja = { l: PAD, r: PAD, t: PAD + 20, b: PAD + 70 }, fondo = C.bg, ink = C, tarjeta = !!E.tarjeta;
    if (E.textura && !conFoto) capas += `<div class="bg" data-foto="textura" data-modo="cover" data-src="${E.textura}" style="background-image:url('${E.textura}');background-position:center"></div>`;
    if (conFoto) {
      if (p.forma === 'portada' && v === 'mitad') { capas += fotoBg(foto, url, 'cover', `bottom:${Math.round(H * 0.42)}px`); caja.t = Math.round(H * 0.58) + 44; tarjeta = false; }
      else if (E.lateral && p.forma !== 'portada') { capas += fotoBg(foto, url, 'cover', `right:${Math.round(W * 0.58)}px`); caja.l = Math.round(W * 0.42) + 60; caja.r = 72; }
      else {
        capas += fotoBg(foto, url, 'cover');
        const velo = E.velo || 'rgba(28,22,14,.6)';
        capas += p.forma === 'portada' ? `<div class="bg" style="background:linear-gradient(180deg,rgba(0,0,0,0) 30%,${velo} 70%)"></div>` : `<div class="bg" style="background:${velo}"></div>`;
        if (!tarjeta) ink = { ...C, tit: K.crema, it: K.calida, ink: K.cremaM };
      }
    }
    const pos = p.pos || (p.forma === 'portada' && conFoto && v === 'completa' ? 'abajo' : E.centrado ? 'centro' : 'centro');
    const just = pos === 'arriba' ? 'flex-start' : pos === 'abajo' ? 'flex-end' : 'center';
    const centrar = E.centrado && !(E.lateral && conFoto);
    let inner = contenido(ink, p, i, n, H, s);
    if (tarjeta) inner = `<div style="background:#fffdf8;border-radius:28px;padding:${52}px ${56}px;box-shadow:0 18px 50px rgba(40,30,15,.22);color:${K.negro}">${contenido({ ...E, tit: K.negro, it: K.cafe, ink: K.negro }, p, i, n, H, s)}</div>`;
    const oscuro = !tarjeta && (ink.tit === K.crema || C.bg === K.olivo || C.bg === K.bb || C.bg === K.negro);
    const logo = (assets || {})[oscuro ? 'logoC' : 'logoO'];
    const pie = `<div style="position:absolute;left:${PAD}px;right:${PAD}px;bottom:52px;display:flex;justify-content:space-between;align-items:center;font-family:'Sans';font-size:22px;letter-spacing:.14em;color:${oscuro ? K.cremaM : K.cafe}">${logo ? `<img src="${logo}" style="height:40px">` : '<span>FLOR PÉRSICO</span>'}<span>${i + 1}/${n}</span></div>`;
    return `<div class="p" style="height:${H}px;background:${fondo};color:${ink.ink}">${capas}<div class="caja" style="left:${caja.l}px;right:${caja.r}px;top:${caja.t}px;bottom:${caja.b}px;justify-content:${just};text-align:${centrar ? 'center' : 'left'};gap:${10 * s}px">${inner}</div>${pie}</div>`;
  }

  window.Estilos = { ESTILOS, ROLES, aEstilos, desdeForma, llevaFoto, placa, variante };
})();
