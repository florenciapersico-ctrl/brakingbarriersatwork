// AT WORK · app de alumnas. Una vista por vez, según el #hash de la URL.
(function () {
  const P = window.PROGRAMA, DB = window.DB;
  const root = document.getElementById('root');
  const IA = DB.demo || !!(window.ATW_CONFIG || {}).FLOR_AI_ACTIVA; // Flor AI dentro de la app
  const st = { perfil: null, programa: {}, admin: false, chat: null, pendiente: null, enviando: false };

  // ---------- utilidades ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fecha = (iso, opt = { day: 'numeric', month: 'short' }) => { if (!iso) return ''; const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso); return d.toLocaleDateString('es', opt); };
  const url = (u) => (/^https?:\/\//i.test(u || '') ? u : '');
  let tt;
  function toast(msg, err) {
    let t = $('.toast'); if (!t) { t = document.createElement('div'); document.body.appendChild(t); }
    t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg; t.hidden = false;
    clearTimeout(tt); tt = setTimeout(() => { t.hidden = true; }, err ? 6000 : 2800);
  }
  async function intentar(fn, okMsg) {
    try { const r = await fn(); if (okMsg) toast(okMsg); return r; } catch (e) { console.error(e); toast(e.message || 'Algo falló. Intenta de nuevo.', true); throw e; }
  }

  // Markdown chico y seguro para las respuestas de Flor AI (negrita, listas, títulos, tablas).
  function inline(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  function md(txt) {
    const L = String(txt || '').replace(/\r/g, '').split('\n'); let h = '', i = 0;
    while (i < L.length) {
      const l = L[i];
      if (/^\s*\|/.test(l)) {
        const rows = []; while (i < L.length && /^\s*\|/.test(L[i])) rows.push(L[i++]);
        const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        const body = rows.filter((r) => !/^\s*\|?\s*:?-{2,}/.test(r));
        const [head, ...rest] = body;
        h += '<div class="tbl"><table><thead><tr>' + cells(head).map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
          rest.map((r) => '<tr>' + cells(r).map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
        continue;
      }
      if (/^\s*[-*•]\s+/.test(l)) { h += '<ul>'; while (i < L.length && /^\s*[-*•]\s+/.test(L[i])) h += '<li>' + inline(L[i++].replace(/^\s*[-*•]\s+/, '')) + '</li>'; h += '</ul>'; continue; }
      if (/^\s*\d+[.)]\s+/.test(l)) { h += '<ol>'; while (i < L.length && /^\s*\d+[.)]\s+/.test(L[i])) h += '<li>' + inline(L[i++].replace(/^\s*\d+[.)]\s+/, '')) + '</li>'; h += '</ol>'; continue; }
      if (/^#{1,4}\s/.test(l)) { h += '<h4>' + inline(l.replace(/^#+\s/, '')) + '</h4>'; i++; continue; }
      if (/^\s*(---|___)\s*$/.test(l)) { i++; continue; }
      if (!l.trim()) { i++; continue; }
      let p = l; i++;
      while (i < L.length && L[i].trim() && !/^\s*([-*•]\s|\d+[.)]\s|\||#)/.test(L[i])) p += '\n' + L[i++];
      h += '<p>' + inline(p).replace(/\n/g, '<br>') + '</p>';
    }
    return h;
  }

  const I = {
    semana: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    flor: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
    feedback: '<path d="M4 4h16v12H8l-4 4z"/><path d="M9 10l2 2 4-4"/>',
    weekly: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4M16 2v4M8 11h8M8 15h5"/>',
    camino: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
    coaches: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    progreso: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    empieza: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    proceso: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>',
    bandeja: '<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
    alumnas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 5.8"/>',
    ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.7 4.4V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>'
  };
  const svg = (k) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[k] + '</svg>';
  const GRUPOS = [
    ['Tu programa', [['semana', 'Mi semana'], ['camino', 'Mi camino'], ['empieza', 'Empieza acá']]],
    ['Con Flor', [['flor', 'Flor AI'], ['feedback', 'Pedir feedback'], ['weekly', 'Weekly report']]],
    ['Tu práctica', [['coaches', 'Mis coaches'], ['proceso', 'Mi proceso'], ['progreso', 'Mi progreso']]]
  ];
  const VISTAS = GRUPOS.flatMap((g) => g[1]);
  const TITULOS = Object.fromEntries(VISTAS.concat([['bandeja', 'Bandeja'], ['alumnas', 'Alumnas'], ['ajustes', 'Programa']]));
  const ADMIN = [['bandeja', 'Bandeja'], ['alumnas', 'Alumnas'], ['ajustes', 'Programa']];

  // ---------- arranque y sesión ----------
  const hashInicial = location.hash;
  let necesitaClave = /type=(invite|recovery)/.test(hashInicial);

  async function boot() {
    DB.onAuth((ev) => {
      if (ev === 'PASSWORD_RECOVERY') { necesitaClave = true; pantallaClave(); }
      if (ev === 'SIGNED_OUT') pantallaLogin();
    });
    let s = null;
    try { s = await DB.sesion(); } catch (e) { console.error(e); }
    if (!s) return pantallaLogin();
    if (necesitaClave) return pantallaClave();
    entrar();
  }

  function marcoAuth(inner) {
    root.innerHTML = '<div class="auth"><form class="card" novalidate><div class="logo">AT WORK<small>Breaking Barriers</small></div>' + inner + '</form></div>';
    return $('.auth form');
  }

  function pantallaLogin(modo) {
    if (modo === 'olvide') {
      const f = marcoAuth('<h2>Recuperar contraseña</h2><p class="muted small">Te mandamos un mail con un link para crear una nueva.</p>' +
        '<div class="field"><label for="em">Tu mail</label><input id="em" type="email" autocomplete="email" required></div>' +
        '<button class="btn" type="submit">Mandarme el link</button><p id="msg" class="small"></p><button type="button" class="linkbtn small" id="volver">Volver a entrar</button>');
      $('#volver').onclick = () => pantallaLogin();
      f.onsubmit = async (e) => {
        e.preventDefault();
        try { await DB.recuperar($('#em').value.trim()); $('#msg').textContent = 'Listo. Revisa tu mail (y la carpeta de spam).'; }
        catch (er) { $('#msg').innerHTML = '<span class="err-text">' + esc(er.message) + '</span>'; }
      };
      return;
    }
    const f = marcoAuth('<h2>Hola, Fluent Queen.</h2><p class="muted small">Entra con el mail con el que te inscribiste en AT WORK.</p>' +
      (DB.demo ? '<p class="note">Versión demo: toca <b>Entrar</b> sin completar nada.</p>' : '') +
      '<div class="field"><label for="em">Mail</label><input id="em" type="email" autocomplete="email"></div>' +
      '<div class="field"><label for="pw">Contraseña</label><input id="pw" type="password" autocomplete="current-password"></div>' +
      '<button class="btn" type="submit">Entrar</button><p id="msg" class="small"></p>' +
      '<button type="button" class="linkbtn small" id="olv">Olvidé mi contraseña</button>' +
      '<p class="muted small">¿Todavía no tienes acceso? Escríbele a Flor por WhatsApp.</p>');
    $('#olv').onclick = () => pantallaLogin('olvide');
    f.onsubmit = async (e) => {
      e.preventDefault(); const b = $('button[type=submit]', f); b.disabled = true;
      try { await DB.login($('#em').value.trim(), $('#pw').value); await DB.sesion(); entrar(); }
      catch (er) { $('#msg').innerHTML = '<span class="err-text">' + (/invalid/i.test(er.message) ? 'Mail o contraseña incorrectos.' : esc(er.message)) + '</span>'; b.disabled = false; }
    };
  }

  function pantallaClave() {
    const f = marcoAuth('<h2>Crea tu contraseña</h2><p class="muted small">La vas a usar para entrar a tu espacio de AT WORK. Mínimo 8 caracteres.</p>' +
      '<div class="field"><label for="pw">Contraseña nueva</label><input id="pw" type="password" autocomplete="new-password" minlength="8"></div>' +
      '<div class="field"><label for="pw2">Repítela</label><input id="pw2" type="password" autocomplete="new-password"></div>' +
      '<button class="btn" type="submit">Guardar y entrar</button><p id="msg" class="small"></p>' + (st.perfil ? '<button type="button" class="linkbtn small" id="volver">Volver</button>' : ''));
    if ($('#volver')) $('#volver').onclick = () => entrar();
    f.onsubmit = async (e) => {
      e.preventDefault(); const a = $('#pw').value, b = $('#pw2').value;
      if (a.length < 8) return ($('#msg').innerHTML = '<span class="err-text">Tiene que tener al menos 8 caracteres.</span>');
      if (a !== b) return ($('#msg').innerHTML = '<span class="err-text">Las dos contraseñas no coinciden.</span>');
      try { await DB.cambiarClave(a); necesitaClave = false; history.replaceState(null, '', location.pathname + location.search + '#empieza'); entrar(); }
      catch (er) { $('#msg').innerHTML = '<span class="err-text">' + esc(er.message) + '</span>'; }
    };
  }

  async function entrar() {
    try {
      [st.perfil, st.programa] = await Promise.all([DB.miPerfil(), DB.programa().catch(() => ({}))]);
    } catch (e) {
      root.innerHTML = '<div class="auth"><div class="card"><h2>No pudimos cargar tu espacio</h2><p class="muted">' + esc(e.message) + '</p><button class="btn" id="re">Reintentar</button><button class="linkbtn small" id="out">Salir</button></div></div>';
      $('#re').onclick = entrar; $('#out').onclick = () => DB.logout();
      return;
    }
    st.programa = st.programa || {};
    st.admin = st.perfil.rol === 'admin';
    shell();
    if (!location.hash || /access_token|type=/.test(location.hash)) location.replace('#' + (st.admin && !DB.demo ? 'bandeja' : 'semana'));
    ruta();
  }

  function navHTML(tab) {
    const it = ([id, l]) => '<a href="#' + id + '" data-v="' + id + '">' + svg(id) + '<span>' + l + '</span>' + (id === 'bandeja' ? '<span class="badge"' + (tab ? '' : ' id="bdg"') + ' hidden></span>' : '') + '</a>';
    if (tab) return (st.admin && !DB.demo ? ADMIN.concat(VISTAS) : VISTAS).map(it).join('');
    return GRUPOS.map(([g, vs]) => '<div class="sep">' + g + '</div>' + vs.map(it).join('')).join('') + (st.admin ? '<div class="sep">Panel de Flor</div>' + ADMIN.map(it).join('') : '');
  }
  function saludo() { const h = new Date().getHours(); return h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches'; }
  function iniciales(n) { return String(n || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join(''); }

  function shell() {
    const nom = st.perfil.nombre || st.perfil.email || '';
    root.innerHTML = '<div class="shell"><aside class="side"><div class="logo"><span class="tilde">~</span>AT WORK<small>Breaking Barriers</small></div><nav class="main">' + navHTML() + '</nav>' +
      '<div class="foot">' + (DB.demo ? '<span class="demo">Versión demo</span><button class="linkbtn" id="reset">Reiniciar datos de ejemplo</button>' : '') +
      '<button class="linkbtn" id="clave">Cambiar contraseña</button><button class="linkbtn" id="salir">Cerrar sesión</button></div></aside>' +
      '<div class="mainwrap"><header class="topbar"><span class="tb-title" id="tbt"></span><span class="tb-sp"></span>' +
      '<span class="fmt">' + (fmt(st.perfil) === '1:1' ? 'Private' : 'Lab') + '</span><span class="who"><span class="av">' + esc(iniciales(nom)) + '</span><span class="nm">' + esc(nom.split(' ')[0]) + '</span></span></header>' +
      '<main id="app"></main></div></div><nav class="tabbar">' + navHTML(true) + '</nav>';
    $('#salir').onclick = () => DB.logout();
    $('#clave').onclick = () => pantallaClave();
    if ($('#reset')) $('#reset').onclick = () => { DB.reiniciar(); location.reload(); };
    if (st.admin) contarBandeja();
  }

  async function contarBandeja() {
    try {
      const [p, w] = await Promise.all([DB.todosPedidos(), DB.todosWeeklies()]);
      const n = p.filter((x) => x.estado === 'pendiente').length + w.filter((x) => !x.respuesta_flor).length;
      $$('#bdg, .tabbar .badge').forEach((b) => { b.textContent = n; b.hidden = !n; });
    } catch (e) { /* no es crítico */ }
  }

  window.addEventListener('hashchange', () => { if (st.perfil) ruta(); });

  async function ruta() {
    const [v, ...args] = location.hash.replace(/^#/, '').split('/');
    const vista = V[v] && (!ADMIN.some(([id]) => id === v) || st.admin) ? v : 'semana';
    $$('nav a').forEach((a) => (a.dataset.v === vista ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    if ($('#tbt')) $('#tbt').textContent = TITULOS[vista] || '';
    const app = $('#app');
    app.innerHTML = '<div class="view"><p class="muted">Cargando…</p></div>';
    try {
      const html = await V[vista].html(...args);
      app.innerHTML = '<div class="view">' + html + '</div>';
      if (V[vista].mount) await V[vista].mount(...args);
    } catch (e) {
      console.error(e);
      app.innerHTML = '<div class="view"><section class="card"><h3>No pudimos cargar esta sección</h3><p class="muted">' + esc(e.message) + '</p><div class="row"><button class="btn" onclick="location.reload()">Reintentar</button></div></section></div>';
    }
    window.scrollTo(0, 0);
  }

  // Botones "preguntale a Flor AI" en cualquier vista
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ask]'); if (!b) return;
    st.pendiente = { texto: b.dataset.ask, coach: b.dataset.coach || 'flor', enviar: b.dataset.send !== 'no' };
    if (location.hash === '#flor') ruta(); else location.hash = 'flor';
  });

  // ---------- camino de 5 meses ----------
  const COACHES_URL = '../coaches/';
  const fmt = (perfil) => ((perfil && perfil.formato) === '1:1' ? '1:1' : 'LAB');
  const wq = (perfil) => P.weeklyPorFormato[fmt(perfil)];
  const onbDe = (perfil) => P.onboardingPorFormato[fmt(perfil)];
  function semanaDe(perfil) {
    if (!perfil || !perfil.fecha_inicio) return null;
    const d = Math.floor((Date.now() - new Date(perfil.fecha_inicio + 'T00:00:00')) / (7 * 864e5)) + 1;
    return Math.max(1, Math.min(20, d));
  }
  function semanaCamino(n) {
    for (const m of P.camino) for (const s of m.semanas) if (s.s.includes(n)) return { mes: m, sem: s };
    return null;
  }
  const todasTareas = () => P.camino.flatMap((m) => m.semanas.flatMap((s) => s.tareas));
  const TAG = { orientacion: 'Orientación', evidencia: 'Evidencia', habito: 'Hábito', comunidad: 'Comunidad', clase: 'Clase', practica: 'Práctica', coach: 'Coach', material: 'Material', envivo: 'En vivo', playbook: 'Playbook', worksheet: 'Worksheet' };
  function accionTarea(t) {
    if (t.onb) { const l = (P.onbLinks[fmt(st.perfil)] || {})[t.onb]; return l ? `<a class="linkbtn small" href="${esc(l)}" target="_blank" rel="noopener">Ver clase</a>` : ''; }
    if (t.ir) return `<a class="linkbtn small" href="${t.ir}">Ir</a>`;
    if (t.coaches && !(/clase/.test(t.tipo) && t.link)) return `<a class="linkbtn small" href="#coaches">Mis coaches</a>`;
    if (t.reservar && url(links().reservar)) return `<a class="linkbtn small" href="${esc(links().reservar)}" target="_blank" rel="noopener">Reservar</a>`;
    if (t.comunidad && url(links().comunidad)) return `<a class="linkbtn small" href="${esc(links().comunidad)}" target="_blank" rel="noopener">Comunidad</a>`;
    if (/clase/.test(t.tipo) && !t.pronto) { const l = url(t.link) || url(links().plataforma); return l ? `<a class="linkbtn small" href="${esc(l)}" target="_blank" rel="noopener">Ver clase</a>` : ''; }
    return '';
  }
  function filaTarea(t, hechas) {
    const tags = t.tipo.split(' ').map((x) => TAG[x] || x).join(' + ');
    return `<li><label><input type="checkbox" data-cam="${t.id}" ${hechas.includes(t.id) ? 'checked' : ''}><div><div class="t">${esc(t.texto)}</div>
      <div class="where">${tags} · ${esc(t.donde)} ${t.pronto ? '<span class="pill warn">En grabación · se publica pronto</span>' : ''} ${accionTarea(t)}</div></div></label></li>`;
  }
  function montarCamino(root) {
    root.addEventListener('change', (e) => {
      const i = e.target; if (!i.dataset || !i.dataset.cam) return;
      const set = new Set(st.perfil.camino_hecho || []);
      i.checked ? set.add(i.dataset.cam) : set.delete(i.dataset.cam);
      st.perfil.camino_hecho = [...set];
      $$('[data-cam="' + i.dataset.cam + '"]').forEach((x) => { x.checked = i.checked; });
      $$('[data-camcount]').forEach((x) => { x.textContent = contarCamino(); });
      intentar(() => DB.guardarMiPerfil({ camino_hecho: st.perfil.camino_hecho })).catch(() => {});
    });
  }
  const contarCamino = () => { const ids = new Set(todasTareas().map((t) => t.id)); return (st.perfil.camino_hecho || []).filter((x) => ids.has(x)).length + ' de ' + ids.size + ' tareas'; };
  async function abrirArchivo(path) {
    try { const u = await DB.urlArchivo(path); if (u && u !== '#') window.open(u, '_blank', 'noopener'); else toast('En la demo los archivos no se abren.'); }
    catch (e) { toast(e.message, true); }
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-archivo]'); if (b) { e.preventDefault(); abrirArchivo(b.dataset.archivo); } });
  const adjunto = (x) => (x.archivo ? `<button type="button" class="linkbtn small" data-archivo="${esc(x.archivo)}">📎 ${esc(x.archivo_nombre || 'Archivo adjunto')}</button>` : '');

  // ---------- cálculos ----------
  function racha(weeklies) {
    const env = new Set(weeklies.filter((w) => w.enviado_en).map((w) => w.semana));
    const sem = (n) => { const d = new Date(DB.lunes() + 'T12:00:00'); d.setDate(d.getDate() - 7 * n); return DB.lunes(d); };
    let n = env.has(sem(0)) ? 0 : 1, actual = 0;
    while (env.has(sem(n))) { actual++; n++; }
    const orden = [...env].sort(); let rec = 0, run = 0, prev = null;
    for (const s of orden) { const d = new Date(s + 'T12:00:00'); if (prev && (d - prev) / 864e5 <= 8) run++; else run = 1; rec = Math.max(rec, run); prev = d; }
    const celdas = []; for (let k = 6; k >= 0; k--) celdas.push({ s: sem(k), on: env.has(sem(k)), hoy: k === 0 });
    return { actual, rec, celdas, hoyHecho: env.has(sem(0)) };
  }
  const lab = () => st.programa.proximo_lab || {};
  const links = () => st.programa.links || {};
  const fixes = (c) => (c || []).map((x) => '<div class="fix"><s>' + esc(x.mal) + '</s><span class="arr muted">→</span><b>' + esc(x.bien) + '</b></div>').join('');

  // ======================= Vistas =======================
  const V = {};

  // ---------- Mi semana ----------
  function ring(pct, label) {
    const r = 26, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pct));
    return `<svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" class="rb"/><circle cx="32" cy="32" r="${r}" class="rf" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v / 100)}"/><text x="32" y="36" text-anchor="middle">${label ?? Math.round(v) + '%'}</text></svg>`;
  }
  function avanceCamino(p) {
    const ids = todasTareas().map((t) => t.id), h = new Set(p.camino_hecho || []);
    const hechas = ids.filter((x) => h.has(x)).length;
    return { hechas, total: ids.length, pct: ids.length ? (100 * hechas) / ids.length : 0 };
  }
  function loQueSigue(p) {
    const n = semanaDe(p) || 1, h = new Set(p.camino_hecho || []);
    for (const m of P.camino) for (const s of m.semanas) for (const t of s.tareas) {
      if (Math.min(...s.s) > n) return null;
      if (!h.has(t.id) && !t.pronto) return { t, s, m };
    }
    return null;
  }
  function etapasHTML(n) {
    const e = n ? etapaDe(n) : -1;
    return `<div class="stepper">${P.recorrido.map((r, i) => `<div class="${i < e ? 'done' : i === e ? 'on' : ''}"><i>${i < e ? '✓' : i}</i><b>${esc(r.etapa)}</b><span>${esc(r.cuando)}</span></div>`).join('')}</div>`;
  }

  V.semana = {
    async html() {
      const [tareas, weeklies, pedidos] = await Promise.all([DB.tareas(), DB.weeklies(), DB.pedidos()]);
      st._tareas = tareas;
      const p = st.perfil, r = racha(weeklies), l = lab(), n = semanaDe(p), av = avanceCamino(p), sig = loQueSigue(p);
      const fb = pedidos.find((x) => x.estado === 'respondido');
      const nombre = (p.nombre || '').split(' ')[0];
      const aviso = st.programa.aviso ? '<p class="note">' + esc(st.programa.aviso) + '</p>' : '';
      const sinOnb = (p.onboarding || []).length < onbDe(p).checklist.length;
      const cs = n ? semanaCamino(n) : null;
      const hechasSem = cs ? cs.sem.tareas.filter((t) => (p.camino_hecho || []).includes(t.id)).length : 0;
      const enVivo = fmt(p) === '1:1'
        ? { t: 'Tu clase 1:1', d: 'Una vez por semana, en tu horario fijo con Flor.', link: '' }
        : { t: l.fecha ? esc(l.fecha) : 'Lab de los sábados', d: l.fecha ? esc(l.horario || '') + (l.tema ? ' · ' + esc(l.tema) : '') : '15:30 a 16:30 de Argentina (12:30 MX y CR, 13:30 CO)', link: url(l.link) || 'https://meet.google.com/gow-vnpg-xhx' };
      return `
<div class="hero"><div><h1>${saludo()}${nombre ? ', ' + esc(nombre) : ''}<span class="punto">.</span></h1>
  <p class="muted">${n ? `Semana ${n} de 20 · Mes ${cs.mes.n} · ${esc(cs.mes.titulo)}` : 'Tu espacio de AT WORK: todo lo de tu programa, en un solo lugar.'}</p></div>
  <div class="row"><a class="btn ghost" href="#weekly">${r.hoyHecho ? 'Ver mi weekly' : 'Completar mi weekly'}</a><a class="btn" href="#feedback">Pedir feedback</a></div></div>
${aviso}
${sinOnb && !weeklies.length ? `<section class="card feature"><span class="eyebrow">Tu primera semana</span><h2>Empieza por tu onboarding</h2><p class="muted">Dónde está cada cosa, tu punto de partida y tu primera práctica. Con calma: entender todo lleva unas dos semanas.</p><div class="row"><a class="btn" href="#empieza">Ir a Empieza acá</a></div></section>` : ''}
<div class="kpis">
  <section class="card kpi"><span class="eyebrow">Tu camino</span><div class="kv">${ring(av.pct)}<span><b>${av.hechas} de ${av.total}</b><br><span class="muted small">tareas del programa</span></span></div></section>
  <section class="card kpi"><span class="eyebrow">Esta semana</span><div class="kv"><span class="big">${cs ? hechasSem + '<small>/' + cs.sem.tareas.length + '</small>' : '–'}</span><span class="muted small">${cs ? esc(cs.sem.titulo) : 'Flor carga tu fecha de inicio'}</span></div></section>
  <section class="card kpi"><span class="eyebrow">Weekly · constancia</span><div class="kv"><span class="big">${r.actual}</span><span class="muted small">${r.actual === 1 ? 'lunes seguido' : 'lunes seguidos'}<br>Récord: ${r.rec}</span></div>
    <div class="streak">${r.celdas.map((c) => `<div class="${c.on ? 'on' : ''} ${c.hoy ? 'now' : ''}" title="${fecha(c.s)}">${c.on ? '✓' : c.hoy ? 'Hoy' : ''}</div>`).join('')}</div></section>
  <section class="card kpi"><span class="eyebrow">${fmt(p) === '1:1' ? 'En vivo con Flor' : 'Tu próximo lab'}</span><b class="kt">${enVivo.t}</b><span class="muted small">${enVivo.d}</span>${enVivo.link ? `<a class="small" href="${esc(enVivo.link)}" target="_blank" rel="noopener">Entrar al lab ›</a>` : ''}</section>
</div>
<div class="grid g-2">
  <section class="card next"><span class="eyebrow">Lo que sigue</span>
    ${sig ? `<h2>${esc(sig.t.texto)}</h2><p class="muted small">Semana ${sig.s.s.join(' y ')} · ${esc(sig.s.titulo)} · ${esc(sig.t.donde)}</p><div class="row">${accionTarea(sig.t).replace('linkbtn small', 'btn')}<a class="btn ghost" href="#camino">Ver mi camino</a></div>`
      : n ? '<h2>Estás al día con tu camino</h2><p class="muted small">Usa esta semana para practicar con tu material real y mandárselo a Flor.</p><div class="row"><a class="btn" href="#feedback">Mandar material real</a></div>'
        : '<h2>Tu camino de 20 semanas</h2><p class="muted small">Cuando Flor cargue tu fecha de inicio, acá vas a ver exactamente qué te toca.</p><div class="row"><a class="btn ghost" href="#camino">Ver mi camino</a></div>'}
  </section>
  ${p.foco_titulo ? `<section class="card feature"><span class="eyebrow">Tu foco de esta semana · lo eligió Flor</span><h2>${esc(p.foco_titulo)}</h2>${p.foco_texto ? '<p class="muted">' + esc(p.foco_texto) + '</p>' : ''}
    <div class="row"><button class="btn" type="button" data-ask="Quiero practicar mi foco de esta semana: ${esc(p.foco_titulo)}">Practicarlo con Flor AI</button></div></section>`
    : `<section class="card empty-state"><span class="eyebrow">Tu foco de esta semana</span><h3>Flor lo elige con tu material</h3><p class="muted small">Cuando le mandes una reunión real o una práctica desde “Pedir feedback”, Flor te dice qué entrenar.</p><a class="btn ghost" href="#feedback">Pedir feedback</a></section>`}
</div>
${caminoSemanaHTML(p)}
<div class="grid g-2">
  <section class="card">
    <div class="row between"><h3>Tareas que te dejó Flor</h3><span class="pill" id="taskCount"></span></div>
    ${tareas.length ? '<ul class="tasks" id="tasks">' + tareas.map((t) => `<li><label><input type="checkbox" data-id="${t.id}" ${t.hecha ? 'checked' : ''}><div><div class="t">${esc(t.texto)}</div>${t.donde ? '<div class="where">' + esc(t.donde) + '</div>' : ''}</div></label></li>`).join('') + '</ul>'
      : '<p class="muted small">Esta semana no hay tareas extra: sigue tu camino y completa tu weekly report.</p>'}
  </section>
  <section class="card ask"><span class="eyebrow">Flor AI</span><h3>¿Por dónde seguimos?</h3><p class="muted small">Conoce tu semana, tu foco, tu feedback y tu progreso. Te guía con el criterio de Flor.</p>
    <div class="asklist">
      <button type="button" data-ask="¿Qué me toca esta semana?"><b>¿Qué me toca esta semana?</b><span>Tu próximo paso según tu camino y tu foco.</span></button>
      <button type="button" data-ask="Tengo una reunión pronto y me quiero preparar"><b>Tengo una reunión pronto</b><span>Encontramos dónde te trabas y qué practicar.</span></button>
      <button type="button" data-ask="Ayúdame con mi weekly report"><b>Ayúdame con mi weekly</b><span>Lo ordenamos juntas antes del lunes.</span></button>
    </div></section>
</div>
${fb ? `<section class="card">
  <div class="row between"><h3>Último feedback de Flor</h3><span class="muted small">Sobre: ${esc(fb.titulo || fb.tipo)}</span></div>
  <div class="feedback"><p>${esc(fb.respuesta).replace(/\n/g, '<br>')}</p>${fixes(fb.correcciones)}</div>
  <a href="#feedback" class="small">Ver todos tus feedbacks</a>
</section>` : ''}
<section class="card"><div class="row between"><h3>Tu recorrido</h3><a class="small" href="#camino">Ver detalle</a></div>${etapasHTML(n)}</section>
<section class="grid">
  <span class="eyebrow">A mano</span>
  <div class="quick">
    ${fmt(p) === '1:1' ? qa('https://calendar.app.google/XMDANMAaRPLHTFBG8', 'Agendar con Flor', 'Tu link de reserva') : qa(enVivo.link, 'Link del lab', 'Sábados') + qa('https://calendar.app.google/kxnVBHB5XJam7JG69', 'Reservar mi 1:1', '30 min, 1 por mes')}
    ${qa(st.perfil.drive_url, 'Mi carpeta de Drive', 'Prácticas y material')}${qa(links().comunidad || 'https://chat.whatsapp.com/EKffC7cix6oDfeCCvfKGYv', 'Comunidad', 'Grupo de WhatsApp')}${qa((P.onbLinks[fmt(p)] || {}).curso ? 'https://academy.breakingbarriers.site/courses/products/6863ca67-9163-40bd-98de-f0c450d87919' : '', 'Mis clases', 'Curso AT WORK')}
  </div>
</section>`;
    },
    mount() {
      montarCamino($('#app'));
      const el = $('#tasks'); if (!el) return ($('#taskCount') ? ($('#taskCount').textContent = '0') : null);
      const count = () => { $('#taskCount').textContent = el.querySelectorAll('input:checked').length + ' de ' + el.querySelectorAll('input').length; };
      el.addEventListener('change', (e) => { const i = e.target; intentar(() => DB.marcarTarea(+i.dataset.id || i.dataset.id, i.checked)).catch(() => { i.checked = !i.checked; count(); }); count(); });
      count();
    }
  };
  function caminoSemanaHTML(p) {
    const n = semanaDe(p);
    if (!n) return `<section class="card empty-state"><span class="eyebrow">Tu camino AT WORK</span><h3>Tus 5 meses, semana por semana</h3><p class="muted small">Cuando Flor cargue tu fecha de inicio, acá vas a ver exactamente qué te toca esta semana.</p><a class="btn ghost" href="#camino">Ver mi camino</a></section>`;
    const c = semanaCamino(n);
    return `<section class="card"><div class="row between"><div><span class="eyebrow">Tu camino · semana ${n} de 20 · mes ${c.mes.n}</span><h3>${esc(c.sem.titulo)}</h3></div><a class="small" href="#camino">Ver todo mi camino</a></div>
      <ul class="tasks">${c.sem.tareas.map((t) => filaTarea(t, p.camino_hecho || [])).join('')}</ul>
      ${n >= 2 ? `<details><summary class="small muted">Tus hábitos de todas las semanas</summary><ul class="tasks" style="margin-top:8px">${P.habitos.tareas.map((t) => `<li><div class="fbitem"><b>${esc(t.texto)}</b><span class="where muted small">${esc(t.donde)} ${accionTarea(t)}</span></div></li>`).join('')}</ul></details>` : ''}
    </section>`;
  }
  function qa(link, t, s) {
    return url(link) ? `<a href="${esc(link)}" target="_blank" rel="noopener"><b>${t}</b><span>${s}</span></a>` : `<a href="#empieza"><b>${t}</b><span>${s}</span></a>`;
  }

  // ---------- Flor AI y coaches (chat) ----------
  const coachDe = (id) => P.coaches.find((c) => c.id === id) || P.coaches[0];
  function enClaudeHTML() {
    return `<div class="head"><div><span class="eyebrow">Tu consultoría</span><h1>Flor AI</h1></div></div>
<section class="card feature"><span class="eyebrow">Muy pronto acá</span><h2>Flor AI te va a guiar desde esta app</h2>
  <p class="muted">Te va a decir qué te toca, dónde estás en tu camino y cómo prepararte para tu próxima situación real, y va a hacer tu onboarding contigo.</p>
  <div class="row"><a class="btn" href="#camino">Mientras tanto, mira tu camino</a></div></section>
<section class="card"><h3>Para practicar, usa tus coaches</h3><p class="muted small">Role Play, Narrative Flow, Color Method y Career Coach se instalan una sola vez en Claude.</p><div class="row"><a class="btn ghost" href="#coaches">Ver mis coaches</a></div></section>`;
  }

  V.flor = {
    async html() {
      if (!IA) return enClaudeHTML();
      return `<div class="head"><div><span class="eyebrow">Tu consultoría y tus coaches</span><h1>Flor AI</h1></div></div>
<div class="chat">
  <div class="chat-side">
    <label class="eyebrow" for="coachSel">Hablar con</label>
    <select id="coachSel">${P.coaches.filter((c) => c.id === 'flor').map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('')}</select>
    <button class="new" id="nuevo" type="button">+ Nueva conversación</button>
    <span class="eyebrow" style="margin-top:6px">Tus conversaciones</span>
    <div class="chat-list" id="lista"></div>
  </div>
  <div class="chat-main">
    <div class="chat-top"><span class="dotc" id="dotc"></span><b id="ctitulo">Flor AI</b><span class="muted small" id="csub"></span><span style="margin-left:auto"></span><button class="linkbtn small" id="borrar" hidden>Borrar</button></div>
    <div class="msgs" id="msgs" aria-live="polite"></div>
    <form class="composer" id="comp"><textarea id="txt" rows="2" placeholder="Escribe aquí… (puedes dictar con el micrófono del teclado)"></textarea><button class="btn" type="submit" id="send">Enviar</button></form>
    <p class="disclaimer">Flor AI es una IA entrenada con el método de Flor: puede equivocarse. Lo importante, mándaselo a Flor desde “Pedir feedback”.</p>
  </div>
</div>`;
    },
    async mount(arg) {
      if (!IA) { st.pendiente = null; return; }
      let chats = await DB.chats();
      const sel = $('#coachSel');
      const pintarLista = () => {
        $('#lista').innerHTML = chats.length ? chats.map((c) => `<button type="button" data-c="${c.id}" ${st.chat && st.chat.id === c.id ? 'aria-current="true"' : ''}>${esc(c.titulo)}<small>${coachDe(c.coach).nombre} · ${fecha(c.creado)}</small></button>`).join('') : '<p class="muted small">Todavía no hay conversaciones.</p>';
      };
      const cabecera = (coach) => {
        const c = coachDe(coach);
        $('#ctitulo').textContent = c.nombre; $('#dotc').style.setProperty('--c', c.color); sel.value = c.id;
        $('#borrar').hidden = !st.chat;
      };
      const vacio = (coach) => {
        const c = coachDe(coach);
        const sug = c.id === 'flor' ? P.sugerencias : [[c.frase, c.desc]];
        $('#msgs').innerHTML = `<div class="empty"><h2>${c.id === 'flor' ? 'Hola' + (st.perfil.nombre ? ', ' + esc(st.perfil.nombre.split(' ')[0]) : '') + '. ¿Qué entrenamos hoy?' : esc(c.nombre)}</h2><p class="muted">${esc(c.desc)}</p>
          <div class="suggest">${sug.map(([t, d]) => `<button type="button" data-sug="${esc(t)}"><b>${esc(t.trim())}</b><span>${esc(d)}</span></button>`).join('')}</div></div>`;
      };
      const pintarMsgs = (ms) => {
        $('#msgs').innerHTML = ms.map((m) => m.rol === 'user' ? `<div class="msg user">${esc(m.contenido)}</div>` : `<div class="msg ai">${md(m.contenido)}</div>`).join('');
        $('#msgs').scrollTop = 1e9;
      };
      const abrir = async (c) => {
        st.chat = c; cabecera(c.coach); pintarLista();
        const ms = await DB.mensajes(c.id); ms.length ? pintarMsgs(ms) : vacio(c.coach);
      };
      const nuevo = (coach) => { st.chat = null; st.coachNuevo = coach; cabecera(coach); pintarLista(); vacio(coach); $('#txt').focus(); };

      const enviar = async (texto) => {
        texto = texto.trim(); if (!texto || st.enviando) return;
        st.enviando = true; $('#send').disabled = true;
        try {
          if (!st.chat) { st.chat = await DB.crearChat(st.coachNuevo || sel.value); chats.unshift(st.chat); cabecera(st.chat.coach); }
          const box = $('#msgs'); if ($('.empty', box)) box.innerHTML = '';
          box.insertAdjacentHTML('beforeend', `<div class="msg user">${esc(texto)}</div><div class="msg ai" id="out"><p class="thinking">${coachDe(st.chat.coach).nombre} está pensando…</p></div>`);
          box.scrollTop = 1e9; $('#txt').value = '';
          const out = $('#out');
          await DB.enviar(st.chat.id, texto, (t) => { out.innerHTML = md(t); box.scrollTop = 1e9; });
          out.removeAttribute('id');
          if (st.chat.titulo === 'Nueva conversación') { st.chat.titulo = texto.slice(0, 60); }
          pintarLista();
        } catch (e) {
          const out = $('#out'); if (out) { out.innerHTML = '<p class="err-text">' + esc(e.message) + '</p>'; out.removeAttribute('id'); }
          $('#txt').value = texto;
        } finally { st.enviando = false; $('#send').disabled = false; }
      };

      $('#lista').onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) abrir(chats.find((c) => String(c.id) === b.dataset.c)); };
      $('#nuevo').onclick = () => nuevo(sel.value);
      sel.onchange = () => nuevo(sel.value);
      $('#borrar').onclick = async () => {
        if (!st.chat || !confirm('¿Borrar esta conversación?')) return;
        await intentar(() => DB.borrarChat(st.chat.id), 'Conversación borrada');
        chats = chats.filter((c) => c.id !== st.chat.id); nuevo(st.chat.coach);
      };
      $('#msgs').onclick = (e) => {
        const b = e.target.closest('[data-sug]'); if (!b) return;
        const t = b.dataset.sug;
        if (/[:\s]$/.test(t)) { $('#txt').value = t; $('#txt').focus(); } else enviar(t);
      };
      $('#comp').onsubmit = (e) => { e.preventDefault(); enviar($('#txt').value); };
      $('#txt').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey && !/Mobi/.test(navigator.userAgent)) { e.preventDefault(); enviar($('#txt').value); } };

      const pend = st.pendiente; st.pendiente = null;
      if (pend) {
        nuevo(pend.coach);
        if (pend.enviar && !/[:\s]$/.test(pend.texto)) enviar(pend.texto); else { $('#txt').value = pend.texto; $('#txt').focus(); }
      } else if (arg && coachDe(arg).id === arg) nuevo(arg);
      else if (st.chat && chats.some((c) => c.id === st.chat.id)) abrir(st.chat);
      else nuevo('flor');
    }
  };

  // ---------- Pedir feedback ----------
  const TIPOS = [['audio', 'Audio o video'], ['reunion', 'Reunión real (grabación o transcript)'], ['mail', 'Mail o mensaje'], ['tarea', 'Tarea de una clase'], ['otro', 'Otra cosa']];
  const tipoNombre = (t) => (TIPOS.find((x) => x[0] === t) || [, t])[1];
  V.feedback = {
    async html() {
      const ped = await DB.pedidos();
      return `<div class="head"><div><span class="eyebrow">Directo a Flor</span><h1>Pedir feedback</h1></div></div>
<p class="muted intro">Mándale a Flor tu práctica o tu material real: un audio, una reunión, un mail. Ella lo lee, te responde acá con tus correcciones y te dice qué clase ver. Si quieres un primer feedback rápido antes, pídeselo a Flor AI.</p>
<div class="grid g-2">
  <form class="card" id="pform" novalidate>
    <div class="field"><label for="ptipo">¿Qué le mandas?</label><select id="ptipo">${TIPOS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></div>
    <div class="field"><label for="ptit">Título corto</label><input id="ptit" type="text" placeholder="Ej.: Update de capex con mi jefe"></div>
    <div class="field"><label for="ptxt">Tu texto o transcript</label><small>Pega el texto. Si es confidencial, cambia nombres y datos. Si es un audio, cuéntale el contexto.</small><textarea id="ptxt" rows="7"></textarea></div>
    <div class="field"><label for="pfile">Sube tu audio, video o documento</label><small>Hasta 50 MB. Desde el celular puedes elegir una nota de voz o una grabación.</small><input id="pfile" type="file" accept="audio/*,video/*,.pdf,.doc,.docx,.txt,image/*"></div>
    <div class="field"><label for="plink">O pega un link (opcional)</label><small>Por ejemplo, de tu Drive, con permiso para que Flor lo vea.</small><input id="plink" type="url" placeholder="https://drive.google.com/…"></div>
    <div class="row"><button class="btn" type="submit">Enviar a Flor</button><button class="btn ghost" type="button" id="pai">Primero, feedback de Flor AI</button></div>
  </form>
  <section class="card">
    <h3>Cómo pedir un buen feedback</h3>
    <ul class="dates">
      <li><b>Real</b><span>Lo que pasó en tu trabajo, no un ejercicio inventado.</span></li>
      <li><b>Contexto</b><span>Con quién era, qué querías lograr y dónde sentiste que te trabaste.</span></li>
      <li><b>Uno a la vez</b><span>Mejor un audio de 3 minutos que cinco largos.</span></li>
      <li><b>Después</b><span>Practica la corrección con tus coaches y tráela al lab.</span></li>
    </ul>
  </section>
</div>
<section class="card">
  <h3>Tus pedidos</h3>
  ${ped.length ? ped.map((x) => `<div class="fbitem">
    <div class="row between"><b>${esc(x.titulo || tipoNombre(x.tipo))}</b><span class="pill ${x.estado === 'respondido' ? 'ok' : 'warn'}">${x.estado === 'respondido' ? 'Respondido' : 'Esperando a Flor'}</span></div>
    <span class="muted small">${tipoNombre(x.tipo)} · ${fecha(x.creado)}</span>
    <details><summary class="small">Lo que mandaste</summary>${x.texto ? `<pre>${esc(x.texto)}</pre>` : ''}${adjunto(x)}${url(x.link) ? ` <a class="small" href="${esc(x.link)}" target="_blank" rel="noopener">Abrir link</a>` : ''}</details>
    ${x.respuesta ? `<div class="reply"><span class="eyebrow">Flor · ${fecha(x.respondido_en)}</span><p>${esc(x.respuesta).replace(/\n/g, '<br>')}</p>${fixes(x.correcciones)}</div>` : ''}
  </div>`).join('') : '<p class="muted small">Todavía no mandaste nada. Empieza por tu audio de punto de partida.</p>'}
</section>`;
    },
    mount() {
      const f = $('#pform');
      f.onsubmit = async (e) => {
        e.preventDefault();
        const texto = $('#ptxt').value.trim(), link = $('#plink').value.trim(), file = $('#pfile').files[0];
        if (!texto && !link && !file) return toast('Pega tu texto, sube un archivo o pega un link para que Flor lo vea.', true);
        if (link && !url(link)) return toast('El link tiene que empezar con https://', true);
        if (file && file.size > 50 * 1024 * 1024) return toast('El archivo pesa más de 50 MB. Prueba con uno más corto o pega un link.', true);
        const b = $('button[type=submit]', f); b.disabled = true; b.textContent = file ? 'Subiendo…' : 'Enviando…';
        try {
          const archivo = file ? await intentar(() => DB.subirArchivo(file, 'pedidos')) : '';
          await intentar(() => DB.crearPedido({ tipo: $('#ptipo').value, titulo: $('#ptit').value.trim(), texto, link, archivo, archivo_nombre: file ? file.name : '' }), 'Listo, le llegó a Flor.'); ruta();
        }
        catch (er) { b.disabled = false; b.textContent = 'Enviar a Flor'; }
      };
      $('#pai').onclick = () => {
        const t = $('#ptxt').value.trim(); if (!t) return toast('Primero pega tu texto.', true);
        st.pendiente = { texto: 'Revisa mi tarea y dame un primer feedback (' + tipoNombre($('#ptipo').value) + (($('#ptit').value.trim()) ? ': ' + $('#ptit').value.trim() : '') + '):\n\n' + t, coach: 'flor', enviar: true };
        location.hash = 'flor';
      };
    }
  };

  // ---------- Weekly report ----------
  V.weekly = {
    async html() {
      const ws = await DB.weeklies(); const sem = DB.lunes();
      const w = ws.find((x) => x.semana === sem) || { respuestas: {} };
      st._weekly = w;
      const bloqueado = !!w.respuesta_flor;
      const hist = ws.filter((x) => x.semana !== sem && x.enviado_en);
      return `<div class="head"><div><span class="eyebrow">Todos los lunes · semana del ${fecha(sem, { day: 'numeric', month: 'long' })}</span><h1>Weekly report</h1></div>${w.enviado_en ? '<span class="pill ok">Enviado</span>' : ''}</div>
<p class="muted intro">Es tu canal con Flor. Planificas tu semana, cuentas qué hiciste y qué quieres entrenar. Flor lo lee siempre y te responde con tu próximo paso.</p>
${w.respuesta_flor ? `<section class="card"><div class="reply"><span class="eyebrow">Respuesta de Flor</span><p>${esc(w.respuesta_flor).replace(/\n/g, '<br>')}</p></div></section>` : ''}
<form class="card" id="wform" novalidate>
  <p class="eyebrow">Weekly report ${st.perfil.formato === '1:1' ? '1:1' : 'LAB'} · Complete every Monday · 5–10 minutes</p>
  <p class="muted small">${esc(P.weeklyIntro)}</p>
  ${wq(st.perfil).map(([id, l, h]) => `<div class="field"><label for="w-${id}">${l}</label><small>${h}</small><textarea id="w-${id}" data-k="${id}" rows="${/training/.test(id) ? 2 : 3}" ${bloqueado ? 'readonly' : ''}>${esc(w.respuestas[id] || '')}</textarea></div>`).join('')}
  <p class="eyebrow">${P.weeklyLema}</p>
  ${bloqueado ? '' : `<div class="row"><button class="btn" type="submit">${w.enviado_en ? 'Actualizar mi weekly' : 'Enviar a Flor'}</button><button class="btn ghost" type="button" data-ask="Ayúdame con mi weekly report">Ordenarlo con Flor AI</button><span class="muted small" id="wsave">Tu borrador se guarda solo.</span></div>`}
</form>
${hist.length ? `<section class="card"><h3>Tus weeklies anteriores</h3>${hist.map((x) => `<details class="fbitem"><summary><b>Semana del ${fecha(x.semana, { day: 'numeric', month: 'long' })}</b> ${x.respuesta_flor ? '<span class="pill ok">Flor respondió</span>' : ''}</summary>
  ${wq(st.perfil).map(([id, l]) => (x.respuestas[id] ? `<p class="small"><b>${l}</b><br>${esc(x.respuestas[id])}</p>` : '')).join('')}
  ${x.respuesta_flor ? `<div class="reply"><span class="eyebrow">Flor</span><p>${esc(x.respuesta_flor).replace(/\n/g, '<br>')}</p></div>` : ''}</details>`).join('')}</section>` : ''}`;
    },
    mount() {
      const f = $('#wform'); if (!f || $('textarea[readonly]', f)) return;
      const datos = () => { const r = {}; $$('textarea', f).forEach((t) => { if (t.value.trim()) r[t.dataset.k] = t.value; }); return r; };
      let tm;
      f.addEventListener('input', () => {
        clearTimeout(tm);
        tm = setTimeout(async () => { try { await DB.guardarWeekly(DB.lunes(), datos(), false); $('#wsave').textContent = 'Borrador guardado.'; } catch (e) { $('#wsave').textContent = 'No se pudo guardar el borrador.'; } }, 900);
      });
      f.onsubmit = async (e) => {
        e.preventDefault(); clearTimeout(tm);
        const d = datos(); if (!d.wins && !d.foco) return toast('Completa al menos tus wins y tu foco de esta semana.', true);
        await intentar(() => DB.guardarWeekly(DB.lunes(), d, true), 'Listo, tu weekly está enviado. Avisa en la comunidad que ya lo completaste.');
        ruta();
      };
    }
  };

  // ---------- Mi camino ----------
  V.camino = {
    html() {
      const p = st.perfil, n = semanaDe(p), hechas = p.camino_hecho || [], av = avanceCamino(p), sig = loQueSigue(p);
      const mesActual = n ? semanaCamino(n).mes.n : 1;
      const pctMes = (m) => { const ts = m.semanas.flatMap((x) => x.tareas); return { h: ts.filter((t) => hechas.includes(t.id)).length, t: ts.length }; };
      return `<div class="head"><div><span class="eyebrow">Tu implementación, mes a mes, durante 5 meses</span><h1>Mi camino</h1></div></div>
<p class="muted intro">El programa paso a paso. Enfócate en la semana en la que estás: lo demás espera. Si tu diagnóstico pide otro foco, Flor te lo indica en la respuesta a tu Weekly Report.</p>
<section class="card progress-top">
  <div><span class="eyebrow" data-camcount>${contarCamino()}</span><div class="meter"><i style="width:${av.pct}%"></i></div>${n ? `<span class="small muted">Estás en la semana ${n} de 20</span>` : ''}</div>
  <div class="sig"><span class="eyebrow">Lo que sigue</span>${sig ? `<b>${esc(sig.t.texto)}</b><span class="small muted">Mes ${sig.m.n} · Semana ${sig.s.s.join(' y ')}</span>` : '<b>Estás al día</b>'}</div>
  ${sig ? `<div>${accionTarea(sig.t).replace('linkbtn small', 'btn')}</div>` : ''}
</section>
<section class="card"><h3>Tu recorrido</h3>${etapasHTML(n)}<p class="muted small">${esc(P.recorridoNota)}</p></section>
${P.camino.map((m) => { const pm = pctMes(m); return `<details class="card mes" ${m.n === mesActual ? 'open' : ''}><summary><span class="mesnum"><small>MES</small>0${m.n}</span><span class="mestit"><h2>${esc(m.titulo)}</h2><span class="muted small">${pm.h} de ${pm.t} tareas · Al final del mes: ${esc(m.logro)}</span></span>${ring(pm.t ? (100 * pm.h) / pm.t : 0)}</summary>
  ${m.semanas.map((s) => `<div class="semana ${n && s.s.includes(n) ? 'actual' : ''}"><div class="row between"><b class="semtit"><span>SEMANA${s.s.length > 1 ? 'S' : ''} ${s.s.join(' Y ')}</span> ${esc(s.titulo)}</b>${n && s.s.includes(n) ? '<span class="pill warn">Esta semana</span>' : ''}</div>
    <ul class="tasks">${s.tareas.map((t) => filaTarea(t, hechas)).join('')}</ul></div>`).join('')}
</details>`; }).join('')}
<section class="card"><span class="eyebrow">${esc(P.habitos.titulo)}</span><h3>${esc(P.habitos.ciclo)}</h3>
  <ul class="dates">${P.habitos.tareas.map((t) => `<li><b>${esc(t.donde)}</b><span>${esc(t.texto)} ${accionTarea(t)}</span></li>`).join('')}</ul>
</section>`;
    },
    mount() { montarCamino($('#app')); }
  };
  function etapaDe(n) { return n <= 2 ? 0 : n <= 4 ? 1 : n <= 8 ? 2 : n <= 12 ? 3 : n <= 16 ? 4 : 5; }

  // ---------- Mis coaches (skills para instalar en Claude) ----------
  const SKILLS = [
    ['Flor AI', 'Tu consultoría con el criterio de Flor, también dentro de tu Claude: qué entrenar esta semana, dónde te trabas y a qué coach ir.', 'flor-ai.zip', 'Hola Flor, tengo una reunión el jueves y me trabo cuando me preguntan.', 'Empieza acá'],
    ['Onboarding', 'Tu bienvenida a AT WORK: dónde está cada cosa, tu punto de partida y tu primera práctica.', 'onboarding-at-work.zip', 'Hola, soy nueva en AT WORK.', 'Empieza acá'],
    ['Role Play', 'Ensaya tu reunión, presentación o entrevista antes de que pase. Hace de la otra persona y no te corrige durante la escena.', 'at-work-role-play.zip', 'Quiero practicar mi update del lunes con mi jefa.', 'Coach'],
    ['Narrative Flow', 'Corrige la gramática de tu mail, mensaje o transcript. Tú encuentras tus errores, uno por uno.', 'at-work-narrative-flow.zip', 'Pega tu mail o tu reporte.', 'Coach'],
    ['Color Method', 'Haz que lo que dices y escribes suene más profesional, con las expresiones de tu trabajo.', 'at-work-color-method.zip', 'Pega tu texto o el transcript de tu reunión.', 'Coach'],
    ['Interview Me · Career Coach', 'Si estás preparando entrevistas: analiza el aviso, arma tus respuestas STAR, revisa tu CV y tu LinkedIn.', 'career-coach-pro.zip', 'Pega el aviso del puesto y tu CV.', 'Opcional']
  ];
  V.coaches = {
    html() {
      return `<div class="head"><div><span class="eyebrow">Tu práctica entre clases</span><h1>Mis coaches</h1></div></div>
<p class="muted intro">Adentro de esta app te guía Flor AI. Para practicar sola entre sesiones, con situaciones reales de tu trabajo, instalas los coaches en tu propio Claude, como skills: una sola vez y unos 10 minutos desde la computadora. Se usan desde el Módulo 1.</p>
<section class="card"><span class="eyebrow">Míralo primero · 6 minutos</span><h3>El paso a paso en video</h3><p class="muted small">Te muestro cómo descargar, instalar y usar tus coaches. Puedes pausarlo e ir haciéndolo conmigo.</p>
  <div style="position:relative;padding-top:56.25%;border-radius:12px;overflow:hidden;background:var(--surface-2)"><iframe src="https://drive.google.com/file/d/1kvQouR-hqDktK28UFj8RQ9W4hFM5us78/preview" allow="autoplay; fullscreen" allowfullscreen loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;border:0" title="Video: cómo descargar, instalar y usar tus coaches"></iframe></div>
</section>
<section class="card"><h3>1 · Descarga tus skills</h3><p class="muted small">Son 6. Las 5 primeras son para todas; Interview Me, solo si preparas entrevistas. <b>No descomprimas</b> los archivos .zip.</p>
  <div class="skills">${SKILLS.map(([n, d, zip, , tag]) => `<div class="skill"><span class="tag">${esc(tag)}</span><b>${esc(n)}</b><span class="small muted">${esc(d)}</span><a class="btn ghost sm" href="${COACHES_URL}${zip}" download>↓ Descargar</a></div>`).join('')}</div>
</section>
<section class="card"><h3>2 · Instálalos en Claude</h3><ol class="pasos">
  <li>Entra a <a href="https://claude.ai" target="_blank" rel="noopener">claude.ai</a> con tu cuenta (o créala con tu mail).</li>
  <li>Ve a <b>Settings › Capabilities</b> y activa <b>Code execution and file creation</b> (en algunas versiones: <b>Create and edit files</b>). Sin esto, los coaches no funcionan.</li>
  <li>Ve a <b>Customize › Skills</b> (en las versiones nuevas: <b>Plugins</b>).</li>
  <li>Toca <b>+</b>, luego <b>Create skill</b> y después <b>Upload a skill</b>.</li>
  <li>Elige uno de los .zip que descargaste. Repite con cada skill.</li>
</ol><p class="note small">✓ Ya está listo si abres un chat nuevo, escribes <b>/</b> y ves tus coaches en la lista. Desde ahí también funcionan en el celular.</p></section>
<section class="card"><h3>3 · Úsalos</h3><p class="small">Abre un chat nuevo en Claude, escribe <b>/</b> y elige tu coach. Después cuéntale qué traes. Así arranca cada uno:</p>
  <ul class="dates">${SKILLS.map(([n, , , f]) => `<li><b>${n}</b><span>${esc(f)}</span></li>`).join('')}</ul>
  <p class="muted small">Para cambiar de coach no necesitas otro chat: escribe “pasemos a Role Play”, “pasemos a Narrative Flow” o “pasemos a Color Method”.</p></section>
<section class="card"><h3>¿Cuál uso hoy?</h3><ul class="dates">${P.situaciones.map(([s, c]) => `<li><b>${c === 'flor' ? 'Flor AI' : (P.coaches.find((x) => x.id === c) || {}).nombre || c}</b><span>${esc(s)}</span></li>`).join('')}</ul>
  <p class="muted small">Flor AI vive en esta app: te dice qué te toca y te guía. Lo importante, mándaselo a Flor desde <a href="#feedback">Pedir feedback</a>.</p></section>`;
    }
  };

  // ---------- Mi proceso: plan de acción, documentos y compromisos ----------
  V.proceso = {
    async html() {
      const p = st.perfil, docs = await DB.documentos(), n = semanaDe(p);
      const tipo = (t) => (P.tiposDoc.find((x) => x[0] === t) || [, 'Documento'])[1];
      const acuerdo = docs.find((d) => d.tipo === 'acuerdo');
      return `<div class="head"><div><span class="eyebrow">Tu plan de acción</span><h1>Mi proceso</h1></div>${n ? `<span class="pill">Semana ${n} de 20</span>` : ''}</div>
<div class="grid g-2">
  <section class="card feature"><span class="eyebrow">Tu objetivo a 5 meses</span><h2>${p.objetivo ? esc(p.objetivo) : 'Lo defines en tu onboarding'}</h2>
    ${p.foco_titulo ? `<p class="muted">Foco de esta semana: ${esc(p.foco_titulo)}</p>` : ''}
    <div class="row"><a class="btn" href="#camino">Ver mi camino</a></div></section>
  <section class="card"><h3>Tu Acuerdo de Trabajo</h3>
    ${acuerdo ? `<p class="pill ok" style="align-self:flex-start">Firmado</p><button type="button" class="btn ghost sm" style="align-self:flex-start" data-archivo="${esc(acuerdo.path)}">Abrir mi acuerdo</button>`
      : `<p class="muted small">Cuando lo firmes, súbelo acá (PDF o foto). Flor también puede cargarlo por ti.</p>`}
  </section>
</div>
<section class="card"><div class="row between"><h3>Mis documentos</h3></div>
  ${docs.length ? `<ul class="dates">${docs.map((d) => `<li><b>${esc(tipo(d.tipo))}</b><span><button type="button" class="linkbtn" data-archivo="${esc(d.path)}">${esc(d.nombre)}</button> <span class="muted small">· ${fecha(d.creado)}</span></span></li>`).join('')}</ul>` : '<p class="muted small">Todavía no hay documentos.</p>'}
  <form class="editrow" id="dform"><select id="d-tipo">${P.tiposDoc.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select><input type="file" id="d-file" accept=".pdf,image/*,.doc,.docx"><button class="btn sm" type="submit">Subir</button></form>
</section>
<section class="card"><h3>Checklist antes de continuar</h3><p class="muted small">Antes de continuar, asegúrate de tener claro que…</p>
  <ul class="tasks" id="comp">${P.compromisos.map(([t, d], i) => `<li><label><input type="checkbox" data-i="${i}" ${(p.compromisos || []).includes(i) ? 'checked' : ''}><div><div class="t">${esc(t)}</div><div class="where">${esc(d)}</div></div></label></li>`).join('')}</ul>
</section>`;
    },
    mount() {
      montarCompromisos();
      $('#dform').onsubmit = async (e) => {
        e.preventDefault(); const f = $('#d-file').files[0]; if (!f) return toast('Elige un archivo.', true);
        const b = $('#dform button'); b.disabled = true; b.textContent = 'Subiendo…';
        try { await intentar(() => DB.subirDocumento(st.perfil.id, f, $('#d-tipo').value, f.name), 'Documento subido'); ruta(); }
        catch (er) { b.disabled = false; b.textContent = 'Subir'; }
      };
    }
  };
  function montarCompromisos() {
    const el = $('#comp'); if (!el) return;
    el.addEventListener('change', () => {
      const v = $$('input:checked', el).map((x) => +x.dataset.i); st.perfil.compromisos = v;
      intentar(() => DB.guardarMiPerfil({ compromisos: v })).catch(() => {});
    });
  }

  // ---------- Mi progreso ----------
  V.progreso = {
    async html() {
      const [pat, ped, ws] = await Promise.all([DB.patrones(), DB.pedidos(), DB.weeklies()]);
      const p = st.perfil;
      const hace28 = Date.now() - 28 * 864e5;
      const reales = ped.filter((x) => ['reunion', 'mail'].includes(x.tipo));
      const recientes = ped.filter((x) => new Date(x.creado) > hace28).length;
      const env = ws.filter((w) => w.enviado_en).length;
      return `<div class="head"><div><span class="eyebrow">Evidencia real, no sensaciones</span><h1>Mi progreso</h1></div></div>
<section class="card feature"><span class="eyebrow">Tu objetivo a 5 meses</span>
  ${p.objetivo ? `<h2>${esc(p.objetivo)}</h2>` : '<h2>Todavía no lo definiste</h2><p class="muted">Lo armas en tu onboarding con Flor AI.</p><div class="row"><button class="btn" data-ask="Quiero definir mi objetivo a 5 meses">Definirlo con Flor AI</button></div>'}
</section>
<div class="grid g-3">
  <section class="card"><span class="eyebrow">Cómo me siento al hablar en reuniones</span>
    ${p.confianza_hoy ? `<div class="row" style="gap:10px"><span class="big">${p.confianza_hoy}</span><span class="muted">/10 hoy${p.confianza_inicio ? '<br>empezaste en ' + p.confianza_inicio : ''}</span></div>
    <div class="meter"><i style="width:${p.confianza_hoy * 10}%"></i></div><div class="scale"><span>1</span><span>5</span><span>10</span></div>` : '<p class="muted small">Flor lo carga con tu punto de partida y lo actualiza en tus check-ins.</p>'}
  </section>
  <section class="card"><span class="eyebrow">Material real que le mandaste a Flor</span>
    <div class="row" style="gap:10px"><span class="big">${ped.length}</span><span class="muted">en total<br>${recientes} en las últimas 4 semanas</span></div>
    <span class="pill ${recientes >= 4 ? 'ok' : 'warn'}">${recientes >= 4 ? 'Vas al día' : 'Meta: 1 reunión real por semana'}</span>
    <span class="muted small">${reales.length} reuniones o mails reales · ${env} weeklies enviados</span>
  </section>
  <section class="card"><span class="eyebrow">Audio de punto de partida</span>
    ${p.audio_inicio ? `<p><b>Grabado el ${fecha(p.audio_inicio, { day: 'numeric', month: 'long' })}</b></p><p class="muted small">Al cerrar el programa grabas el mismo audio y lo comparan juntas.</p>` : '<p class="muted small">Todavía no está. Grábalo (3–5 min hablando de tu trabajo) y mándaselo a Flor.</p><a class="btn ghost sm" href="#feedback">Mandar mi audio</a>'}
  </section>
</div>
<section class="card">
  <h3>Tus patrones de error</h3>
  <p class="muted small">Flor separa los errores fosilizados (sabes la regla pero se te escapa) de los que vienen de falta de base (necesitas la explicación).</p>
  ${pat.length ? `<div class="tbl"><table><thead><tr><th>Patrón</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>
    ${pat.map((x) => `<tr><td>${esc(x.patron)}</td><td>${esc(x.tipo)}</td><td><span class="pill ${/resuel/i.test(x.estado) ? 'ok' : 'warn'}">${esc(x.estado)}</span></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">Flor los va a ir cargando a medida que vea tu material.</p>'}
</section>`;
    }
  };

  // ---------- Empieza acá (onboarding LAB o Private) ----------
  V.empieza = {
    html() {
      const o = onbDe(st.perfil), f = fmt(st.perfil), hechos = st.perfil.onboarding || [];
      const lk = (v) => (v === 'curso' ? (P.onbLinks[f] || {}).curso : v);
      return `<div class="head"><div><span class="eyebrow">Tu primera semana · ${esc(o.nombre)}</span><h1>Empieza acá</h1></div><span class="pill" id="onbCount"></span></div>
<p class="note small">¿Entraste con una contraseña provisoria que te mandó Flor? <button type="button" class="linkbtn" id="clave2">Crea tu propia contraseña acá</button>.</p>
<p class="muted intro">Todo lo que necesitas para empezar está en esta página. Tómate el onboarding con calma: entender cómo funciona todo lleva unas dos semanas, y es normal.</p>
${o.nota ? `<p class="note">${esc(o.nota)}</p>` : ''}
<section class="card feature">
  <span class="eyebrow">Tu bienvenida con Flor AI · 20 a 30 minutos</span>
  <h2>Haz tu onboarding acompañada</h2>
  <p class="muted">Flor AI te explica cómo funciona tu semana, dónde está cada cosa, toma tu punto de partida y hacen juntas tu primera práctica.</p>
  <div class="row"><button class="btn" type="button" data-ask="Soy nueva en AT WORK, quiero hacer mi onboarding">Empezar mi onboarding</button>${url(lk('curso')) ? `<a class="btn ghost" href="${esc(lk('curso'))}" target="_blank" rel="noopener">Ver los 8 videos</a>` : ''}</div>
</section>
<div class="grid g-2">
  <section class="card"><h3>Tu checklist final</h3><p class="muted small">Márcalo completo antes de empezar el Módulo 1.</p>
    <div class="meter"><i id="onbBar" style="width:0"></i></div>
    <ul class="tasks" id="onb">${o.checklist.map((t, i) => `<li><label><input type="checkbox" data-i="${i}" ${hechos.includes(i) ? 'checked' : ''}><div><div class="t">${esc(t)}</div></div></label></li>`).join('')}</ul></section>
  <div class="grid" style="align-content:start">
    <section class="card"><h3>Tus links</h3><ul class="dates">
      ${o.links.map(([t, d, v]) => `<li><b>${esc(t)}</b><span>${url(lk(v)) ? `<a href="${esc(lk(v))}" target="_blank" rel="noopener">${esc(d)}</a>` : esc(d)}</span></li>`).join('')}
      <li><b>Tu carpeta de Drive</b><span>${url(st.perfil.drive_url) ? `<a href="${esc(st.perfil.drive_url)}" target="_blank" rel="noopener">Abrir mi carpeta</a>` : 'Te llegó en el mail de bienvenida'}</span></li>
    </ul></section>
    <section class="card"><h3>Tu semana</h3><ul class="dates">${o.semana.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ul></section>
  </div>
</div>
<section class="card"><span class="eyebrow">Antes de empezar</span><h3>${esc(o.arranque[0])}</h3><p class="small">${esc(o.arranque[1])}</p>
  ${url(o.links[2][2]) ? `<div class="row"><a class="btn ghost sm" href="${esc(o.links[2][2])}" target="_blank" rel="noopener">Agendar</a></div>` : ''}</section>
<section class="card"><h3>Dónde está cada cosa</h3><p class="muted small">Las clases están en la comunidad AT WORK, dentro de «Learning», y tu camino con los links está en <a href="#camino">Mi camino</a>. Lo tuyo vive en tu carpeta personal de Drive:</p>
  <ul class="dates">${P.carpetas.map(([n, t, d]) => `<li><b>${n} · ${esc(t)}</b><span>${esc(d)}</span></li>`).join('')}</ul>
  <p class="muted small">Desde <a href="#proceso">Mi proceso</a> y <a href="#feedback">Pedir feedback</a> puedes subir tus archivos y quedan guardados en tu carpeta.</p></section>
<section class="card"><h3>Preguntas frecuentes</h3>${o.faq.map(([q, r]) => `<details class="faq"><summary>${esc(q)}</summary><p class="small">${esc(r)}</p></details>`).join('')}
  <p class="muted small">¿Dudas, prácticas, wins? En la comunidad. ¿Temas administrativos o privados? Por WhatsApp. Flor responde de lunes a viernes, en su horario de trabajo.</p></section>
<section class="card"><h3>Checklist antes de continuar</h3><p class="muted small">Antes de continuar, asegúrate de tener claro que…</p>
  <ul class="tasks" id="comp">${P.compromisos.map(([t, d], i) => `<li><label><input type="checkbox" data-i="${i}" ${(st.perfil.compromisos || []).includes(i) ? 'checked' : ''}><div><div class="t">${esc(t)}</div><div class="where">${esc(d)}</div></div></label></li>`).join('')}</ul>
</section>
<section class="card"><h3>Instálala en tu celular</h3>
  <p class="small"><b>iPhone:</b> abre esta página en Safari, toca compartir y elige “Agregar a inicio”. <b>Android:</b> en Chrome, toca los tres puntitos y “Instalar app”. <b>Compu:</b> guárdala en favoritos.</p>
</section>`;
    },
    mount() {
      $('#clave2').onclick = () => pantallaClave();
      montarCompromisos();
      const el = $('#onb'), total = onbDe(st.perfil).checklist.length;
      const c = () => { const n = $$('input:checked', el).length; $('#onbCount').textContent = n + ' de ' + total + ' listos'; $('#onbBar').style.width = (100 * n / total) + '%'; };
      el.addEventListener('change', () => {
        const hechos = $$('input:checked', el).map((x) => +x.dataset.i);
        st.perfil.onboarding = hechos; c();
        intentar(() => DB.guardarMiPerfil({ onboarding: hechos })).catch(() => {});
      });
      c();
    }
  };

  // ======================= Panel de Flor =======================
  async function mapaAlumnas() { const a = await DB.alumnas(); const m = {}; a.forEach((x) => { m[x.id] = x; }); return m; }

  // ---------- Bandeja ----------
  V.bandeja = {
    async html(tab = 'pedidos') {
      const [ped, ws, al] = await Promise.all([DB.todosPedidos(), DB.todosWeeklies(), mapaAlumnas()]);
      const pend = ped.filter((x) => x.estado === 'pendiente'), wp = ws.filter((x) => !x.respuesta_flor);
      const resp = ped.filter((x) => x.estado === 'respondido').slice(0, 30);
      const nom = (id) => esc((al[id] && (al[id].nombre || al[id].email)) || 'Alumna');
      const T = [['pedidos', 'Pedidos de feedback', pend.length], ['weeklies', 'Weeklies sin responder', wp.length], ['respondidos', 'Respondidos', '']];
      let cuerpo = '';
      if (tab === 'pedidos') cuerpo = pend.length ? pend.map((x) => `<div class="fbitem" data-pid="${x.id}">
        <div class="row between"><b>${nom(x.alumna_id)} · ${esc(x.titulo || tipoNombre(x.tipo))}</b><span class="muted small">${tipoNombre(x.tipo)} · ${fecha(x.creado, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
        ${x.texto ? `<pre>${esc(x.texto)}</pre>` : ''}${adjunto(x)}${url(x.link) ? ` <a class="small" href="${esc(x.link)}" target="_blank" rel="noopener">Abrir el link que mandó</a>` : ''}
        <div class="field"><label>Tu respuesta</label><textarea class="r" rows="5" placeholder="Lo que funcionó, tu foco para ella y qué clase ver."></textarea></div>
        <div class="field"><label>Correcciones</label><div class="corrs"></div><button type="button" class="linkbtn small addc">+ Agregar corrección</button></div>
        <p class="notas small muted" hidden></p>
        <div class="row"><button class="btn send" type="button">Enviar respuesta</button>${IA ? '<button class="btn ghost ia" type="button">Borrador con IA</button>' : ''}</div>
      </div>`).join('') : '<p class="muted">No hay pedidos pendientes. 🎉</p>';
      if (tab === 'weeklies') cuerpo = wp.length ? wp.map((x) => `<div class="fbitem" data-wid="${x.id}" data-aid="${x.alumna_id}">
        <div class="row between"><b>${nom(x.alumna_id)} · semana del ${fecha(x.semana, { day: 'numeric', month: 'long' })}</b><span class="muted small">Enviado ${fecha(x.enviado_en)}</span></div>
        ${wq(al[x.alumna_id]).map(([id, l]) => (x.respuestas[id] ? `<p class="small"><b>${l}</b><br>${esc(x.respuestas[id])}</p>` : '')).join('')}
        <div class="field"><label>Tu respuesta</label><textarea class="r" rows="5" placeholder="Su próximo paso para esta semana."></textarea></div>
        <div class="plan" hidden><span class="eyebrow">Para su “Mi semana”</span>
          <div class="field"><label>Foco de la semana</label><input type="text" class="pf"></div>
          <div class="field"><label>Por qué</label><input type="text" class="pft"></div>
          <div class="field"><label>Tareas (una por línea: tarea | dónde)</label><textarea class="pt" rows="3"></textarea></div>
          <label class="row small"><input type="checkbox" class="aplicar" checked> Cargarle este foco y estas tareas al enviar</label></div>
        <p class="notas small muted" hidden></p>
        <div class="row"><button class="btn sendw" type="button">Enviar respuesta</button>${IA ? '<button class="btn ghost iaw" type="button">Borrador con IA</button>' : ''}</div>
      </div>`).join('') : '<p class="muted">No hay weeklies sin responder.</p>';
      if (tab === 'respondidos') cuerpo = resp.length ? resp.map((x) => `<details class="fbitem"><summary><b>${nom(x.alumna_id)} · ${esc(x.titulo || tipoNombre(x.tipo))}</b> <span class="muted small">${fecha(x.respondido_en)}</span></summary><pre>${esc(x.texto)}</pre><div class="reply"><p>${esc(x.respuesta).replace(/\n/g, '<br>')}</p>${fixes(x.correcciones)}</div></details>`).join('') : '<p class="muted">Todavía no respondiste pedidos.</p>';
      return `<div class="head"><div><span class="eyebrow">Panel de Flor</span><h1>Bandeja</h1></div></div>
<div class="tabs">${T.map(([id, l, n]) => `<button type="button" data-tab="${id}" aria-pressed="${tab === id}">${l}${n !== '' ? ' (' + n + ')' : ''}</button>`).join('')}</div>
<section class="card">${cuerpo}</section>`;
    },
    mount() {
      $$('[data-tab]').forEach((b) => (b.onclick = () => (location.hash = 'bandeja/' + b.dataset.tab)));
      const filaCorr = (box, mal = '', bien = '') => {
        box.insertAdjacentHTML('beforeend', `<div class="corr"><input type="text" class="mal" placeholder="Lo que dijo" value="${esc(mal)}"><input type="text" class="bien" placeholder="Cómo se dice" value="${esc(bien)}"><button type="button" class="linkbtn small quitar">Quitar</button></div>`);
      };
      $$('[data-pid]').forEach((it) => {
        const box = $('.corrs', it);
        $('.addc', it).onclick = () => filaCorr(box);
        box.onclick = (e) => { if (e.target.classList.contains('quitar')) e.target.parentElement.remove(); };
        if ($('.ia', it)) $('.ia', it).onclick = async (e) => {
          const b = e.target; b.disabled = true; b.textContent = 'Armando borrador…';
          try { const r = await DB.borrador({ pedido_id: +it.dataset.pid || it.dataset.pid }); $('.r', it).value = r.respuesta; box.innerHTML = ''; (r.correcciones || []).forEach((c) => filaCorr(box, c.mal, c.bien)); if (r.notas) { $('.notas', it).hidden = false; $('.notas', it).textContent = 'Notas para ti: ' + r.notas; } }
          catch (er) { toast(er.message, true); }
          b.disabled = false; b.textContent = 'Borrador con IA';
        };
        $('.send', it).onclick = async () => {
          const r = $('.r', it).value.trim(); if (!r) return toast('Escribe tu respuesta.', true);
          const corr = $$('.corr', it).map((c) => ({ mal: $('.mal', c).value.trim(), bien: $('.bien', c).value.trim() })).filter((c) => c.mal && c.bien);
          await intentar(() => DB.responderPedido(+it.dataset.pid || it.dataset.pid, r, corr), 'Respuesta enviada');
          it.remove(); contarBandeja();
        };
      });
      $$('[data-wid]').forEach((it) => {
        const id = +it.dataset.wid || it.dataset.wid;
        if ($('.iaw', it)) $('.iaw', it).onclick = async (e) => {
          const b = e.target; b.disabled = true; b.textContent = 'Armando borrador…';
          try {
            const r = await DB.borrador({ weekly_id: id }); $('.r', it).value = r.respuesta;
            if (r.foco || (r.tareas || []).length) { $('.plan', it).hidden = false; $('.pf', it).value = r.foco || ''; $('.pft', it).value = r.foco_texto || ''; $('.pt', it).value = (r.tareas || []).map((t) => t.texto + (t.donde ? ' | ' + t.donde : '')).join('\n'); }
            if (r.notas) { $('.notas', it).hidden = false; $('.notas', it).textContent = 'Notas para ti: ' + r.notas; }
          } catch (er) { toast(er.message, true); }
          b.disabled = false; b.textContent = 'Borrador con IA';
        };
        $('.sendw', it).onclick = async () => {
          const r = $('.r', it).value.trim(); if (!r) return toast('Escribe tu respuesta.', true);
          await intentar(() => DB.responderWeekly(id, r), 'Respuesta enviada');
          if (!$('.plan', it).hidden && $('.aplicar', it).checked) {
            const aid = it.dataset.aid, foco = $('.pf', it).value.trim();
            if (foco) await intentar(() => DB.actualizarPerfil(aid, { foco_titulo: foco, foco_texto: $('.pft', it).value.trim() })).catch(() => {});
            const ts = $('.pt', it).value.split('\n').map((l) => l.split('|')).filter((p) => p[0].trim());
            for (const [t, d = ''] of ts) await DB.crearTarea(aid, t.trim(), d.trim(), Date.now() % 1e9).catch(() => {});
            if (foco || ts.length) toast('Respuesta enviada y su semana actualizada');
          }
          it.remove(); contarBandeja();
        };
      });
    }
  };

  // ---------- Alumnas ----------
  V.alumnas = {
    async html(sel) {
      const al = (await DB.alumnas()).filter((x) => x.rol !== 'admin' || DB.demo);
      const ya = new Set(al.map((x) => String(x.email || '').toLowerCase()));
      st._pend = DB.pendientesImportacion ? (await DB.pendientesImportacion().catch(() => [])).filter((x) => !ya.has(x.email)) : [];
      const a = al.find((x) => String(x.id) === sel);
      let det = '<section class="card empty-state"><h3>Elige una alumna</h3><p class="muted small">Desde acá le cargas su foco de la semana, sus tareas, las clases que tiene que ver, su progreso y sus patrones de error. Todo lo ve en su app y lo usa Flor AI.</p></section>';
      if (a) {
        const [t, pat, docs, ficha] = await Promise.all([DB.tareas(a.id), DB.patrones(a.id), DB.documentos(a.id), DB.ficha(a.id)]);
        st._docs = docs;
        st._alumna = a;
        const v = (k) => esc(a[k] ?? '');
        det = `<form class="card" id="aform" novalidate>
  <div class="row between"><h2>${esc(a.nombre || a.email)}</h2><span class="muted small">${esc(a.email || '')}</span></div>
  <div class="grid g-2e">
    <div class="field"><label for="f-nombre">Nombre</label><input id="f-nombre" type="text" value="${v('nombre')}"></div>
    <div class="field"><label for="f-formato">Formato</label><select id="f-formato">${['LAB', '1:1'].map((o) => `<option ${a.formato === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
  </div>
  <div class="field"><label for="f-trabajo">Su trabajo</label><small>A qué se dedica, con quién habla en inglés. Lo usa Flor AI.</small><input id="f-trabajo" type="text" value="${v('trabajo')}"></div>
  <div class="field"><label for="f-objetivo">Objetivo a 5 meses</label><textarea id="f-objetivo" rows="2">${v('objetivo')}</textarea></div>
  <div class="field"><label for="f-ficha">Lo que sabes de ella</label><small>Solo lo ves tú y lo usa Flor AI para guiarla como tú: su historia, su contexto, cómo trabaja, qué le funciona, qué la frena. Ella no lo ve.</small><textarea id="f-ficha" rows="6">${esc(ficha)}</textarea></div>
  <h3>Su semana</h3>
  <div class="field"><label for="f-foco_titulo">Foco de esta semana</label><input id="f-foco_titulo" type="text" value="${v('foco_titulo')}" placeholder="Ej.: Ordenar tu mensaje antes de hablar"></div>
  <div class="field"><label for="f-foco_texto">Por qué ese foco</label><textarea id="f-foco_texto" rows="2">${v('foco_texto')}</textarea></div>
  <div class="field"><label for="f-fecha_inicio">Fecha de inicio del programa</label><small>Con esto la app calcula en qué semana de los 20 está y qué le toca.</small><input id="f-fecha_inicio" type="date" value="${v('fecha_inicio')}"></div>
  <p class="small muted">Camino: ${(a.camino_hecho || []).length} tareas tildadas${semanaDe(a) ? ' · semana ' + semanaDe(a) + ' de 20' : ''} · Compromisos: ${(a.compromisos || []).length} de ${P.compromisos.length}</p>
  <div class="field"><label for="f-modulo_actual">Dónde está</label><select id="f-modulo_actual">${P.modulos.map((m) => `<option value="${m.n}" ${+a.modulo_actual === m.n ? 'selected' : ''}>M${m.n} · ${esc(m.nombre)}</option>`).join('')}</select></div>
  <div class="field"><label>Clases asignadas</label><small>Toca para asignar o sacar.</small>
    ${P.modulos.map((m) => `<div class="lessons" style="margin-bottom:4px"><span class="muted small" style="border:0;padding-left:0">M${m.n}</span>${m.clases.map((c) => `<button type="button" class="cl" data-cl="${esc(c)}" aria-pressed="${(a.clases_asignadas || []).includes(c)}">${esc(c)}</button>`).join('')}</div>`).join('')}
  </div>
  <h3>Progreso</h3>
  <div class="grid g-3">
    <div class="field"><label for="f-confianza_inicio">Confianza al empezar (1-10)</label><input id="f-confianza_inicio" type="number" min="1" max="10" value="${v('confianza_inicio')}"></div>
    <div class="field"><label for="f-confianza_hoy">Confianza hoy (1-10)</label><input id="f-confianza_hoy" type="number" min="1" max="10" value="${v('confianza_hoy')}"></div>
    <div class="field"><label for="f-audio_inicio">Audio de punto de partida</label><input id="f-audio_inicio" type="date" value="${v('audio_inicio')}"></div>
  </div>
  <div class="field"><label for="f-drive_url">Link a su carpeta de Drive</label><input id="f-drive_url" type="url" value="${v('drive_url')}" placeholder="https://drive.google.com/…"></div>
  <label class="row small"><input type="checkbox" id="f-activa" ${a.activa !== false ? 'checked' : ''}> Alumna activa</label>
  <div class="row"><button class="btn" type="submit">Guardar cambios</button><span class="muted small">Onboarding: ${(a.onboarding || []).length} de ${onbDe(a).checklist.length}</span></div>
</form>
<section class="card">
  <h3>Documentos</h3><p class="muted small">Su Acuerdo de Trabajo firmado, su Starting Point, su plan de acción. Ella los ve en “Mi proceso”.</p>
  ${docs.length ? `<ul class="dates">${docs.map((d) => `<li><b>${esc((P.tiposDoc.find((x) => x[0] === d.tipo) || [, 'Documento'])[1])}</b><span><button type="button" class="linkbtn" data-archivo="${esc(d.path)}">${esc(d.nombre)}</button> <button type="button" class="linkbtn small" data-deldoc="${d.id}">Quitar</button></span></li>`).join('')}</ul>` : '<p class="muted small">Sin documentos.</p>'}
  <form class="editrow" id="adform"><select id="ad-tipo">${P.tiposDoc.map(([v2, l]) => `<option value="${v2}">${l}</option>`).join('')}</select><input type="file" id="ad-file" accept=".pdf,image/*,.doc,.docx"><button class="btn sm" type="submit">Subir</button></form>
</section>
<section class="card">
  <div class="row between"><h3>Tareas extra de la semana</h3><button class="linkbtn small" id="limpiar">Borrar las hechas</button></div>
  <ul class="tasks">${t.map((x) => `<li><div class="fbitem" style="flex-direction:row;align-items:center;justify-content:space-between"><span>${x.hecha ? '✓ ' : ''}<b>${esc(x.texto)}</b>${x.donde ? '<br><span class="muted small">' + esc(x.donde) + '</span>' : ''}</span><button type="button" class="linkbtn small" data-deltarea="${x.id}">Quitar</button></div></li>`).join('') || '<li class="muted small">Sin tareas.</li>'}</ul>
  <form class="editrow" id="tform"><input type="text" id="t-texto" placeholder="Tarea (ej.: Ver la clase Dar un update)"><input type="text" id="t-donde" placeholder="Dónde / detalle (opcional)"><button class="btn sm" type="submit">Agregar</button></form>
</section>
<section class="card">
  <h3>Patrones de error</h3>
  ${pat.map((x) => `<div class="editrow" data-pat="${x.id}"><span>${esc(x.patron)} <span class="muted small">· ${esc(x.tipo)}</span></span><select class="pat-estado">${['Practicando', 'Resuelto'].map((o) => `<option ${x.estado === o ? 'selected' : ''}>${o}</option>`).join('')}</select><button type="button" class="linkbtn small pat-del">Quitar</button></div>`).join('') || '<p class="muted small">Sin patrones cargados.</p>'}
  <form class="editrow" id="patform"><input type="text" id="pa-patron" placeholder="Patrón (ej.: each + singular)"><select id="pa-tipo"><option>Fosilizado</option><option>Falta de base</option><option>Falso amigo</option></select><button class="btn sm" type="submit">Agregar</button></form>
</section>`;
      }
      return `<div class="head"><div><span class="eyebrow">Panel de Flor</span><h1>Alumnas</h1></div><span class="pill">${al.filter((x) => x.activa !== false && x.rol !== 'admin').length} activas</span></div>
<div class="grid" style="grid-template-columns:minmax(0,280px) minmax(0,1fr);align-items:start" id="agrid">
  <div class="grid">
    <form class="card" id="invform" novalidate><h3>Agregar alumna</h3><p class="muted small">Le creas el usuario con una contraseña provisoria y se la mandas por WhatsApp. Después ella puede cambiarla.</p>
      <input type="text" id="inv-nombre" placeholder="Nombre y apellido"><input type="email" id="inv-email" placeholder="Mail">
      <input type="text" id="inv-pw" placeholder="Contraseña provisoria"><button class="btn sm" type="submit">Crear alumna</button>
      <div id="inv-ok" hidden class="note small"></div></form>
    ${st._pend && st._pend.length ? `<section class="card" id="pendcard"><h3>Por crear (${st._pend.length})</h3><p class="muted small">Ya están cargadas con su formato, su carpeta, sus weeklies y tu ficha. Toca «Crear» y mándale el mensaje: cuando entre, ve todo lo suyo.</p>
      <div class="alist">${st._pend.map((x) => `<div class="editrow" data-pend="${esc(x.email)}"><span>${esc(x.nombre)}<br><span class="muted small">${esc(x.datos && x.datos.formato === 'LAB' ? 'Lab' : 'Private')} · ${esc(x.email)}</span></span><button type="button" class="btn sm pend-crear">Crear</button></div>`).join('')}</div></section>` : ''}
    <div class="alist" id="alist">${al.map((x) => `<button type="button" data-a="${x.id}" ${String(x.id) === sel ? 'aria-current="true"' : ''}><span>${esc(x.nombre || x.email)}${x.activa === false ? ' <span class="muted small">(inactiva)</span>' : ''}</span><span class="muted small">${esc(x.formato || '')}</span></button>`).join('')}</div>
  </div>
  <div class="grid" style="align-content:start">${det}</div>
</div>`;
    },
    mount(sel) {
      if (window.matchMedia('(max-width:860px)').matches) $('#agrid').style.gridTemplateColumns = '1fr';
      $$('[data-a]').forEach((b) => (b.onclick = () => (location.hash = 'alumnas/' + b.dataset.a)));
      const genPw = () => 'atwork-' + Math.random().toString(36).slice(2, 7);
      $('#inv-pw').value = genPw();
      const mensajeAlta = (nom, em, pw) => 'Hola' + (nom ? ' ' + nom.split(' ')[0] : '') + '! Ya tienes tu espacio de AT WORK 🎉\nEntra acá: ' + location.origin + location.pathname + '\nMail: ' + em + '\nContraseña provisoria: ' + pw + '\nCuando entres, ve a "Empieza acá" y crea tu propia contraseña.';
      const mostrarMsg = (ok, msg) => {
        ok.hidden = false;
        ok.innerHTML = '<b>Mándale esto por WhatsApp:</b><pre style="white-space:pre-wrap;font:inherit;margin:6px 0">' + esc(msg) + '</pre><button type="button" class="btn sm">Copiar mensaje</button> <a class="btn ghost sm" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(msg) + '">Abrir WhatsApp</a>';
        ok.querySelector('button').onclick = () => navigator.clipboard && navigator.clipboard.writeText(msg).then(() => toast('Copiado'));
      };
      $$('[data-pend] .pend-crear').forEach((b) => (b.onclick = async () => {
        const fila = b.closest('[data-pend]'), em = fila.dataset.pend, x = st._pend.find((p) => p.email === em), pw = genPw();
        b.disabled = true;
        try {
          await intentar(() => DB.invitar(em, x.nombre, pw), 'Cuenta creada');
          const ok = document.createElement('div'); ok.className = 'note small';
          fila.after(ok); fila.querySelector('button').remove();
          mostrarMsg(ok, mensajeAlta(x.nombre, em, pw));
          st._pend = st._pend.filter((p) => p.email !== em);
        } catch (er) { b.disabled = false; }
      }));
      $('#invform').onsubmit = async (e) => {
        e.preventDefault();
        const em = $('#inv-email').value.trim(), nom = $('#inv-nombre').value.trim(), pw = $('#inv-pw').value.trim();
        if (!em) return toast('Escribe el mail.', true);
        const btn = $('#invform button[type=submit]'); btn.disabled = true;
        try {
          await intentar(() => DB.invitar(em, nom, pw), 'Alumna creada');
          const msg = mensajeAlta(nom, em, pw);
          mostrarMsg($('#inv-ok'), msg);
          $('#inv-email').value = ''; $('#inv-nombre').value = ''; $('#inv-pw').value = genPw();
          const lista = await DB.alumnas();
          $('#alist').innerHTML = lista.filter((x) => x.rol !== 'admin' || DB.demo).map((x) => `<button type="button" data-a="${x.id}"><span>${esc(x.nombre || x.email)}</span><span class="muted small">${esc(x.formato || '')}</span></button>`).join('');
          $$('[data-a]').forEach((b) => (b.onclick = () => (location.hash = 'alumnas/' + b.dataset.a)));
        } catch (er) { /* ya avisó */ }
        btn.disabled = false;
      };
      const a = st._alumna; if (!a || String(a.id) !== sel) return;
      const aid = a.id;
      $$('.cl').forEach((b) => (b.onclick = () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true')));
      $('#aform').onsubmit = async (e) => {
        e.preventDefault();
        const g = (k) => $('#f-' + k).value.trim();
        const n = (k) => { const x = parseInt(g(k), 10); return isNaN(x) ? null : Math.min(10, Math.max(1, x)); };
        const c = {
          nombre: g('nombre'), formato: g('formato'), trabajo: g('trabajo'), objetivo: g('objetivo'),
          foco_titulo: g('foco_titulo'), foco_texto: g('foco_texto'), modulo_actual: +g('modulo_actual'),
          clases_asignadas: $$('.cl[aria-pressed="true"]').map((b) => b.dataset.cl),
          confianza_inicio: n('confianza_inicio'), confianza_hoy: n('confianza_hoy'), audio_inicio: g('audio_inicio') || null,
          drive_url: g('drive_url'), activa: $('#f-activa').checked, fecha_inicio: g('fecha_inicio') || null
        };
        await intentar(() => Promise.all([DB.actualizarPerfil(aid, c), DB.guardarFicha(aid, $('#f-ficha').value)]), 'Guardado');
        if (aid === st.perfil.id) Object.assign(st.perfil, c);
      };
      $('#adform').onsubmit = async (e) => {
        e.preventDefault(); const f = $('#ad-file').files[0]; if (!f) return toast('Elige un archivo.', true);
        const b = $('#adform button'); b.disabled = true; b.textContent = 'Subiendo…';
        try { await intentar(() => DB.subirDocumento(aid, f, $('#ad-tipo').value, f.name), 'Documento subido'); ruta(); }
        catch (er) { b.disabled = false; b.textContent = 'Subir'; }
      };
      $$('[data-deldoc]').forEach((b) => (b.onclick = async () => {
        const d = (st._docs || []).find((x) => String(x.id) === b.dataset.deldoc); if (!d || !confirm('¿Quitar este documento?')) return;
        await intentar(() => DB.borrarDocumento(d), 'Documento quitado'); ruta();
      }));
      $('#tform').onsubmit = async (e) => {
        e.preventDefault(); const tx = $('#t-texto').value.trim(); if (!tx) return;
        await intentar(() => DB.crearTarea(aid, tx, $('#t-donde').value.trim(), Date.now() % 1e9)); ruta();
      };
      $$('[data-deltarea]').forEach((b) => (b.onclick = async () => { await intentar(() => DB.borrarTarea(+b.dataset.deltarea || b.dataset.deltarea)); ruta(); }));
      $('#limpiar').onclick = async () => { await intentar(() => DB.borrarTareasHechas(aid), 'Listo'); ruta(); };
      $$('[data-pat]').forEach((r) => {
        const pid = +r.dataset.pat || r.dataset.pat;
        $('.pat-estado', r).onchange = (e) => intentar(() => DB.actualizarPatron(pid, { estado: e.target.value }), 'Guardado').catch(() => {});
        $('.pat-del', r).onclick = async () => { await intentar(() => DB.borrarPatron(pid)); ruta(); };
      });
      $('#patform').onsubmit = async (e) => {
        e.preventDefault(); const tx = $('#pa-patron').value.trim(); if (!tx) return;
        await intentar(() => DB.crearPatron(aid, tx, $('#pa-tipo').value, 'Practicando')); ruta();
      };
    }
  };

  // ---------- Programa (ajustes generales) ----------
  V.ajustes = {
    html() {
      const l = lab(), k = links(), pr = st.programa;
      const inp = (id, lab_, val, ph = '', type = 'text') => `<div class="field"><label for="${id}">${lab_}</label><input id="${id}" type="${type}" value="${esc(val || '')}" placeholder="${esc(ph)}"></div>`;
      return `<div class="head"><div><span class="eyebrow">Panel de Flor</span><h1>Programa</h1></div></div>
<p class="muted intro">Lo que cargas acá lo ven todas tus alumnas (y lo sabe Flor AI). Las clases y módulos se editan en <code>app/programa.js</code>.</p>
<form class="grid" id="prform" novalidate>
  <section class="card"><h3>Próximo lab</h3>
    <div class="grid g-2e">${inp('l-fecha', 'Fecha', l.fecha, 'Sábado 7 de noviembre')}${inp('l-horario', 'Horario', l.horario, '18:00 Argentina · 15:00 México')}</div>
    ${inp('l-tema', 'Tema', l.tema, 'Cómo dar un update claro en una reunión')}${inp('l-link', 'Link de Zoom', l.link, 'https://zoom.us/…', 'url')}
  </section>
  <section class="card"><h3>Links</h3>
    ${inp('k-plataforma', 'Plataforma con las clases grabadas', k.plataforma, 'https://academy.breakingbarriers.site', 'url')}
    ${inp('k-reservar', 'Reservar 1:1', k.reservar, 'https://calendly.com/…', 'url')}
    ${inp('k-comunidad', 'Comunidad de WhatsApp', k.comunidad, 'https://chat.whatsapp.com/…', 'url')}
    ${inp('k-whatsapp_flor', 'Tu WhatsApp', k.whatsapp_flor, 'https://wa.me/54911…', 'url')}
  </section>
  <section class="card"><h3>Fechas importantes</h3>
    <div class="field"><label for="fechas">Una por línea: cuándo | qué</label><textarea id="fechas" rows="5" placeholder="Sáb 7 nov | Lab · 18:00 Argentina">${esc((pr.fechas || []).map((f) => f.cuando + ' | ' + f.que).join('\n'))}</textarea></div>
  </section>
  <section class="card"><h3>Aviso para todas</h3>
    <div class="field"><label for="aviso">Aparece arriba de “Mi semana”. Déjalo vacío para no mostrar nada.</label><textarea id="aviso" rows="2">${esc(pr.aviso || '')}</textarea></div>
  </section>
  <div class="row"><button class="btn" type="submit">Guardar</button></div>
</form>`;
    },
    mount() {
      $('#prform').onsubmit = async (e) => {
        e.preventDefault();
        const g = (id) => $('#' + id).value.trim();
        const c = {
          proximo_lab: { fecha: g('l-fecha'), horario: g('l-horario'), tema: g('l-tema'), link: g('l-link') },
          links: { plataforma: g('k-plataforma'), reservar: g('k-reservar'), comunidad: g('k-comunidad'), whatsapp_flor: g('k-whatsapp_flor') },
          fechas: g('fechas').split('\n').map((x) => x.split('|')).filter((x) => x[0].trim()).map(([a, b]) => ({ cuando: a.trim(), que: (b || '').trim() })),
          aviso: g('aviso')
        };
        await intentar(() => DB.guardarPrograma(c), 'Guardado');
        Object.assign(st.programa, c);
      };
    }
  };

  boot();
})();
