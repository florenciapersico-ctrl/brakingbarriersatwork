// AT WORK · app de alumnas. Una vista por vez, según el #hash de la URL.
(function () {
  const P = window.PROGRAMA, DB = window.DB;
  const root = document.getElementById('root');
  const IA = DB.demo || !!(window.ATW_CONFIG || {}).FLOR_AI_ACTIVA; // Flor AI dentro de la app
  const st = { perfil: null, programa: {}, admin: false, chat: null, pendiente: null, enviando: false };

  // ---------- utilidades ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Links de Gmail en la cuenta de Flor (con «u/0» se abría la primera cuenta del navegador, que puede no ser la suya).
  const gmLink = (l) => String(l || '').replace('https://mail.google.com/mail/u/0/', 'https://mail.google.com/mail/?authuser=florenciapersico%40breakingbarriers.site');
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

  // Nombre claro para cada link (Flor, 13/11: todo link de un feedback se tiene que poder tocar y llevar a algún lado).
  function rotuloLink(u) {
    return /wa\.me/.test(u) ? 'WhatsApp de Flor' : /academy\./.test(u) ? 'Abrir la clase' : /docs\.google\.com\/document/.test(u) ? 'Abrir el documento'
      : /docs\.google\.com\/presentation/.test(u) ? 'Abrir la presentación' : /docs\.google\.com\/spreadsheets/.test(u) ? 'Abrir la planilla'
      : /drive\.google/.test(u) ? 'Abrir en Drive' : /meet\.google/.test(u) ? 'Entrar a la reunión' : /app\.breakingbarriers\.site/.test(u) ? 'Abrir en tu app' : 'Abrir el link';
  }
  // Markdown chico y seguro para las respuestas de Flor AI (negrita, listas, títulos, tablas).
  function inline(s) {
    const lk = (u, t) => /^#[a-z]+$/.test(u) ? `<a href="${u}">${t}</a>` : `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
    return esc(s)
      .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+|#[a-z]+)\)/g, (_, t, u) => lk(u, t))
      .replace(/(^|[\s(:])(https:\/\/[^\s<)\]]+[^\s<).,;:!?\]])/g, (_, a, u) => a + lk(u, rotuloLink(u)))
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  const linkear = (t) => inline(t);
  // Tareas (Flor, 17/11): el link largo no se muestra en el texto; va abajo como botón corto («Abrir la clase ↗»).
  function desenvolver(u) { try { const x = new URL(u); if (/(^|\.)google\.[a-z.]+$/.test(x.hostname) && x.pathname === '/url' && x.searchParams.get('q')) return x.searchParams.get('q'); } catch (e) {} return u; }
  function tareaHTML(s) {
    const urls = [];
    let t = String(s || '').replace(/\s*:?\s*\(?(https?:\/\/[^\s)<\]]+[^\s)<\].,;:!?])\)?/g, (_, u) => { urls.push(desenvolver(u)); return '\u0001'; });
    t = t.replace(/\s*\u0001+\s*$/, '').replace(/([^.!?:;,\s])\s*\u0001+\s*/g, '$1. ').replace(/\s*\u0001+\s*/g, ' ')
      .replace(/\s+([.,;!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
    if (urls.length && /[\p{L}\p{N}"»)]$/u.test(t)) t += '.';
    const vistos = [...new Set(urls)].filter((u) => /^https:\/\//i.test(u));
    return { txt: inline(t), links: vistos.length ? '<span class="tlinks">' + vistos.map((u) => `<a class="tlink" href="${esc(u)}" target="_blank" rel="noopener">${rotuloLink(u)} ↗</a>`).join('') + '</span>' : '' };
  }
  const tareaLinea = (s) => { const r = tareaHTML(s); return r.txt + (r.links ? ' ' + r.links : ''); };
  // Nombre corto y simpático para el saludo: su apodo (lo carga Flor en la ficha) o su primer nombre.
  function apodoDe(p) { return String((p && (p.apodo || p.nombre)) || '').trim().split(' ')[0]; }
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
    myday: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    semana: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    flor: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
    feedback: '<path d="M4 4h16v12H8l-4 4z"/><path d="M9 10l2 2 4-4"/>',
    weekly: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4M16 2v4M8 11h8M8 15h5"/>',
    camino: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
    micamino: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
    coaches: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    progreso: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    wins: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3a3 3 0 0 1-3 4M7 5H4a3 3 0 0 0 3 4"/>',
    empieza: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    proceso: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>',
    clases: '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    inicio: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    atwork: '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="M16 10l5-3v10l-5-3"/><circle cx="9.5" cy="12" r="2"/>',
    contenido: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    labs: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.2 14h9.6"/>',
    lab: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M7.2 14h9.6"/>',
    bandeja: '<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
    alumnas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 5.8"/>',
    ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.7 4.4V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>'
  };
  const svg = (k) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[k] + '</svg>';
  const GRUPOS = [
    ['Tu programa', [['semana', 'Mi semana'], ['myday', 'My Day'], ['lab', 'Mi lab'], ['clases', 'Tus clases'], ['camino', 'Mi camino'], ['empieza', 'Empieza acá']]],
    ['Con Flor', [['flor', 'Flor AI'], ['feedback', 'Pedir feedback'], ['weekly', 'Weekly report'], ['wins', 'Wins de todas']]],
    ['Tu práctica', [['coaches', 'Mis coaches'], ['progreso', 'Mi progreso']]]
  ];
  const VISTAS = GRUPOS.flatMap((g) => g[1]);
  const TITULOS = Object.fromEntries(VISTAS.concat([['bandeja', 'Bandeja'], ['alumnas', 'Alumnas'], ['ajustes', 'Programa'], ['inicio', 'Inicio'], ['labs', 'Labs'], ['atwork', 'AT WORK'], ['contenido', 'Contenido']]));
  const ADMIN = [['bandeja', 'Bandeja'], ['alumnas', 'Alumnas'], ['ajustes', 'Programa']];
  // Menú propio de Flor (administradora): nada de "tu programa" de alumna. Para ver lo de ellas: "Ver la app como alumna".
  const MENU_FLOR = [['inicio', 'Inicio'], ['bandeja', 'Bandeja'], ['alumnas', 'Alumnas'], ['atwork', 'AT WORK'], ['micamino', 'Mi camino'], ['contenido', 'Contenido'], ['labs', 'Labs'], ['progreso', 'Mis números'], ['wins', 'Wins de alumnas'], ['ajustes', 'Programa']];
  const esFlor = () => st.admin && !DB.demo;
  // "Mi lab" solo aparece en el menú de las alumnas del formato LAB (Flor, 14/11). Las 1:1 van al lab como invitadas.
  const conLab = () => !st.perfil || st.perfil.formato !== '1:1';
  const vistaOk = ([id]) => id !== 'lab' || conLab();

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
        const m = $('#em').value.trim(), b = $('button[type=submit]', f);
        if (!m) { $('#msg').innerHTML = '<span class="err-text">Escribe tu mail para mandarte el link.</span>'; $('#em').focus(); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) { $('#msg').innerHTML = '<span class="err-text">Revisa el mail: parece que le falta algo.</span>'; $('#em').focus(); return; }
        b.disabled = true; $('#msg').textContent = 'Enviando…';
        try { await DB.recuperar(m); $('#msg').textContent = 'Listo. Revisa tu mail (y la carpeta de spam).'; }
        catch (er) { $('#msg').innerHTML = '<span class="err-text">' + esc(er.message) + '</span>'; }
        b.disabled = false;
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
      setTimeout(() => DB.backupDiario && DB.backupDiario(), 8000);
    } catch (e) {
      root.innerHTML = '<div class="auth"><div class="card"><h2>No pudimos cargar tu espacio</h2><p class="muted">' + esc(e.message) + '</p><button class="btn" id="re">Reintentar</button><button class="linkbtn small" id="out">Salir</button></div></div>';
      $('#re').onclick = entrar; $('#out').onclick = () => DB.logout();
      return;
    }
    st.programa = st.programa || {};
    st.admin = st.perfil.rol === 'admin';
    shell();
    if (!location.hash || /access_token|type=/.test(location.hash)) location.replace('#' + (esFlor() ? 'inicio' : 'semana'));
    ruta();
    if (!st.admin) avisosNuevos();
  }

  // Aviso en la app cuando Flor le respondió algo que todavía no vio (además del mail).
  const VISTO = (k) => 'atw-visto-' + k + '-' + (st.perfil && st.perfil.id);
  async function avisosNuevos() {
    try {
      const [ps, ws] = await Promise.all([DB.pedidos(), DB.weeklies()]);
      const ult = (arr, campo) => arr.map((x) => x[campo] || '').filter(Boolean).sort().pop() || '';
      const marcas = { feedback: ult(ps.filter((x) => x.estado === 'respondido'), 'respondido_en'), weekly: ult(ws.filter((x) => x.respuesta_flor), 'respondido_en') };
      let hay = false;
      Object.entries(marcas).forEach(([k, t]) => {
        let visto = ''; try { visto = localStorage.getItem(VISTO(k)) || ''; } catch (e) { /* sin almacenamiento */ }
        if (!visto) { try { localStorage.setItem(VISTO(k), t || new Date().toISOString()); } catch (e) { /* */ } return; }
        if (t && t > visto) { $$('.nuevo-' + k).forEach((b) => (b.hidden = false)); hay = true; }
      });
      if (hay) toast('Flor te respondió. Míralo en ' + ($('.nuevo-feedback:not([hidden])') ? 'Pedir feedback' : 'Weekly report') + '.');
    } catch (e) { /* no es crítico */ }
  }
  function marcarVisto(v) {
    if (st.admin || (v !== 'feedback' && v !== 'weekly')) return;
    try { localStorage.setItem(VISTO(v), new Date().toISOString()); } catch (e) { /* */ }
    $$('.nuevo-' + v).forEach((b) => (b.hidden = true));
  }

  function navHTML(tab) {
    const it = ([id, l]) => (l = id === 'empieza' && (DB.demo || !st.admin) && onbHecho() ? 'Cómo funciona' : l, '<a href="#' + id + '" data-v="' + id + '">' + svg(id) + '<span>' + l + '</span>' + (id === 'bandeja' ? '<span class="badge"' + (tab ? '' : ' id="bdg"') + ' hidden></span>' : '') + (id === 'feedback' || id === 'weekly' ? '<span class="badge nuevo-' + id + '" hidden>Nuevo</span>' : '') + '</a>');
    // En el celular, lo primero es Mi semana (Flor, 20/11). Flor AI sigue entre las primeras para que se vea.
    const ORDEN = ['bandeja', 'semana', 'myday', 'flor', 'alumnas', 'feedback', 'weekly', 'camino'];
    const rank = (id) => { const i = ORDEN.indexOf(id); return i < 0 ? 99 : i; };
    if (esFlor()) return MENU_FLOR.slice(0, tab ? 5 : MENU_FLOR.length).map(it).join('') + (tab ? '' : '<div class="sep">Tus alumnas</div><a href="?demo#semana" target="_blank" rel="noopener">' + svg('alumnas') + '<span>Ver la app como alumna</span></a>');
    if (tab) return (st.admin && !DB.demo ? ADMIN.concat(VISTAS) : VISTAS).filter(vistaOk).sort((a, b) => rank(a[0]) - rank(b[0])).map(it).join('');
    return GRUPOS.map(([g, vs]) => '<div class="sep">' + g + '</div>' + vs.filter(vistaOk).map(it).join('')).join('') + (st.admin ? '<div class="sep">Panel de Flor</div>' + ADMIN.map(it).join('') : '');
  }
  // ¿Ya hizo el onboarding? (checklist completo o la primera tarea del camino tildada)
  function onbHecho(p) { p = p || st.perfil || {}; return (p.onboarding || []).length >= onbDe(p).checklist.length || (p.camino_hecho || []).includes('1.1'); }
  function txtT(t) { return t.privada && fmt(st.perfil) === '1:1' ? t.privada : t.texto; }
  function saludo() { const h = new Date().getHours(); return h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches'; }
  function iniciales(n) { return String(n || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join(''); }

  function shell() {
    const nom = st.perfil.nombre || st.perfil.email || '';
    root.innerHTML = '<div class="shell"><aside class="side"><div class="logo"><span class="tilde">~</span>AT WORK<small>Breaking Barriers</small></div><nav class="main">' + navHTML() + '</nav>' +
      '<div class="foot">' + (DB.demo ? '<span class="demo">Versión demo</span><button class="linkbtn" id="reset">Reiniciar datos de ejemplo</button>' : '') +
      '<button class="linkbtn" id="clave">Cambiar contraseña</button><button class="linkbtn" id="salir">Cerrar sesión</button></div></aside>' +
      '<div class="mainwrap">' + (DB.demo && /[?&]demo\b/.test(location.search) ? '<div class="demobar"><span>Estás viendo la app como alumna, con datos de ejemplo.</span><a class="btn sm" href="' + location.pathname + '#inicio">← Volver a mi panel</a></div>' : '') + '<header class="topbar"><span class="tb-title" id="tbt"></span><span class="tb-sp"></span>' +
      (st.admin ? '' : '<span class="fmt">' + (fmt(st.perfil) === '1:1' ? 'Private' : 'Lab') + '</span>') + '<button type="button" class="who" id="whob" aria-haspopup="true"><span class="av">' + esc(iniciales(nom)) + '</span><span class="nm">' + esc(nom.split(' ')[0]) + '</span></button>' +
      '<div class="whomenu" id="whom" hidden><span class="muted small">' + esc(st.perfil.email || '') + '</span><button type="button" class="linkbtn" id="mclave">Cambiar contraseña</button><button type="button" class="linkbtn" id="msalir">Cerrar sesión</button></div></header>' +
      '<main id="app"></main></div></div><nav class="tabbar">' + navHTML(true) + '</nav>';
    $('#salir').onclick = $('#msalir').onclick = () => DB.logout();
    $('#clave').onclick = $('#mclave').onclick = () => { $('#whom').hidden = true; pantallaClave(); };
    $('#whob').onclick = (e) => { e.stopPropagation(); $('#whom').hidden = !$('#whom').hidden; };
    document.addEventListener('click', (e) => { const m = $('#whom'); if (m && !m.hidden && !m.contains(e.target)) m.hidden = true; });
    if ($('#reset')) $('#reset').onclick = () => { DB.reiniciar(); location.reload(); };
    if (st.admin) contarBandeja();
  }

  // Todo lo de la bandeja junto: alumnas con cuenta + las que siguen en importación (sin repetir).
  async function cargarBandeja() {
    const [ped, ws, al, imp, res] = await Promise.all([DB.todosPedidosAdmin(), DB.todosWeekliesAdmin(), DB.alumnas(), DB.importacionTodas().catch(() => []), DB.todosResumenes ? DB.todosResumenes().catch(() => []) : []]);
    const porId = {}, mails = new Set();
    al.forEach((x) => { porId[x.id] = x; if (x.email) mails.add(x.email.toLowerCase()); });
    const vacio = (r) => !r || !Object.values(r).some((v) => String(v || '').trim());
    const W = [], T = [];
    ws.forEach((x) => { const a = porId[x.alumna_id] || {}; if (a.rol === 'admin' && !DB.demo) return; W.push({ src: 'app', id: x.id, aid: x.alumna_id, email: a.email, nombre: a.nombre || a.email || 'Alumna', perfil: a, semana: x.semana, respuestas: x.respuestas || {}, enviado_en: x.enviado_en, respuesta_flor: x.respuesta_flor, respondido_en: x.respondido_en, mail_borrador: x.mail_borrador }); });
    ped.forEach((x) => { const a = porId[x.alumna_id] || {}; T.push({ ...x, src: 'app', nombre: a.nombre || a.email || 'Alumna', perfil: a }); });
    imp.forEach((i) => {
      if (mails.has(String(i.email).toLowerCase())) return;
      const perfil = { formato: (i.datos || {}).formato || 'LAB' };
      (i.weeklies || []).forEach((x) => W.push({ src: 'imp', email: i.email, nombre: i.nombre, perfil, semana: x.semana, respuestas: x.respuestas || {}, enviado_en: x.enviado_en, respuesta_flor: x.respuesta_flor || null, respondido_en: x.respondido_en }));
      ((i.datos || {}).pedidos || []).forEach((x) => T.push({ ...x, src: 'imp', email: i.email, nombre: i.nombre, perfil, estado: x.respuesta ? 'respondido' : 'pendiente' }));
    });
    // Ventana de la bandeja (Flor, 14/11): solo lo de esta semana; a lo sumo lo de la semana pasada, con aviso.
    // Lo más viejo no se responde: queda aparte, para borrarlo sin mandar nada.
    const lunHoy = DB.lunes(), desde = DB.lunes(new Date(new Date(lunHoy + 'T12:00:00').getTime() - 7 * 864e5));
    const mailDe = (x) => String((x.perfil || {}).email || x.email || '').toLowerCase();
    // Clases con resumen ya mandado: si después de que lo subió tuvo clase y le mandaste el resumen, ya lo vieron en clase.
    const clasesDe = (x) => { const aid = x.alumna_id || x.aid || (x.perfil || {}).id; return aid ? res.filter((r) => r.alumna_id === aid) : []; };
    const claseDespues = (x, cuando) => clasesDe(x).filter((r) => String(r.creado || r.fecha) > String(cuando || '')).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))[0] || null;
    const respDespues = (x, cuando) => W.some((y) => y.respuesta_flor && String(y.email || '').toLowerCase() === mailDe(x) && String(y.respondido_en || y.semana) > String(cuando || ''))
      || T.some((y) => y.estado === 'respondido' && mailDe(y) === mailDe(x) && String(y.respondido_en || '') > String(cuando || ''));
    const wsPend = W.filter((w) => !w.respuesta_flor && (w.enviado_en || !vacio(w.respuestas)));
    // Un weekly se responde solo si es de esta semana o de la pasada, y si no hay uno más nuevo de ella (respondido o no).
    const hayMasNuevo = (w) => W.some((y) => String(y.email || '').toLowerCase() === String(w.email || '').toLowerCase() && String(y.semana) > String(w.semana) && (y.enviado_en || y.respuesta_flor));
    const sinResp = wsPend.filter((w) => String(w.semana || '') >= desde && !hayMasNuevo(w)).map((w) => {
      if (w.semana >= lunHoy) return w;
      const cl = claseDespues(w, w.enviado_en || w.semana + 'T23:59');
      return { ...w, pasada: { clase: cl ? cl.fecha : null, resp: respDespues(w, w.enviado_en || w.semana) } };
    });
    const wViejos = wsPend.filter((w) => !sinResp.includes(w) && !sinResp.some((y) => y.id && y.id === w.id));
    const resp = W.filter((w) => w.respuesta_flor);
    const orden = (a, b) => (a.semana < b.semana ? 1 : a.semana > b.semana ? -1 : String(a.nombre).localeCompare(String(b.nombre)));
    sinResp.sort(orden); resp.sort(orden); wViejos.sort(orden);
    // Tareas: lo mismo. Y si después de subirla ya tuvo clase y le mandaste el resumen, ya la vieron en clase:
    // no se manda otro feedback (Flor, 14/11). Va a «Ya lo vieron en clase», para borrarla.
    const pendT = T.filter((x) => x.estado === 'pendiente').sort((a, b) => (a.creado < b.creado ? 1 : -1));
    const enClase = [], viejos = [], pend = [];
    pendT.forEach((x) => {
      const cl = claseDespues(x, x.creado);
      if (cl) enClase.push({ ...x, clase: cl.fecha });
      else if (lunesDe(x.creado) < desde) viejos.push(x);
      else pend.push(x);
    });
    const tResp = T.filter((x) => x.estado === 'respondido').sort((a, b) => ((a.respondido_en || a.creado) < (b.respondido_en || b.creado) ? 1 : -1));
    const activas = al.filter((x) => x.rol !== 'admin' && x.activa !== false).map((x) => ({ nombre: x.nombre || x.email, email: (x.email || '').toLowerCase(), perfil: x }))
      .concat(imp.filter((i) => !mails.has(String(i.email).toLowerCase())).map((i) => ({ nombre: i.nombre, email: String(i.email).toLowerCase(), perfil: { ...(i.datos || {}), nombre: i.nombre } })));
    return { sinResp, resp, pend, viejos, enClase, wViejos, tResp, W, T, activas, imp, al };
  }
  // "Esta semana", "Semana pasada", "Semana del 26 de octubre"
  function nombreSemana(lun) {
    const hoy = DB.lunes(), d = (new Date(hoy + 'T12:00:00') - new Date(lun + 'T12:00:00')) / (7 * 864e5);
    const f = fecha(lun, { day: 'numeric', month: 'long' });
    return Math.round(d) === 0 ? 'Esta semana · del ' + f : Math.round(d) === 1 ? 'Semana pasada · del ' + f : 'Semana del ' + f;
  }
  const lunesDe = (iso) => DB.lunes(new Date(String(iso).length === 10 ? iso + 'T12:00:00' : iso));
  function porSemana(items, sem) {
    const g = []; items.forEach((x) => { const s = sem(x); let b = g.find((y) => y.s === s); if (!b) g.push((b = { s, items: [] })); b.items.push(x); });
    return g.sort((a, b) => (a.s < b.s ? 1 : -1));
  }

  // Cuántos feedbacks hay que dar: lo que una alumna mandó en los mismos días (±3 días) cuenta como uno solo (Flor, 21/11).
  function feedbacksPend(pend) {
    const g = [];
    [...(pend || [])].sort((p1, p2) => String(p1.creado).localeCompare(String(p2.creado))).forEach((x) => {
      const y = x.src === 'app' && g.find((z) => z.src === 'app' && z.alumna_id === x.alumna_id && Math.abs(new Date(x.creado) - new Date(z.ult)) <= 3 * 864e5);
      if (y) y.ult = x.creado; else g.push({ src: x.src, alumna_id: x.alumna_id, ult: x.creado });
    });
    return g.length;
  }
  async function contarBandeja() {
    try {
      const b = await cargarBandeja();
      const n = feedbacksPend(b.pend) + b.sinResp.length;
      $$('#bdg, .tabbar .badge').forEach((x) => { x.textContent = n; x.hidden = !n; });
    } catch (e) { /* no es crítico */ }
  }

  window.addEventListener('hashchange', () => { if (st.perfil) ruta(); });

  // Clases publicadas desde el panel (Flor, 20/11): cuando Flor marca «Ya la grabé» y pega el link de la academia,
  // la clase deja de estar «en grabación» para todas (Mi camino, Mi semana, Flor AI) sin tocar el código.
  // Mi camino editable desde el panel (Flor, 21/11): en programa.flor.camino se guarda
  //   ocultas: { id: 'por qué' }  → la tarea no la ve ninguna alumna (ni Flor AI la recomienda)
  //   cambios: { id: { texto, link, ws, nota, pronto } } → gana sobre camino.js
  // P._caminoBase es el camino completo (con lo oculto); P.camino es lo que ven las alumnas.
  const CAMPOS = ['texto', 'link', 'ws', 'nota', 'pronto'];
  function aplicarPublicadas() {
    const F = (st.programa || {}).flor || {}, pub = F.publicadas || {}, C = F.camino || {};
    const ocultas = C.ocultas || {}, cambios = C.cambios || {};
    if (!P._caminoBase) P._caminoBase = P.camino;
    for (const m of P._caminoBase) for (const s of m.semanas) for (const t of s.tareas) {
      if (!t._o) { t._o = {}; CAMPOS.forEach((k) => { t._o[k] = t[k]; }); t._o.pronto = !!t.pronto; t._o.anticipo0 = !!t.anticipo; }
      CAMPOS.forEach((k) => { t[k] = t._o[k]; });
      const l = pub[t.id] && (pub[t.id].link || pub[t.id]);
      if (t._o.pronto && typeof l === 'string' && url(l)) { t.pronto = false; t.link = l; }
      const c = cambios[t.id];
      if (c) {
        if (c.texto) t.texto = c.texto;
        if ('link' in c) { t.link = url(c.link) || undefined; if (url(c.link)) t.pronto = false; }
        if ('ws' in c) t.ws = url(c.ws) || undefined;
        if ('nota' in c) t.nota = c.nota || undefined;
        if ('pronto' in c) t.pronto = !!c.pronto;
      }
      t.sube = c && c.sube ? c.sube : undefined;
      t.oculta = t.id in ocultas;
      // Antes de grabarla, la alumna la ve solo si Flor lo eligió (tiene worksheet o teoría para hacer mientras tanto).
      t.antes = c && 'anticipo' in c ? !!c.anticipo : !!t._o.anticipo0;
    }
    // Las alumnas ven SOLO lo publicado (Flor, 21/11): lo que falta grabar lo ve únicamente Flor.
    // Cuando Flor publica una clase (pega el link), les aparece sola.
    const armar = (ok) => P._caminoBase.map((m) => ({ ...m, _base: m, semanas: m.semanas.map((s) => ({ ...s, tareas: s.tareas.filter(ok) })) }));
    P.caminoFlor = armar((t) => !t.oculta);
    P.caminoAlumnas = armar((t) => !t.oculta && (!t.pronto || t.antes));
    P.camino = esFlor() ? P.caminoFlor : P.caminoAlumnas;
  }
  async function ruta() {
    aplicarPublicadas();
    const [v, ...args] = location.hash.replace(/^#/, '').split('/');
    let vista = V[v] && (!ADMIN.some(([id]) => id === v) || st.admin) ? v : 'semana';
    if (vista === 'inicio' && !esFlor()) vista = 'semana';
    if ((vista === 'lab' && !conLab()) || (['labs', 'atwork', 'contenido', 'micamino'].includes(vista) && !st.admin)) vista = 'semana';
    if (esFlor() && !MENU_FLOR.some(([id]) => id === vista)) vista = 'inicio';
    $$('nav a').forEach((a) => (a.dataset.v === vista ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    if ($('#tbt')) $('#tbt').textContent = esFlor() && (MENU_FLOR.find(([id]) => id === vista) || [])[1] ? MENU_FLOR.find(([id]) => id === vista)[1] : vista === 'empieza' && (DB.demo || !st.admin) && onbHecho() ? 'Cómo funciona' : (TITULOS[vista] || '');
    marcarVisto(vista);
    const app = $('#app');
    app.innerHTML = '<div class="view"><p class="muted">Cargando…</p></div>';
    try {
      if ((vista === 'camino' || vista === 'semana') && (!st.admin || DB.demo)) await cargarEntregas();
      const html = await V[vista].html(...args);
      app.innerHTML = '<div class="view">' + html + '</div>';
      if (V[vista].mount) await V[vista].mount(...args);
      await montarEjercicios(app).catch((e) => console.error(e));
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
  const TAG = { orientacion: 'Orientación', evidencia: 'Evidencia', habito: 'Hábito', comunidad: 'Comunidad', clase: 'Clase', practica: 'Práctica', coach: 'Coach', material: 'Material', envivo: 'En vivo', playbook: 'Playbook', worksheet: 'Worksheet', cierre: 'Cierre de módulo' };
  function accionTarea(t) {
    if (t.onb) { const l = (P.onbLinks[fmt(st.perfil)] || {})[t.onb]; return l ? `<a class="linkbtn small" href="${esc(l)}" target="_blank" rel="noopener">Ver clase</a>` : ''; }
    if (t.ir) return `<a class="linkbtn small" href="${t.ir}">Ir</a>`;
    if (t.coaches && !(/clase/.test(t.tipo) && t.link)) return `<a class="linkbtn small" href="#coaches">Mis coaches</a>`;
    if (t.reservar && fmt(st.perfil) === '1:1') return `<a class="linkbtn small" href="${esc((links().whatsapp_flor || 'https://wa.me/5491144101209'))}" target="_blank" rel="noopener">Avisar por WhatsApp</a>`;
    if (t.reservar && url(links().reservar)) return `<a class="linkbtn small" href="${esc(links().reservar)}" target="_blank" rel="noopener">Reservar</a>`;
    if (t.comunidad && url(links().comunidad)) return `<a class="linkbtn small" href="${esc(links().comunidad)}" target="_blank" rel="noopener">Comunidad</a>`;
    if (/clase/.test(t.tipo) && !t.pronto) { const l = url(t.link) || url(links().plataforma); return l ? `<a class="linkbtn small" href="${esc(l)}" target="_blank" rel="noopener">Ver clase</a>` : ''; }
    return '';
  }
  // Entregas desde Mi camino (Flor, 13/11): al lado de cada clase la alumna sube su playbook o su tarea;
  // le llega a Flor como pedido de feedback (origen 'camino:<id>') y la tarea queda hecha.
  function entregaDe(t) {
    if (t.ir === '#weekly' || t.onb) return null;
    if (t.id === '1.2') return { label: 'Subir mi acuerdo firmado', tipo: 'tarea', doc: 'acuerdo' };
    if (t.id === '1.3' || t.id === '19.1') return { label: 'Subir mi Starting Point', tipo: 'audio', doc: 'starting' };
    // Lo que eligió Flor desde su panel gana (21/11): 'no' | 'playbook' | 'worksheet' | 'tarea'.
    if (t.sube === 'no') return null;
    if (t.sube === 'playbook') return { label: 'Subir mi playbook', tipo: 'playbook' };
    if (t.sube === 'worksheet') return { label: 'Subir mi worksheet', tipo: 'playbook' };
    if (t.sube === 'tarea') return { label: 'Subir mi tarea', tipo: 'tarea' };
    if (t.entrega) return { label: t.entrega, tipo: 'playbook' };
    // Solo si la clase TIENE playbook o worksheet (Flor, 21/11: antes salía «Subir mi playbook» en todas).
    if ((t.ws && !t.wsExtra) || /worksheet/.test(t.tipo)) return { label: 'Subir mi worksheet', tipo: 'playbook' };
    if (/playbook/.test(t.tipo)) return { label: 'Subir mi playbook', tipo: 'playbook' };
    if (/evidencia|practica|material/.test(t.tipo)) return { label: 'Subir mi tarea', tipo: 'tarea' };
    return null;
  }
  function filaTarea(t, hechas) {
    const tags = t.tipo.split(' ').map((x) => TAG[x] || x).join(' + ');
    const ent = entregaDe(t), hecha = hechas.includes(t.id);
    const x = (st._entregas || {})[t.id];
    const estado = x ? (x.respuesta ? `<span class="pill ok">Entregado ✓</span> <a class="linkbtn small" href="#feedback">Ver el feedback de Flor</a>` : '<span class="pill ok">Entregado ✓</span> <span class="muted small">Esperando a Flor</span>') : '';
    const subir = !ent || x || (st.admin && !DB.demo) ? '' : `<button type="button" class="btn ghost sm" data-subir="${t.id}">${ent.label}</button>
      <form class="entrega" data-ent="${t.id}" hidden><input type="file" class="e-file" accept="audio/*,video/*,.pdf,image/*,.doc,.docx,.ppt,.pptx">
        <input type="url" class="e-link" placeholder="…o pega un link (Drive, Google Docs)"><textarea class="e-txt" rows="2" placeholder="¿Algo que quieras contarle a Flor? (opcional)"></textarea>
        <div class="row"><button class="btn sm" type="submit">Entregar</button><button type="button" class="linkbtn small e-x">Cancelar</button></div></form>`;
    const sinEnt = !ent && !hecha && !t.ir && !t.reservar && !t.comunidad ? (/clase/.test(t.tipo) ? '<span class="muted small">Esta clase no tiene playbook: márcala cuando la termines.</span>' : '<span class="muted small">Márcala cuando la termines.</span>') : '';
    return `<li><label><input type="checkbox" data-cam="${t.id}" ${hecha ? 'checked' : ''}><div><div class="t">${esc(txtT(t))}</div>${t.nota ? `<div class="muted small" style="margin:2px 0 4px">${esc(t.nota)}</div>` : ''}
      <div class="where">${tags} · ${esc(t.donde)} ${t.pronto ? (t.ws || (t.cb || []).length ? '<span class="pill warn">Video en grabación · ya puedes trabajarla con el worksheet y la teoría</span>' : '<span class="pill warn">En grabación · se publica pronto</span>') : ''} ${accionTarea(t)} ${t.ws ? `<a class="linkbtn small" href="${esc(t.ws)}" target="_blank" rel="noopener" title="Se guarda una copia en tu Drive para que la completes">⬇️ ${t.wsExtra ? 'Descargar worksheet para profundizar' : 'Descargar ' + (t.wsNombre || 'tu ' + (t.sube === 'playbook' ? 'playbook' : 'worksheet'))}</a>` : ''} ${sinEnt}</div></div></label>
      ${(t.cb || []).length ? `<details class="cb-extra"><summary class="small">📚 Para profundizar · Clarity Bank (${t.cb.length + (t.cbMas || []).length})</summary>
        <p class="muted small" style="margin:4px 0">${esc(t.cbIntro || 'Material de consulta: si quieres repasar la regla con más detalle, aquí está cada tema explicado paso a paso.')}</p>
        <ul class="small" style="margin:0;padding-left:18px">${t.cb.map((c) => `<li><a href="${esc(c.u)}" target="_blank" rel="noopener">${esc(c.t)}</a>${c.d ? ': ' + esc(c.d) : ''}</li>`).join('')}</ul>
        ${(t.cbMas || []).length ? `<p class="muted small" style="margin:8px 0 4px">Y si quieres ir un paso más:</p><ul class="small" style="margin:0;padding-left:18px">${t.cbMas.map((c) => `<li><a href="${esc(c.u)}" target="_blank" rel="noopener">${esc(c.t)}</a>${c.d ? ': ' + esc(c.d) : ''}</li>`).join('')}</ul>` : ''}</details>` : ''}
      ${estado || subir ? `<div class="ent-row">${estado}${subir}</div>` : ''}</li>`;
  }
  async function cargarEntregas() {
    try { const ped = await DB.pedidos(); const m = {}; ped.forEach((x) => { const k = /^camino:(.+)$/.exec(x.origen || ''); if (k && !m[k[1]]) m[k[1]] = x; }); st._entregas = m; } catch (e) { st._entregas = {}; }
  }
  function montarCamino(root) {
    if (root._camino) return; root._camino = true; // #app no cambia entre vistas: los listeners se agregan una sola vez
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-subir]');
      if (b) { e.preventDefault(); const f = $(`form[data-ent="${b.dataset.subir}"]`, root); b.hidden = true; f.hidden = false; return; }
      const x = e.target.closest('.e-x');
      if (x) { e.preventDefault(); const f = x.closest('form'); f.hidden = true; const bb = $(`[data-subir="${f.dataset.ent}"]`, root); if (bb) bb.hidden = false; }
    });
    root.addEventListener('submit', async (e) => {
      const f = e.target.closest('form.entrega'); if (!f) return;
      e.preventDefault();
      const id = f.dataset.ent, t = todasTareas().find((y) => y.id === id); if (!t) return;
      const ent = entregaDe(t) || { tipo: 'tarea' };
      const file = $('.e-file', f).files[0], link = $('.e-link', f).value.trim(), texto = $('.e-txt', f).value.trim();
      if (!file && !link) return toast('Sube tu archivo o pega el link.', true);
      if (link && !url(link)) return toast('El link tiene que empezar con https://', true);
      if (file && file.size > 50 * 1024 * 1024) return toast('El archivo pesa más de 50 MB: pega un link de Drive.', true);
      const b = $('button[type=submit]', f); b.disabled = true; b.textContent = file ? 'Subiendo…' : 'Enviando…';
      try {
        const archivo = file ? await intentar(() => DB.subirArchivo(file, 'pedidos')) : '';
        await intentar(() => DB.crearPedido({ tipo: ent.tipo, titulo: (ent.tipo === 'playbook' ? 'Playbook · ' : '') + txtT(t), texto, link, archivo, archivo_nombre: file ? file.name : '', origen: 'camino:' + id }));
        if (ent.doc) await DB.agregarDocumento(ent.doc, ent.doc === 'acuerdo' ? 'Acuerdo de Trabajo firmado' : 'Mi Starting Point', archivo || link).catch(() => {});
        const set = new Set(st.perfil.camino_hecho || []); set.add(id); st.perfil.camino_hecho = [...set];
        await DB.guardarMiPerfil({ camino_hecho: st.perfil.camino_hecho }).catch(() => {});
        toast('Listo: le llegó a Flor y la tarea quedó hecha ✓');
        ruta();
      } catch (er) { b.disabled = false; b.textContent = 'Entregar'; }
    });
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
  // Próximo lab: el sábado que viene (o hoy, si es sábado y todavía no terminó), 15:30 Argentina, siempre en Meet.
  const MEET_LAB = 'https://meet.google.com/gow-vnpg-xhx';
  const HORARIO_LAB = '15:30 a 16:30 Argentina · 12:30 México y Costa Rica · 13:30 Colombia';
  function proximoSabado() {
    const d = new Date(), h = d.getHours() * 60 + d.getMinutes();
    let add = (6 - d.getDay() + 7) % 7; if (add === 0 && h >= 16 * 60 + 30) add = 7;
    d.setDate(d.getDate() + add);
    const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const t = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    return { iso, fecha: t.charAt(0).toUpperCase() + t.slice(1) };
  }
  // Si el lab guardado ya pasó (o nunca tuvo fecha), lo pasa al próximo sábado: fecha, horario y Meet. Tema y material quedan para cargar.
  function labAlDia() {
    const l = lab(), s = proximoSabado();
    if (l.iso === s.iso) return null;
    return { iso: s.iso, fecha: s.fecha, horario: HORARIO_LAB, link: /meet\.google/.test(l.link || '') ? l.link : MEET_LAB, tema: '', material: '' };
  }
  const links = () => st.programa.links || {};
  const fixes = (c) => (c || []).map((x) => '<div class="fix"><s>' + esc(x.mal) + '</s><span class="arr muted">→</span><b>' + esc(x.bien) + '</b>' + (x.por_que ? '<span class="muted small"> · ' + esc(x.por_que) + '</span>' : '') + '</div>').join('');

  // ---------- Método de corrección de Flor ----------
  // 1) la respuesta de Flor · 2) sus frases para que ELLA encuentre el error y diga por qué · 3) la tabla con las respuestas.
  const ES = /^(como|con|si|la|el|los|las|es|va|para|porque|cuando|en|se|y|acá|aca|así|fijate|fíjate|ojo|una|un|lo|al|del|de|que|ya|solo|sólo|también|pero)\b/i;
  function partirBien(resto) {
    const re = /[.!?…:]\s+/g; let m;
    while ((m = re.exec(resto))) {
      const sig = resto.slice(m.index + m[0].length);
      if (/^[¿¡]/.test(sig) || ES.test(sig) || /^\S+\s+(es|son|va|van|significa|se|quiere|suena|lleva)\b/i.test(sig)) return [resto.slice(0, m.index + (m[0].trim() === ':' ? 0 : 1)).trim(), sig.trim()];
    }
    return [resto.trim(), ''];
  }
  // Saca del texto de Flor las líneas "frase de ella → frase corregida. Explicación" (como en sus mails).
  function separar(texto) {
    const L = String(texto || '').replace(/\r/g, '').split('\n'), quedan = [], corr = [];
    const esCorr = (l) => /\S\s*(→|->)\s*\S/.test(l) && (l.match(/→|->/g) || []).length === 1 && /[A-Za-zÁÉÍÓÚáéíóúñ]{3,}/.test(l.split(/→|->/)[0]) && l.length < 600;
    const esTit = (l) => l.trim().length > 2 && l.trim().length < 60 && /[A-ZÁÉÍÓÚÑ]{3}/.test(l) && l.trim() === l.trim().toUpperCase() && !/^ACORDATE/i.test(l.trim());
    for (let i = 0; i < L.length; i++) {
      const l = L[i];
      if (esTit(l) && i + 1 < L.length && esCorr(L[i + 1])) continue;
      if (esCorr(l)) {
        const [mal, ...r] = l.split(/\s*(?:→|->)\s*/);
        const [bien, por_que] = partirBien(r.join(' → '));
        const tit = i > 0 && esTit(L[i - 1]) ? L[i - 1].trim() : '';
        corr.push({ mal: mal.replace(/^[-•\d.)\s]+/, '').trim(), bien, por_que: por_que || (tit ? tit.charAt(0) + tit.slice(1).toLowerCase() : '') });
        continue;
      }
      quedan.push(l);
    }
    return { texto: quedan.join('\n').replace(/\n{3,}/g, '\n\n').trim(), correcciones: corr };
  }
  const parrafos = (t) => String(t || '').split(/\n{2,}/).map((p) => '<p>' + p.split('\n').map(inline).join('<br>') + '</p>').join('');
  // La devolución completa, con el ejercicio. clave = 'pedidos:12' o 'weekly:2026-11-09'.
  // fuente = el texto de la alumna donde están esas frases (su tarea o su weekly), para mandárselo a Narrative Flow.
  function devolucion(texto, corrs, clave, fuente) {
    let t = texto || '', c = (corrs || []).filter(corrValida);
    if (!c.length) { const s = separar(t); if (s.correcciones.length) { t = s.texto; c = s.correcciones; } }
    return parrafos(t) + (c.length ? ejercicioHTML(c, clave, fuente) : '');
  }
  // Weekly: Flor alienta y dice cómo seguir; no se corrigen errores del weekly (las correcciones son solo de las tareas).
  const respuestaWeekly = (texto) => parrafos(separar(texto).texto);
  // El weekly como texto, con el nombre de cada parte (para Narrative Flow).
  function weeklyTexto(perfil, w) {
    if (!w || !w.respuestas) return '';
    return wq(perfil).map(([id, l]) => (w.respuestas[id] ? `${l}: ${w.respuestas[id]}` : '')).filter(Boolean).join('\n\n');
  }
  // Una corrección sirve si la frase de ella tiene palabras (no "%", ",200,000" ni el mapa "Overall → Revenue → …").
  const corrValida = (x) => x && x.mal && /[A-Za-zÁÉÍÓÚáéíóúñ]{3,}/.test(x.mal) && x.bien;
  // La oración completa de ella donde está el error, con el error en negrita (Flor, 12/11: "tiene que estar la frase completa").
  function fraseCompleta(fuente, mal, html) {
    const m = String(mal || '').replace(/^["“«]|["”»]$/g, '').trim();
    const norm = (t) => t.toLowerCase().replace(/[“”«»"]/g, '').replace(/\s+/g, ' ');
    const ors = String(fuente || '').replace(/\r/g, '').split(/(?<=[.!?])\s+|\n+/).map((o) => o.trim()).filter(Boolean);
    const o = m.length > 2 && ors.find((x) => norm(x).includes(norm(m)));
    if (!o) return html ? '<b>' + esc(m) + '</b>' : '**' + m + '**';
    const i = norm(o).indexOf(norm(m)), raw = o.replace(/\s+/g, ' ');
    const antes = raw.slice(0, i), err = raw.slice(i, i + m.length), despues = raw.slice(i + m.length);
    return html ? esc(antes) + '<b>' + esc(err) + '</b>' + esc(despues) : antes + '**' + err + '**' + despues;
  }
  // El ejercicio se hace con el coach Narrative Flow (no en la app): acá ve sus frases completas con el error en negrita,
  // copia todo para Narrative Flow y, cuando terminó, puede mirar las correcciones de Flor.
  function ejercicioHTML(c, clave, fuente) {
    c = (c || []).filter(corrValida);
    if (!c.length) return '';
    return `<div class="ejer" data-clave="${esc(clave)}" data-c="${esc(JSON.stringify(c))}" data-f="${esc(fuente || '')}">
  <span class="eyebrow">Tu turno · ${c.length === 1 ? 'encuentra el error' : 'encuentra los errores'}</span>
  <p class="small muted">${c.length === 1 ? 'Esta frase es tuya' : 'Estas frases son tuyas'}: lo que está en negrita tiene un error. Corrígelo con tu coach Narrative Flow: copia todo, ábrelo en Claude y pégalo. Te guía uno por uno, sin darte la respuesta.</p>
  <ol class="ej-frases">${c.map((x) => `<li>${fraseCompleta(fuente, x.mal, true)}</li>`).join('')}</ol>
  <div class="row"><button type="button" class="btn sm ej-ai">Practicar con Narrative Flow</button><span class="muted small ej-ok"></span></div>
  <details class="ej-resp"><summary class="small">Ver las correcciones de Flor (después de practicar)</summary>
  <div class="tbl"><table><thead><tr><th>#</th><th>Tu frase</th><th>Corrección</th><th>Por qué</th></tr></thead><tbody>
  ${c.map((x, i) => `<tr><td>${i + 1}</td><td><s>${esc(x.mal)}</s></td><td><b>${esc(x.bien)}</b></td><td>${esc(x.por_que || '')}</td></tr>`).join('')}
  </tbody></table></div><p class="small muted">Ahora vuelve a decirlo (o a grabarlo) con la corrección: el segundo intento es el que fija.</p></details>
</div>`;
  }
  async function montarEjercicios(root) {
    for (const el of $$('.ejer', root)) {
      const c = JSON.parse(el.dataset.c || '[]');
      $('.ej-ai', el).onclick = () => {
        const celda = (t) => String(t || '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
        const limpio = (t) => String(t || '').replace(/[*_"“”«»]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        const fuente = el.dataset.f || '';
        const parrs = fuente.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
        const usados = parrs.filter((p) => c.some((x) => { const m = limpio(x.mal); return m.length > 3 && limpio(p).includes(m.slice(0, 40)); }));
        const texto = (usados.length ? usados : parrs).join('\n\n').slice(0, 6000);
        const tabla = '| # | Mi frase (el error está en negrita) | ¿Cómo la corrijo? | ¿Por qué? |\n|---|---|---|---|\n' + c.map((x, i) => `| ${i + 1} | ${celda(fraseCompleta(fuente, x.mal, false))} |  |  |`).join('\n');
        const txt = 'Narrative Flow: Flor me marcó estos errores en un texto mío para que los encuentre y los corrija yo. ' +
          'Abajo tienes mi texto completo y una tabla con mis frases completas: lo que está en negrita es el error que eligió Flor. ' +
          'Hagamos el ejercicio con tu método: de a una frase, yo escribo cómo la corrijo y por qué, y tú me dices si está bien, sin darme la respuesta antes de que lo intente. ' +
          'Si en mi texto ves uno o dos errores más que valga la pena trabajar, súmalos al final de la tabla.\n\n' +
          (texto ? 'MI TEXTO:\n' + texto + '\n\n' : '') + 'MIS FRASES CON LOS ERRORES QUE ELIGIÓ FLOR:\n' + tabla;
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Copiado. Abre Claude, elige tu coach Narrative Flow y pégalo.'), () => { prompt('Copia este texto y pégalo en tu coach Narrative Flow:', txt); });
      };
    }
  }

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
  // Dónde está (Flor, 21/11: módulos, no meses): el módulo que eligió ella en «Dónde estás»;
  // si no eligió, el que le toca por su fecha de inicio; si no hay fecha, el Módulo 1.
  function moduloDe(p) {
    p = p || {};
    if (p.modulo_actual != null && p.modulo_actual !== '') return Math.max(1, Math.min(5, +p.modulo_actual || 1));
    const n = semanaDe(p), c = n ? semanaCamino(n) : null; return c ? c.mes.n : 1;
  }
  // Lo que sigue: el primer bloque de su módulo (o de los siguientes) con algo sin hacer.
  function bloqueActual(p) {
    const h = new Set((p && p.camino_hecho) || []), m0 = moduloDe(p);
    for (const m of P.camino) { if (m.n < m0) continue; for (const s of m.semanas) if (s.tareas.some((t) => !h.has(t.id))) return { mes: m, sem: s }; }
    const m = P.camino.find((x) => x.n === m0), ss = m ? m.semanas.filter((s) => s.tareas.length) : [];
    return ss.length ? { mes: m, sem: ss[ss.length - 1] } : null;
  }
  function loQueSigue(p) {
    const h = new Set(p.camino_hecho || []), m0 = moduloDe(p);
    for (const m of P.camino) { if (m.n < m0) continue; for (const s of m.semanas) for (const t of s.tareas) if (!h.has(t.id) && !t.pronto) return { t, s, m }; }
    return null;
  }
  function etapasHTML(n, p) {
    const e = p && (p.modulo_actual === 0 || p.modulo_actual === '0') ? 0 : p ? moduloDe(p) : n ? etapaDe(n) : -1, h = new Set((p && p.camino_hecho) || []);
    const completa = (i) => { let hay = false; for (const m of P.camino) for (const s of m.semanas) if (etapaDe(Math.min(...s.s)) === i) for (const t of s.tareas) { if (t.pronto) continue; hay = true; if (!h.has(t.id)) return false; } return hay; };
    return `<div class="stepper">${P.recorrido.map((r, i) => `<div class="${completa(i) ? 'done' : i === e ? 'on' : ''}"><i>${completa(i) ? '✓' : i}</i><b>${esc(r.etapa)}</b><span>${esc(r.cuando)}</span></div>`).join('')}</div>`;
  }

  V.semana = {
    async html() {
      const [tareas, weeklies] = await Promise.all([DB.tareas(), DB.weeklies()]);
      st._tareas = tareas;
      const p = st.perfil, r = racha(weeklies), l = labAlDia() || lab(), n = semanaDe(p), av = avanceCamino(p), sig = loQueSigue(p);
      const acordado = tareas.find((t) => !t.hecha);
      const nombre = apodoDe(p);
      const aviso = st.programa.aviso ? '<p class="note">' + esc(st.programa.aviso) + '</p>' : '';
      // Recordatorio del weekly: si todavía no mandó el de esta semana (y ya terminó el onboarding o empezó el camino)
      const wHoy = weeklies.find((w) => w.semana === DB.lunes());
      const faltaW = !(wHoy && wHoy.enviado_en) && (onbHecho(p) || weeklies.length > 0) && !st.admin;
      const recW = faltaW ? `<section class="card feature recw"><span class="eyebrow">Recordatorio · weekly report</span><h2>${wHoy && Object.keys(wHoy.respuestas || {}).length ? 'Tu weekly está a medias' : 'Todavía no mandaste tu weekly de esta semana'}</h2><p class="muted">Son 5 a 10 minutos y es lo que le permite a Flor guiarte esta semana: tus wins, tu foco y qué necesitas de ella.</p><div class="row"><a class="btn" href="#weekly">${wHoy && Object.keys(wHoy.respuestas || {}).length ? 'Terminarlo ahora' : 'Completarlo ahora'}</a></div></section>` : '';
      const sinOnb = (p.onboarding || []).length < onbDe(p).checklist.length;
      const cs = bloqueActual(p);
      const hechasSem = cs ? cs.sem.tareas.filter((t) => (p.camino_hecho || []).includes(t.id)).length : 0;
      const enVivo = fmt(p) === '1:1'
        ? { t: 'Tu clase 1:1', d: p.horario_clase ? esc(p.horario_clase) : 'En tu horario fijo con Flor.', link: url(p.link_clase) || '' }
        : { t: l.fecha ? esc(l.fecha) : 'Lab de los sábados', d: l.fecha ? esc(l.horario || '') + (l.tema ? ' · ' + esc(l.tema) : '') : '15:30 a 16:30 de Argentina (12:30 MX y CR, 13:30 CO)', link: url(l.link) || 'https://meet.google.com/gow-vnpg-xhx' };
      // Mi semana (Flor, 13/11): arriba solo lo que sigue, sus tareas y su foco. Lo demás, abajo y plegado.
      const sinTareas = sig && fmt(p) !== '1:1'
          ? `<h2>${esc(txtT(sig.t))}</h2><p class="muted small">Módulo ${sig.m.n} · ${esc(sig.s.titulo)} · ${esc(sig.t.donde)}</p><div class="row">${accionTarea(sig.t).replace('linkbtn small', 'btn')}<a class="btn ghost" href="#camino">Ver mi camino</a></div>`
          : '<h2>Estás al día</h2><p class="muted small">Usa esta semana para practicar con tu material real y mandárselo a Flor.</p><div class="row"><a class="btn" href="#feedback">Mandar material real</a></div>';
      return `
<div class="hero"><div><h1>${saludo()}${nombre ? ', ' + esc(nombre) : ''}<span class="punto">.</span></h1>
  <p class="muted">${cs ? `Módulo ${cs.mes.n} · ${esc(cs.mes.titulo)}` : 'Tu espacio de AT WORK: todo lo de tu programa, en un solo lugar.'}</p></div></div>
${aviso}
${recW}
${sinOnb && !weeklies.length ? `<section class="card feature"><span class="eyebrow">Tu primera semana</span><h2>Empieza por tu onboarding</h2><p class="muted">Dónde está cada cosa, tu punto de partida y tu primera práctica. Con calma: entender todo lleva unas dos semanas.</p><div class="row"><a class="btn" href="#empieza">Ir a Empieza acá</a></div></section>` : ''}
<div class="grid g-2">
  <section class="card next">
    <div class="row between"><span class="eyebrow">${tareas.length ? 'Lo que sigue · tus tareas de la última clase' : 'Lo que sigue'}</span>${tareas.length ? '<span class="pill" id="taskCount"></span>' : ''}</div>
    ${tareas.length ? '<ul class="tasks" id="tasks">' + tareas.map((t) => `<li${t === acordado ? ' class="sigue"' : ''}><label><input type="checkbox" data-id="${t.id}" ${t.hecha ? 'checked' : ''}><div>${(() => { const r = tareaHTML(t.texto); return `<div class="t">${r.txt}</div>${r.links}`; })()}${t.donde ? '<div class="where">' + linkear(t.donde) + '</div>' : ''}</div></label></li>`).join('') + '</ul><p class="muted small">Te las deja Flor y se actualizan después de cada clase.</p>'
      : sinTareas}
  </section>
  ${p.foco_titulo ? `<section class="card feature"><span class="eyebrow">Tu foco de esta semana · lo eligió Flor</span><h2>${esc(p.foco_titulo)}</h2>${p.foco_texto ? '<p class="muted">' + esc(p.foco_texto) + '</p>' : ''}
    <div class="row"><button class="btn" type="button" data-ask="¿Dónde y cómo practico mi foco de esta semana (${esc(p.foco_titulo)})?">¿Dónde lo practico?</button><a class="btn ghost" href="#coaches">Mis coaches</a></div></section>`
    : `<section class="card empty-state"><span class="eyebrow">Tu foco de esta semana</span><h3>Flor lo elige con tu material</h3><p class="muted small">Cuando le mandes una reunión real o una práctica desde “Pedir feedback”, Flor te dice qué entrenar.</p><a class="btn ghost" href="#feedback">Pedir feedback</a></section>`}
</div>
<div class="acciones">
  <a class="accion principal" href="#weekly/cargar"><b>${wHoy && wHoy.enviado_en ? 'Actualizar mi weekly report' : 'Subir mi weekly report'}</b><span>${wHoy && wHoy.enviado_en ? 'Ya lo mandaste esta semana ✓' : 'Todos los lunes · 5 a 10 minutos'}</span></a>
  <a class="accion" href="#weekly/anteriores"><b>Ver mis weeklies</b><span>Tus reports y las respuestas de Flor</span></a>
  <a class="accion" href="#feedback"><b>Pedir feedback</b><span>Mándale a Flor una tarea o material real</span></a>
</div>
<div class="kpis">
  <section class="card kpi"><span class="eyebrow">Weekly · constancia</span><div class="kv"><span class="big">${r.actual}</span><span class="muted small">${r.actual === 1 ? 'lunes seguido' : 'lunes seguidos'}<br>Récord: ${r.rec}</span></div>
    <div class="streak">${r.celdas.map((c) => `<div class="${c.on ? 'on' : ''} ${c.hoy ? 'now' : ''}" title="${fecha(c.s)}">${c.on ? '✓' : c.hoy ? 'Hoy' : ''}</div>`).join('')}</div></section>
  <section class="card kpi"><span class="eyebrow">${fmt(p) === '1:1' ? 'En vivo con Flor' : 'Tu próximo lab'}</span><b class="kt">${enVivo.t}</b><span class="muted small">${enVivo.d}</span>${enVivo.link ? `<a class="small" href="${esc(enVivo.link)}" target="_blank" rel="noopener">${fmt(p) === '1:1' ? 'Entrar a tu clase ›' : 'Entrar al lab ›'}</a>` : ''}<a class="small" href="#clases">${fmt(p) === '1:1' ? 'Tus clases anteriores ›' : 'Tus labs anteriores ›'}</a></section>
  <section class="card kpi"><span class="eyebrow">Dónde estás</span><b class="kt" id="mod-t">${esc('M' + (P.modulos[p.modulo_actual || 0] || P.modulos[0]).n + ' · ' + (P.modulos[p.modulo_actual || 0] || P.modulos[0]).nombre)}</b><span class="muted small">${(p.clases_asignadas || []).length ? 'Te toca: ' + esc(p.clases_asignadas[p.clases_asignadas.length - 1]) : 'Elige tú en qué módulo estás; Flor también lo puede cambiar.'}</span>
    <label class="small muted" for="mod-yo">¿En qué módulo estás?</label><select id="mod-yo" class="sm">${P.modulos.map((m) => `<option value="${m.n}"${+(p.modulo_actual || 0) === m.n ? ' selected' : ''}>M${m.n} · ${esc(m.nombre)}</option>`).join('')}</select>
    <a class="small" href="#camino">Ver mi camino ›</a></section>
</div>
${fmt(p) === '1:1' ? '' : caminoSemanaHTML(p)}
<details class="card mas"><summary><b>Flor AI, tu recorrido y tus accesos</b><span class="muted small">Abrir</span></summary>
<div class="grid g-2" style="margin-top:12px">
  <section class="card ask"><span class="eyebrow">Flor AI</span><h3>¿Por dónde seguimos?</h3><p class="muted small">Conoce tu semana, tu foco, tu feedback y tu progreso. Te guía con el criterio de Flor.</p>
    <div class="asklist">
      <button type="button" data-ask="¿Qué me toca esta semana?"><b>¿Qué me toca esta semana?</b><span>Tu próximo paso según tu camino y tu foco.</span></button>
      <button type="button" data-ask="Tengo una reunión pronto y me quiero preparar"><b>Tengo una reunión pronto</b><span>Encontramos dónde te trabas y qué practicar.</span></button>
      <button type="button" data-ask="Ayúdame con mi weekly report"><b>Ayúdame con mi weekly</b><span>Lo ordenamos juntas antes del lunes.</span></button>
    </div></section>
<section class="card"><div class="row between"><h3>Tu recorrido</h3><a class="small" href="#camino">Ver detalle</a></div>${etapasHTML(n, p)}</section>
</div>
<section class="grid">
  <span class="eyebrow">A mano</span>
  <div class="quick">
    ${fmt(p) === '1:1' ? qa((links().whatsapp_flor || 'https://wa.me/5491144101209'), 'Avisarle a Flor', 'WhatsApp') : qa(enVivo.link, 'Link del lab', 'Sábados') + qa('https://calendar.app.google/kxnVBHB5XJam7JG69', 'Reservar mi 1:1', '30 min, 1 por mes')}
    ${qa(st.perfil.drive_url, 'Mi carpeta de Drive', 'Prácticas y material')}${qa(links().comunidad || 'https://chat.whatsapp.com/EKffC7cix6oDfeCCvfKGYv', 'Comunidad', 'Grupo de WhatsApp')}${qa((P.onbLinks[fmt(p)] || {}).curso ? 'https://academy.breakingbarriers.site/courses/products/6863ca67-9163-40bd-98de-f0c450d87919' : '', 'Curso AT WORK', 'Ver las clases')}
  </div>
</section>
</details>`;
    },
    mount() {
      montarCamino($('#app'));
      // La alumna elige ella misma su módulo (migración 21); Flor lo puede seguir cambiando desde su panel.
      if ($('#mod-yo')) $('#mod-yo').onchange = async (e) => {
        const n = +e.target.value, m = P.modulos.find((x) => x.n === n) || P.modulos[0], antes = st.perfil.modulo_actual;
        st.perfil.modulo_actual = n; $('#mod-t').textContent = 'M' + m.n + ' · ' + m.nombre;
        try { await intentar(() => DB.guardarMiPerfil({ modulo_actual: n }), 'Listo, quedó guardado'); }
        catch (er) { st.perfil.modulo_actual = antes; e.target.value = String(antes || 0); }
      };
      const el = $('#tasks'); if (!el) return ($('#taskCount') ? ($('#taskCount').textContent = '0') : null);
      const count = () => { $('#taskCount').textContent = el.querySelectorAll('input:checked').length + ' de ' + el.querySelectorAll('input').length; };
      el.addEventListener('change', (e) => { const i = e.target; intentar(() => DB.marcarTarea(+i.dataset.id || i.dataset.id, i.checked)).catch(() => { i.checked = !i.checked; count(); }); count(); });
      count();
    }
  };
  function caminoSemanaHTML(p) {
    const c = bloqueActual(p);
    if (!c) return '';
    return `<section class="card"><div class="row between"><div><span class="eyebrow">Tu camino · Módulo ${c.mes.n} · lo que sigue</span><h3>${esc(c.sem.titulo)}</h3></div><a class="small" href="#camino">Ver todo mi camino</a></div>
      ${c.sem.tareas.length ? `<ul class="tasks">${c.sem.tareas.map((t) => filaTarea(t, p.camino_hecho || [])).join('')}</ul>` : '<p class="muted small">Ahora es momento de aplicar en tu trabajo lo que ya viste: practícalo con tus coaches y cuéntaselo a Flor en tu Weekly Report.</p>'}
      ${onbHecho(p) ? `<details><summary class="small muted">Tus hábitos de todas las semanas</summary><ul class="tasks" style="margin-top:8px">${P.habitos.tareas.map((t) => `<li><div class="fbitem"><b>${esc(t.texto)}</b><span class="where muted small">${esc(t.donde)} ${accionTarea(t)}</span></div></li>`).join('')}</ul></details>` : ''}
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
<section class="card"><h3>Para practicar, usa tus coaches</h3><p class="muted small">Role Play, Narrative Flow, Color Method y Career Coach se instalan una sola vez en Claude (los tres primeros también en ChatGPT).</p><div class="row"><a class="btn ghost" href="#coaches">Ver mis coaches</a></div></section>`;
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
  const TIPOS = [['audio', 'Audio o video'], ['reunion', 'Reunión real (grabación o transcript)'], ['mail', 'Mail o mensaje'], ['tarea', 'Tarea de una clase'], ['playbook', 'Playbook de una clase grabada'], ['otro', 'Otra cosa']];
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
    ${x.estado !== 'respondido' ? `<div class="row"><button type="button" class="linkbtn small" data-ped-edit="${x.id}">Editar</button><button type="button" class="linkbtn small" data-ped-del="${x.id}">Borrar</button></div>
    <form class="ped-ed grid" data-ped-form="${x.id}" hidden><div class="field"><label for="pe-tit-${x.id}">Título</label><input type="text" id="pe-tit-${x.id}" class="pe-tit" value="${esc(x.titulo || '')}"></div><div class="field"><label for="pe-txt-${x.id}">Tu texto</label><textarea id="pe-txt-${x.id}" class="pe-txt" rows="5">${esc(x.texto || '')}</textarea></div><div class="row"><button class="btn sm" type="submit" disabled>Guardar cambios</button><button class="linkbtn small pe-cancel" type="button">Cancelar</button></div></form>` : ''}
    ${x.respuesta ? `<div class="reply" data-tit="${esc(x.titulo || '')}"><span class="eyebrow">Flor · ${fecha(x.respondido_en)}</span>${devolucion(x.respuesta, x.correcciones, 'pedidos:' + x.id, x.texto)}</div>` : ''}
  </div>`).join('') : '<p class="muted small">Todavía no mandaste nada. Empieza por tu audio de punto de partida.</p>'}
</section>`;
    },
    mount() {
      $$('[data-ped-edit]').forEach((bt) => (bt.onclick = () => { const fm = $(`[data-ped-form="${bt.dataset.pedEdit}"]`); fm.hidden = !fm.hidden; }));
      $$('[data-ped-form]').forEach((fm) => {
        // «Guardar cambios» se prende solo cuando algo cambió de verdad.
        const t0 = $('.pe-tit', fm).value, x0 = $('.pe-txt', fm).value, bG = $('button[type="submit"]', fm);
        const cambio = () => $('.pe-tit', fm).value !== t0 || $('.pe-txt', fm).value !== x0;
        fm.addEventListener('input', () => { bG.disabled = !cambio(); });
        $('.pe-cancel', fm).onclick = () => { $('.pe-tit', fm).value = t0; $('.pe-txt', fm).value = x0; bG.disabled = true; fm.hidden = true; };
        fm.onsubmit = async (e) => { e.preventDefault(); if (!cambio()) return; await intentar(() => DB.editarPedido(+fm.dataset.pedForm || fm.dataset.pedForm, { titulo: $('.pe-tit', fm).value.trim(), texto: $('.pe-txt', fm).value.trim() }), 'Cambios guardados'); ruta(); };
      });
      $$('[data-ped-del]').forEach((bt) => (bt.onclick = async () => { if (!confirm('¿Borrar este pedido? Flor ya no lo va a ver.')) return; await intentar(() => DB.borrarPedido(+bt.dataset.pedDel || bt.dataset.pedDel), 'Pedido borrado'); ruta(); }));
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
      if ($('#pai')) $('#pai').onclick = async () => {
        const t = $('#ptxt').value.trim(), file = $('#pfile').files[0];
        const esAudio = file && (/^(audio|video)\//.test(file.type) || /\.(mp3|m4a|wav|ogg|oga|opus|webm|aac|flac|mp4|mov|m4v|3gp|amr)$/i.test(file.name));
        if (!t && !esAudio) return toast('Primero pega tu texto o sube tu audio.', true);
        const enc = 'Revisa mi tarea y dame un primer feedback (' + tipoNombre($('#ptipo').value) + (($('#ptit').value.trim()) ? ': ' + $('#ptit').value.trim() : '') + ')';
        let trans = '';
        if (esAudio) {
          if (file.size > 50 * 1024 * 1024) return toast('El audio pesa más de 50 MB. Prueba con uno más corto.', true);
          const b = $('#pai'); b.disabled = true; b.textContent = 'Flor AI está escuchando tu audio…';
          try { const path = await DB.subirArchivo(file, 'practicas'); trans = await DB.escuchar(path); }
          catch (er) { toast(er.message, true); b.disabled = false; b.textContent = 'Primero, feedback de Flor AI'; return; }
        }
        st.pendiente = { texto: enc + (esAudio ? '. Te mando mi audio «' + file.name + '»: dame feedback de lo que dije y de mi pronunciación.' : ':') + (t ? '\n\n' + t : '') + (trans ? '\n\n' + trans : ''), coach: 'flor', enviar: true };
        location.hash = 'flor';
      };
    }
  };

  // ---------- Weekly report ----------
  // ---------- Tus clases (Flor, 13/11): el registro de cada clase o lab, con su resumen, su material y sus tareas ----------
  function verResumen(r) {
    const t = String(r.texto || '');
    const links = [...t.matchAll(/https:\/\/[^\s)>\]]+/g)].map((m) => m[0].split(/&(?:amp;)?(?:sa|source|ust|usg)=/)[0].replace(/[.,;]+$/, ''));
    const rotulo = (u) => /meet\.google|\.mp4|grabaci|recording|loom|youtu|vimeo/i.test(u) ? 'Ver la grabación' : /academy\./.test(u) ? 'Ver la clase del programa' : /docs\.google\.com\/(document|presentation)|drive\.google/.test(u) ? 'Abrir el material' : 'Abrir link';
    const sin = t.replace(/^.*(Material|Worksheet|Playbook|Documento|Grabaci[oó]n|Recording)[^:\n]*:\s*https:\/\/\S+\s*$/gim, '').trim();
    return { cuerpo: md(sin), links: [...new Set(links)].map((u) => ({ u, t: rotulo(u) })) };
  }
  V.clases = {
    async html() {
      const p = st.perfil, esLab = fmt(p) !== '1:1';
      const [res0, tareas] = await Promise.all([DB.resumenes ? DB.resumenes().catch(() => []) : [], DB.tareas().catch(() => [])]);
      // Uno por clase: si el mismo día hay el resumen automático (Wispr) y el mail de Flor, queda el de Flor.
      const porDia = {}; res0.forEach((r) => { const k = r.fecha + (/lab/i.test(r.asunto || '') ? ':lab' : ''); const y = porDia[k]; if (!y || (/^wispr:/.test(y.origen || '') && !/^wispr:/.test(r.origen || ''))) porDia[k] = r; });
      const res = Object.values(porDia).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
      const l = labAlDia() || lab();
      const prox = esLab
        ? { t: l.fecha ? esc(l.fecha) : 'Lab de los sábados', d: l.fecha ? esc(l.horario || '') + (l.tema ? ' · ' + esc(l.tema) : '') : '15:30 a 16:30 de Argentina', link: url(l.link) || 'https://meet.google.com/gow-vnpg-xhx' }
        : { t: 'Tu clase 1:1 con Flor', d: p.horario_clase ? esc(p.horario_clase) : 'En tu horario fijo con Flor.', link: url(p.link_clase) || '' };
      const pend = tareas.filter((t) => !t.hecha);
      const btns = (ls) => ls.length ? `<div class="row" style="gap:8px;flex-wrap:wrap">${ls.map((x, i) => `<a class="btn ${i ? 'ghost ' : ''}sm" href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.t)}</a>`).join('')}</div>` : '';
      const tit = (r) => esc(r.asunto && !/^resumen de tu clase$/i.test(r.asunto.trim()) ? r.asunto.replace(/^(Re:\s*)?Resumen de tu (clase|lab)\s*[·:\-–]?\s*/i, '') : (esLab ? 'Lab' : 'Clase'));
      return `<div class="head"><div><span class="eyebrow">${esLab ? 'Tus labs' : 'Tus clases en vivo'}</span><h1>Tus clases</h1></div></div>
<p class="muted intro">Cada ${esLab ? 'lab' : 'clase'} queda guardad${esLab ? 'o' : 'a'} acá: lo que trabajamos, el material, la grabación si la hay y lo que te quedó para hacer.</p>
<section class="card feature"><span class="eyebrow">${esLab ? 'Tu próximo lab' : 'Tu próxima clase'}</span><h2>${prox.t}</h2><p class="muted">${prox.d}</p>${prox.link ? `<div class="row"><a class="btn" href="${esc(prox.link)}" target="_blank" rel="noopener">${esLab ? 'Entrar al lab' : 'Entrar a tu clase'}</a></div>` : ''}</section>
${res.length ? res.map((r, i) => { const x = verResumen(r); return `<section class="card ${i ? '' : 'ultima'}">
  <details ${i ? '' : 'open'}><summary><div class="row between" style="width:100%"><div><span class="eyebrow">${i ? '' : (esLab ? 'Último lab · ' : 'Última clase · ')}${esc(fecha(r.fecha, { weekday: 'long', day: 'numeric', month: 'long' }))}</span><h3>${tit(r)}</h3></div></div></summary>
  ${btns(x.links)}
  <div class="feedback">${x.cuerpo}</div>
  ${!i && pend.length ? `<div class="reply"><span class="eyebrow">Lo que te quedó para hacer</span><ul>${pend.map((t) => `<li>${tareaLinea(t.texto)}${t.donde ? ' <span class="muted small">· ' + linkear(t.donde) + '</span>' : ''}</li>`).join('')}</ul><a class="small" href="#semana">Tildarlas en Mi semana ›</a></div>` : ''}
  </details></section>`; }).join('')
  : `<section class="card empty-state"><h3>Todavía no hay ${esLab ? 'labs' : 'clases'} guardad${esLab ? 'os' : 'as'}</h3><p class="muted small">Después de cada ${esLab ? 'lab' : 'clase'} con Flor, acá aparece el resumen con el material y tus tareas.</p></section>`}`;
    }
  };

  // ---------- Mi lab (alumnas del formato LAB, Flor 14/11): el próximo lab listo, su material, lo que les queda y el registro de cada lab ----------
  const btnsLinks = (ls) => ls.length ? `<div class="row" style="gap:8px;flex-wrap:wrap">${ls.map((x, i) => `<a class="btn ${i ? 'ghost ' : ''}sm" href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.t)}</a>`).join('')}</div>` : '';
  V.lab = {
    async html() {
      const l = labAlDia() || lab();
      const [res0, tareas] = await Promise.all([DB.resumenes().catch(() => []), DB.tareas().catch(() => [])]);
      const labs = res0.filter((r) => /lab/i.test(r.asunto || '') || /lab/i.test(r.origen || ''));
      const pend = tareas.filter((t) => !t.hecha && /lab/i.test(t.donde || ''));
      const mat = [url(l.lab_sheet) && { t: 'Tu Lab Sheet (haz tu copia)', u: l.lab_sheet }].concat((l.para_alumnas || []).map((x) => url(x.u) && x)).filter(Boolean);
      return `<div class="head"><div><span class="eyebrow">Working Lab · los sábados</span><h1>Mi lab</h1></div></div>
<p class="muted intro">Todo lo de tus labs en un lugar: el próximo, qué traer, el material y lo que trabajamos en cada uno.</p>
<section class="card feature"><span class="eyebrow">Tu próximo lab${l.fecha ? ' · ' + esc(l.fecha) : ''}</span><h2>${esc(l.tema || 'Working Lab')}</h2>
  <p class="muted">${esc(l.horario || HORARIO_LAB)}</p>
  ${l.objetivo ? `<p><b>Al terminar vas a poder:</b> ${linkear(l.objetivo)}</p>` : ''}
  <div class="row"><a class="btn" href="${esc(url(l.link) || MEET_LAB)}" target="_blank" rel="noopener">Entrar al lab</a></div>
  ${l.preparar ? `<div class="reply"><span class="eyebrow">Para traer al lab</span>${md(l.preparar)}</div>` : ''}
  ${btnsLinks(mat)}
</section>
${pend.length ? `<section class="card"><h3>Lo que te quedó de tus labs</h3><ul>${pend.map((t) => `<li>${tareaLinea(t.texto)}${t.donde ? ' <span class="muted small">· ' + linkear(t.donde) + '</span>' : ''}</li>`).join('')}</ul><a class="small" href="#semana">Tildarlas en Mi semana ›</a></section>` : ''}
<h3 style="margin:22px 0 8px">Tus labs</h3>
${labs.length ? labs.map((r, i) => { const x = verResumen(r); return `<section class="card ${i ? '' : 'ultima'}"><details class="lb" ${i ? '' : 'open'}><summary><div><span class="eyebrow">${i ? '' : 'Último lab · '}${esc(fecha(r.fecha, { weekday: 'long', day: 'numeric', month: 'long' }))}</span><h3>${esc(String(r.asunto || 'Lab').replace(/^(Re:\s*)?Resumen del? (tu )?lab\s*[·:\-–]?\s*/i, '') || 'Lab')}</h3></div></summary>${btnsLinks(x.links)}<div class="feedback">${x.cuerpo}</div></details></section>`; }).join('')
  : `<section class="card empty-state"><h3>Todavía no hay labs guardados</h3><p class="muted small">Después de cada lab, acá aparece lo que trabajamos, el material y lo que te queda para hacer.</p></section>`}`;
    }
  };

  // ---------- Labs (panel de Flor, 14/11): el lab de la semana listo para dar, tu feedback para el próximo y el registro de cada lab ----------
  // Se guarda en hoy_flor (solo la ve Flor, tipo 'otro'): clave 'lab:guion' (texto = guion, texto2 = feedback de Flor, link = guion en Docs, link2 = deck)
  // y 'lab:registro' (texto = qué se hizo, invitadas = las que vinieron). Lo llenan las tareas "🧪 Lab del sábado" y "🧪 Registro del lab".
  V.labs = {
    async html() {
      const l = labAlDia() || lab(), rows = await DB.labsFlor().catch(() => []);
      const G = {}; rows.forEach((r) => { (G[r.fecha] = G[r.fecha] || {})[r.clave === 'lab:registro' ? 'reg' : 'g'] = r; });
      const iso = l.iso || proximoSabado().iso, cur = G[iso] || {}, g = cur.g || {}, reg = cur.reg || {};
      st._labIso = iso;
      const links = [url(l.link) && { t: 'Entrar al Meet', u: l.link }, url(g.link) && { t: 'Guion en Google Docs', u: g.link }, url(g.link2 || l.deck) && { t: 'Presentación (Canva)', u: g.link2 || l.deck }, url(l.lab_sheet) && { t: 'Lab Sheet de las alumnas', u: l.lab_sheet }, url(l.material) && { t: 'Carpeta del lab', u: l.material }].filter(Boolean);
      const pasados = Object.keys(G).filter((f) => f < iso).sort().reverse();
      return `<div class="head"><div><span class="eyebrow">Working Labs · sábados 15:30</span><h1>Labs</h1></div></div>
<section class="card feature"><span class="eyebrow">${l.iso === diaISO(new Date()) ? 'Hoy · ' : 'Próximo lab · '}${esc(l.fecha || iso)}</span><h2>${esc(l.tema || 'Todavía sin tema')}</h2>
  <p class="muted">${esc(l.horario || HORARIO_LAB)}</p>
  ${l.objetivo ? `<p><b>Objetivo:</b> ${linkear(l.objetivo)}</p>` : ''}${l.porque ? `<p class="muted small"><b>Por qué este tema:</b> ${linkear(l.porque)}</p>` : ''}
  ${btnsLinks(links)}
</section>
${url(l.lab_sheet) ? `<section class="card"><p class="note enclase" style="margin:0">En el lab, pegá en el chat este link (a cada una le pide hacer su copia):<br><b style="word-break:break-all" id="labsheetlink">${esc(l.lab_sheet)}</b><br><button type="button" class="btn sm" id="labsheetcopy" style="margin-top:8px">Copiar link</button></p><p class="muted small" style="margin:8px 0 0">¡Que te vaya genial! 💙</p></section>` : ''}
<section class="card"><details class="lb" open><summary><h3>Guion para dar el lab</h3></summary>
  ${g.texto ? `<div class="feedback">${md(g.texto)}</div>` : `<p class="muted">Todavía no está el guion. La tarea "🧪 Lab del sábado" lo arma los jueves y lo deja acá.</p>`}
</details></section>
<section class="card"><h3>Tu feedback para el próximo lab</h3><p class="muted small">Lo que querés que cambie. La tarea del jueves lo lee antes de armar el próximo lab, así cada lab sale mejor.</p>
  <div class="field"><textarea id="labfb" rows="4" placeholder="Ej.: más práctica entre ellas, menos teoría; todo lo que digo, en inglés…">${esc(g.texto2 || '')}</textarea></div>
  <div class="row"><button class="btn sm" id="labfbok" type="button">Guardar feedback</button></div></section>
<section class="card"><h3>Registro de este lab</h3><p class="muted small">Qué se hizo y quiénes vinieron. Se completa solo después del lab (con la grabación); lo podés corregir acá.</p>
  <div class="field"><textarea id="labreg" rows="5" placeholder="Qué trabajamos, qué salió bien, qué ajustar.">${esc(reg.texto || '')}</textarea></div>
  ${(reg.invitadas || []).length ? `<p class="muted small"><b>Vinieron:</b> ${esc((reg.invitadas || []).join(', '))}</p>` : ''}
  <div class="row"><button class="btn sm" id="labregok" type="button">Guardar registro</button></div></section>
<h3 style="margin:22px 0 8px">Labs anteriores</h3>
${pasados.length ? pasados.map((f) => { const x = G[f], gg = x.g || {}, rr = x.reg || {}; return `<section class="card"><details class="lb"><summary><div><span class="eyebrow">${esc(fecha(f, { weekday: 'long', day: 'numeric', month: 'long' }))}</span><h3>${esc(gg.titulo || rr.titulo || 'Lab')}</h3></div></summary>
  ${btnsLinks([url(gg.link) && { t: 'Guion', u: gg.link }, url(gg.link2) && { t: 'Presentación', u: gg.link2 }].filter(Boolean))}
  ${rr.texto ? `<span class="eyebrow">Qué se hizo</span><div class="feedback">${md(rr.texto)}</div>` : '<p class="muted small">Sin registro.</p>'}
  ${(rr.invitadas || []).length ? `<p class="muted small"><b>Vinieron:</b> ${esc(rr.invitadas.join(', '))}</p>` : ''}
  ${gg.texto2 ? `<span class="eyebrow">Tu feedback</span><p>${linkear(gg.texto2)}</p>` : ''}
  ${gg.texto ? `<details><summary class="small">Ver el guion</summary><div class="feedback">${md(gg.texto)}</div></details>` : ''}
</details></section>`; }).join('') : '<p class="muted small">Todavía no hay labs anteriores registrados.</p>'}`;
    },
    mount() {
      const iso = st._labIso, l = labAlDia() || lab();
      if ($('#labsheetcopy')) $('#labsheetcopy').onclick = async () => { try { await navigator.clipboard.writeText($('#labsheetlink').textContent); toast('Link copiado. Pegalo en el chat del Meet.'); } catch (e) { toast('No se pudo copiar: seleccioná el link y copialo.', true); } };
      $('#labfbok').onclick = () => intentar(() => DB.guardarLabFlor(iso, 'lab:guion', { texto2: $('#labfb').value.trim(), titulo: l.tema || 'Lab' }), 'Guardado. El próximo lab lo va a tener en cuenta.');
      $('#labregok').onclick = () => intentar(() => DB.guardarLabFlor(iso, 'lab:registro', { texto: $('#labreg').value.trim(), titulo: l.tema || 'Lab' }), 'Registro guardado.');
    }
  };

  // ---------- My Day (alumnas · pedido de Gisela 17/11, Flor 19/11: «fundamental») ----------
  // Planner diario TODO en inglés: ritual corto de la mañana, el momento en inglés del día, 3 prioridades
  // (Work · English · Me), lo de AT WORK de hoy y el cierre del día. Se baja en PDF o se manda por mail.
  // Se guarda en mi_dia (migración 20), una fila por día, privada de cada alumna.
  const MD_DIAS = ['dom', 'lun', 'mar', 'mi[eé]', 'jue', 'vie', 's[aá]b'];
  const mdVacio = () => ({ energia: 0, quien: '', gracias: ['', '', ''], momento: '', frase: '', prioridades: [{ t: '', h: false }, { t: '', h: false }, { t: '', h: false }], identidad: '', dicha: false, hecho: false, minima: false, win: '', ingles: '', manana: '' });
  const mdNorm = (d) => { const x = Object.assign(mdVacio(), d || {}); x.gracias = [0, 1, 2].map((i) => (x.gracias || [])[i] || ''); x.prioridades = [0, 1, 2].map((i) => Object.assign({ t: '', h: false }, (x.prioridades || [])[i])); return x; };
  const MD_ID = "I'm a professional who speaks up in English, even when it isn't perfect.";
  const MD_EJES = [['Work', 'The one work thing that matters most today'], ['English', 'One English action (e.g. 10 min with Role Play, send that email)'], ['Me', 'Something that takes care of you (a walk, a real lunch, rest)']];
  const mdPaso = (d, k) => ({
    checkin: !!d.energia && !!d.quien.trim(),
    gracias: d.gracias.some((g) => g.trim()),
    momento: !!d.momento.trim(),
    prioridades: d.prioridades.every((p) => p.t.trim()),
    identidad: !!d.dicha,
  })[k];
  const MD_PASOS = ['checkin', 'gracias', 'momento', 'prioridades', 'identidad'];
  const mdCompleto = (d) => MD_PASOS.every((k) => mdPaso(d, k));
  const mdMinimo = (d) => !!d.energia && !!d.momento.trim() && !!d.prioridades[0].t.trim();
  // ¿Tiene clase hoy? Lee su horario («mar 19:00», «jue 18:30 o sáb», «Lab B sáb 15:30»).
  function mdClaseHoy(p) {
    const h = String((p && p.horario_clase) || '').toLowerCase(); if (!h) return null;
    const re = new RegExp('(^|[^a-zé])' + MD_DIAS[new Date().getDay()] + '[a-zé]*\\.?\\s*(\\d{1,2}[:.]\\d{2})?', 'i');
    const m = h.match(re); if (!m) return null;
    return { hora: m[2] ? m[2].replace('.', ':') : '', link: url(p.link_clase) };
  }
  const mdFecha = (iso, o = { weekday: 'long', day: 'numeric', month: 'long' }) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', o);
  // Texto plano del día, para mandárselo por mail a ella misma.
  function mdTexto(f, d, nom) {
    const L = [`MY DAY · ${mdFecha(f)}${nom ? ' · ' + nom : ''}`, ''];
    if (d.energia || d.quien) L.push(`Energy: ${d.energia || '-'}/10${d.quien ? ' · Today I want to be: ' + d.quien : ''}`);
    const g = d.gracias.filter((x) => x.trim()); if (g.length) L.push('', "I'm grateful for:", ...g.map((x) => '- ' + x));
    if (d.momento) L.push('', 'My English moment today: ' + d.momento);
    if (d.frase) L.push('The phrase I\'ll use: "' + d.frase + '"');
    const pr = d.prioridades.map((p, i) => [p, MD_EJES[i][0]]).filter(([p]) => p.t.trim());
    if (pr.length) L.push('', 'My 3 priorities:', ...pr.map(([p, e]) => `[${p.h ? 'x' : ' '}] ${e}: ${p.t}`));
    if (d.dicha) L.push('', d.identidad || MD_ID);
    if (d.win || d.ingles || d.manana) L.push('', 'END OF DAY');
    if (d.win) L.push("Today's win: " + d.win);
    if (d.ingles) L.push('English that worked: ' + d.ingles);
    if (d.manana) L.push('Tomorrow I will: ' + d.manana);
    L.push('', '— AT WORK · My Day · https://app.breakingbarriers.site/#myday');
    return L.join('\n');
  }
  function mdRacha(dias, hoyI) {
    const h = new Set(dias.filter((x) => x.d.hecho).map((x) => x.fecha));
    const t = new Date(hoyI + 'T12:00:00'); if (!h.has(hoyI)) t.setDate(t.getDate() - 1);
    let n = 0; while (h.has(diaISO(t))) { n++; t.setDate(t.getDate() - 1); }
    return n;
  }
  // My log: los días anteriores y, por semana, lo que logró (para usar en su Weekly report).
  function mdLogHTML(dias, hoyI) {
    const T = dias.filter((x) => x.d.hecho || x.d.win.trim() || x.d.prioridades.some((p) => p.t.trim())).slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    if (!T.length) return '';
    const lunDe = (f) => DB.lunes(new Date(f + 'T12:00:00'));
    const S = {}; T.forEach((x) => { (S[lunDe(x.fecha)] = S[lunDe(x.fecha)] || []).push(x); });
    const sems = Object.keys(S).sort().reverse().slice(0, 8);
    const dia = (x) => { const d = x.d, pr = d.prioridades.map((p, i) => [p, MD_EJES[i][0]]).filter(([p]) => p.t.trim());
      return `<details class="reg-dia"><summary><b>${esc(mdFecha(x.fecha, { weekday: 'long', day: 'numeric', month: 'short' }))}</b> ${d.hecho ? (d.minima ? '· ½ quick version' : '· ✓') : '· not finished'}${d.win.trim() ? ' · 🏆' : ''}</summary>
  ${d.energia ? `<p class="small"><b>Energy:</b> ${d.energia}/10${d.quien ? ' · ' + esc(d.quien) : ''}</p>` : ''}
  ${d.gracias.some((g) => g.trim()) ? `<p class="small"><b>Grateful for:</b> ${d.gracias.filter((g) => g.trim()).map(esc).join(' · ')}</p>` : ''}
  ${d.momento ? `<p class="small"><b>English moment:</b> ${esc(d.momento)}${d.frase ? ` · <i>"${esc(d.frase)}"</i>` : ''}</p>` : ''}
  ${pr.length ? `<ul class="small reg-acc">${pr.map(([p, e]) => `<li>${p.h ? '✅' : '⬜'} <b>${e}:</b> ${esc(p.t)}</li>`).join('')}</ul>` : ''}
  ${d.win.trim() ? `<p class="small"><b>🏆 Win:</b> ${esc(d.win)}</p>` : ''}
  ${d.ingles.trim() ? `<p class="small"><b>English that worked:</b> ${esc(d.ingles)}</p>` : ''}
</details>`; };
    const sem = (l, i) => { const L = S[l], hechos = L.filter((x) => x.d.hecho).length;
      const pr = L.flatMap((x) => x.d.prioridades.filter((p) => p.t.trim())), ok = pr.filter((p) => p.h);
      const wins = L.filter((x) => x.d.win.trim()), eng = L.filter((x) => x.d.ingles.trim());
      const txtW = wins.map((x) => '- ' + x.d.win.trim()).concat(eng.map((x) => '- English that worked: ' + x.d.ingles.trim())).join('\n');
      return `<details class="reg-sem"${i === 0 ? ' open' : ''}><summary><b>${l === lunDe(hoyI) ? 'This week' : 'Week of ' + esc(mdFecha(l, { month: 'short', day: 'numeric' }))}</b> <span class="muted small">· ${hechos} ${hechos === 1 ? 'day' : 'days'} · ${ok.length} of ${pr.length} priorities done</span></summary>
  ${wins.length || eng.length ? `<p class="hab-sec">🏆 Wins of the week</p><ul class="small reg-acc">${wins.map((x) => `<li>🏆 <b>${esc(mdFecha(x.fecha, { weekday: 'short' }))}:</b> ${esc(x.d.win)}</li>`).join('')}${eng.map((x) => `<li>🗣️ <b>${esc(mdFecha(x.fecha, { weekday: 'short' }))}:</b> ${esc(x.d.ingles)}</li>`).join('')}</ul>
  <div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn ghost sm" data-mdcopy="${esc(txtW)}">Copy my wins</button><a class="btn ghost sm" href="#weekly">Open my Weekly report</a></div>` : '<p class="muted small">No wins written yet this week.</p>'}
  <p class="hab-sec">Day by day</p>${L.map(dia).join('')}
</details>`; };
    return `<section class="card registro md-noprint" id="mdlog"><div class="row between"><h2>📖 My log</h2><span class="muted small">${((n) => n + (n === 1 ? ' day' : ' days'))(T.filter((x) => x.d.hecho).length)}</span></div>
  <p class="muted small">Your past days and, week by week, what you achieved. Use it for your Weekly report.</p>
  ${sems.map(sem).join('')}
</section>`;
  }

  V.myday = {
    async html() {
      const p = st.perfil || {}, hoy = new Date(), hoyI = diaISO(hoy);
      const desde = new Date(hoy); desde.setDate(desde.getDate() - 70);
      const [rows, tareas] = await Promise.all([DB.miDia ? DB.miDia(diaISO(desde)).catch((e) => { console.error(e); return null; }) : null, DB.tareas().catch(() => [])]);
      if (rows === null) throw new Error('My Day is not ready yet. Try again in a few minutes.');
      const dias = rows.map((r) => ({ fecha: r.fecha, d: mdNorm(r.datos) }));
      let hoyD = dias.find((x) => x.fecha === hoyI);
      if (!hoyD) { hoyD = { fecha: hoyI, d: mdVacio() }; dias.push(hoyD); }
      const d = hoyD.d; st._md = { f: hoyI, d };
      const racha = mdRacha(dias, hoyI), nDias = dias.filter((x) => x.d.hecho).length;
      const nom = apodoDe(p), h = hoy.getHours(), hola = h < 12 ? 'Good morning' : h < 19 ? 'Good afternoon' : 'Good evening';
      const clase = mdClaseHoy(p), pend = (tareas || []).filter((t) => !t.hecha);
      const on = (k) => (mdPaso(d, k) ? ' on' : '');
      const ta = (id, v, ph, rows = 1, lab = '') => `<textarea class="rit-auto" ${id} rows="${rows}" placeholder="${esc(ph)}" aria-label="${esc(lab || ph)}">${esc(v)}</textarea>`;
      const cuenta = nDias ? `${nDias} ${nDias === 1 ? 'day' : 'days'}${racha > 1 ? ` · 🔥 ${racha} in a row` : ''}` : '';
      const energia = `<div class="md-en" role="group" aria-label="Energy from 1 to 10">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<button type="button" data-en="${n}" aria-pressed="${d.energia === n}" class="${d.energia === n ? 'on' : ''}">${n}</button>`).join('')}</div>`;
      const prio = d.prioridades.map((x, i) => `<div class="rit-acc${x.h ? ' on' : ''}"><label class="rit-eje"><input type="checkbox" data-mdph="${i}"${x.h ? ' checked' : ''}> ${MD_EJES[i][0]}</label>${ta(`data-mdp="${i}"`, x.t, MD_EJES[i][1], 1, 'Priority: ' + MD_EJES[i][0])}</div>`).join('');
      const ritual = d.hecho
        ? `<section class="card ritual hecho" id="mdrit"><div class="row between"><h2>☀️ Morning done${d.minima ? ' · quick version' : ''}</h2><span class="muted small">${cuenta}</span></div>
  <p class="rit-yo">${esc(d.identidad || MD_ID)}</p>
  ${d.momento ? `<p class="small"><b>My English moment today:</b> ${esc(d.momento)}${d.frase ? ` · <i>"${esc(d.frase)}"</i>` : ''}</p>` : ''}
  <p class="hab-sec">My 3 priorities</p><div class="rit-accs">${d.prioridades.map((x, i) => (x.t.trim() ? `<button type="button" class="hab${x.h ? ' on' : ''}" data-mdp2="${i}" aria-pressed="${!!x.h}"><span class="hab-box" aria-hidden="true">✓</span><span class="hab-t"><b>${MD_EJES[i][0]}:</b> ${esc(x.t)}</span></button>` : '')).join('')}</div>
  <button type="button" class="linkbtn small md-noprint" id="md-edit">Edit this morning</button>
</section>`
        : `<section class="card ritual" id="mdrit"><div class="row between"><h2>☀️ Morning ritual</h2><span class="muted small">${cuenta || '5 minutes'}</span></div>
  <p class="muted small">Before email and meetings. Five quick steps to start your day on purpose, in English.</p>
  <div class="rit-p${on('checkin')}" data-paso="checkin"><h3>1 · Check in</h3><p class="muted small">How is your energy today, from 1 to 10? And who do you want to be today?</p>${energia}${ta('id="md-quien"', d.quien, 'Today I want to be calm and clear…', 1, 'Who do you want to be today?')}</div>
  <div class="rit-p${on('gracias')}" data-paso="gracias"><h3>2 · Gratitude</h3><p class="muted small">Up to three things you're grateful for today. Small is fine.</p>${d.gracias.map((g, i) => ta(`data-mdg="${i}"`, g, "I'm grateful for…", 1, 'Gratitude ' + (i + 1))).join('')}</div>
  <div class="rit-p${on('momento')}" data-paso="momento"><h3>3 · My English moment today</h3><p class="muted small">Where will you use English today? A meeting, a call, an email… Then one phrase you want to use there.</p>${ta('id="md-mom"', d.momento, 'The 10:00 call with the US team…', 1, 'Where will you use English today?')}${ta('id="md-frase"', d.frase, 'The phrase I\'ll use: "The short answer is…"', 1, 'The phrase you want to use')}</div>
  <div class="rit-p${on('prioridades')}" data-paso="prioridades"><h3>4 · My 3 priorities</h3><p class="muted small">One for work, one for your English, one for you. Tick them during the day.</p>${prio}</div>
  <div class="rit-p${on('identidad')}" data-paso="identidad"><h3>5 · Say it out loud</h3><p class="muted small">Read it out loud, in English. Change it so it sounds like you.</p>${ta('id="md-id"', d.identidad || MD_ID, '', 2, 'Your statement, to say out loud')}<label class="rit-chk"><input type="checkbox" id="md-dicha"${d.dicha ? ' checked' : ''}> I said it out loud</label></div>
  <div class="row between rit-pie"><span class="muted small" id="md-est"></span><button type="button" class="btn" id="md-ok"${mdCompleto(d) ? '' : ' disabled'}>Ready for my day ✓</button></div>
  <p class="small rit-min">Busy morning? With your energy, your English moment and your work priority, <button type="button" class="linkbtn small" id="md-min"${mdMinimo(d) ? '' : ' disabled'}>do the 1-minute version (it counts)</button></p>
</section>`;
      const atw = `<section class="card"><h2>📌 Today in AT WORK</h2>
  ${clase ? `<div class="td-i"><b>🎥 Class with Flor today${clase.hora ? ' · ' + esc(clase.hora) + ' (Argentina time)' : ''}</b>${clase.link ? `<div class="row md-noprint"><a class="btn sm" href="${esc(clase.link)}" target="_blank" rel="noopener">Join the class</a></div>` : ''}</div>` : ''}
  ${p.foco_titulo ? `<p class="small"><b>Focus of the week:</b> ${esc(p.foco_titulo)}</p>` : ''}
  ${pend.length ? `<p class="hab-sec">Your tasks from Flor</p><ul class="small reg-acc">${pend.slice(0, 4).map((t) => `<li>⬜ ${tareaLinea(t.texto)}</li>`).join('')}</ul>${pend.length > 4 ? `<p class="muted small">+${pend.length - 4} more in Mi semana.</p>` : ''}<div class="row md-noprint"><a class="btn ghost sm" href="#semana">Open Mi semana</a></div>` : '<p class="muted small">No pending tasks from your last class. 🎉</p>'}
</section>`;
      const cierre = `<section class="card ritual" id="mdfin"><h2>🌙 End of day</h2><p class="muted small">Two minutes before you close the laptop. It goes to your log and helps you write your Weekly report.</p>
  <div class="rit-p${d.win.trim() ? ' on' : ''}" data-paso2="win"><h3>Today's win</h3>${ta('id="md-win"', d.win, 'Today I… (even a small one)', 1, "Today's win")}</div>
  <div class="rit-p${d.ingles.trim() ? ' on' : ''}" data-paso2="ingles"><h3>English that worked</h3><p class="muted small">A phrase you used, or one you want to use next time.</p>${ta('id="md-ing"', d.ingles, '"Let me check and get back to you by Friday."', 1, 'English that worked')}</div>
  <div class="rit-p${d.manana.trim() ? ' on' : ''}" data-paso2="manana"><h3>Tomorrow I will…</h3>${ta('id="md-man"', d.manana, 'Send the summary email before 11.', 1, 'Tomorrow I will')}</div>
  <span class="muted small" id="md-est2"></span>
</section>`;
      return `<div class="head"><div><span class="eyebrow">${esc(mdFecha(hoyI))}</span><h1>${hola}${nom ? ', ' + esc(nom) : ''}</h1></div>
  <div class="row md-noprint" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn ghost sm" id="md-pdf">Download PDF</button><button type="button" class="btn ghost sm" id="md-mail">Email it</button></div></div>
<p class="muted intro md-noprint">Your daily planner, in English. Start here in the morning, tick your priorities during the day, and close the day with your win.</p>
<div class="md-print-head"><b>AT WORK · My Day</b><span>${esc(nom)} · ${esc(mdFecha(hoyI))}</span></div>
${ritual}${atw}${cierre}${mdLogHTML(dias, hoyI)}`;
    },
    mount() {
      const M = st._md; if (!M) return;
      const d = M.d; let t;
      const est = (x) => $$('#md-est, #md-est2').forEach((e) => (e.textContent = x));
      const guardar = (ya) => {
        clearTimeout(t);
        const go = async () => { try { await DB.guardarMiDia(M.f, d); est('Saved'); } catch (e) { console.error(e); toast("My Day didn't save. Try again.", true); } };
        if (ya) return go(); est('Saving…'); t = setTimeout(go, 700);
      };
      const repintar = () => {
        $$('#mdrit .rit-p').forEach((x) => x.classList.toggle('on', !!mdPaso(d, x.dataset.paso)));
        $$('#mdfin .rit-p').forEach((x) => x.classList.toggle('on', !!String(d[x.dataset.paso2] || '').trim()));
        if ($('#md-ok')) $('#md-ok').disabled = !mdCompleto(d);
        if ($('#md-min')) $('#md-min').disabled = !mdMinimo(d);
      };
      const cambio = (fn) => { fn(d); repintar(); guardar(); };
      const on = (sel, ev, fn) => $$(sel).forEach((el) => el.addEventListener(ev, () => fn(el)));
      const alto = (el) => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 2 + 'px'; };
      $$('.view .rit-auto').forEach((el) => { alto(el); el.addEventListener('input', () => alto(el)); });
      requestAnimationFrame(() => $$('.view .rit-auto').forEach(alto));
      on('[data-en]', 'click', (el) => cambio((x) => { x.energia = +el.dataset.en; $$('[data-en]').forEach((b) => { const s = +b.dataset.en === x.energia; b.classList.toggle('on', s); b.setAttribute('aria-pressed', s); }); }));
      on('#md-quien', 'input', (el) => cambio((x) => { x.quien = el.value; }));
      on('[data-mdg]', 'input', (el) => cambio((x) => { x.gracias[+el.dataset.mdg] = el.value; }));
      on('#md-mom', 'input', (el) => cambio((x) => { x.momento = el.value; }));
      on('#md-frase', 'input', (el) => cambio((x) => { x.frase = el.value; }));
      on('[data-mdp]', 'input', (el) => cambio((x) => { x.prioridades[+el.dataset.mdp].t = el.value; }));
      on('[data-mdph]', 'change', (el) => cambio((x) => { x.prioridades[+el.dataset.mdph].h = el.checked; el.closest('.rit-acc').classList.toggle('on', el.checked); }));
      on('#md-id', 'input', (el) => cambio((x) => { x.identidad = el.value; }));
      on('#md-dicha', 'change', (el) => cambio((x) => { x.dicha = el.checked; if (!x.identidad.trim()) x.identidad = ($('#md-id') || {}).value || MD_ID; }));
      on('#md-win', 'input', (el) => cambio((x) => { x.win = el.value; }));
      on('#md-ing', 'input', (el) => cambio((x) => { x.ingles = el.value; }));
      on('#md-man', 'input', (el) => cambio((x) => { x.manana = el.value; }));
      on('[data-mdp2]', 'click', (el) => cambio((x) => { const p = x.prioridades[+el.dataset.mdp2]; p.h = !p.h; el.classList.toggle('on', p.h); el.setAttribute('aria-pressed', p.h); }));
      const terminar = async (min) => { if (min ? !mdMinimo(d) : !mdCompleto(d)) return; if (!d.identidad.trim()) d.identidad = MD_ID; d.hecho = true; d.minima = !!min; d.hecho_en = new Date().toISOString(); await guardar(true); toast(min ? 'Quick version ✓ It counts.' : 'Ready for your day ✓'); ruta(); };
      if ($('#md-ok')) $('#md-ok').onclick = () => terminar(false);
      if ($('#md-min')) $('#md-min').onclick = () => terminar(true);
      if ($('#md-edit')) $('#md-edit').onclick = async () => { d.hecho = false; d.minima = false; await guardar(true); ruta(); };
      $('#md-pdf').onclick = () => { document.body.classList.add('md-imprimir'); window.addEventListener('afterprint', () => document.body.classList.remove('md-imprimir'), { once: true }); setTimeout(() => window.print(), 50); };
      // Abre su propio programa de mail con el día ya escrito; ella elige a quién mandarlo (la app no envía nada).
      $('#md-mail').onclick = () => {
        location.href = 'mailto:?subject=' + encodeURIComponent('My Day · ' + mdFecha(M.f, { weekday: 'long', day: 'numeric', month: 'short' })) + '&body=' + encodeURIComponent(mdTexto(M.f, d, apodoDe(st.perfil)));
      };
      $$('[data-mdcopy]').forEach((b) => (b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.mdcopy); toast('Copied. Paste it in your Weekly report (01 · My wins).'); } catch (e) { toast("Couldn't copy. Select the text and copy it.", true); } }));
    }
  };

  V.weekly = {
    async html() {
      const [ws, peds] = await Promise.all([DB.weeklies(), DB.pedidos().catch(() => [])]); const lun = DB.lunes();
      const fb = peds.find((x) => x.estado === 'respondido');
      const actual = ws.find((x) => x.semana === lun);
      // Si Flor ya respondió el de esta semana, el formulario es para el weekly nuevo (el del lunes que viene).
      const prox = (() => { const d = new Date(lun + 'T12:00:00'); d.setDate(d.getDate() + 7); return diaISO(d); })();
      const sem = actual && actual.respuesta_flor ? prox : lun;
      const w = ws.find((x) => x.semana === sem) || { respuestas: {} };
      st._weekly = w; st._wsem = sem;
      const bloqueado = !!w.respuesta_flor;
      const hist = ws.filter((x) => x.semana !== sem && x.enviado_en);
      return `<div class="head"><div><span class="eyebrow">Todos los lunes · ${sem === lun ? 'semana del' : 'tu nuevo weekly · semana del'} ${fecha(sem, { day: 'numeric', month: 'long' })}</span><h1>Weekly report</h1></div>${w.enviado_en ? '<span class="pill ok">Enviado</span>' : bloqueado ? '' : '<a class="btn" href="#wform" onclick="event.preventDefault();document.getElementById(\'wform\').scrollIntoView({behavior:\'smooth\'});setTimeout(()=>{const t=document.querySelector(\'#wform textarea\');t&&t.focus()},400)">+ Cargar mi weekly report</a>'}</div>
<p class="muted intro">Es tu canal con Flor. Planificas tu semana, cuentas qué hiciste y qué quieres entrenar. Flor lo lee siempre y te responde con tu próximo paso.</p>
${w.respuesta_flor ? `<section class="card"><div class="reply"><span class="eyebrow">Respuesta de Flor</span>${respuestaWeekly(w.respuesta_flor)}</div></section>` : ''}
${sem !== lun ? `<p class="note small">Flor ya respondió tu weekly de esta semana (lo ves abajo, en «Tus weeklies anteriores»). Este es tu weekly nuevo, para la semana del ${fecha(sem, { day: 'numeric', month: 'long' })}: puedes empezarlo cuando quieras y mandarlo el lunes.</p>` : ''}
<form class="card" id="wform" novalidate>
  <p class="eyebrow">Weekly report ${st.perfil.formato === '1:1' ? '1:1' : 'LAB'} · Complete every Monday · 5–10 minutes</p>
  <p class="muted small">${esc(P.weeklyIntro)}</p>
  ${wq(st.perfil).map(([id, l, h]) => `<div class="field"><label for="w-${id}">${l}</label><small>${h}</small><textarea id="w-${id}" data-k="${id}" rows="${/training/.test(id) ? 2 : 3}" ${bloqueado ? 'readonly' : ''}>${esc(w.respuestas[id] || '')}</textarea></div>`).join('')}
  <label class="row small"><input type="checkbox" id="w-compartir" ${w.respuestas.compartir_wins === 'no' ? '' : 'checked'} ${bloqueado ? 'disabled' : ''}> Compartir mi win en «Wins de todas» (solo tu nombre y tu win)</label>
  <p class="eyebrow">${P.weeklyLema}</p>
  ${bloqueado ? '' : sem > lun && !w.enviado_en
    ? `<div class="row"><button class="btn" type="submit">Guardar borrador</button><button class="btn ghost" type="button" data-ask="Ayúdame con mi weekly report">Ordenarlo con Flor AI</button><span class="muted small" id="wsave">Tu borrador se guarda solo. Podrás mandárselo a Flor desde el lunes ${fecha(sem, { day: 'numeric', month: 'long' })}.</span></div>`
    : `<div class="row"><button class="btn" type="submit">${w.enviado_en ? 'Actualizar mi weekly' : 'Enviar a Flor'}</button><button class="btn ghost" type="button" data-ask="Ayúdame con mi weekly report">Ordenarlo con Flor AI</button><span class="muted small" id="wsave">Tu borrador se guarda solo.</span></div>`}
</form>
${fb ? `<section class="card" id="ultimofb">
  <div class="row between"><div><span class="eyebrow">Último feedback de Flor${fb.respondido_en ? ' · ' + fecha(String(fb.respondido_en).slice(0, 10), { day: 'numeric', month: 'long' }) : ''}</span><h3>${esc(fb.titulo || fb.tipo || 'Tu tarea')}</h3></div><a href="#feedback" class="small">Ver todos tus feedbacks ›</a></div>
  <div class="feedback">${devolucion(fb.respuesta, fb.correcciones, 'pedidos:' + fb.id, fb.texto)}</div>
</section>` : ''}
${hist.length ? `<section class="card" id="whist"><h3>Tus weeklies anteriores</h3>${hist.map((x) => `<details class="fbitem"><summary><b>Semana del ${fecha(x.semana, { day: 'numeric', month: 'long' })}</b> ${x.respuesta_flor ? '<span class="pill ok">Flor respondió</span>' : ''}</summary>
  ${wq(st.perfil).map(([id, l]) => (x.respuestas[id] ? `<p class="small"><b>${l}</b><br>${esc(x.respuestas[id])}</p>` : '')).join('')}
  ${x.respuesta_flor ? `<div class="reply"><span class="eyebrow">Flor</span>${respuestaWeekly(x.respuesta_flor)}</div>` : ''}</details>`).join('')}</section>` : ''}`;
    },
    mount(ir) {
      if (ir) setTimeout(() => { const el = ir === 'anteriores' ? ($('#whist') || $('#ultimofb')) : $('#wform'); if (el) el.scrollIntoView({ behavior: 'smooth' }); if (ir === 'cargar') { const t = $('#wform textarea:not([readonly])'); if (t) t.focus({ preventScroll: true }); } }, 120);
      const f = $('#wform'); if (!f || $('textarea[readonly]', f)) return;
      const datos = () => { const r = {}; $$('textarea', f).forEach((t) => { if (t.value.trim()) r[t.dataset.k] = t.value; }); if ($('#w-compartir') && !$('#w-compartir').checked) r.compartir_wins = 'no'; return r; };
      let tm;
      f.addEventListener('change', () => f.dispatchEvent(new Event('input')));
      f.addEventListener('input', () => {
        clearTimeout(tm);
        tm = setTimeout(async () => { try { await DB.guardarWeekly(st._wsem || DB.lunes(), datos(), false); $('#wsave').textContent = 'Borrador guardado.'; } catch (e) { $('#wsave').textContent = 'No se pudo guardar el borrador.'; } }, 900);
      });
      f.onsubmit = async (e) => {
        e.preventDefault(); clearTimeout(tm);
        const d = datos();
        // El weekly de la semana que viene se guarda como borrador; se manda recién ese lunes.
        if ((st._wsem || DB.lunes()) > DB.lunes() && !(st._weekly && st._weekly.enviado_en)) {
          await intentar(() => DB.guardarWeekly(st._wsem, d, false), 'Borrador guardado. El lunes lo encuentras acá, listo para mandárselo a Flor.');
          return;
        }
        if (!d.wins && !d.foco) return toast('Completa al menos tus wins y tu foco de esta semana.', true);
        await intentar(() => DB.guardarWeekly(st._wsem || DB.lunes(), d, true), 'Listo, tu weekly está enviado. Avisa en la comunidad que ya lo completaste.');
        ruta();
      };
    }
  };

  // ---------- Wins de todas ----------
  V.wins = {
    async html() {
      let ws = [];
      try { ws = await DB.winsComunidad(); } catch (e) { console.error(e); }
      const grupos = porSemana(ws.filter((w) => w.semana), (w) => w.semana);
      const iniciales2 = (n) => esc(String(n || '?').slice(0, 1).toUpperCase());
      return `<div class="head"><div><span class="eyebrow">Celebramos juntas</span><h1>Wins de todas</h1></div>${ws.length ? `<span class="pill ok">${ws.length} wins</span>` : ''}</div>
<p class="muted intro">Cada lunes, cuando una de ustedes manda su weekly, su win aparece acá. Leer lo que lograron las demás también es parte del entrenamiento: a todas nos cuesta lo mismo y todas avanzamos.</p>
${grupos.length ? grupos.map((g) => `<section class="card sem-grupo"><div class="row between"><h3>${esc(nombreSemana(g.s))}</h3><span class="pill">${g.items.length}</span></div>
  <div class="winsgrid">${g.items.map((w) => `<article class="win"><span class="av">${iniciales2(w.nombre)}</span><div><b>${esc(w.nombre || 'Una alumna')}</b><p>${esc(w.wins).replace(/\n/g, '<br>')}</p></div></article>`).join('')}</div></section>`).join('')
  : '<section class="card empty-state"><h3>Todavía no hay wins</h3><p class="muted small">Cuando manden su weekly, acá aparecen los wins de todas.</p><a class="btn" href="#weekly">Completar mi weekly</a></section>'}`;
    }
  };

  // ---------- Mi camino ----------
  V.camino = {
    html() {
      // Sin la tarjeta de «X de 60 tareas / Lo que sigue» (Flor, 20/11: no tenía sentido).
      // Proceso por módulos, no por meses ni semanas (Flor, 21/11): cada una avanza a su ritmo y muchas renuevan.
      const p = st.perfil, hechas = p.camino_hecho || [];
      const modActual = moduloDe(p), ba = bloqueActual(p);
      const pctMes = (m) => { const ts = m.semanas.flatMap((x) => x.tareas); return { h: ts.filter((t) => hechas.includes(t.id)).length, t: ts.length }; };
      return `<div class="head"><div><span class="eyebrow">Tu proceso, módulo a módulo</span><h1>Mi camino</h1></div></div>
<p class="muted intro">El programa paso a paso. Enfócate en el módulo en el que estás: lo demás espera. Si tu diagnóstico pide otro foco, Flor te lo indica en la respuesta a tu Weekly Report.</p>
<section class="card"><h3>Tu recorrido</h3>${etapasHTML(null, p)}<p class="muted small">${esc(P.recorridoNota)}</p></section>
${P.camino.map((m) => { const pm = pctMes(m); if (!pm.t) return ''; return `<details class="card mes" ${m.n === modActual ? 'open' : ''}><summary><span class="mesnum"><small>MÓDULO</small>${m.n}</span><span class="mestit"><h2>${esc(m.titulo)}</h2><span class="muted small">${pm.h} de ${pm.t} tareas · Al terminar el módulo: ${esc(m.logro)}</span></span>${ring(pm.t ? (100 * pm.h) / pm.t : 0)}</summary>
  ${m.semanas.filter((s) => s.tareas.length).map((s) => { const aq = ba && ba.sem === s; return `<div class="semana ${aq ? 'actual' : ''}"><div class="row between"><b class="semtit">${esc(s.titulo)}</b>${aq ? '<span class="pill warn">Lo que sigue</span>' : ''}</div>
    <ul class="tasks">${s.tareas.map((t) => filaTarea(t, hechas)).join('')}</ul></div>`; }).join('')}
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
    ['Flor English Coach', 'Para practicar inglés en general, no solo del trabajo: una lección del día hecha a tu medida, gramática que todavía te falta pulir, vocabulario y frases del Clarity Bank, shadowing y pronunciación, role plays de cualquier tema y un coaching para tus bloqueos con el idioma.', 'flor-english-coach.zip', 'Your Daily Barrier Lesson 🚀 (o «quiero repasar el present perfect»).', 'Inglés general'],
    ['Onboarding', 'Tu bienvenida a AT WORK: dónde está cada cosa, tu punto de partida y tu primera práctica.', 'onboarding-at-work.zip', 'Hola, soy nueva en AT WORK.', 'Empieza acá'],
    ['Role Play', 'Ensaya tu reunión, presentación o entrevista antes de que pase. Hace de la otra persona y no te corrige durante la escena.', 'at-work-role-play.zip', 'Quiero practicar mi update del lunes con mi jefa.', 'Coach'],
    ['Narrative Flow', 'Corrige la gramática de tu mail, mensaje o transcript. Tú encuentras tus errores, uno por uno.', 'at-work-narrative-flow.zip', 'Pega tu mail o tu reporte.', 'Coach'],
    ['Color Method', 'Haz que lo que dices y escribes suene más profesional, con las expresiones de tu trabajo.', 'at-work-color-method.zip', 'Pega tu texto o el transcript de tu reunión.', 'Coach'],
    ['Interview Me · Career Coach', 'Si estás preparando entrevistas: analiza el aviso, arma tus respuestas STAR, revisa tu CV y tu LinkedIn.', 'career-coach-pro.zip', 'Pega el aviso del puesto y tu CV.', 'Opcional']
  ];
  // Versión ChatGPT (plugins) de los 3 coaches, para quien prefiere ChatGPT en vez de Claude (Flor, 17/11).
  const SKILLS_GPT = [
    ['Role Play', 'role-play-chatgpt.zip', 'I have a meeting this week I want to practice.'],
    ['Narrative Flow', 'narrative-flow-chatgpt.zip', 'I have a text from work I want to review.'],
    ['Color Method', 'color-method-chatgpt.zip', 'Tengo un texto de mi trabajo para analizar.']
  ];
  V.coaches = {
    html() {
      return `<div class="head"><div><span class="eyebrow">Tu práctica entre clases</span><h1>Mis coaches</h1></div></div>
<p class="muted intro">Adentro de esta app te guía Flor AI. Para practicar sola entre sesiones, con situaciones reales de tu trabajo, instalas los coaches en tu propio Claude (o en ChatGPT, si lo prefieres): una sola vez y unos 10 minutos desde la computadora. Se usan desde el Módulo 1.</p>
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
<section class="card" id="chatgpt"><span class="eyebrow">¿Prefieres ChatGPT?</span><h3>Tus coaches en ChatGPT</h3>
  <p class="muted small">Si ya usas ChatGPT y no quieres abrir otra cuenta, Role Play, Narrative Flow y Color Method también están para ChatGPT, como plugins. Flor English Coach, Onboarding e Interview Me, por ahora, solo están en Claude. <b>No descomprimas</b> los archivos .zip.</p>
  <div class="skills">${SKILLS_GPT.map(([n, zip]) => `<div class="skill"><span class="tag">ChatGPT</span><b>${esc(n)}</b><a class="btn ghost sm" href="${COACHES_URL}chatgpt/${zip}" download>↓ Descargar</a></div>`).join('')}</div>
  <ol class="pasos">
    <li>Entra a <a href="https://chatgpt.com" target="_blank" rel="noopener">chatgpt.com</a> desde la computadora, con tu cuenta.</li>
    <li>Abajo a la izquierda, toca tu nombre y entra a <b>Configuración</b> (Settings).</li>
    <li>Ve a <b>Complementos</b> (Plugins) y toca <b>Explorar</b>.</li>
    <li>Arriba a la derecha toca <b>Añadir</b> y después <b>Cargar archivo de complemento</b>. Arrastra uno de los .zip que descargaste.</li>
    <li>Toca <b>Agregar complemento</b> y después <b>Instalar complemento</b>. Repite con cada coach.</li>
    <li>Para usarlo, abre un chat nuevo, escribe <b>@</b> y elige tu coach. La primera vez te pide tu nombre y tu perfil.</li>
  </ol>
  <ul class="dates">${SKILLS_GPT.map(([n, , f]) => `<li><b>${n}</b><span>${esc(f)}</span></li>`).join('')}</ul>
  <p class="note small">Si no encuentras algún paso, avísale a Flor desde <a href="#feedback">Pedir feedback</a> y te ayuda.</p></section>
<section class="card feature" id="coaches-ok"><span class="eyebrow">4 · Avísale a Flor AI</span>
  ${st.perfil.coaches_instalados
    ? `<h3>Ya instalaste tus coaches ✓</h3><p class="muted small">Flor AI ya lo sabe: cuando te mande a practicar, te dice qué coach abrir y qué pegarle.</p><div class="row"><button type="button" class="linkbtn small" id="coaches-no">Todavía no los tengo</button></div>`
    : `<h3>¿Ya los instalaste?</h3><p class="small">Cuando hayas instalado tus coaches y los veas al escribir <b>/</b> en Claude (o <b>@</b> en ChatGPT), toca este botón. Así Flor AI sabe que los tienes y te guía para practicar con ellos.</p><div class="row"><button type="button" class="btn" id="coaches-si">Ya instalé mis coaches</button></div>`}
</section>
<section class="card"><h3>¿Cuál uso hoy?</h3><ul class="dates">${P.situaciones.map(([s, c]) => `<li><b>${c === 'flor' ? 'Flor AI' : (P.coaches.find((x) => x.id === c) || {}).nombre || c}</b><span>${esc(s)}</span></li>`).join('')}</ul>
  <p class="muted small">Flor AI vive en esta app: te dice qué te toca y te guía. Lo importante, mándaselo a Flor desde <a href="#feedback">Pedir feedback</a>.</p></section>`;
    },
    mount() {
      const marcar = async (si) => {
        try { await intentar(() => DB.marcarCoaches(si), si ? 'Listo: Flor AI ya sabe que tienes tus coaches' : 'Listo'); st.perfil.coaches_instalados = si ? new Date().toISOString() : null; ruta(); } catch (e) {}
      };
      const s = $('#coaches-si'), n = $('#coaches-no');
      if (s) s.onclick = () => marcar(true);
      if (n) n.onclick = () => marcar(false);
    }
  };

  // ---------- Mi proceso: plan de acción, documentos y compromisos ----------
  // "Mi proceso" se juntó con "Mi progreso" (Flor, 13/11): los documentos ahora están ahí.
  V.proceso = { html: (...x) => V.progreso.html(...x), mount: (...x) => V.progreso.mount(...x) };
  function montarCompromisos() {
    const el = $('#comp'); if (!el) return;
    el.addEventListener('change', () => {
      const v = $$('input:checked', el).map((x) => +x.dataset.i); st.perfil.compromisos = v;
      intentar(() => DB.guardarMiPerfil({ compromisos: v })).catch(() => {});
    });
  }

  // ---------- Mi progreso de Flor (cuando entra Flor) ----------
  const diaISO = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  // Clases en grabación que ya les tocan (o les tocan la semana que viene) a tus alumnas, la más urgente primero
  const linkGrabar = (F, id) => (F.grabar || {})[id] || (P.grabar || {})[id] || '';
  function clasesPorGrabar(b, F) {
    const out = [];
    if (!b) return out;
    for (const m of P.camino) for (const s of m.semanas) for (const t of s.tareas) {
      if (!t.pronto || (F.grabadas || []).includes(t.id) || (F.salteadas || []).includes(t.id)) continue;
      const desde = Math.min(...s.s);
      const quienes = b.activas.map((a) => ({ a, n: semanaDe(a.perfil) })).filter((x) => x.n && x.n >= desde - 1 && !((x.a.perfil.camino_hecho || []).includes(t.id)));
      if (quienes.length) out.push({ t, desde, quienes, ya: quienes.some((x) => x.n >= desde), listo: !!linkGrabar(F, t.id) });
    }
    // Primero las que ya les tocan; entre esas, las que tienen el material listo; después, la que va antes en el programa.
    return out.sort((x, y) => (y.ya - x.ya) || (y.listo - x.listo) || (x.desde - y.desde));
  }
  async function pegarLinkGrabar(id) {
    const u = prompt('Pega el link de la carpeta (Drive o Notion) donde tienes el prompter, la presentación y todo para grabar esta clase:', linkGrabar(st._flor, id));
    if (u == null) return false;
    if (u.trim() && !url(u.trim())) { toast('El link tiene que empezar con https://', true); return false; }
    await guardarF({ grabar: { ...(st._flor.grabar || {}), [id]: u.trim() } }, 'Link guardado'); return true;
  }
  const textoClase = (id) => ((P.camino.flatMap((m) => m.semanas.flatMap((x) => x.tareas)).find((t) => t.id === id) || {}).texto || '');
  const ACADEMIA = 'https://academy.breakingbarriers.site/';
  // «Ya la grabé»: si ya la subiste, pegás el link de la academia y queda publicada para todas tus alumnas.
  async function marcarGrabada(id) {
    const u = prompt('¿Ya la subiste a la academia? Pega el link de la clase y se publica sola para todas tus alumnas (Mi camino, su roadmap y Flor AI).\n\nSi todavía no la subiste, déjalo vacío: queda como «Grabada · falta subirla» y pegas el link después.', '');
    if (u == null) return;
    const l = u.trim();
    if (l && !l.startsWith(ACADEMIA)) { toast('Tiene que ser el link de la clase en la academia (' + ACADEMIA + '…)', true); return; }
    const grabadas = (st._flor.grabadas || []).includes(id) ? st._flor.grabadas : [...(st._flor.grabadas || []), id];
    const cambios = { grabadas };
    if (l) cambios.publicadas = { ...(st._flor.publicadas || {}), [id]: { link: l, texto: textoClase(id) } };
    await guardarF(cambios, l ? '✓ Publicada: ' + textoClase(id) + '. Ya la ven tus alumnas.' : '✓ Grabada: ' + textoClase(id) + '. Cuando la subas, pega el link.');
    ruta();
  }
  async function publicarClase(id) {
    const ya = ((st._flor || {}).publicadas || {})[id];
    const u = prompt('Pega el link de la clase en la academia. Se publica sola para todas tus alumnas:', (ya && (ya.link || ya)) || '');
    if (u == null) return;
    const l = u.trim();
    const pub = { ...((st._flor || {}).publicadas || {}) };
    if (!l) delete pub[id];
    else if (!l.startsWith(ACADEMIA)) { toast('Tiene que ser el link de la clase en la academia (' + ACADEMIA + '…)', true); return; }
    else pub[id] = { link: l, texto: textoClase(id) };
    await guardarF({ publicadas: pub }, l ? '✓ Publicada: ' + textoClase(id) : 'Vuelve a «Grabada · falta subirla»');
    ruta();
  }
  async function desmarcarGrabada(id) {
    const pub = { ...((st._flor || {}).publicadas || {}) }; delete pub[id];
    await guardarF({ grabadas: (st._flor.grabadas || []).filter((x) => x !== id), publicadas: pub }, 'Vuelve a la lista para grabar');
    ruta();
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-grab],[data-desgrab],[data-publicar]'); if (!b || !st._flor) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (b.dataset.grab) marcarGrabada(b.dataset.grab);
    else if (b.dataset.desgrab) desmarcarGrabada(b.dataset.desgrab);
    else publicarClase(b.dataset.publicar);
  }, true);
  async function progresoFlor() {
    const b = await cargarBandeja();
    const F = Object.assign({ objetivo: 'Terminar de grabar el programa y crear contenido todos los días', grabadas: [], contenido: {}, recordatorios: {}, links: {} }, st.programa.flor || {});
    st._flor = F;
    const lun = DB.lunes();
    const delaSemana = (iso) => iso && lunesDe(iso) === lun;
    const wEsta = b.W.filter((w) => w.semana === lun && (w.enviado_en || w.respuesta_flor || Object.keys(w.respuestas || {}).length));
    const wRespEsta = wEsta.filter((w) => w.respuesta_flor);
    const conW = new Set(wEsta.map((w) => String(w.email || '').toLowerCase()));
    const faltan = b.activas.filter((a) => !conW.has(a.email));
    const fbEsta = b.tResp.filter((x) => delaSemana(x.respondido_en));
    const porGrabar = clasesPorGrabar(b, F);
    const todasT = P.camino.flatMap((m) => m.semanas.flatMap((x) => x.tareas));
    const hechasG = (F.grabadas || []).map((id) => todasT.find((t) => t.id === id)).filter(Boolean);
    const salteadasG = (F.salteadas || []).map((id) => todasT.find((t) => t.id === id)).filter(Boolean);
    const dias = [...Array(7)].map((_, i) => { const d = new Date(lun + 'T12:00:00'); d.setDate(d.getDate() + i); return d; });
    const hechosDias = dias.filter((d) => F.contenido[diaISO(d)]).length;
    const chk = (ok, txt, sub, link) => `<li class="chk"><span class="${ok ? 'ok-i' : 'no-i'}">${ok ? '✓' : '○'}</span><span><b>${txt}</b>${sub ? '<br><span class="muted small">' + sub + '</span>' : ''}${link ? ' ' + link : ''}</span></li>`;
    const lk = F.links || {};
    const enlace = (u, t) => (url(u) ? `<a class="btn ghost sm" href="${esc(u)}" target="_blank" rel="noopener">${t}</a>` : '');
    const nom1 = (n) => esc(String(n || '').split(' ')[0]);
    const lkG = (id) => linkGrabar(F, id);
    return `<div class="head"><div><span class="eyebrow">Tu semana como directora de AT WORK · semana del ${fecha(lun, { day: 'numeric', month: 'long' })}</span><h1>Mis números</h1></div></div>
<section class="card feature"><span class="eyebrow">Tu objetivo</span><h2 id="fobj">${esc(F.objetivo)}</h2>
  <div class="row"><button class="btn ghost sm" id="fobj-ed">Editar mi objetivo</button></div>
  <form id="fobj-f" style="display:none" class="grid"><textarea id="fobj-t" rows="3">${esc(F.objetivo)}</textarea><div class="row"><button class="btn sm" type="submit">Guardar</button><button class="linkbtn small" type="button" id="fobj-x">Cancelar</button></div></form></section>
<div class="grid g-2">
  <section class="card"><div class="row between"><h3>Esta semana con tus alumnas</h3><a class="small" href="#bandeja">Ir a la bandeja</a></div>
    <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
      ${chk(!!F.recordatorios[lun], 'Recordatorio del weekly enviado', F.recordatorios[lun] ? 'Listo' : 'El lunes, a todas', `<button class="linkbtn small" id="frec">${F.recordatorios[lun] ? 'Desmarcar' : 'Marcar como enviado'}</button>`)}
      ${chk(wEsta.length > 0 && wRespEsta.length === wEsta.length, `Weeklies respondidos: ${wRespEsta.length} de ${wEsta.length}`, wEsta.length > wRespEsta.length ? 'Te faltan: ' + wEsta.filter((w) => !w.respuesta_flor).map((w) => nom1(w.nombre)).join(', ') : wEsta.length ? 'Respondiste todos los que llegaron' : 'Todavía no llegó ninguno', wEsta.length > wRespEsta.length ? '<a class="small" href="#bandeja/weeklies">Responder</a>' : '')}
      ${chk(!faltan.length, faltan.length ? (faltan.length === 1 ? '1 alumna todavía no mandó su weekly' : `${faltan.length} alumnas todavía no mandaron su weekly`) : 'Todas mandaron su weekly', faltan.map((a) => nom1(a.nombre)).join(', '))}
      ${chk(!b.pend.length, b.pend.length ? (b.pend.length === 1 ? '1 tarea espera tu feedback' : `${b.pend.length} tareas esperan tu feedback`) : 'No hay tareas esperando feedback', b.pend.slice(0, 6).map((x) => nom1(x.nombre) + ' · ' + esc(x.titulo || tipoNombre(x.tipo))).join('<br>'), b.pend.length ? '<a class="small" href="#bandeja/pedidos">Responder</a>' : '')}
      ${chk(fbEsta.length > 0, `Feedback de tareas devuelto esta semana: ${fbEsta.length}`, '')}
    </ul></section>
  <section class="card"><span class="eyebrow">Contenido · todos los días</span>
    <div class="row" style="gap:10px"><span class="big">${hechosDias}</span><span class="muted">de 7 días con contenido publicado<br>esta semana</span></div>
    <div class="dias" id="fdias">${dias.map((d) => `<button type="button" data-dia="${diaISO(d)}" aria-pressed="${!!F.contenido[diaISO(d)]}" title="${fecha(diaISO(d), { weekday: 'long', day: 'numeric' })}">${d.toLocaleDateString('es', { weekday: 'short' }).slice(0, 2)}<br>${d.getDate()}</button>`).join('')}</div>
    <p class="muted small">Toca el día cuando publicas.</p>
    <div class="row">${enlace(lk.instagram, 'Instagram')}${enlace(lk.contenido, 'Mi plan de contenido')}</div>
  </section>
</div>
<section class="card"><div class="row between"><h3>Clases que tienes que grabar</h3>${enlace(lk.notion, 'Notion de grabación')}</div>
  <p class="muted small">Ordenadas por urgencia: primero las que ya les tocan y tienen el material listo. Grabá de a una, empezando por la de arriba.</p>
  ${porGrabar.length ? `<ul class="tasks">${porGrabar.map((g, i) => `${i === 3 ? `</ul><details class="mas-grabar"><summary class="small">Ver las otras ${porGrabar.length - 3}</summary><ul class="tasks">` : ''}<li><div class="fbitem" style="flex-direction:row;align-items:flex-start;justify-content:space-between;gap:12px"><span><b>${esc(g.t.texto)}</b> ${g.ya ? '<span class="pill warn">Grábala sí o sí</span>' : '<span class="pill">La semana que viene</span>'}<br>
    <span class="muted small">Va en la semana ${g.desde}. ${g.quienes.map((x) => nom1(x.a.nombre) + ' (semana ' + x.n + ')').join(', ')} ${g.ya ? (g.quienes.length === 1 ? 'ya llegó' : 'ya llegaron') : 'llega' + (g.quienes.length === 1 ? '' : 'n')}.</span></span>
    <span class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end">${lkG(g.t.id) ? `<a class="btn sm" href="${esc(lkG(g.t.id))}" target="_blank" rel="noopener">🎬 Abrir todo para grabar</a><button type="button" class="linkbtn small" data-glink="${esc(g.t.id)}">Cambiar link</button>` : `<button type="button" class="btn ghost sm" data-glink="${esc(g.t.id)}">+ Pegar link del material</button>`}
    <button type="button" class="btn ghost sm" data-grab="${esc(g.t.id)}">Ya la grabé</button><button type="button" class="linkbtn small" data-saltar="${esc(g.t.id)}">No la grabo</button></span></div></li>`).join('')}</ul>${porGrabar.length > 3 ? '</details>' : ''}` : '<p class="muted small">Ninguna alumna llegó todavía a una clase en grabación. 🎉</p>'}
  ${hechasG.length ? `<details class="mas-grabar"><summary class="small">✓ Ya grabadas (${hechasG.length})</summary><ul class="neg">${hechasG.map((t) => `<li class="row between"><span>${esc(t.texto)}</span><span class="row" style="gap:6px">${t.pronto ? `<button type="button" class="btn ghost sm" data-publicar="${esc(t.id)}">Ya la subí: pegar el link</button>` : '<span class="pill ok">Publicada</span>'}<button type="button" class="linkbtn small" data-desgrab="${esc(t.id)}">Deshacer</button></span></li>`).join('')}</ul></details>` : ''}
  ${salteadasG.length ? `<details class="mas-grabar"><summary class="small">No las grabo (${salteadasG.length})</summary><ul class="neg">${salteadasG.map((t) => `<li class="row between"><span>${esc(t.texto)}</span><button type="button" class="linkbtn small" data-dessaltar="${esc(t.id)}">Volver a la lista</button></li>`).join('')}</ul></details>` : ''}
</section>
<details class="card"><summary><b>Tus links de trabajo</b></summary>
  <form class="grid" id="flinks" novalidate>
    <div class="field"><label for="fl-instagram">Tu Instagram</label><input id="fl-instagram" type="url" value="${esc(lk.instagram || '')}" placeholder="https://instagram.com/…"></div>
    <div class="field"><label for="fl-contenido">Tu plan de contenido (Notion, Drive, lo que uses)</label><input id="fl-contenido" type="url" value="${esc(lk.contenido || '')}"></div>
    <div class="field"><label for="fl-notion">Notion de grabación de clases</label><input id="fl-notion" type="url" value="${esc(lk.notion || '')}"></div>
    <div class="row"><button class="btn sm" type="submit">Guardar links</button></div>
  </form></details>`;
  }
  async function guardarF(cambios, msg) {
    const F = Object.assign({}, st._flor, cambios);
    await intentar(() => DB.guardarFlor(F), msg);
    st._flor = F; st.programa.flor = F;
  }
  function montarProgresoFlor() {
    const F = st._flor, lun = DB.lunes();
    const abrirObj = (si) => { $('#fobj-f').style.display = si ? '' : 'none'; $('#fobj-ed').style.display = si ? 'none' : ''; if (si) $('#fobj-t').focus(); };
    $('#fobj-ed').onclick = () => abrirObj(true);
    $('#fobj-x').onclick = () => abrirObj(false);
    $('#fobj-f').onsubmit = async (e) => { e.preventDefault(); const t = $('#fobj-t').value.trim(); if (!t) return; await guardarF({ objetivo: t }, 'Guardado'); $('#fobj').textContent = t; abrirObj(false); };
    $('#frec').onclick = async () => { await guardarF({ recordatorios: { ...st._flor.recordatorios, [lun]: !st._flor.recordatorios[lun] } }); ruta(); };
    $('#fdias').onclick = async (e) => {
      const b = e.target.closest('[data-dia]'); if (!b) return;
      const c = { ...st._flor.contenido }; if (c[b.dataset.dia]) delete c[b.dataset.dia]; else c[b.dataset.dia] = true;
      await guardarF({ contenido: c }); ruta();
    };
    $$('[data-glink]').forEach((b) => (b.onclick = async () => { if (await pegarLinkGrabar(b.dataset.glink)) ruta(); }));
    $$('[data-grab]').forEach((b) => (b.onclick = async () => { await guardarF({ grabadas: [...(st._flor.grabadas || []), b.dataset.grab] }, '✓ Grabada: ' + ((P.camino.flatMap((m) => m.semanas.flatMap((x) => x.tareas)).find((t) => t.id === b.dataset.grab) || {}).texto || '') + '. Si fue sin querer, abajo está «Ya grabadas».'); ruta(); }));
    const sacar = (k, id) => (st._flor[k] || []).filter((x) => x !== id);
    $$('[data-desgrab]').forEach((b) => (b.onclick = async () => { await guardarF({ grabadas: sacar('grabadas', b.dataset.desgrab) }, 'Vuelve a la lista para grabar'); ruta(); }));
    $$('[data-saltar]').forEach((b) => (b.onclick = async () => { await guardarF({ salteadas: [...(st._flor.salteadas || []), b.dataset.saltar] }, 'Sale de tu lista para grabar'); ruta(); }));
    $$('[data-dessaltar]').forEach((b) => (b.onclick = async () => { await guardarF({ salteadas: sacar('salteadas', b.dataset.dessaltar) }, 'Vuelve a la lista para grabar'); ruta(); }));
    $('#flinks').onsubmit = async (e) => { e.preventDefault(); const g = (k) => $('#fl-' + k).value.trim(); await guardarF({ links: { instagram: g('instagram'), contenido: g('contenido'), notion: g('notion') } }, 'Guardado'); ruta(); };
  }


  // ---------- AT WORK desde el lado de Flor (pedido de Flor, 14/11) ----------
  // Todo el programa en una sola lista: qué está publicado, qué grabar primero y dónde está cada cosa.
  const CB_WS = 'https://drive.google.com/drive/folders/1MAmSBiOUgRV_Z-pKl1YEX9SzA_uBEeDY';
  const CB = {
    '12.3': { ws: 'Worksheet 1 · Reported Speech', vid: 'Clarity Bank 1.0, 1.A, 1.B y 1.C' },
    '12.2': { ws: 'Worksheet 2 · Conditionals', vid: 'Clarity Bank 2.0 a 2.5' },
    '11.3': { ws: 'Worksheet 3 · Modals', vid: 'Clarity Bank 3.0 a 3.5 (falta reeditar el 3.2)' },
    '12.5': { ws: 'Worksheet 4 · Passive Voice', vid: 'Sin video todavía (grabar el 4.1)' },
    '7.1': { ws: 'Worksheet 5 · Comparatives (para profundizar)', vid: 'Clarity Bank 5.1 (cortar el final)' }
  };
  function estadoClase(t, F, G) {
    const g = G.find((x) => x.t.id === t.id);
    if (!t.pronto) return { k: 'pub', pill: '<span class="pill ok">Publicada</span>', orden: 9 };
    if ((F.grabadas || []).includes(t.id)) return { k: 'grab', pill: '<span class="pill">Grabada · falta subirla</span>', orden: 5 };
    if ((F.salteadas || []).includes(t.id)) return { k: 'salt', pill: '<span class="pill">No la grabo</span>', orden: 8 };
    if (g && g.ya) return { k: 'urg', pill: '<span class="pill warn">Urgente</span>', orden: 0, g };
    if (g) return { k: 'prox', pill: '<span class="pill warn">La semana que viene</span>', orden: 1, g };
    return { k: 'falta', pill: '<span class="pill">Por grabar</span>', orden: 3 };
  }
  V.atwork = {
    async html() {
      const b = await cargarBandeja();
      const F = Object.assign({ grabadas: [], salteadas: [] }, st.programa.flor || {});
      st._flor = F;
      const G = clasesPorGrabar(b, F);
      const nom1 = (n) => esc(String(n || '').split(' ')[0]);
      const clases = [];
      P.camino.forEach((m) => m.semanas.forEach((s) => s.tareas.forEach((t) => { if (/clase/.test(t.tipo) && !t.onb) clases.push({ t, m, s, e: estadoClase(t, F, G) }); })));
      const n = (k) => clases.filter((c) => c.e.k === k).length;
      const porGrabar = clases.filter((c) => ['urg', 'prox', 'falta'].includes(c.e.k));
      const g0 = G[0];
      // Dónde están tus alumnas: cuántas en cada etapa del recorrido
      const etapas = P.recorrido.map((r) => ({ r, quienes: [] }));
      b.activas.forEach((a) => { const w = semanaDe(a.perfil); if (!w) return; const i = w <= 2 ? 0 : w <= 4 ? 1 : w <= 8 ? 2 : w <= 12 ? 3 : w <= 16 ? 4 : 5; etapas[i].quienes.push({ a, w }); });
      const fila = (c) => {
        const { t, e } = c, lk = linkGrabar(F, t.id), cb = CB[t.id];
        const quien = e.g ? `<br><span class="muted small">${e.g.quienes.map((x) => nom1(x.a.nombre) + ' (sem. ' + x.n + ')').join(', ')}</span>` : '';
        const botones = e.k === 'pub' ? (t.link ? `<a class="btn ghost sm" href="${esc(t.link)}" target="_blank" rel="noopener">Ver la clase</a>` : '') + ((F.publicadas || {})[t.id] ? `<button type="button" class="linkbtn small" data-publicar="${esc(t.id)}">Cambiar link</button>` : '')
          : e.k === 'grab' ? `<button type="button" class="btn sm" data-publicar="${esc(t.id)}">Ya la subí: pegar el link</button><button type="button" class="linkbtn small" data-desgrab="${esc(t.id)}">Deshacer</button>`
          : e.k === 'salt' ? `<button type="button" class="linkbtn small" data-dessaltar="${esc(t.id)}">Volver a la lista</button>`
          : `${lk ? `<a class="btn sm" href="${esc(lk)}" target="_blank" rel="noopener">🎬 Abrir todo para grabar</a><button type="button" class="linkbtn small" data-glink="${esc(t.id)}">Cambiar link</button>` : `<button type="button" class="btn ghost sm" data-glink="${esc(t.id)}">+ Link del material</button>`}<button type="button" class="btn ghost sm" data-grab="${esc(t.id)}">Ya la grabé</button><button type="button" class="linkbtn small" data-saltar="${esc(t.id)}">No la grabo</button>`;
        return `<li><div class="fbitem" style="flex-direction:row;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap"><span><b>${esc(t.texto)}</b> ${e.pill}${quien}
          ${cb ? `<br><span class="muted small">📄 ${esc(cb.ws)} · 🎥 ${esc(cb.vid)} · <a href="${CB_WS}" target="_blank" rel="noopener">Worksheets</a></span>` : ''}</span>
          <span class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end">${botones}</span></div></li>`;
      };
      return `<div class="head"><div><span class="eyebrow">El programa desde tu lado</span><h1>AT WORK</h1></div></div>
<div class="grid g-3">
  <section class="card"><span class="eyebrow">Publicadas</span><span class="big">${n('pub')}</span><span class="muted small">de ${clases.length} clases del programa</span></section>
  <section class="card"><span class="eyebrow">Por grabar</span><span class="big">${porGrabar.length}</span><span class="muted small">${n('urg')} urgentes · ${n('prox')} para la semana que viene</span></section>
  <section class="card"><span class="eyebrow">Grabadas, falta subir</span><span class="big">${n('grab')}</span><span class="muted small">${n('salt') ? n('salt') + ' que decidiste no grabar' : 'Subilas a la academia'}</span></section>
</div>
<section class="card feature"><span class="eyebrow">Lo próximo que grabás</span>
  ${g0 ? `<h2>${esc(g0.t.texto)}</h2><p class="small">${g0.ya ? 'Ya la necesitan: ' : 'La necesitan la semana que viene: '}${g0.quienes.map((x) => nom1(x.a.nombre)).join(', ')}.</p>
  <div class="row" style="gap:8px;flex-wrap:wrap">${linkGrabar(F, g0.t.id) ? `<a class="btn" href="${esc(linkGrabar(F, g0.t.id))}" target="_blank" rel="noopener">🎬 Abrir todo para grabar</a>` : `<button type="button" class="btn" data-glink="${esc(g0.t.id)}">+ Pegar el link del material</button>`}<button type="button" class="btn ghost" data-grab="${esc(g0.t.id)}">Ya la grabé</button></div>
  <p class="muted small">De a una. Cuando la grabes, la siguiente sube sola a este lugar.</p>`
  : '<h2>Ninguna alumna está esperando una clase sin grabar 🎉</h2><p class="muted small">Si querés adelantar, abajo están las que faltan, en orden del programa.</p>'}
</section>
<section class="card"><h3>Dónde están tus alumnas</h3>
  <ul class="dates">${etapas.map((x) => `<li><b>${esc(x.r.cuando)} · ${esc(x.r.etapa)}</b><span>${x.quienes.length ? x.quienes.map((q) => nom1(q.a.nombre)).join(', ') : '<span class="muted small">nadie</span>'}</span></li>`).join('')}</ul>
  <p class="muted small">Sale de la fecha de inicio de cada una. Por eso sabés qué clase necesitan primero.</p>
</section>
${P.camino.map((m) => { const cs = clases.filter((c) => c.m === m).sort((x, y) => x.e.orden - y.e.orden); if (!cs.length) return ''; const pend = cs.filter((c) => ['urg', 'prox', 'falta'].includes(c.e.k)).length;
  return `<details class="card"${pend ? ' open' : ''}><summary><b>${esc(m.titulo || m.nombre || m.mes || '')}</b> <span class="muted small">· ${cs.length - pend} de ${cs.length} listas${pend ? ' · ' + pend + ' por grabar' : ''}</span></summary><ul class="tasks">${cs.map(fila).join('')}</ul></details>`; }).join('')}
<section class="card"><h3>Material de apoyo</h3>
  <ul class="neg">
    <li><a href="${CB_WS}" target="_blank" rel="noopener">Worksheets para la app · AT WORK × Clarity Bank</a> <span class="muted small">(Drive)</span></li>
    <li><a href="#labs">Labs: el próximo lab y el registro de los anteriores</a></li>
    <li><span class="muted small">Pendientes del Clarity Bank: reeditar el 3.2, grabar Passive 4.1, cortar el final del 5.1.</span></li>
  </ul>
</section>`;
    },
    mount() { montarGrabar(); }
  };
  function montarGrabar() {
    const tx = (id) => ((P.camino.flatMap((m) => m.semanas.flatMap((x) => x.tareas)).find((t) => t.id === id) || {}).texto || '');
    const sacar = (k, id) => (st._flor[k] || []).filter((x) => x !== id);
    $$('[data-glink]').forEach((b) => (b.onclick = async () => { if (await pegarLinkGrabar(b.dataset.glink)) ruta(); }));
    $$('[data-grab]').forEach((b) => (b.onclick = async () => { await guardarF({ grabadas: [...(st._flor.grabadas || []), b.dataset.grab] }, '✓ Grabada: ' + tx(b.dataset.grab)); ruta(); }));
    $$('[data-desgrab]').forEach((b) => (b.onclick = async () => { await guardarF({ grabadas: sacar('grabadas', b.dataset.desgrab) }, 'Vuelve a la lista para grabar'); ruta(); }));
    $$('[data-saltar]').forEach((b) => (b.onclick = async () => { await guardarF({ salteadas: [...(st._flor.salteadas || []), b.dataset.saltar] }, 'Sale de tu lista para grabar'); ruta(); }));
    $$('[data-dessaltar]').forEach((b) => (b.onclick = async () => { await guardarF({ salteadas: sacar('salteadas', b.dataset.dessaltar) }, 'Vuelve a la lista para grabar'); ruta(); }));
  }

  // ---------- Mi camino desde tu lado (Flor, 21/11) ----------
  // 1) Ver Mi camino EXACTO como lo ve una alumna (Lab o Private, en la semana que elijas).
  // 2) Editarlo: ocultar o mostrar tareas, cambiar el texto, el link de la clase, la worksheet o la nota, y dejar el porqué.
  //    Se guarda en programa.flor.camino y lo ven todas al momento (Mi camino, Mi semana y Flor AI).
  // 3) «Qué grabar»: un asesor con tu criterio, sin gastar créditos: urgencia por alumnas, sus patrones de error,
  //    si ya tienen worksheet o Clarity Bank para arrancar y si el material para grabar está listo.
  const TEMAS = {
    '6.3': /opini|i think|point of view|punto de vista/i,
    '6.4': /explic|explain|clarif|aclarar/i,
    '8.4': /desacuerdo|disagree|push ?back|decir que no/i,
    '8.5': /inesperad|unexpected|congel|freez|en blanco|preguntas?\b/i,
    '12.3': /reported|reportad|\bsaid\b|\btold\b|dijo|lo que dijo/i,
    '12.4': /error radar|accuracy|precisi/i,
    '12.5': /passive|pasiva/i,
    '12.6': /word famil|nominal|word form|sustantivo|adjetivo/i,
    '13.1': /listening|no entiend|comprensi|nativ/i,
    '13.2': /listening|no entiend|reuni.*entend|nativ/i,
    '14.1': /pronunci|sonido|stress|intelig|me piden que repita/i,
    '15.1': /miedo|no me animo|confian|bloque|insegur/i,
    '15.2': /en blanco|me callo|congel|freez/i,
    '16.1': /perfec|miedo a equivoc/i
  };
  const VEREDICTO = [[4, 'Grábala ya', 'warn'], [2, 'Esta semana o la próxima', 'warn'], [0.5, 'Pronto', ''], [-99, 'Puede esperar', 'ok']];
  function asesorGrabar(b, F, pats) {
    const out = [];
    for (const m of P._caminoBase) for (const s of m.semanas) for (const t of s.tareas) {
      if (!/clase/.test(t.tipo) || t.onb || !t.pronto || t.oculta || (F.grabadas || []).includes(t.id) || (F.salteadas || []).includes(t.id)) continue;
      const desde = Math.min(...s.s), motivos = [];
      const est = b.activas.map((a) => ({ a, n: semanaDe(a.perfil) })).filter((x) => x.n && !((x.a.perfil.camino_hecho || []).includes(t.id)));
      const ya = est.filter((x) => x.n >= desde), prox = est.filter((x) => x.n === desde - 1), cerca = est.filter((x) => x.n >= desde - 4 && x.n < desde - 1);
      const nom = (xs) => xs.map((x) => String(x.a.nombre || '').split(' ')[0]).join(', ');
      let pts = 3 * ya.length + 2 * prox.length + 0.5 * cerca.length;
      if (ya.length) motivos.push(`${nom(ya)} ${ya.length === 1 ? 'ya llegó' : 'ya llegaron'} a esta clase (semana ${desde})`);
      if (prox.length) motivos.push(`${nom(prox)} ${prox.length === 1 ? 'llega' : 'llegan'} la semana que viene`);
      if (cerca.length) motivos.push(`${nom(cerca)} ${cerca.length === 1 ? 'llega' : 'llegan'} en menos de un mes`);
      const re = TEMAS[t.id];
      const conPatron = re ? [...new Set(pats.filter((p) => re.test(p.patron || '') && !/super|resuel/i.test(p.estado || '')).map((p) => p.alumna_id))] : [];
      if (conPatron.length) {
        pts += Math.min(3, conPatron.length);
        const nn = conPatron.map((id) => (b.al.find((x) => x.id === id) || {}).nombre).filter(Boolean).map((n) => n.split(' ')[0]);
        motivos.push(`Es un patrón de error de ${nn.join(', ') || conPatron.length + ' alumnas'}: la necesitan aunque no estén en esa semana`);
      }
      if (linkGrabar(F, t.id)) { pts += 1; motivos.push('El material para grabar ya está listo'); } else motivos.push('Falta el material para grabar (prompter, presentación)');
      const cubierta = t.ws || (t.cb || []).length;
      if (cubierta) { pts -= 1.5; motivos.push('Mientras tanto ya tienen ' + (t.ws ? 'worksheet' : '') + (t.ws && (t.cb || []).length ? ' y ' : '') + ((t.cb || []).length ? 'teoría del Clarity Bank' : '') + ': puede esperar un poco más'); }
      if (!est.length && !conPatron.length) motivos.push('Ninguna alumna activa la necesita todavía');
      const v = VEREDICTO.find(([min]) => pts >= min);
      out.push({ t, m, desde, pts, v, motivos });
    }
    return out.sort((x, y) => y.pts - x.pts || x.desde - y.desde);
  }
  function vistaComoAlumna(formato, semana) {
    const p0 = st.perfil, a0 = st.admin, e0 = st._entregas;
    const d = new Date(); d.setDate(d.getDate() - 7 * ((semana || 1) - 1));
    st.perfil = { ...p0, rol: 'alumna', formato, camino_hecho: [], onboarding: [], fecha_inicio: semana ? diaISO(d) : null };
    const c0 = P.camino; P.camino = P.caminoAlumnas;
    st.admin = false; st._entregas = {};
    try { return V.camino.html(); } finally { st.perfil = p0; st.admin = a0; st._entregas = e0; P.camino = c0; }
  }
  V.micamino = {
    async html() {
      const F = Object.assign({ grabadas: [], salteadas: [] }, st.programa.flor || {});
      st._flor = F;
      const mc = st._mc = Object.assign({ modo: 'editar', fmt: 'LAB', sem: 0, filtro: 'todo' }, st._mc || {});
      const C = F.camino || {}, ocultas = C.ocultas || {}, cambios = C.cambios || {}, notas = C.notas || {};
      const tareas = P._caminoBase.flatMap((m) => m.semanas.flatMap((s) => s.tareas));
      const nOc = tareas.filter((t) => t.oculta).length, nCa = Object.keys(cambios).filter((id) => tareas.some((t) => t.id === id)).length;
      const nPr = tareas.filter((t) => /clase/.test(t.tipo) && t.pronto && !t.oculta).length;
      let b = null, pats = [];
      try { b = await cargarBandeja(); pats = (await Promise.all(b.al.filter((a) => a.rol !== 'admin' && a.activa !== false).map((a) => DB.patrones(a.id).catch(() => [])))).flat(); } catch (e) { console.error(e); }
      const sug = b ? asesorGrabar(b, F, pats) : [];
      st._mcSug = sug;
      const tabs = `<div class="row" style="gap:6px;flex-wrap:wrap">${[['editar', '✏️ Editar mi camino'], ['alumna', '👀 Verlo como alumna'], ['grabar', '🎬 Qué grabar']].map(([k, l]) => `<button type="button" class="btn ${mc.modo === k ? '' : 'ghost'} sm" data-mcmodo="${k}">${l}</button>`).join('')}</div>`;
      const head = `<div class="head"><div><span class="eyebrow">El recorrido de tus alumnas, desde tu lado</span><h1>Mi camino</h1></div></div>
<p class="muted intro">Lo que cambias acá lo ven todas tus alumnas al momento: en Mi camino, en Mi semana y en Flor AI. Nada toca el código.</p>
<div class="grid g-3">
  <section class="card"><span class="eyebrow">Tareas en el camino</span><span class="big">${tareas.length - nOc}</span><span class="muted small">${nOc ? nOc + ' ocultas por ti' : 'ninguna oculta'}</span></section>
  <section class="card"><span class="eyebrow">Clases en grabación</span><span class="big">${nPr}</span><span class="muted small">las alumnas ven «se publica pronto»</span></section>
  <section class="card"><span class="eyebrow">Cambios tuyos</span><span class="big">${nCa}</span><span class="muted small">sobre el camino original</span></section>
</div>
<section class="card">${tabs}</section>`;

      if (mc.modo === 'alumna') {
        return head + `<section class="card"><div class="row" style="gap:10px;flex-wrap:wrap;align-items:flex-end">
  <div class="field" style="margin:0"><label for="mc-fmt">Formato</label><select id="mc-fmt"><option value="LAB" ${mc.fmt === 'LAB' ? 'selected' : ''}>Lab</option><option value="1:1" ${mc.fmt === '1:1' ? 'selected' : ''}>Private</option></select></div>
  <div class="field" style="margin:0"><label for="mc-sem">Está en la semana</label><select id="mc-sem"><option value="0">Sin fecha de inicio</option>${[...Array(20)].map((_, i) => `<option value="${i + 1}" ${mc.sem === i + 1 ? 'selected' : ''}>Semana ${i + 1}</option>`).join('')}</select></div>
</div><p class="muted small" style="margin-top:8px">Es exactamente su pantalla, con tus cambios. Los links funcionan; los botones de subir y las tildes están apagados para que no se te cargue nada a ti.</p></section>
<div class="mc-prev">${vistaComoAlumna(mc.fmt, mc.sem)}</div>`;
      }

      if (mc.modo === 'grabar') {
        const fila = (x, i) => `<li><div class="fbitem" style="gap:6px"><div class="row between" style="gap:8px;flex-wrap:wrap"><span><b>${i + 1}. ${esc(x.t.texto)}</b> <span class="pill ${x.v[2]}">${x.v[1]}</span></span>
          <span class="row" style="gap:6px;flex-wrap:wrap">${linkGrabar(F, x.t.id) ? `<a class="btn sm" href="${esc(linkGrabar(F, x.t.id))}" target="_blank" rel="noopener">🎬 Abrir todo para grabar</a>` : `<button type="button" class="btn ghost sm" data-glink="${esc(x.t.id)}">+ Link del material</button>`}<button type="button" class="btn ghost sm" data-grab="${esc(x.t.id)}">Ya la grabé</button><button type="button" class="linkbtn small" data-saltar="${esc(x.t.id)}">No la grabo</button></span></div>
          <ul class="small" style="margin:0;padding-left:18px">${x.motivos.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div></li>`;
        return head + `<section class="card feature"><span class="eyebrow">Flor AI para ti · qué grabar</span>
  ${sug.length ? `<h2>Grabá primero: ${esc(sug[0].t.texto)}</h2><p class="small">${esc(sug[0].motivos[0] || '')}.</p>` : '<h2>No hay clases pendientes de grabar 🎉</h2>'}
  <p class="muted small">Ordena con tu criterio: primero las que tus alumnas ya necesitan, después las que son un patrón de error de alguna, y baja las que ya tienen worksheet o Clarity Bank para arrancar. No gasta créditos. Si quieres pensarlo con más contexto, cópialo y pégalo en Claude.</p>
  <div class="row"><button type="button" class="btn ghost sm" id="mc-claude">Copiar para Claude</button></div></section>
${sug.length ? `<section class="card"><ul class="tasks">${sug.map(fila).join('')}</ul></section>` : ''}
${nOc ? `<p class="muted small">Las clases que ocultaste no entran en esta lista.</p>` : ''}`;
      }

      // Modo edición
      const filtro = (t) => mc.filtro === 'todo' || (mc.filtro === 'grab' && /clase/.test(t.tipo) && t.pronto) || (mc.filtro === 'oc' && t.oculta) || (mc.filtro === 'ed' && cambios[t.id]) || (mc.filtro === 'sinpb' && /clase/.test(t.tipo) && !t.onb && !entregaDe(t));
      const filaEd = (t) => {
        const c = cambios[t.id] || {}, o = t._o || {};
        const pills = (t.oculta ? '<span class="pill bad">Oculta</span> ' : '') + (/clase/.test(t.tipo) && !t.onb ? (t.pronto ? (t.antes ? '<span class="pill warn">Por grabar · ya la ven (con su worksheet)</span>' : '<span class="pill warn">Por grabar · solo la ves tú</span>') : '<span class="pill ok">Publicada · la ven</span>') : '') + (cambios[t.id] ? ' <span class="pill">Editada</span>' : '');
        const lkClase = t.onb ? (P.onbLinks.LAB || {})[t.onb] : t.link;
        const links = [url(lkClase) ? `<a class="linkbtn small" href="${esc(lkClase)}" target="_blank" rel="noopener">Ver clase ↗</a>` : '', url(t.ws) ? `<a class="linkbtn small" href="${esc(t.ws)}" target="_blank" rel="noopener">📄 Worksheet ↗</a>` : '', (t.cb || []).length ? `<span class="muted small">📚 Clarity Bank (${t.cb.length})</span>` : '', linkGrabar(F, t.id) && t.pronto ? `<a class="linkbtn small" href="${esc(linkGrabar(F, t.id))}" target="_blank" rel="noopener">🎬 Material para grabar ↗</a>` : ''].filter(Boolean).join(' ');
        return `<li class="mc-t${t.oculta ? ' mc-oc' : ''}" data-mct="${esc(t.id)}"><div class="fbitem" style="gap:4px">
  <div class="row between" style="gap:8px;flex-wrap:wrap;align-items:flex-start"><span><span class="muted small">${esc(t.id)}</span> <b>${esc(t.texto)}</b> ${pills}</span>
    <span class="row" style="gap:8px;flex-wrap:wrap"><label class="small"><input type="checkbox" data-mcver="${esc(t.id)}" ${t.oculta ? '' : 'checked'}> Se muestra</label><button type="button" class="btn ghost sm" data-mced="${esc(t.id)}">Editar</button>${cambios[t.id] ? `<button type="button" class="linkbtn small" data-mcorig="${esc(t.id)}">Volver al original</button>` : ''}</span></div>
  <span class="where muted small">${esc(t.donde)} ${links}</span>
  ${/clase|evidencia|practica|material/.test(t.tipo) && !t.onb ? (() => { const en = entregaDe(t); return en ? `<span class="small">📤 La alumna ve: «${esc(en.label)}»</span>` : `<span class="small">⚠️ Sin nada para subir${/clase/.test(t.tipo) ? ': esta clase no tiene playbook ni worksheet' : ''}</span>`; })() : ''}
  ${t.nota ? `<span class="muted small">Nota para la alumna: ${esc(t.nota)}</span>` : ''}
  ${notas[t.id] ? `<span class="small">🔒 Por qué (solo tú): ${esc(notas[t.id])}</span>` : ''}
  <form class="mc-form grid" data-mcf="${esc(t.id)}" hidden novalidate>
    <div class="field"><label>Texto que ve la alumna</label><input class="f-texto" type="text" value="${esc(t.texto)}"><small class="muted">Original: ${esc(o.texto || '')}</small></div>
    ${/clase/.test(t.tipo) && !t.onb ? `<div class="field"><label>Link de la clase (academia)</label><input class="f-link" type="url" value="${esc(url(t.link) || '')}" placeholder="https://academy.breakingbarriers.site/…"><small class="muted">Si pegas el link, la clase queda publicada. Vacío: sin link.</small></div>
    <label class="small"><input type="checkbox" class="f-pronto" ${t.pronto ? 'checked' : ''}> Todavía no está grabada</label>
    <label class="small"><input type="checkbox" class="f-antes" ${t.antes ? 'checked' : ''}> Mostrársela a las alumnas antes de grabarla (solo si ya tiene worksheet o teoría para hacer)</label>` : ''}
    <div class="field"><label>Worksheet (link /copy)</label><input class="f-ws" type="url" value="${esc(url(t.ws) || '')}" placeholder="https://docs.google.com/document/d/…/copy"></div>
    <div class="field"><label>Qué sube la alumna</label><select class="f-sube">${[['', 'Automático (según tenga playbook o worksheet)'], ['playbook', 'Su playbook'], ['worksheet', 'Su worksheet'], ['tarea', 'Su tarea'], ['no', 'Nada: esta clase no tiene playbook']].map(([k, l]) => `<option value="${k}" ${(t.sube || '') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="field"><label>Nota para la alumna (opcional)</label><textarea class="f-nota" rows="2">${esc(t.nota || '')}</textarea></div>
    <div class="field"><label>Por qué lo cambias (solo lo ves tú)</label><input class="f-por" type="text" value="${esc(notas[t.id] || '')}"></div>
    <div class="row"><button class="btn sm" type="submit">Guardar</button><button type="button" class="linkbtn small f-x">Cancelar</button></div>
  </form></div></li>`;
      };
      const cuerpo = P._caminoBase.map((m) => {
        const sems = m.semanas.map((s) => { const ts = s.tareas.filter(filtro); return ts.length ? `<div class="semana"><b class="semtit"><span>SEMANA${s.s.length > 1 ? 'S' : ''} ${s.s.join(' Y ')}</span> ${esc(s.titulo)}</b><ul class="tasks">${ts.map(filaEd).join('')}</ul></div>` : ''; }).join('');
        return sems ? `<details class="card mes" open><summary><span class="mesnum"><small>MÓDULO</small>${m.n}</span><span class="mestit"><h2>${esc(m.titulo)}</h2></span></summary>${sems}</details>` : '';
      }).join('');
      return head + `<section class="card"><div class="row" style="gap:10px;flex-wrap:wrap;align-items:flex-end"><div class="field" style="margin:0"><label for="mc-filtro">Mostrar</label><select id="mc-filtro">${[['todo', 'Todo el camino'], ['grab', 'Clases en grabación'], ['oc', 'Lo que ocultaste'], ['ed', 'Lo que editaste'], ['sinpb', 'Clases sin playbook ni worksheet']].map(([k, l]) => `<option value="${k}" ${mc.filtro === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
  <p class="muted small" style="margin-top:8px">Destilda «Se muestra» para sacar una tarea del camino de todas (Flor AI tampoco la recomienda). Con «Editar» cambias lo que ven y dejas el porqué.</p></section>
${cuerpo || '<section class="card"><p class="muted">Nada para mostrar con este filtro.</p></section>'}`;
    },
    mount() {
      const view = $('#app .view'); if (!view) return;
      montarGrabar();
      const prev = $('.mc-prev', view);
      if (prev) { $$('input, [data-subir]', prev).forEach((x) => { x.disabled = true; }); $$('.entrega', prev).forEach((x) => x.remove()); }
      const C = () => Object.assign({ ocultas: {}, cambios: {}, notas: {} }, JSON.parse(JSON.stringify((st._flor || {}).camino || {})));
      const guardarC = async (c, msg) => { await guardarF({ camino: c }, msg); st.programa.flor = st._flor; ruta(); };
      const sel = (id, k) => { const s = $('#' + id); if (s) s.onchange = () => { st._mc[k] = k === 'sem' ? +s.value : s.value; ruta(); }; };
      sel('mc-fmt', 'fmt'); sel('mc-sem', 'sem'); sel('mc-filtro', 'filtro');
      view.addEventListener('click', async (e) => {
        const m = e.target.closest('[data-mcmodo]'); if (m) { st._mc.modo = m.dataset.mcmodo; return ruta(); }
        const ed = e.target.closest('[data-mced]');
        if (ed) { const f = $(`form[data-mcf="${ed.dataset.mced}"]`, view); f.hidden = !f.hidden; if (!f.hidden) $('.f-texto', f).focus(); return; }
        if (e.target.closest('.f-x')) { e.target.closest('form').hidden = true; return; }
        const og = e.target.closest('[data-mcorig]');
        if (og) { if (!confirm('¿Volver esta tarea a como estaba en el programa original?')) return; const c = C(); delete c.cambios[og.dataset.mcorig]; delete c.notas[og.dataset.mcorig]; return guardarC(c, 'Volvió al original'); }
        if (e.target.id === 'mc-claude') {
          const txt = 'Soy Flor, directora de AT WORK. Ayúdame a decidir qué clase grabar primero esta semana (de a una, sin llenarme la agenda). Esto es lo que dice mi app, ordenado con mi criterio:\n\n' +
            (st._mcSug || []).map((x, i) => `${i + 1}. ${x.t.texto} (semana ${x.desde}) · ${x.v[1]}\n   - ${x.motivos.join('\n   - ')}`).join('\n') +
            '\n\nDecime cuál grabo primero y por qué, y cuáles mando a «después».';
          (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Copiado. Pégalo en Claude.'), () => prompt('Copia este texto:', txt));
        }
      });
      view.addEventListener('change', async (e) => {
        const v = e.target.closest('[data-mcver]'); if (!v) return;
        const id = v.dataset.mcver, c = C();
        if (v.checked) { delete c.ocultas[id]; return guardarC(c, 'Se muestra otra vez: ' + textoBase(id)); }
        const por = prompt('¿Por qué la ocultas? (solo lo ves tú, opcional)', c.notas[id] || '');
        if (por == null) { v.checked = true; return; }
        c.ocultas[id] = textoBase(id); if (por.trim()) c.notas[id] = por.trim();
        guardarC(c, 'Oculta para todas: ' + textoBase(id));
      });
      view.addEventListener('submit', async (e) => {
        const f = e.target.closest('form.mc-form'); if (!f) return;
        e.preventDefault();
        const id = f.dataset.mcf, t = P._caminoBase.flatMap((m) => m.semanas.flatMap((s) => s.tareas)).find((x) => x.id === id); if (!t) return;
        const o = t._o, c = C(), n = {};
        const val = (k) => { const el = $('.f-' + k, f); return el ? (el.type === 'checkbox' ? el.checked : el.value.trim()) : undefined; };
        const texto = val('texto'), link = val('link'), ws = val('ws'), nota = val('nota'), pronto = val('pronto'), por = val('por');
        if ([link, ws].some((u) => u && !url(u))) return toast('Los links tienen que empezar con https://', true);
        if (link && !link.startsWith(ACADEMIA)) return toast('El link de la clase tiene que ser de la academia (' + ACADEMIA + '…)', true);
        if (!texto) return toast('El texto no puede quedar vacío.', true);
        if (texto !== o.texto) n.texto = texto;
        if (link !== undefined && link !== (url(t.link) || '')) n.link = link;
        if (ws !== (url(t.ws) || '')) n.ws = ws;
        if (nota !== (t.nota || '')) n.nota = nota;
        if (pronto !== undefined && pronto !== !!t.pronto) n.pronto = pronto;
        const sube = val('sube');
        if (sube !== (t.sube || '')) n.sube = sube;
        const antes = val('antes');
        if (antes !== undefined && antes !== !!t.antes) n.anticipo = antes;
        const prev = c.cambios[id] || {}, junto = { ...prev, ...n };
        // Lo que quedó igual al original no se guarda como cambio.
        ['texto', 'ws', 'nota'].forEach((k) => { if ((junto[k] || '') === (o[k] || '')) delete junto[k]; });
        if ('link' in junto && (junto.link || '') === (o.link || '')) delete junto.link;
        if ('pronto' in junto && !!junto.pronto === !!o.pronto && !('link' in junto)) delete junto.pronto;
        if ('anticipo' in junto && !!junto.anticipo === !!o.anticipo0) delete junto.anticipo;
        if ('sube' in junto && !junto.sube) delete junto.sube;
        delete junto.de;
        if (Object.keys(junto).length) c.cambios[id] = { ...junto, de: o.texto }; else delete c.cambios[id];
        if (por) c.notas[id] = por; else delete c.notas[id];
        guardarC(c, '✓ Guardado. Ya lo ven tus alumnas.');
      });
    }
  };
  const textoBase = (id) => ((P._caminoBase || P.camino).flatMap((m) => m.semanas.flatMap((x) => x.tareas)).find((t) => t.id === id) || {}).texto || id;

  // ---------- Contenido (pedido de Flor, 14/11) ----------
  // Lo de hoy, tu semana circular (YouTube → email → reels y carruseles que llevan al video),
  // ideas que salen de tus clases y a quién pedirle testimonio. Las piezas se arman con Claude (tu plan), no gastan créditos de la app.
  const LOOP = [['yt', '🎬 Grabar el video de YouTube de la semana'], ['r1', 'Reel hablado 1'], ['r2', 'Reel hablado 2'], ['c1', 'Carrusel 1'], ['c2', 'Carrusel 2'], ['st', 'Stories o research (un día)']];
  const pedidoContenido = (r, nombreTrabajo) => `Proyecto Contenido y marca. Con lo que pasó en esta clase, armame UNA pieza de Instagram con mis reglas:
- Elegí UN momento real de la clase y decime qué TIPO de pieza da mejor: EDUCA/VALOR (algo concreto que usa mañana en su reunión), DEMANDA (cambia una creencia: cómo lo hace hoy, cómo podría ser y qué cambió en la alumna), CRECIMIENTO (un formato viral de una referente puesto en su realidad) o INSPIRA (mi historia, mi forma de trabajar). Y si va como carrusel o reel hablado. Si no da para una pieza fuerte, decímelo y no la armes.
- Le habla a mi clienta ideal: mujer profesional B1-B2 que YA trabaja en inglés en relación de dependencia (no dueña de empresa ni emprendedora). Todo en femenino y con TÚ.
- Hook: la ESTRUCTURA de un hook validado de una referente, no su texto; la escena es mía.
- CTA según el tipo: valor → «guárdalo» o «sígueme»; crecimiento → «sígueme» o mi video de YouTube; demanda → ninguno o una pregunta; inspira → una pregunta. READY solo si estoy en mi semana de puertas abiertas (te aviso).
- La alumna es anónima (${nombreTrabajo}): sin su nombre, sin empresas, sin detalles que la identifiquen ni que solo le sirvan a ella. Nada de citas textuales suyas salvo que yo tenga su ok por escrito.
- Carrusel: placas una por línea y el caption. Reel: prompter corto y caption. Las historias del día, aparte.
- Auditala según su tipo hasta 9/10 o más.

Resumen de la clase (${r.fecha}), solo para que entiendas qué pasó:
${String(r.texto || '').replace(/^\s*[¡!]?\s*hola[^\n]*\n/i, '')}`;
  const pedidoTestimonio = (ap) => `Hola ${ap}! Estoy juntando historias reales de alumnas de AT WORK y me encantaría que la tuya esté. ¿Me contarías en 3 o 4 líneas (o en un audio de un minuto) cómo te sentías al hablar en inglés en el trabajo cuando empezaste, qué cambió y una situación concreta en la que lo notaste? Si te animas a grabarlo en video, mejor, pero escrito está perfecto. ¡Gracias! 💙`;
  V.contenido = {
    async html() {
      const F = Object.assign({ contenido: {}, loop: {}, testimonios: {} }, st.programa.flor || {});
      st._flor = F;
      const hoy = new Date(), hoyI = diaISO(hoy), lun = DB.lunes();
      const hace7 = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
      const finSig = (() => { const d = new Date(lun + 'T12:00:00'); d.setDate(d.getDate() + 13); return diaISO(d); })();
      const [hd, b, res, wins, semC] = await Promise.all([DB.hoyFlor ? DB.hoyFlor(hoyI).catch(() => []) : [], cargarBandeja().catch(() => null), DB.todosResumenes ? DB.todosResumenes().catch(() => []) : [], DB.winsComunidad().catch(() => []), DB.contenidoRango ? DB.contenidoRango(lun, finSig).catch(() => []) : []]);
      st._semC = semC || [];
      st._hoyD = hd || [];
      const porId = {}; ((b && b.activas) || []).forEach((a) => { if (a.perfil && a.perfil.id) porId[a.perfil.id] = a; });
      const nom1 = (n) => String(n || '').split(' ')[0];
      const apodo = (a) => (a.perfil && a.perfil.apodo) || nom1(a.nombre);
      // Ideas de clases (Flor, 18/11): solo alumnas que encajan con la clienta ideal, una por clase (los labs y las clases grupales no se repiten), sin saludos.
      const FUERA = /rossi|maribel|luz ca[ñn]as|roberto/i;
      const vistos = new Set();
      const recientes = (res || []).filter((r) => r.fecha >= hace7 && porId[r.alumna_id] && !FUERA.test(porId[r.alumna_id].nombre || '') && !/decorad|dise[ñn]o de interiores/i.test((porId[r.alumna_id].perfil || {}).trabajo || ''))
        .sort((x, y) => (x.fecha < y.fecha ? 1 : -1))
        .filter((r) => { const k1 = r.alumna_id + '|' + r.fecha, k2 = r.fecha + '|' + String(r.texto || '').replace(/^[^\n]*\n/, '').slice(0, 160); if (vistos.has(k1) || vistos.has(k2)) return false; vistos.add(k1); vistos.add(k2); return true; });
      const ideaDe = (r) => { const ls = String(r.texto || '').split('\n').map((x) => x.trim()).filter((x) => x && !/^[¡!]?\s*hola\b/i.test(x) && !/^[#*\-–]*\s*[A-ZÁÉÍÓÚÑ ·]{6,}:?$/.test(x)); const t = (ls[0] || r.asunto || '').replace(/^(hoy|en la clase del \w+)\s*/i, ''); if (t.length <= 170) return t; const c = t.slice(0, 170); return c.slice(0, c.lastIndexOf(' ')) + '…'; };
      const corto = (t, n) => { t = String(t || '').split(/[.;\n]/)[0]; if (t.length <= n) return t; const c = t.slice(0, n); return c.slice(0, c.lastIndexOf(' ')) + '…'; };
      st._resC = recientes; st._porIdC = porId;
      const L = F.loop[lun] || {};
      const hechosLoop = LOOP.filter(([k]) => L[k]).length;
      const dias = [...Array(7)].map((_, i) => { const d = new Date(lun + 'T12:00:00'); d.setDate(d.getDate() + i); return d; });
      const hechosDias = dias.filter((d) => F.contenido[diaISO(d)]).length;
      // Testimonios: alumnas con 4 semanas o más, sin pedido en los últimos 60 días. Primero las que tienen un win.
      const T = F.testimonios || {};
      const winDe = (a) => (wins || []).filter((w) => w.nombre === a.nombre && w.wins).sort((x, y) => (x.semana < y.semana ? 1 : -1))[0];
      const cand = ((b && b.activas) || []).filter((a) => !/rossi|maribel|roberto/i.test(a.nombre || '')).map((a) => ({ a, w: semanaDe(a.perfil), t: T[a.email] || {}, win: winDe(a) }))
        .filter((x) => x.w && x.w >= 4 && !x.t.recibido && !(x.t.pedido && Date.now() - new Date(x.t.pedido) < 60 * 864e5))
        .sort((x, y) => (!!y.win - !!x.win) || (y.w - x.w));
      const pedidas = ((b && b.activas) || []).filter((a) => (T[a.email] || {}).pedido && !(T[a.email] || {}).recibido);
      const recibidas = ((b && b.activas) || []).filter((a) => (T[a.email] || {}).recibido);
      st._cand = cand;
      return `<div class="head"><div><span class="eyebrow">Tu contenido sale de tus clases</span><h1>Contenido</h1></div></div>
<section class="card"><div class="row between"><h2>Hoy</h2><span class="muted small">${fecha(hoyI, { weekday: 'long', day: 'numeric' })}</span></div>
  ${hoy.getDay() === 0 ? '<p class="muted small">Domingo: descanso. Nada para publicar.</p>' : tuDia(st._hoyD, hoyI, 'contenido')}
</section>
${semanaContenido(st._semC, lun, 'Tu semana de contenido', hoyI)}
${semanaContenido(st._semC, (() => { const d = new Date(lun + 'T12:00:00'); d.setDate(d.getDate() + 7); return diaISO(d); })(), 'La semana que viene', hoyI)}
<section class="card"><div class="row between"><h3>Tu semana circular</h3><span class="muted small">${hechosLoop} de ${LOOP.length}</span></div>
  <p class="muted small">Un video largo por semana y todo lo demás lleva a esa misma idea: dos reels, dos carruseles y un día de stories. De martes a sábado. (El email queda para cuando arranque el email marketing.)</p>
  <div class="hab-list">${LOOP.map(([k, l]) => `<button type="button" class="hab${L[k] ? ' on' : ''}" data-loop="${k}" aria-pressed="${!!L[k]}"><span class="hab-box" aria-hidden="true">✓</span><span class="hab-t">${esc(l)}</span></button>`).join('')}</div>
  <div class="row" style="gap:10px;margin-top:10px"><span class="big">${hechosDias}</span><span class="muted small">días con algo publicado esta semana</span></div>
  <div class="dias" id="cdias">${dias.map((d) => `<button type="button" data-dia="${diaISO(d)}" aria-pressed="${!!F.contenido[diaISO(d)]}" title="${fecha(diaISO(d), { weekday: 'long', day: 'numeric' })}">${d.toLocaleDateString('es', { weekday: 'short' }).slice(0, 2)}<br>${d.getDate()}</button>`).join('')}</div>
  <p class="muted small">Tocá el día cuando publicás. <a href="https://app.notion.com/p/4155708d644881f5bd88c7664cf930a6" target="_blank" rel="noopener">Mi plan de YouTube</a> · <a href="https://app.notion.com/p/fc35708d644883bf9a3e07edd62e7e62" target="_blank" rel="noopener">Calendario en Notion</a></p>
</section>
<section class="card"><h3>Ideas que salen de tus clases de esta semana</h3>
  <p class="muted small">Una por clase, solo de alumnas que son tu clienta ideal. Tocá «Copiar pedido» y pegalo en Claude (proyecto Contenido y marca): te dice si da para una pieza fuerte y, si da, te la arma anónima, conectada con la idea de la semana y auditada.</p>
  ${recientes.length ? `<ul class="tasks">${recientes.map((r, i) => { const a = porId[r.alumna_id]; const pr = corto(a.perfil.trabajo, 70); return `<li><div class="fbitem" style="flex-direction:row;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start"><span style="flex:1;min-width:220px"><b>${esc(apodo(a))} · ${fecha(r.fecha, { weekday: 'short', day: 'numeric' })}</b>${pr ? ` <span class="muted small">· ${esc(pr)}</span>` : ''}<br><span class="small">${esc(ideaDe(r))}</span></span><button type="button" class="btn ghost sm" data-cpedido="${i}">Copiar pedido</button></div></li>`; }).join('')}</ul>`
  : '<p class="muted small">Todavía no hay resúmenes de clase de esta semana.</p>'}
</section>
<section class="card"><div class="row between"><h3>Testimonios</h3><span class="muted small">${recibidas.length} recibidos · ${pedidas.length} pedidos</span></div>
  <p class="muted small">A partir de la semana 4, una por vez. Primero las que acaban de contar un win: es el mejor momento para pedírselo.</p>
  ${cand.length ? `<ul class="tasks">${cand.slice(0, 4).map((x, i) => `<li><div class="fbitem" style="flex-direction:row;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start"><span><b>${esc(apodo(x.a))}</b> <span class="muted small">${(() => { const n = String(x.a.nombre || '').split(' ').slice(0, 2).join(' '); return n && n !== apodo(x.a) ? '· ' + esc(n) + ' ' : ''; })()}· semana ${x.w}</span>${x.win ? `<br><span class="small">Su win: «${esc(String(x.win.wins).slice(0, 140))}»</span>` : ''}</span>
    <span class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end"><button type="button" class="btn ghost sm" data-ctest="${i}">Copiar mensaje</button><button type="button" class="linkbtn small" data-tpedido="${esc(x.a.email)}">Ya se lo pedí</button></span></div></li>`).join('')}</ul>${cand.length > 4 ? `<p class="muted small">Y ${cand.length - 4} más. De a una.</p>` : ''}`
  : '<p class="muted small">Nadie para pedirle ahora.</p>'}
  ${pedidas.length ? `<p class="hab-sec">Esperando su testimonio</p><ul class="neg">${pedidas.map((a) => `<li class="row between"><span>${esc(nom1(a.nombre))} <span class="muted small">· se lo pediste el ${fecha(T[a.email].pedido)}</span></span><button type="button" class="linkbtn small" data-trecibido="${esc(a.email)}">Ya me lo mandó</button></li>`).join('')}</ul>` : ''}
</section>
<p class="muted small" style="text-align:center">Email marketing a tu lista: queda para después de que las alumnas tengan la app.</p>`;
    },
    mount() {
      const lun = DB.lunes();
      const copiar = async (t, msg) => { try { await navigator.clipboard.writeText(t); toast(msg); } catch (e) { toast('No se pudo copiar', true); } };
      $$('[data-copiar]').forEach((bt) => (bt.onclick = () => copiar(bt.parentElement.querySelector('pre').textContent, 'Copiado')));
      $$('[data-tdok]').forEach((bt) => (bt.onclick = async () => {
        const fe = bt.dataset.tdf;
        const x = (fe ? (st._semC || []).find((y) => y.clave === bt.dataset.tdok && y.fecha === fe) : null) || (st._hoyD || []).find((y) => y.clave === bt.dataset.tdok); if (!x) return;
        x.hecho = !x.hecho;
        $$(`[data-tdok="${bt.dataset.tdok}"]`).forEach((b2) => { b2.classList.toggle('on', x.hecho); b2.setAttribute('aria-pressed', x.hecho); b2.textContent = x.hecho ? '✓ Hecho' : 'Marcar hecho'; const li = b2.closest('.td-i'); if (li) li.classList.toggle('hecho', x.hecho); });
        try { await DB.hoyHecho(x.fecha || diaISO(new Date()), x.clave, x.hecho); } catch (e) { toast('No se guardó. Probá de nuevo.', true); }
      }));
      $$('[data-loop]').forEach((bt) => (bt.onclick = async () => {
        const L = { ...((st._flor.loop || {})[lun] || {}) }; L[bt.dataset.loop] = !L[bt.dataset.loop];
        await guardarF({ loop: { ...(st._flor.loop || {}), [lun]: L } }); ruta();
      }));
      const cd = $('#cdias'); if (cd) cd.onclick = async (e) => {
        const b = e.target.closest('[data-dia]'); if (!b) return;
        const c = { ...(st._flor.contenido || {}) }; if (c[b.dataset.dia]) delete c[b.dataset.dia]; else c[b.dataset.dia] = true;
        await guardarF({ contenido: c }); ruta();
      };
      const porIdC = st._porIdC || {};
      $$('[data-cpedido]').forEach((bt) => (bt.onclick = () => { const r = st._resC[+bt.dataset.cpedido]; if (!r) return; copiar(pedidoContenido(r, 'una alumna que trabaja como ' + (String(((porIdC[r.alumna_id] || {}).perfil || {}).trabajo || 'profesional').split(/[.;:\n(]/)[0].replace(/\s+en\s+[A-Z][\w&.]*.*$/, '').trim() || 'profesional')), 'Pedido copiado: pegalo en Claude'); }));
      $$('[data-ctest]').forEach((bt) => (bt.onclick = () => { const x = st._cand[+bt.dataset.ctest]; if (!x) return; copiar(pedidoTestimonio((x.a.perfil && x.a.perfil.apodo) || String(x.a.nombre).split(' ')[0]), 'Mensaje copiado'); }));
      const marcarT = async (mail, cambio, msg) => { const T = { ...(st._flor.testimonios || {}) }; T[mail] = { ...(T[mail] || {}), ...cambio }; await guardarF({ testimonios: T }, msg); ruta(); };
      $$('[data-tpedido]').forEach((bt) => (bt.onclick = () => marcarT(bt.dataset.tpedido, { pedido: diaISO(new Date()) }, 'Anotado: se lo pediste hoy')));
      $$('[data-trecibido]').forEach((bt) => (bt.onclick = () => marcarT(bt.dataset.trecibido, { recibido: diaISO(new Date()) }, '¡Testimonio recibido! 💙')));
    }
  };


  // ---------- Semáforo (Flor, 16/11): ¿corrió todo lo automático? ----------
  // Sale de dos lados: lo que se ve en los datos (clases sin resumen, Tu día sin cargar) y el "latido" que deja cada tarea al terminar.
  const LATIDOS = [['prep', '🌙 Preparación de clases (3 am)'], ['tudia', '📌 Tu día (7:41)'], ['clases', '🎓 Clases del día (cada hora)'], ['sync', '📲 Feedbacks y weeklies (21:13)'], ['control', '🛟 Control de clases (22:43)'], ['mantenimiento', '🛠️ Mantenimiento (6:23)']];
  async function semaforoHTML(hoyD) {
    const hoy = new Date(), hoyI = diaISO(hoy), ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1);
    if (ayer.getDay() === 0) ayer.setDate(ayer.getDate() - 1);
    const ayI = diaISO(ayer);
    const [lat, cAyer] = await Promise.all([DB.latidos ? DB.latidos() : null, DB.clasesDe ? DB.clasesDe(ayI) : []]);
    const hh = (iso) => new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const nom = (t) => esc(String(t || '').split(' ')[0]);
    const exento = (x) => /vacaciones|no vino|no mandar/i.test(x.estado || '');
    const rojos = [], amarillos = [];
    // Clases de hoy que ya terminaron hace más de 90 minutos y no tienen el resumen enviado
    (hoyD || []).filter((x) => x.tipo === 'clase' && x.inicio && !x.enviado_en && !exento(x) && Date.now() - new Date(x.inicio) > 150 * 60e3)
      .forEach((x) => rojos.push(`Clase de ${nom(x.titulo)} (${hh(x.inicio)}): sin resumen enviado.${x.estado ? ' ' + esc(x.estado) : ''}`));
    (cAyer || []).filter((x) => !x.enviado_en && !exento(x)).forEach((x) => rojos.push(`Clase de ayer de ${nom(x.titulo)}: sin resumen enviado.`));
    if (hoy.getDay() !== 0 && hoy.getHours() >= 9 && !(hoyD || []).some((x) => x.tipo !== 'clase' || x.clave.startsWith('clase:'))) rojos.push('Tu día de hoy no se cargó (clases y contenido).');
    if (lat) {
      const porK = {}; lat.forEach((l) => (porK[l.clave] = l));
      LATIDOS.forEach(([k, n]) => {
        const l = porK[k];
        if (!l) return; // todavía no dejó su primera marca
        if (!l.ok) return rojos.push(`${n}: ${esc(l.mensaje || 'falló')} (${fecha(l.cuando, { weekday: 'short' })} ${hh(l.cuando)})`);
        const horas = (Date.now() - new Date(l.cuando)) / 36e5;
        if (horas > (hoy.getDay() === 1 ? 54 : 30)) amarillos.push(`${n}: no corre desde el ${fecha(l.cuando, { weekday: 'long', day: 'numeric' })}.`);
      });
    }
    const verde = !rojos.length && !amarillos.length;
    return `<section class="card semaforo ${verde ? 'ok' : rojos.length ? 'mal' : 'medio'}">
  <div class="row between"><h3>${verde ? '🟢 Todo lo automático está al día' : rojos.length ? '🔴 Algo no corrió' : '🟡 Revisar'}</h3><span class="muted small">${hh(new Date())}</span></div>
  ${verde ? '<p class="muted small">Clases con su resumen, Tu día cargado y todas las tareas corrieron.</p>' : `<ul class="neg small">${rojos.map((t) => `<li>🔴 ${t}</li>`).join('')}${amarillos.map((t) => `<li>🟡 ${t}</li>`).join('')}</ul>
  <p class="small">No tenés que hacer nada: «🔁 Reintentos» lo vuelve a correr solo cada 2 horas (8:13 a 22:13) y esto se pone verde cuando sale. Si a la noche sigue en rojo, abrí Claude en el proyecto «app de at work» y escribí <b>«arreglá lo que está en rojo»</b>. ${lat == null ? '<br><span class="muted">(Falta activar la tabla del semáforo.)</span>' : ''}</p>`}
</section>`;
  }

  // El semáforo se refresca solo cuando volvés a la app (Flor, 17/11: veía el rojo viejo con la pestaña abierta).
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible' || !st.perfil) return;
    const el = document.querySelector('section.semaforo'); if (!el) return;
    try {
      const hd = DB.hoyFlor ? await DB.hoyFlor(diaISO(new Date())) : st._hoyD;
      st._hoyD = hd || st._hoyD;
      const t = document.createElement('div'); t.innerHTML = await semaforoHTML(st._hoyD);
      if (t.firstElementChild) el.replaceWith(t.firstElementChild);
    } catch (e) { /* si falla, queda lo que había */ }
  });

  // La app queda abierta en el celular (Flor, 20/11): cuando vuelve a la pantalla después de 3 minutos o más,
  // trae de nuevo el perfil y lo del programa y vuelve a dibujar la pantalla. Solo en pantallas de lectura:
  // donde se escribe (weekly, feedback, My Day, Flor AI, fichas) no se toca nada, para no perder lo escrito.
  const SE_REFRESCAN = ['semana', 'clases', 'camino', 'inicio', 'progreso', 'empieza', 'coaches'];
  let ocultaDesde = 0;
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') { ocultaDesde = Date.now(); return; }
    const pasaron = ocultaDesde ? Date.now() - ocultaDesde : 0; ocultaDesde = 0;
    if (!st.perfil || pasaron < 3 * 6e4) return;
    try {
      const [p, pr] = await Promise.all([DB.miPerfil(), DB.programa().catch(() => null)]);
      if (p) st.perfil = p; if (pr) st.programa = pr;
      st._clasesHoy = null; // «Hoy tienen clase» de Flor: se vuelve a leer el Calendar
      const v = location.hash.replace(/^#/, '').split('/')[0] || 'semana';
      const enfocado = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      const sinGuardar = [...document.querySelectorAll('#app textarea, #app input[type="text"]')].some((x) => x.value !== x.defaultValue);
      if (SE_REFRESCAN.includes(v) && !enfocado && !sinGuardar) await ruta();
    } catch (e) { /* sin conexión: queda lo que había */ }
  });

  // ---------- Semana de prueba de Flor (16 al 21/11) ----------
  const PRUEBA_HASTA = '2026-11-22';
  const PRUEBA = [['inicio', 'Arrancar el día desde Inicio (Mi día y la una sola cosa)'], ['ok', 'Después de cada clase: OK y fijarme que diga «Resumen enviado»'], ['bandeja', 'Responder weeklies y tareas desde la Bandeja'], ['ficha', 'Abrir la ficha de una alumna antes de su clase'], ['alumna', 'Ver la app como alumna y anotar lo que confunde']];
  function pruebaHTML() {
    const hoyI = diaISO(new Date()); if (hoyI >= PRUEBA_HASTA) return '';
    const F = st._flor || {}, P2 = F.prueba || {}, H2 = P2.hechos || {}, notas = P2.notas || [];
    return `<section class="card"><div class="row between"><h3>Tu semana de prueba</h3><span class="muted small">hasta el sábado 21/11</span></div>
  <p class="muted small">Hacé todo desde la app. Lo que falle o moleste, anotalo acá: el mantenimiento de cada mañana lo lee y lo arregla.</p>
  <div class="hab-list">${PRUEBA.map(([k, l]) => `<button type="button" class="hab${H2[k] ? ' on' : ''}" data-prueba="${k}" aria-pressed="${!!H2[k]}"><span class="hab-box" aria-hidden="true">✓</span><span class="hab-t">${esc(l)}</span></button>`).join('')}</div>
  <form id="prueba-f" class="grid" style="margin-top:8px"><textarea id="prueba-t" rows="2" placeholder="Algo que falló, que no encontré o que me molestó…"></textarea><div class="row"><button class="btn sm" type="submit">Anotar</button></div></form>
  ${notas.length ? `<ul class="neg small">${notas.slice(-5).reverse().map((x) => `<li>${esc(fecha(x.fecha))} · ${esc(x.texto)}${x.resuelto ? ' <span class="pill ok">Arreglado</span>' : ''}</li>`).join('')}</ul>` : ''}
</section>`;
  }
  function montarPrueba() {
    if (!$('#prueba-f')) return;
    $$('[data-prueba]').forEach((bt) => (bt.onclick = async () => { const P2 = { hechos: {}, notas: [], ...(st._flor.prueba || {}) }; P2.hechos = { ...P2.hechos, [bt.dataset.prueba]: !P2.hechos[bt.dataset.prueba] }; await guardarF({ prueba: P2 }); bt.classList.toggle('on'); bt.setAttribute('aria-pressed', !!P2.hechos[bt.dataset.prueba]); }));
    $('#prueba-f').onsubmit = async (e) => { e.preventDefault(); const t = $('#prueba-t').value.trim(); if (!t) return; const P2 = { hechos: {}, notas: [], ...(st._flor.prueba || {}) }; P2.notas = [...(P2.notas || []), { fecha: diaISO(new Date()), texto: t }]; await guardarF({ prueba: P2 }, 'Anotado. Mañana a primera hora se revisa.'); ruta(); };
  }

  // ---------- Mi progreso ----------
  V.progreso = {
    mount() {
      if (st._progFlor) return montarProgresoFlor();
      if ($('#sentir-f')) $('#sentir-f').onsubmit = async (e) => {
        e.preventDefault(); const t = $('#sentir-t').value.trim(); if (!t) return toast('Escribe cómo te sentías al empezar.', true);
        try { await intentar(() => DB.guardarMiPerfil({ sentir_inicio: t }), 'Guardado'); st.perfil.sentir_inicio = t; } catch (er) {}
      };
      const f = $('#dform'); if (!f) return;
      f.onsubmit = async (e) => {
        e.preventDefault(); const file = $('#d-file').files[0]; if (!file) return toast('Elige un archivo.', true);
        const b = $('button', f); b.disabled = true; b.textContent = 'Subiendo…';
        try { await intentar(() => DB.subirDocumento(st.perfil.id, file, $('#d-tipo').value, file.name), 'Documento subido'); ruta(); }
        catch (er) { b.disabled = false; b.textContent = 'Subir'; }
      };
    },
    async html() {
      if (st.admin && !DB.demo) { st._progFlor = true; return progresoFlor(); }
      st._progFlor = false;
      let [pat, ped, ws, docs] = await Promise.all([DB.patrones(), DB.pedidos(), DB.weeklies(), DB.documentos().catch(() => [])]);
      // Las grabaciones de las clases NUNCA se muestran a las alumnas (Flor, 20/11). El Starting Point es solo su audio.
      const esGrab = (d) => /recording|grabaci[oó]n de (tu|la|su) (primera )?clase|class .*recording/i.test(String(d.nombre || '') + ' ' + String(d.path || ''));
      docs = docs.filter((d) => !esGrab(d));
      const audio = docs.find((d) => d.tipo === 'starting'), mios = docs.filter((d) => d.tipo === 'material');
      const p = st.perfil;
      const hace28 = Date.now() - 28 * 864e5;
      const reales = ped.filter((x) => ['reunion', 'mail'].includes(x.tipo));
      const recientes = ped.filter((x) => new Date(x.creado) > hace28).length;
      const env = ws.filter((w) => w.enviado_en).length;
      return `<div class="head"><div><span class="eyebrow">Evidencia real, no sensaciones</span><h1>Mi progreso</h1></div></div>
<section class="card feature"><span class="eyebrow">Tu objetivo en AT WORK</span>
  ${p.objetivo ? `<h2>${esc(p.objetivo)}</h2>` : '<h2>Todavía no lo definiste</h2><p class="muted">Lo armas en tu onboarding con Flor AI.</p><div class="row"><button class="btn" data-ask="Quiero definir mi objetivo a 5 meses">Definirlo con Flor AI</button></div>'}
</section>
<div class="grid g-3">
  <section class="card"><span class="eyebrow">Cómo me siento al hablar en reuniones</span>
    ${p.confianza_hoy ? `<div class="row" style="gap:10px"><span class="big">${p.confianza_hoy}</span><span class="muted">/10 hoy${p.confianza_inicio ? '<br>empezaste en ' + p.confianza_inicio : ''}</span></div>
    <div class="meter"><i style="width:${p.confianza_hoy * 10}%"></i></div><div class="scale"><span>1</span><span>5</span><span>10</span></div>` : ''}
    <form id="sentir-f" class="grid" style="gap:6px"><label class="small muted" for="sentir-t">Cómo me sentía al empezar el programa</label>
      <textarea id="sentir-t" rows="3" maxlength="1000" placeholder="Por ejemplo: me congelaba cuando me hacían una pregunta en una reunión…">${esc(p.sentir_inicio || '')}</textarea>
      <div class="row"><button class="btn ghost sm" type="submit">Guardar</button></div></form>
  </section>
  <section class="card"><span class="eyebrow">Material real que le mandaste a Flor</span>
    <div class="row" style="gap:10px"><span class="big">${ped.length}</span><span class="muted">en total<br>${recientes} en las últimas 4 semanas</span></div>
    <span class="pill ${recientes >= 4 ? 'ok' : 'warn'}">${recientes >= 4 ? 'Vas al día' : 'Meta: 1 reunión real por semana'}</span>
    <span class="muted small">${reales.length} reuniones o mails reales · ${env} weeklies enviados</span>
    ${mios.length ? `<ul class="dates">${mios.map((d) => `<li><span><button type="button" class="linkbtn small" data-archivo="${esc(d.path)}">${esc(d.nombre)}</button> <span class="muted small">· ${fecha(d.creado)}</span></span></li>`).join('')}</ul>` : ''}
  </section>
  <section class="card"><span class="eyebrow">Audio de punto de partida</span>
    ${p.audio_inicio ? `<p><b>Grabado el ${fecha(p.audio_inicio, { day: 'numeric', month: 'long' })}</b></p>${audio ? `<button type="button" class="btn ghost sm" style="align-self:flex-start" data-archivo="${esc(audio.path)}">Escuchar mi punto de partida</button>` : ''}<p class="muted small">Al cerrar el programa grabas el mismo audio y lo comparan juntas.</p>` : '<p class="muted small">Todavía no está. Sube tu primer audio del programa para tu Starting Point: 3 a 5 minutos hablando de tu trabajo, en inglés.</p><a class="btn ghost sm" href="#feedback">Subir mi primer audio</a>'}
  </section>
</div>
<section class="card">
  <h3>Tus patrones de error</h3>
  <p class="muted small">Flor separa los errores fosilizados (sabes la regla pero se te escapa) de los que vienen de falta de base (necesitas la explicación).</p>
  ${pat.length ? `<div class="tbl"><table><thead><tr><th>Patrón</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>
    ${pat.map((x) => `<tr><td>${esc(x.patron)}</td><td>${esc(x.tipo)}</td><td><span class="pill ${/resuel/i.test(x.estado) ? 'ok' : 'warn'}">${esc(x.estado)}</span></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small">Flor los va a ir cargando a medida que vea tu material.</p>'}
</section>
<section class="card"><h3>Mis documentos</h3><p class="muted small">Tu Acuerdo de Trabajo, tu Starting Point, tu material y tus prácticas. Todo queda guardado acá y en tu carpeta.</p>
  ${docs.length ? `<ul class="dates">${docs.map((d) => `<li><b>${esc((P.tiposDoc.find((x) => x[0] === d.tipo) || [, 'Documento'])[1])}</b><span><button type="button" class="linkbtn" data-archivo="${esc(d.path)}">${esc(d.nombre)}</button> <span class="muted small">· ${fecha(d.creado)}</span></span></li>`).join('')}</ul>` : '<p class="muted small">Todavía no hay documentos.</p>'}
  <form class="editrow" id="dform"><select id="d-tipo">${P.tiposDoc.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select><input type="file" id="d-file" accept=".pdf,image/*,.doc,.docx,audio/*,video/*"><button class="btn sm" type="submit">Subir</button></form>
</section>`;
    }
  };

  // ---------- Empieza acá (onboarding LAB o Private) ----------
  V.empieza = {
    html() {
      const o = onbDe(st.perfil), f = fmt(st.perfil), hechos = st.perfil.onboarding || [];
      const lk = (v) => (v === 'curso' ? (P.onbLinks[f] || {}).curso : v);
      const listo = (DB.demo || !st.admin) && onbHecho();
      const arriba = listo ? `<div class="head"><div><span class="eyebrow">${esc(o.nombre)}</span><h1>Cómo funciona</h1></div><span class="pill">Onboarding hecho ✓</span></div>
<section class="card feature"><span class="eyebrow">Ya terminaste tu onboarding</span><h2>Esto ya lo hiciste</h2>
  <p class="muted">Esta página queda como guía para consultar cuando quieras: tus links, cómo es tu semana, dónde está cada cosa y las preguntas frecuentes. Lo que te toca ahora está en Mi semana.</p>
  <div class="row"><a class="btn" href="#semana">Ir a Mi semana</a><button class="btn ghost" type="button" data-ask="¿Qué me toca hacer esta semana?">Preguntarle a Flor AI qué me toca</button></div></section>
<p class="note small">¿Entraste con una contraseña provisoria que te mandó Flor? <button type="button" class="linkbtn" id="clave2">Crea tu propia contraseña acá</button>.</p>` : `<div class="head"><div><span class="eyebrow">Tu primera semana · ${esc(o.nombre)}</span><h1>Empieza acá</h1></div><span class="pill" id="onbCount"></span></div>
<p class="note small">¿Entraste con una contraseña provisoria que te mandó Flor? <button type="button" class="linkbtn" id="clave2">Crea tu propia contraseña acá</button>.</p>
<p class="muted intro">Todo lo que necesitas para empezar está en esta página. Tómate el onboarding con calma: entender cómo funciona todo lleva unas dos semanas, y es normal.</p>
${o.nota ? `<p class="note">${esc(o.nota)}</p>` : ''}
<section class="card feature">
  <span class="eyebrow">Tu bienvenida con Flor AI · 20 a 30 minutos</span>
  <h2>Haz tu onboarding acompañada</h2>
  <p class="muted">Flor AI te explica cómo funciona tu semana, dónde está cada cosa, toma tu punto de partida y hacen juntas tu primera práctica.</p>
  <div class="row"><button class="btn" type="button" data-ask="Soy nueva en AT WORK, quiero hacer mi onboarding">Empezar mi onboarding</button>${url(lk('curso')) ? `<a class="btn ghost" href="${esc(lk('curso'))}" target="_blank" rel="noopener">Ver los 8 videos</a>` : ''}</div>
</section>`;
      return `${arriba}
<div class="grid g-2">
  ${listo ? '' : `<section class="card"><h3>Tu checklist final</h3><p class="muted small">Márcalo completo antes de empezar el Módulo 1.</p>
    <div class="meter"><i id="onbBar" style="width:0"></i></div>
    <ul class="tasks" id="onb">${o.checklist.map((t, i) => `<li><label><input type="checkbox" data-i="${i}" ${hechos.includes(i) ? 'checked' : ''}><div><div class="t">${esc(t)}</div></div></label></li>`).join('')}</ul></section>`}
  <div class="grid" style="align-content:start">
    <section class="card"><h3>Tus links</h3><ul class="dates">
      ${o.links.map(([t, d, v]) => `<li><b>${esc(t)}</b><span>${url(lk(v)) ? `<a href="${esc(lk(v))}" target="_blank" rel="noopener">${esc(d)}</a>` : esc(d)}</span></li>`).join('')}
      <li><b>Tu carpeta de Drive</b><span>${url(st.perfil.drive_url) ? `<a href="${esc(st.perfil.drive_url)}" target="_blank" rel="noopener">Abrir mi carpeta</a>` : 'Te llegó en el mail de bienvenida'}</span></li>
    </ul></section>
    <section class="card"><h3>Tu semana</h3><ul class="dates">${o.semana.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ul></section>
  </div>
</div>
${listo ? '' : `<section class="card"><span class="eyebrow">Antes de empezar</span><h3>${esc(o.arranque[0])}</h3><p class="small">${esc(o.arranque[1])}</p>
  ${url(o.links[2][2]) ? `<div class="row"><a class="btn ghost sm" href="${esc(o.links[2][2])}" target="_blank" rel="noopener">Agendar</a></div>` : ''}</section>`}
<section class="card"><h3>Dónde está cada cosa</h3><p class="muted small">Las clases están en la comunidad AT WORK, dentro de «Learning», y tu camino con los links está en <a href="#camino">Mi camino</a>. Lo tuyo vive en tu carpeta personal de Drive:</p>
  <ul class="dates">${P.carpetas.map(([n, t, d]) => `<li><b>${n} · ${esc(t)}</b><span>${esc(d)}</span></li>`).join('')}</ul>
  <p class="muted small">Desde <a href="#progreso">Mi progreso</a> y <a href="#feedback">Pedir feedback</a> puedes subir tus archivos y quedan guardados en tu carpeta.</p></section>
<section class="card"><h3>Preguntas frecuentes</h3>${o.faq.map(([q, r, ask]) => `<details class="faq"><summary>${esc(q)}</summary><p class="small">${esc(r)}</p>${ask ? `<button type="button" class="btn ghost sm" data-ask="${esc(ask)}">Preguntarle a Flor AI</button>` : ''}</details>`).join('')}
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
      if (!$('#onb')) return;
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

  // ---------- Inicio de Flor (panel de administradora) ----------
  // Criterio: Ann (una sola cosa a la vez, con métrica de "resuelto") + Hábitos Atómicos (identidad, versión mínima,
  // nunca fallar dos veces, mínima fricción). Mi día se tilda en menos de 30 segundos.
  const HAB = {
    dia: [['escritorio', 'Ordenar escritorio', 'Mañana'], ['mover', 'Gym o pádel', 'Mañana'],
      ['casa', "Cocina + casa 15' + cena resuelta", 'Después de almorzar'], ['grabar', 'GRABAR (antes de cualquier otra cosa en la compu)', 'Después de almorzar']],
    // Suman si se dan, pero no cuentan para el día: a veces se puede y a veces no (Flor, 13/11).
    extra: [['meditar', 'Meditar'], ['leer', 'Leer y escribir']],
    // La versión mínima de cada hábito para un día difícil.
    minima: [['Ordenar escritorio', 'Despejar la mesa: 2 minutos.'], ['Gym o pádel', 'Caminar 10 minutos o estirar 5.'], ['Cocina + casa', 'Lavar lo del día y dejar la cena simple resuelta.'], ['GRABAR', 'Una sola toma de 1 minuto, aunque no la uses.']],
    semana: [['w:compras', 'Compras + comida + flores (domingo)'], ['w:amiga', 'Ver a una amiga'], ['w:plataforma', 'Plataforma solo martes y jueves']],
  };
  // ---------- OK de la clase (Flor, 13/11): al lado de "Entrar a la clase · Clase lista" ----------
  // Gris: todavía no se dio. Flor toca OK (o la tarea lo detecta sola con la grabación de Wispr) → verde.
  // La tarea "🎓 Clases del día" arma el resumen, se lo manda a la alumna por mail (Flor en CCO) y actualiza su app.
  function okClase(x) {
    if (!x || !x.clave) return '';
    const hm = (iso) => (iso ? new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
    const env = !!x.enviado_en, on = !!x.hecho || env;
    const est = env ? `✓ Resumen enviado ${hm(x.enviado_en)} · su app ya está al día`
      : x.estado ? esc(x.estado)
      : on ? 'Armando el resumen: le llega por mail y se actualiza su app en menos de una hora.'
      : '';
    return `<button type="button" class="btn sm okc${on ? ' on' : ''}" data-okc="${esc(x.clave)}" aria-pressed="${on}" ${env ? 'disabled' : ''} title="${on ? 'Clase dada' : 'Tocalo cuando ya diste la clase'}">${on ? '✓ OK' : 'OK'}</button>${est ? `<p class="small okc-e${env ? ' ok' : ''}">${est}</p>` : ''}`;
  }
  function montarOk(lista) {
    $$('[data-okc]').forEach((bt) => (bt.onclick = async () => {
      const x = (lista() || []).find((y) => y.clave === bt.dataset.okc); if (!x || x.enviado_en) return;
      x.hecho = !x.hecho;
      try { await DB.claseOk(x.fecha || diaISO(new Date()), x.clave, x.hecho); toast(x.hecho ? 'Clase dada ✓ El resumen sale solo en menos de una hora.' : 'Desmarcada'); }
      catch (e) { x.hecho = !x.hecho; toast('No se guardó. Probá de nuevo.', true); }
      $$(`[data-okc="${CSS.escape(x.clave)}"]`).forEach((b) => { const w = document.createElement('span'); w.innerHTML = okClase(x); const box = b.parentElement; box.querySelectorAll('.okc-e').forEach((e) => e.remove()); b.replaceWith(...w.childNodes); });
      montarOk(lista);
    }));
  }

  // Semana de contenido (Flor, 18/11): de martes a sábado, cada día con su pieza (Canva, caption, placas o prompter, historias) y el YouTube de la semana.
  function semanaContenido(R, lun, titulo, hoyI) {
    const DN = ['Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dias = DN.map((n, i) => { const d = new Date(lun + 'T12:00:00'); d.setDate(d.getDate() + i + 1); return [n, diaISO(d)]; });
    const fin = dias[4][1];
    const yt = (R || []).filter((x) => /^youtube:/.test(x.clave || '') && x.fecha >= lun && x.fecha <= fin);
    const hay = (R || []).some((x) => x.fecha >= lun && x.fecha <= fin && !/^youtube:/.test(x.clave || ''));
    const tipoDe = (x) => { const m = String(x.detalle || '').match(/^(Valor \+ Crecimiento|Valor|Educa|Crecimiento|Demanda|Inspira|Conversión)/i); return m ? m[1] : ''; };
    const dia = ([n, f]) => {
      const L = (R || []).filter((x) => x.fecha === f && !/^youtube:/.test(x.clave || ''));
      const res = L.map((x) => `${esc(x.titulo || '').replace(/^(Reel a cámara|Carrusel|Historias) · /, (m) => `<span class="muted">${m}</span>`)}${tipoDe(x) ? ` <span class="pill">${esc(tipoDe(x))}</span>` : ''}${x.hecho ? ' <span class="pill">✓</span>' : ''}`).join('<br>');
      return `<details class="sem-dia"${f === hoyI ? ' open' : ''}><summary><b>${n} ${fecha(f, { day: 'numeric', month: 'numeric' })}</b>${f === hoyI ? ' <span class="pill warn">Hoy</span>' : ''}<br><span class="small">${res || '<span class="muted">Todavía sin pieza</span>'}</span></summary>${L.length ? tuDia(L, f, 'dia') : ''}</details>`;
    };
    return `<section class="card"><div class="row between"><h3>${titulo}</h3><span class="muted small">${fecha(dias[0][1], { day: 'numeric', month: 'numeric' })} al ${fecha(fin, { day: 'numeric', month: 'numeric' })}</span></div>
  ${hay ? dias.map(dia).join('') : '<p class="muted small">Todavía no está armada. Se arma sola el domingo a la tarde.</p>'}
  ${yt.length ? `<details class="sem-dia"><summary><b>YouTube · el video de la semana</b><br><span class="small">${esc(yt[0].titulo || '')}</span></summary>${tuDia(yt, yt[0].fecha, 'dia')}</details>` : ''}
</section>`;
  }
  // "Tu día": lo que la madrugada dejó listo (clases preparadas, qué grabar, qué subir). Sale de la tabla hoy_flor.
  // modo 'clases': solo las clases de hoy (lista); modo 'contenido': qué grabar/subir de redes (lista). Sin modo: la tarjeta entera.
  function tuDia(L, hoyI, modo) {
    L = L || [];
    if (!L.length && modo !== 'contenido') return '';
    const hh = (iso) => (iso ? new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
    const lk = (u, t, cl = 'btn ghost sm') => (u ? `<a class="${cl}" href="${esc(u)}" target="_blank" rel="noopener">${t}</a>` : '');
    const copiar = (t, l) => (t ? `<details class="td-txt"><summary>${l}</summary><pre>${esc(t)}</pre><button type="button" class="linkbtn small" data-copiar>Copiar</button></details>` : '');
    // Flor, 18/11: el carrusel no tiene prompter. Placas (o prompter del reel) por un lado y las historias del día por otro.
    const partes = (x) => {
      const t = String(x.texto2 || ''); if (!t.trim()) return [];
      const i = t.search(/📱\s*HISTORIAS DEL D[IÍ]A/i);
      const a = (i >= 0 ? t.slice(0, i) : t).trim(), h = i >= 0 ? t.slice(i).trim() : '';
      const esHist = /^historias:/.test(x.clave || '');
      const la = esHist ? 'Historias del día' : x.tipo === 'subir' ? 'Placas del carrusel' : x.tipo === 'grabar' ? 'Prompter para grabar' : 'Detalle';
      return [[a.replace(/^PLACAS:\s*están en Canva[^\n]*\n?/i, '').trim(), la], [h, 'Historias del día']].filter(([z]) => z);
    };
    const hecho = (x) => `<button type="button" class="linkbtn small td-ok${x.hecho ? ' on' : ''}" data-tdok="${esc(x.clave)}"${modo === 'dia' ? ` data-tdf="${esc(x.fecha || '')}"` : ''} aria-pressed="${!!x.hecho}">${x.hecho ? '✓ Hecho' : 'Marcar hecho'}</button>`;
    const cl = L.filter((x) => x.tipo === 'clase').sort((a, b) => (a.inicio < b.inicio ? -1 : 1));
    const gr = L.filter((x) => x.tipo === 'grabar'), su = L.filter((x) => x.tipo === 'subir'), ot = L.filter((x) => x.tipo === 'otro');
    const item = (x) => `<li class="td-i${x.hecho ? ' hecho' : ''}"><div class="row between"><b>${esc(x.titulo || '')}</b>${hecho(x)}</div>
      ${x.detalle ? `<p class="small muted">${esc(x.detalle)}</p>` : ''}
      <div class="row" style="gap:8px;flex-wrap:wrap">${lk(x.link, /canva/.test(x.link || '') ? 'Abrir en Canva' : /notion/.test(x.link || '') ? 'Abrir en Notion' : 'Abrir')}${lk(x.link2, /notion/.test(x.link2 || '') ? 'Ver en Notion' : 'Abrir')}</div>
      ${partes(x).map(([t, l]) => copiar(t, l)).join('')}${copiar(x.texto, x.tipo === 'grabar' || x.tipo === 'subir' ? 'Caption para copiar' : 'Texto')}</li>`;
    const liClase = (x) => `<li class="td-i"><div class="row between"><b>${hh(x.inicio)} · ${esc(x.titulo || '')}</b></div>${x.detalle ? `<p class="small muted">${esc(x.detalle)}</p>` : ''}<div class="row okc-row" style="gap:8px;flex-wrap:wrap;align-items:center">${lk(x.meet, 'Entrar a la clase', 'btn sm')}${lk(x.link, 'Clase lista')}${okClase(x)}</div></li>`;
    if (modo === 'clases') return cl.length ? `<ul class="td-l">${cl.map(liClase).join('')}</ul>` : '';
    if (modo === 'dia') return `<ul class="td-l">${L.filter((x) => x.tipo !== 'clase').map(item).join('')}</ul>`;
    if (modo === 'contenido') {
      // Siempre a la vista (Flor, 14/11): Instagram de hoy y el YouTube de la semana. Si todavía no se cargó, lo dice.
      const esYT = (x) => /^youtube:/.test(x.clave || ''), esProg = (x) => /^programa:/.test(x.clave || '');
      const ig = gr.concat(su).filter((x) => !esYT(x) && !esProg(x)), yt = L.filter(esYT), prog = gr.filter(esProg);
      const falta = (t, u, l) => `<li class="td-i"><p class="small muted">${t}</p>${u ? `<div class="row">${lk(u, l)}</div>` : ''}</li>`;
      return `<p class="hab-sec">Instagram de hoy</p><ul class="td-l">${ig.length ? ig.map(item).join('') : falta('Todavía no está lista la pieza de hoy (se carga a las 7:41 con su caption y su Canva o su prompter).', 'https://app.notion.com/p/fc35708d644883bf9a3e07edd62e7e62', 'Ver el calendario en Notion')}</ul>
  <p class="hab-sec">YouTube · el video de la semana</p><ul class="td-l">${yt.length ? yt.map(item).join('') : falta('Todavía no está cargado el video de esta semana.', 'https://app.notion.com/p/4155708d644881f5bd88c7664cf930a6', 'Abrir mi plan de YouTube')}</ul>
  ${prog.length ? `<p class="hab-sec">Clases del programa</p><ul class="td-l">${prog.map(item).join('')}</ul>` : ''}${ot.length ? `<p class="hab-sec">Además</p><ul class="td-l">${ot.map(item).join('')}</ul>` : ''}`;
    }
    return `<section class="card tudia"><div class="row between"><h2>Tu día</h2><span class="muted small">Todo lo que quedó listo para hoy</span></div>
  ${cl.length ? `<p class="hab-sec">Clases</p><ul class="td-l">${cl.map((x) => `<li class="td-i"><div class="row between"><b>${hh(x.inicio)} · ${esc(x.titulo || '')}</b></div>${x.detalle ? `<p class="small muted">${esc(x.detalle)}</p>` : ''}<div class="row okc-row" style="gap:8px;flex-wrap:wrap;align-items:center">${lk(x.meet, 'Entrar a la clase', 'btn sm')}${lk(x.link, 'Clase lista')}${okClase(x)}</div></li>`).join('')}</ul>` : ''}
  ${gr.length ? `<p class="hab-sec">Para grabar</p><ul class="td-l">${gr.map(item).join('')}</ul>` : ''}
  ${su.length ? `<p class="hab-sec">Para subir</p><ul class="td-l">${su.map(item).join('')}</ul>` : ''}
  ${ot.length ? `<p class="hab-sec">Además</p><ul class="td-l">${ot.map(item).join('')}</ul>` : ''}
</section>`;
  }
  // Domingo: día de descanso de Flor (15/11). No hay clases, ni hábitos del día, ni nada para grabar.
  const esDomingo = (d) => (d || new Date()).getDay() === 0;
  const IDENTIDAD = 'Soy una mujer que cuida su energía y hace crecer un negocio sano y abundante.';
  // ---------- Ritual de la mañana (Flor, 17/11): 5 pilares, apenas se despierta. Sin fin (Flor, 18/11): cuenta días y racha ----------
  // Se completa en el Inicio antes que todo. Se guarda en habitos_flor.ritual (migración 19), una fila por día.
  const PILARES = [
    ['despierta', '1 · Despertar consciente', 'A tu hora, sin apuro. Antes del celular: ¿cómo está tu energía real y quién querés ser hoy?'],
    ['gracias', '2 · Programación de gratitud', 'Tres cosas concretas por las que agradecés hoy.'],
    ['vision', '3 · Visualización de resultados', 'Cinco minutos con los ojos cerrados: cómo va a ser HOY. Tus clases, tu bloque de grabar, con qué humor, y a qué hora cerrás la compu.'],
    ['acciones', '4 · Compromiso de acción', 'Tres acciones concretas, una por eje. Las clases ya están (Cumplir): acá va lo que depende de vos.'],
    ['identidad', '5 · Declaración de identidad', 'Hoy soy… Leela en voz alta. Si en el día te vas de foco, volvé acá.'],
  ];
  const ritVacio = () => ({ logro: '', despierta: false, quien: '', gracias: ['', '', ''], vision: '', acciones: [{ t: '', h: false }, { t: '', h: false }, { t: '', h: false }], identidad: '', dicha: false, hecho: false });
  const ritNorm = (r) => { const v = ritVacio(), x = Object.assign(v, r || {}); x.gracias = [0, 1, 2].map((i) => (x.gracias || [])[i] || ''); x.acciones = [0, 1, 2].map((i) => Object.assign({ t: '', h: false }, (x.acciones || [])[i])); return x; };
  const ritPilar = (r, k) => ({
    despierta: !!r.quien.trim(),
    gracias: r.gracias.every((g) => g.trim()),
    vision: !!r.vision.trim(),
    acciones: r.acciones.every((a) => a.t.trim()),
    identidad: !!r.identidad.trim() && !!r.dicha,
  })[k];
  const ritCompleto = (r) => PILARES.every(([k]) => ritPilar(r, k));
  // Día difícil (sus reglas: versión mínima y cuenta igual): una gratitud, la acción de Construir y la identidad dicha.
  const ritMinimo = (r) => !!r.gracias.some((g) => g.trim()) && !!r.acciones[0].t.trim() && !!r.dicha;
  // Todos los días del ritual, con el de hoy actualizado. Más reciente primero.
  function ritTodos(dias, hoyI, r) {
    const m = {}; (dias || []).forEach((d) => { if (d.ritual) m[d.fecha] = ritNorm(d.ritual); });
    m[hoyI] = r;
    return Object.keys(m).sort().reverse().map((f) => ({ fecha: f, r: m[f] }));
  }
  function ritDia(dias, hoyI, r) {
    const T = ritTodos(dias, hoyI, r), n = T.filter((x) => x.r.hecho).length;
    // Racha: días seguidos con ritual, contando desde hoy (o desde ayer si hoy todavía no está hecho).
    const hecho = new Set(T.filter((x) => x.r.hecho).map((x) => x.fecha));
    const d = new Date(hoyI + 'T12:00:00'); if (!hecho.has(hoyI)) d.setDate(d.getDate() - 1);
    let racha = 0; while (hecho.has(diaISO(d))) { racha++; d.setDate(d.getDate() - 1); }
    return { n, racha };
  }
  const ritCuenta = (c, hoy) => `día ${c.n + (hoy ? 1 : 0)}${c.racha > 1 ? ` · 🔥 ${c.racha} seguidos` : ''}`;
  // Mi registro (Flor, 18/11): ver los rituales anteriores y, por semana, las acciones hechas y los logros.
  function registroHTML(dias, hoyI, rHoy, H) {
    const T = ritTodos(dias, hoyI, rHoy).filter((x) => x.r.hecho || x.r.gracias.some((g) => g.trim()) || x.r.acciones.some((a) => a.t.trim()));
    const lunDe = (f) => { const d = new Date(f + 'T12:00:00'); const w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return diaISO(d); };
    // Los hábitos de Mi día también suman a los logros (Flor, 18/11: «no pusiste que vi a una amiga»).
    const HS = {}; Object.values(H || {}).forEach((x) => { if (x && x.hechos && Object.values(x.hechos).some(Boolean)) (HS[lunDe(x.fecha)] = HS[lunDe(x.fecha)] || []).push(x); });
    const S = {}; T.forEach((x) => { (S[lunDe(x.fecha)] = S[lunDe(x.fecha)] || []).push(x); });
    Object.keys(HS).forEach((l) => { S[l] = S[l] || []; });
    if (!Object.keys(S).length) return '';
    const habLogros = (l) => { const L = HS[l] || [], out = [];
      HAB.semana.forEach(([k, t]) => { if (L.some((x) => x.hechos[k])) out.push('✅ ' + t.replace(/ \(.*\)$/, '')); });
      HAB.dia.concat(HAB.extra).forEach(([k, t]) => { const n = L.filter((x) => x.hechos[k]).length; if (n) out.push(`💪 ${t.replace(/ \(.*\)$/, '')}: ${n} ${n === 1 ? 'día' : 'días'}`); });
      return out; };
    const semanas = Object.keys(S).sort().reverse();
    const dia = (x) => { const r = x.r, acc = r.acciones.filter((a) => a.t.trim());
      return `<details class="reg-dia"><summary><b>${esc(fecha(x.fecha, { weekday: 'long', day: 'numeric', month: 'short' }))}</b> ${r.hecho ? (r.minima ? '· ½ mínima' : '· ✓') : '· sin terminar'}${r.logro && r.logro.trim() ? ' · 🏆' : ''}</summary>
  ${r.quien ? `<p class="small"><b>Quién quise ser:</b> ${esc(r.quien)}</p>` : ''}
  ${r.gracias.some((g) => g.trim()) ? `<p class="small"><b>Agradecí:</b> ${r.gracias.filter((g) => g.trim()).map(esc).join(' · ')}</p>` : ''}
  ${r.vision ? `<p class="small"><b>Cómo iba a ser el día:</b> ${esc(r.vision)}</p>` : ''}
  ${acc.length ? `<ul class="small reg-acc">${acc.map((a) => `<li>${a.h ? '✅' : '⬜'} ${esc(a.t)}</li>`).join('')}</ul>` : ''}
  ${r.logro && r.logro.trim() ? `<p class="small"><b>🏆 Logro:</b> ${esc(r.logro)}</p>` : ''}
  ${r.identidad ? `<p class="small muted"><i>${esc(r.identidad)}</i></p>` : ''}
</details>`; };
    const sem = (l, i) => { const L = S[l], hechos = L.filter((x) => x.r.hecho).length;
      const acc = L.flatMap((x) => x.r.acciones.filter((a) => a.t.trim())), ok = acc.filter((a) => a.h);
      const logros = L.filter((x) => x.r.logro && x.r.logro.trim()), hl = habLogros(l);
      const fin = new Date(l + 'T12:00:00'); fin.setDate(fin.getDate() + 6);
      return `<details class="reg-sem"${i === 0 ? ' open' : ''}><summary><b>${i === 0 && l === lunDe(hoyI) ? 'Esta semana' : 'Semana del ' + esc(fecha(l))}</b> <span class="muted small">· ${hechos} ${hechos === 1 ? 'ritual' : 'rituales'} · ${ok.length} de ${acc.length} acciones</span></summary>
  ${logros.length || ok.length || hl.length ? `<p class="hab-sec">🏆 Logros de la semana</p><ul class="small reg-acc">${logros.map((x) => `<li>🏆 <b>${esc(fecha(x.fecha, { weekday: 'short' }))}:</b> ${esc(x.r.logro)}</li>`).join('')}${ok.map((a) => `<li>✅ ${esc(a.t)}</li>`).join('')}${hl.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '<p class="muted small">Todavía no hay nada tildado esta semana.</p>'}
  ${L.length ? `<p class="hab-sec">Día por día</p>${L.map(dia).join('')}` : ''}
</details>`; };
    return `<section class="card registro" id="registro"><div class="row between"><h2>📖 Mi registro</h2><span class="muted small">${T.filter((x) => x.r.hecho).length} rituales</span></div>
  <p class="muted small">Tus rituales anteriores y, por semana, lo que hiciste y lo que lograste.</p>
  ${semanas.slice(0, 8).map(sem).join('')}
  ${semanas.length > 8 ? `<p class="muted small">Se muestran las últimas 8 semanas.</p>` : ''}
</section>`;
  }
  function ritualHTML(r, c, ident, foco) {
    const ok = (k) => (ritPilar(r, k) ? ' on' : '');
    const barra = '';
    const dom = esDomingo();
    const ejes = dom ? [['Disfrutar', 'Algo que disfruto hoy'], ['Ordenar', 'Compras, comida, flores: dejar lista la semana'], ['Cuidarme', 'Un descanso que protejo']]
      : [['Construir', foco ? 'Mi foco (' + foco + '): …' : 'GRABAR: …'], ['Ordenar', 'Lo único de admin que sí resuelvo hoy'], ['Cuidarme', 'Gym o pádel, comida, un descanso que protejo']];
    const acciones = r.acciones.map((a, i) => `<div class="rit-acc${a.h ? ' on' : ''}"><label class="rit-eje"><input type="checkbox" data-racc="${i}"${a.h ? ' checked' : ''}> ${ejes[i][0]}</label><textarea class="rit-auto" data-rat="${i}" rows="1" placeholder="${esc(ejes[i][1])}">${esc(a.t)}</textarea></div>`).join('');
    if (r.hecho) {
      return `<section class="card ritual hecho" id="ritual">
  <div class="row between"><h2>☀️ Ritual hecho${r.minima ? ' · versión mínima' : ''}</h2><span class="muted small">${ritCuenta(c, false)}</span></div>${barra}
  <p class="hab-sec">Tus 3 acciones de hoy</p><div class="rit-accs">${r.acciones.map((a, i) => `<button type="button" class="hab${a.h ? ' on' : ''}" data-racc2="${i}" aria-pressed="${!!a.h}"><span class="hab-box" aria-hidden="true">✓</span><span class="hab-t">${esc(a.t)}</span></button>`).filter((_, i) => r.acciones[i].t.trim()).join('')}</div>
  <div class="rit-p rit-logro"><h3>🏆 Logro de hoy</h3><p class="muted small">A la tarde o a la noche: algo que salió bien, aunque sea chico. Queda en tu registro.</p>
    <textarea class="rit-auto" id="rit-logro" rows="1" placeholder="Hoy logré…">${esc(r.logro || '')}</textarea><span class="muted small" id="rit-est"></span></div>
  <details class="rit-foco"><summary class="btn ghost sm">🧭 Me fui de foco: leer mi ritual</summary>
    <p class="rit-yo">${esc(r.identidad)}</p>
    ${r.quien ? `<p class="small"><b>Quién quiero ser hoy:</b> ${esc(r.quien)}</p>` : ''}
    ${r.vision ? `<p class="small"><b>Cómo va a ser hoy:</b> ${esc(r.vision)}</p>` : ''}
    <p class="small"><b>Agradezco:</b> ${r.gracias.map(esc).join(' · ')}</p>
    <p class="note small">¿Lo que estás haciendo está en tus 3 acciones? Si no, máximo 30 minutos y volvés.</p>
    <button type="button" class="linkbtn small" id="rit-abrir">Editar el ritual de hoy</button>
  </details>
</section>`;
    }
    return `<section class="card ritual" id="ritual">
  <div class="row between"><h2>☀️ Ritual de la mañana</h2><span class="muted small">${ritCuenta(c, true)}</span></div>${barra}
  <p class="muted small">Apenas te despertás, a tu hora, antes que nada. Es tu journaling y tus minutos de presencia: cinco pilares, menos de 30 minutos.</p>
  <div class="rit-p${ok('despierta')}" data-pil="despierta"><h3>${PILARES[0][1]}</h3><p class="muted small">${PILARES[0][2]}</p>
    <textarea class="rit-auto" id="rit-quien" rows="1" placeholder="Energía 7/10 · hoy quiero ser…">${esc(r.quien)}</textarea></div>
  <div class="rit-p${ok('gracias')}" data-pil="gracias"><h3>${PILARES[1][1]}</h3><p class="muted small">${PILARES[1][2]}</p>
    ${r.gracias.map((g, i) => `<textarea class="rit-auto" data-rg="${i}" rows="1" placeholder="Agradezco…">${esc(g)}</textarea>`).join('')}</div>
  <div class="rit-p${ok('vision')}" data-pil="vision"><h3>${PILARES[2][1]}</h3><p class="muted small">${PILARES[2][2]}</p>
    <textarea class="rit-auto" id="rit-vis" rows="3" placeholder="Hoy me siento a…, después…, y estoy de buen humor.">${esc(r.vision)}</textarea></div>
  <div class="rit-p${ok('acciones')}" data-pil="acciones"><h3>${PILARES[3][1]}</h3><p class="muted small">${PILARES[3][2]}</p>${acciones}</div>
  <div class="rit-p${ok('identidad')}" data-pil="identidad"><h3>${PILARES[4][1]}</h3><p class="muted small">${PILARES[4][2]}</p>
    <textarea class="rit-auto" id="rit-id" rows="2">${esc(r.identidad || ident)}</textarea>
    <label class="rit-chk"><input type="checkbox" id="rit-dicha"${r.dicha ? ' checked' : ''}> La dije en voz alta</label></div>
  <div class="row between rit-pie"><span class="muted small" id="rit-est"></span><button type="button" class="btn" id="rit-ok"${ritCompleto(r) ? '' : ' disabled'}>Ritual hecho ✓</button></div>
  <p class="small rit-min">Día difícil: con una gratitud, tu acción de ${dom ? 'hoy' : 'Construir'} y la frase dicha, <button type="button" class="linkbtn small" id="rit-min"${ritMinimo(r) ? '' : ' disabled'}>hice la versión mínima (cuenta igual)</button></p>
</section>`;
  }
  function montarRitual(hoyI, getR, setR, ident) {
    const box = $('#ritual'); if (!box) return;
    let t;
    const guardar = (ya) => {
      clearTimeout(t);
      const go = async () => { try { await DB.guardarRitual(hoyI, getR()); if ($('#rit-est')) $('#rit-est').textContent = 'Guardado'; } catch (e) { toast('No se guardó el ritual. Probá de nuevo.', true); } };
      if (ya) return go(); if ($('#rit-est')) $('#rit-est').textContent = 'Guardando…'; t = setTimeout(go, 700);
    };
    const repintar = () => {
      const r = getR();
      $$('.rit-p', box).forEach((p) => p.classList.toggle('on', !!ritPilar(r, p.dataset.pil)));
      if ($('#rit-ok')) $('#rit-ok').disabled = !ritCompleto(r);
      if ($('#rit-min')) $('#rit-min').disabled = !ritMinimo(r);
    };
    const cambio = (fn) => { const r = getR(); fn(r); setR(r); repintar(); guardar(); };
    const on = (sel, ev, fn) => $$(sel, box).forEach((el) => el.addEventListener(ev, () => fn(el)));
    // En el celu: cada campo crece con lo que escribís, para leerlo entero.
    const alto = (el) => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 2 + 'px'; };
    $$('.rit-auto', box).forEach((el) => { alto(el); el.addEventListener('input', () => alto(el)); });
    requestAnimationFrame(() => $$('.rit-auto', box).forEach(alto));
    on('#rit-quien', 'input', (el) => cambio((r) => { r.quien = el.value; }));
    on('[data-rg]', 'input', (el) => cambio((r) => { r.gracias[+el.dataset.rg] = el.value; }));
    on('#rit-vis', 'input', (el) => cambio((r) => { r.vision = el.value; }));
    on('[data-rat]', 'input', (el) => cambio((r) => { r.acciones[+el.dataset.rat].t = el.value; }));
    on('[data-racc]', 'change', (el) => cambio((r) => { r.acciones[+el.dataset.racc].h = el.checked; el.closest('.rit-acc').classList.toggle('on', el.checked); }));
    on('#rit-id', 'input', (el) => cambio((r) => { r.identidad = el.value; }));
    on('#rit-logro', 'input', (el) => cambio((r) => { r.logro = el.value; }));
    on('#rit-dicha', 'change', (el) => cambio((r) => { r.dicha = el.checked; if (!r.identidad.trim()) r.identidad = $('#rit-id').value || ident; }));
    if ($('#rit-ok')) $('#rit-ok').onclick = async () => { const r = getR(); if (!ritCompleto(r)) return; r.hecho = true; r.hecho_en = new Date().toISOString(); setR(r); await guardar(true); toast('Ritual hecho ✓ Un día más.'); ruta(); };
    if ($('#rit-min')) $('#rit-min').onclick = async () => { const r = getR(); if (!ritMinimo(r)) return; r.hecho = true; r.minima = true; r.hecho_en = new Date().toISOString(); setR(r); await guardar(true); toast('Versión mínima ✓ Cuenta igual. Nunca dos días seguidos sin ritual.'); ruta(); };
    if ($('#rit-abrir')) $('#rit-abrir').onclick = async () => { const r = getR(); r.hecho = false; r.minima = false; setR(r); await guardar(true); ruta(); };
    on('[data-racc2]', 'click', (el) => cambio((r) => { const a = r.acciones[+el.dataset.racc2]; a.h = !a.h; el.classList.toggle('on', a.h); el.setAttribute('aria-pressed', a.h); }));
  }
  V.inicio = {
    async html() {
      const F = Object.assign({ foco: {} }, st.programa.flor || {});
      st._flor = F;
      const hoy = new Date(), hoyI = diaISO(hoy), lun = DB.lunes();
      const desde = new Date(lun + 'T12:00:00'); desde.setDate(desde.getDate() - 56);
      const [rows, b, hd, rd] = await Promise.all([DB.habitos(diaISO(desde)).catch(() => null), cargarBandeja().catch(() => null), DB.hoyFlor ? DB.hoyFlor(hoyI).catch(() => []) : [], DB.ritualDias ? DB.ritualDias().catch(() => []) : []]);
      st._hoyD = hd || [];
      const semaf = await semaforoHTML(st._hoyD).catch(() => '');
      const H = {}; (rows || []).forEach((r) => { H[r.fecha] = r; });
      st._hab = H; st._habOk = !!rows;
      const r = H[hoyI] || { hechos: {}, minima: false }, sem = H[lun] || { hechos: {} };
      st._rit = ritNorm(r.ritual);
      const ritN = ritDia(rd, hoyI, st._rit);
      const n = HAB.dia.filter(([k]) => r.hechos[k]).length;
      const dias = [...Array(7)].map((_, i) => { const d = new Date(lun + 'T12:00:00'); d.setDate(d.getDate() + i); return d; });
      const cuenta = (iso) => { const x = H[iso]; return x ? HAB.dia.filter(([k]) => x.hechos[k]).length : 0; };
      const ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1); const ayI = diaISO(ayer);
      const yaEmpezo = Object.keys(H).some((f) => f < ayI);
      const fallóAyer = !esDomingo(hoy) && !esDomingo(ayer) && st._habOk && yaEmpezo && cuenta(ayI) === 0 && !(H[ayI] && H[ayI].minima) && n === 0 && !r.minima;
      const item = (k, l, on) => `<button type="button" class="hab${on ? ' on' : ''}" data-hab="${k}" aria-pressed="${!!on}"><span class="hab-box" aria-hidden="true">✓</span><span class="hab-t">${esc(l)}</span></button>`;
      let bloque = '';
      HAB.dia.forEach(([k, l, g], i) => { if (i === 0 || HAB.dia[i - 1][2] !== g) bloque += `<p class="hab-sec">${g}</p>`; bloque += item(k, l, r.hechos[k]); });
      const fo = F.foco || {};
      const diasFoco = fo.desde ? Math.max(0, 30 - Math.floor((Date.now() - new Date(fo.desde + 'T12:00:00')) / 864e5)) : null;
      const pendW = b ? b.sinResp.length : 0, pendT = b ? b.pend.length : 0;
      const sinW = b ? b.activas.filter((a) => !b.W.some((w) => w.semana === lun && String(w.email || '').toLowerCase() === a.email && (w.enviado_en || Object.keys(w.respuestas || {}).length))) : [];
      const esLunes = hoy.getDay() === 1;
      const G = clasesPorGrabar(b, F), g0 = G[0];
      return `<div class="head"><div><span class="eyebrow">${saludo()}, ${esc((st.perfil.nombre || 'Flor').split(' ')[0])}</span><h1>Inicio</h1></div></div>
<p class="identidad" id="ident" title="Tocá para editar">${esc(F.identidad || IDENTIDAD)}</p>
<form id="ident-f" style="display:none" class="grid" ><textarea id="ident-t" rows="2">${esc(F.identidad || IDENTIDAD)}</textarea><div class="row"><button class="btn sm" type="submit">Guardar</button><button class="linkbtn small" type="button" id="ident-x">Cancelar</button></div></form>
${ritualHTML(st._rit, ritN, F.identidad || IDENTIDAD, (F.foco || {}).texto || '')}
${registroHTML(rd, hoyI, st._rit, H)}
${semaf}
<section class="card midia">
  <div class="row between"><h2>Mi día</h2><span class="muted small" id="hab-n">${fecha(hoyI, { weekday: 'long', day: 'numeric' })} · ${esDomingo(hoy) ? 'descanso' : `${n} de ${HAB.dia.length}`}</span></div>
  ${esDomingo(hoy) ? '<p class="descanso">Hoy es domingo, tu día de descanso 🌿<br><span class="muted small">No hay hábitos para tildar ni nada que grabar. Si querés, hacé las compras y dejá lista la semana.</span></p>' : ''}
  ${fallóAyer ? '<p class="note small">Ayer no se dio, y está bien. Hoy no se falla dos veces: con la versión mínima alcanza.</p>' : ''}
  ${!st._habOk ? '<p class="note small">Todavía no se puede guardar: falta activar la tabla de hábitos.</p>' : ''}
  ${esDomingo(hoy) ? '' : `<div class="hab-list">${bloque}</div>
  <p class="hab-sec">Si se da (no cuenta para el día)</p>
  <div class="hab-list">${HAB.extra.map(([k, l]) => item(k, l, r.hechos[k])).join('')}</div>`}
  <details class="minima-d"${r.minima ? ' open' : ''}${esDomingo(hoy) ? ' hidden' : ''}><summary class="small">Día difícil · ver la versión mínima</summary>
    <ul class="small">${HAB.minima.map(([h, m]) => `<li><b>${esc(h)}:</b> ${esc(m)}</li>`).join('')}</ul>
    <button type="button" class="linkbtn small minima${r.minima ? ' on' : ''}" id="minima" aria-pressed="${!!r.minima}">${r.minima ? '✓ Hice la versión mínima (cuenta igual)' : 'Hice la versión mínima'}</button>
  </details>
  <p class="hab-sec">Esta semana</p>
  <div class="hab-list">${HAB.semana.map(([k, l]) => item(k, l, sem.hechos[k])).join('')}</div>
  <div class="hab-sem" id="hab-sem">${dias.map((d) => { const iso = diaISO(d), c = cuenta(iso), m = H[iso] && H[iso].minima; if (esDomingo(d) && !c) return `<div><span>${d.toLocaleDateString('es', { weekday: 'narrow' })}</span><b class="desc${iso === hoyI ? ' hoy' : ''}" data-dsem="${iso}" title="Descanso">🌿</b></div>`; return `<div><span>${d.toLocaleDateString('es', { weekday: 'narrow' })}</span><b class="${c === HAB.dia.length || m ? 'full' : c ? 'part' : ''}${iso === hoyI ? ' hoy' : ''}" data-dsem="${iso}">${m && c < HAB.dia.length ? '½' : c || ''}</b></div>`; }).join('')}</div>
  <p class="muted small hab-pie">Cada tilde es un voto por quien querés ser. Se guarda en tu Notion (“Mis hábitos”).</p>
</section>
<section class="card${esDomingo(hoy) ? '' : ' feature'} unica">
  ${esDomingo(hoy) ? '<span class="eyebrow">Domingo · descanso</span><p class="small muted">Hoy no hay nada para grabar. Si te sirve, mirá tu foco para arrancar el lunes.</p>' : `<span class="eyebrow">Hoy, una sola cosa · grabar</span>
  ${g0 ? `<h2>${esc(g0.t.texto)}</h2>
  <p class="small">${g0.ya ? `${g0.quienes.filter((x) => x.n >= g0.desde).length} ${g0.quienes.filter((x) => x.n >= g0.desde).length === 1 ? 'alumna ya llegó' : 'alumnas ya llegaron'} a esta clase (va en la semana ${g0.desde}).` : `La necesitan la semana que viene (semana ${g0.desde}).`}</p>
  <div class="row" style="gap:8px;flex-wrap:wrap">${linkGrabar(F, g0.t.id) ? `<a class="btn" href="${esc(linkGrabar(F, g0.t.id))}" target="_blank" rel="noopener">🎬 Abrir todo para grabar</a>` : `<button type="button" class="btn" data-glink="${esc(g0.t.id)}">+ Pegar el link del material</button>`}<button type="button" class="btn ghost sm" data-grab="${esc(g0.t.id)}">Ya la grabé</button></div>
  ${G.length > 1 ? `<p class="muted small" style="margin-top:10px">Después: ${esc(G[1].t.texto)} · <a href="#progreso">quedan ${G.length - 1} más</a>. No las mires hoy: de a una.</p>` : ''}`
  : '<h2>No hay clases urgentes para grabar 🎉</h2><p class="muted small">Ninguna alumna llegó a una clase en grabación. Hoy grabá contenido.</p>'}
  <p class="small" style="margin-top:10px"><a href="#contenido">📲 Contenido de hoy →</a> · <a href="#atwork">🎬 Todo el programa →</a></p>`}
  <details class="foco"><summary class="small">${fo.texto ? `Tu foco de 30 días: <b>${esc(fo.texto)}</b>${diasFoco != null ? ` · ${diasFoco ? 'quedan ' + diasFoco + ' días' : 'revisalo el lunes'}` : ''}` : 'Definí tu foco de 30 días'}</summary>
    ${fo.resuelto ? `<p class="small"><b>Resuelto cuando:</b> ${esc(fo.resuelto)}</p>` : ''}${fo.paso ? `<p class="small"><b>Smart Scale:</b> ${esc(fo.paso)}</p>` : ''}
    <form class="grid" id="foco-f">
      <div class="field"><label>Mi única cosa (30 días)</label><input type="text" id="fo-t" value="${esc(fo.texto || '')}" placeholder="Terminar de grabar el programa"></div>
      <div class="field"><label>Resuelto cuando (un número)</label><input type="text" id="fo-r" value="${esc(fo.resuelto || '')}" placeholder="Las ${G.length || 'X'} clases en grabación, grabadas y subidas"></div>
      <div class="field"><label>Dónde estoy en Smart Scale</label><input type="text" id="fo-p" value="${esc(fo.paso || '')}" placeholder="Implementación · paso 3"></div>
      <div class="row"><button class="btn sm" type="submit">Guardar</button></div>
    </form></details>
</section>
${pruebaHTML()}
<section class="card"><div class="row between"><h3>${esDomingo(hoy) ? 'El lunes te esperan' : 'Hoy te necesitan'}</h3><a class="small" href="#alumnas">Alumnas</a></div>
  ${esDomingo(hoy) ? '<p class="muted small">Hoy no se trabaja: esto queda para el lunes.</p>' : tuDia(st._hoyD, hoyI, 'clases') || '<p class="muted small">Hoy no tenés clases cargadas.</p>'}
  <ul class="neg">
    ${pendW ? `<li><a href="#bandeja/weeklies"><b>${pendW}</b> ${pendW === 1 ? 'weekly espera' : 'weeklies esperan'} tu respuesta</a></li>` : ''}
    ${pendT ? `<li><a href="#bandeja/pedidos"><b>${pendT}</b> ${pendT === 1 ? 'tarea espera' : 'tareas esperan'} tu feedback</a></li>` : ''}
    ${!pendW && !pendT ? '<li>La bandeja está al día ✓</li>' : ''}
    ${esLunes && sinW.length ? `<li><b>${sinW.length}</b> sin weekly: ${sinW.map((a) => esc(String(a.nombre).split(' ')[0])).join(', ')}</li>` : ''}
  </ul>
  ${esLunes ? '<p class="note small"><b>Hoy 15:30, Lunes CEO:</b> mirá <a href="#progreso">Mis números</a>, tus hábitos de la semana pasada y tu foco. Ajustá una sola cosa.</p>' : ''}
</section>
<p class="muted small" style="text-align:center;margin-top:18px"><a href="?demo#semana" target="_blank" rel="noopener">Ver la app como alumna</a> · con datos de ejemplo</p>`;
    },
    async mount() {
      const hoyI = diaISO(new Date()), lun = DB.lunes();
      const fila = (f) => (st._hab[f] = st._hab[f] || { fecha: f, hechos: {}, minima: false });
      const guardar = async (f) => { const x = fila(f); try { await DB.marcarHabito(f, x.hechos, x.minima); } catch (e) { toast('No se guardó. Probá de nuevo.', true); } };
      const pintarHoy = () => {
        const x = fila(hoyI), n = HAB.dia.filter(([k]) => x.hechos[k]).length;
        if (!esDomingo()) $('#hab-n').textContent = fecha(hoyI, { weekday: 'long', day: 'numeric' }) + ' · ' + n + ' de ' + HAB.dia.length;
        const dot = $(`[data-dsem="${hoyI}"]`);
        if (dot && !esDomingo()) { dot.className = (n === HAB.dia.length || x.minima ? 'full' : n ? 'part' : '') + ' hoy'; dot.textContent = x.minima && n < HAB.dia.length ? '½' : n || ''; }
      };
      $$('[data-hab]').forEach((bt) => (bt.onclick = () => {
        const k = bt.dataset.hab, f = k.startsWith('w:') ? lun : hoyI, x = fila(f);
        x.hechos = { ...x.hechos, [k]: !x.hechos[k] };
        bt.classList.toggle('on', !!x.hechos[k]); bt.setAttribute('aria-pressed', !!x.hechos[k]);
        pintarHoy(); guardar(f);
      }));
      $('#minima').onclick = () => {
        const x = fila(hoyI); x.minima = !x.minima;
        const bt = $('#minima'); bt.classList.toggle('on', x.minima); bt.setAttribute('aria-pressed', x.minima);
        bt.textContent = x.minima ? '✓ Hice la versión mínima (cuenta igual)' : 'Hice la versión mínima';
        pintarHoy(); guardar(hoyI);
      };
      $$('[data-copiar]').forEach((bt) => (bt.onclick = async () => { const t = bt.parentElement.querySelector('pre').textContent; try { await navigator.clipboard.writeText(t); toast('Copiado'); } catch (e) { toast('No se pudo copiar', true); } }));
      $$('[data-tdok]').forEach((bt) => (bt.onclick = async () => {
        const x = (st._hoyD || []).find((y) => y.clave === bt.dataset.tdok); if (!x) return;
        x.hecho = !x.hecho; bt.classList.toggle('on', x.hecho); bt.setAttribute('aria-pressed', x.hecho); bt.textContent = x.hecho ? '✓ Hecho' : 'Marcar hecho';
        bt.closest('.td-i').classList.toggle('hecho', x.hecho);
        try { await DB.hoyHecho(x.fecha || hoyI, x.clave, x.hecho); } catch (e) { toast('No se guardó. Probá de nuevo.', true); }
      }));
      montarOk(() => st._hoyD);
      montarPrueba();
      montarRitual(hoyI, () => st._rit, (x) => { st._rit = x; }, st._flor.identidad || IDENTIDAD);
      const abrirId = (si) => { $('#ident-f').style.display = si ? '' : 'none'; $('#ident').style.display = si ? 'none' : ''; if (si) $('#ident-t').focus(); };
      $('#ident').onclick = () => abrirId(true);
      $('#ident-x').onclick = () => abrirId(false);
      $('#ident-f').onsubmit = async (e) => { e.preventDefault(); const t = $('#ident-t').value.trim(); if (!t) return; await guardarF({ identidad: t }, 'Guardado'); $('#ident').textContent = t; abrirId(false); };
      $$('[data-glink]').forEach((bt) => (bt.onclick = async () => { if (await pegarLinkGrabar(bt.dataset.glink)) ruta(); }));
      $$('[data-grab]').forEach((bt) => (bt.onclick = async () => { await guardarF({ grabadas: [...(st._flor.grabadas || []), bt.dataset.grab] }, '✓ Grabada: ' + ((P.camino.flatMap((m) => m.semanas.flatMap((x) => x.tareas)).find((t) => t.id === bt.dataset.grab) || {}).texto || '') + '. Si fue sin querer, la desmarcás en Mis números.'); ruta(); }));
      $('#foco-f').onsubmit = async (e) => {
        e.preventDefault();
        const prev = st._flor.foco || {}, texto = $('#fo-t').value.trim();
        await guardarF({ foco: { texto, resuelto: $('#fo-r').value.trim(), paso: $('#fo-p').value.trim(), desde: texto !== prev.texto ? hoyI : prev.desde || hoyI } }, 'Guardado');
        ruta();
      };
    }
  };

  // ---------- Bandeja ----------
  V.bandeja = {
    async html(tab = 'pedidos') {
      const b = await cargarBandeja();
      st._bandeja = b;
      const T = [['pedidos', 'Pedidos de feedback', feedbacksPend(b.pend)], ['weeklies', 'Weeklies sin responder', b.sinResp.length], ['respondidos', 'Weeklies respondidos', b.resp.length], ['tareas', 'Tareas con feedback', b.tResp.length]];
      const resps = (x) => wq(x.perfil).map(([id, l]) => (x.respuestas[id] ? `<p class="small"><b>${l}</b><br>${esc(x.respuestas[id])}</p>` : '')).join('') +
        Object.keys(x.respuestas || {}).filter((k) => !wq(x.perfil).some(([id]) => id === k) && String(x.respuestas[k] || '').trim()).map((k) => `<p class="small"><b>${esc(k)}</b><br>${esc(x.respuestas[k])}</p>`).join('');
      const porMail = (t) => /^flor te respondi[oó] por mail\.?$/i.test(String(t || '').trim());
      const grupo = (titulo, extra, html) => `<section class="card sem-grupo"><div class="row between"><h3>${esc(titulo)}</h3>${extra || ''}</div>${html}</section>`;
      let cuerpo = '';
      // Si la alumna lo subió el día de su clase, antes de la clase: se trabaja EN la clase y el feedback va después (Flor, 13/11).
      const ch = tab === 'pedidos' && esFlor() ? await clasesHoy().catch(() => null) : null;
      const normN = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const claseHoyDe = (x) => {
        if (!ch || !ch.length || diaISO(new Date(x.creado)) !== diaISO(new Date())) return null;
        const m = String((x.perfil || {}).email || x.email || '').toLowerCase(), n = normN(apodoDe(x.perfil || { nombre: x.nombre }));
        const c = ch.find((y) => (y.invitadas || []).includes(m)) || (n.length >= 3 ? ch.find((y) => normN(y.titulo).split(/[^a-zñ]+/).includes(n)) : null);
        if (!c || !c.inicio) return null;
        const ini = new Date(c.inicio), fin = new Date(ini.getTime() + 60 * 60000);
        return new Date(x.creado) < ini && Date.now() < fin ? { c, hora: hora(c.inicio), link: hojaDe(c) || c.descripcion || '', meet: c.meet } : null;
      };
      // Nota de contexto para Flor (13/11): qué es, cuándo lo subió, antes o después de su clase, si era una tarea suya
      // y si después ya le respondió otra cosa. Solo la ve Flor.
      const RES = tab === 'pedidos' && (esFlor() || DB.demo) && DB.todosResumenes ? await DB.todosResumenes().catch(() => []) : [];
      const fCorta = (d) => fecha(d, { weekday: 'short', day: 'numeric', month: 'short' });
      const contexto = (x) => {
        const aid = x.alumna_id || (x.perfil || {}).id, mail = String((x.perfil || {}).email || x.email || '').toLowerCase();
        const dia = diaISO(new Date(x.creado)), dias = Math.floor((Date.now() - new Date(x.creado)) / 864e5);
        const cl = RES.filter((r) => r.alumna_id === aid).map((r) => r.fecha).sort();
        const antes = cl.filter((f) => f < dia).pop(), mismo = cl.includes(dia), despues = cl.filter((f) => f > dia);
        const rAntes = RES.find((r) => r.alumna_id === aid && r.fecha === antes);
        const tarea = rAntes ? (() => { const m = /(?:TU TAREA|Tu tarea|TAREA)[^\n]*\n([\s\S]*?)(?:\n\s*\n[A-ZÁÉÍÓÚ]{3}|$)/.exec(rAntes.texto || ''); return m ? m[1].replace(/\s+/g, ' ').trim().slice(0, 220) : ''; })() : '';
        const resp = b.tResp.filter((y) => String((y.perfil || {}).email || y.email || '').toLowerCase() === mail && (y.respondido_en || '') > x.creado).length
          + b.W.filter((w) => String(w.email || '').toLowerCase() === mail && w.respuesta_flor && (w.respondido_en || '') > x.creado).length;
        const via = /^mail:/.test(x.origen || '') ? 'por mail' : /^drive:/.test(x.origen || '') ? 'a su carpeta de Drive' : /^camino:/.test(x.origen || '') ? 'desde Mi camino, al lado de una clase' : 'desde la app';
        const hoyK = claseHoyDe(x);
        const cuando = hoyK ? `<b>antes de su clase de hoy (${esc(hoyK.hora)})</b>` : mismo ? 'el mismo día de una clase' : antes ? `después de su clase del ${fCorta(antes)}` : 'antes de su primera clase registrada';
        const viejo = dias > 21 || despues.length >= 2 || resp > 0;
        return `<div class="note small ctx"><b>Para vos · qué es:</b> ${esc(tipoNombre(x.tipo))}${x.titulo ? ' · «' + esc(x.titulo) + '»' : ''}. Lo mandó ${via} el <b>${fCorta(dia)}</b> (${dias === 0 ? 'hoy' : dias === 1 ? 'ayer' : 'hace ' + dias + ' días'}), ${cuando}.
          ${tarea ? `<br><b>En esa clase le habías dejado:</b> ${esc(tarea)}` : antes ? '<br>En el resumen de su clase anterior no figura una tarea: puede ser algo que mandó por su cuenta.' : ''}
          ${despues.length ? `<br><b>Después:</b> tuvieron ${despues.length === 1 ? 'una clase' : despues.length + ' clases'} (la última, ${fCorta(despues[despues.length - 1])})${resp ? ` y ya le respondiste ${resp} ${resp === 1 ? 'cosa' : 'cosas'}` : ''}.` : resp ? `<br><b>Después</b> ya le respondiste ${resp} ${resp === 1 ? 'cosa' : 'cosas'}.` : ''}
          ${viejo && !hoyK ? '<br><b>⚠️ Es viejo:</b> probablemente ya lo trabajaron. Si es así, borralo sin mandar nada (abajo, «Borrar pedido»).' : ''}</div>`;
      };
      if (tab === 'pedidos') {
        // Varias cosas de la misma alumna en los mismos días = UNA tarjeta y UN solo feedback (Flor, 21/11).
        const pendG = [];
        [...b.pend].sort((p1, p2) => String(p1.creado).localeCompare(String(p2.creado))).forEach((x) => {
          if (x.src !== 'app') return pendG.push(x);
          const g = pendG.find((y) => y.src === 'app' && y.alumna_id === x.alumna_id && Math.abs(new Date(x.creado) - new Date(y._grupo[y._grupo.length - 1].creado)) <= 3 * 864e5);
          if (g) g._grupo.push(x); else pendG.push({ ...x, _grupo: [x] });
        });
        const entregas = (x) => x._grupo && x._grupo.length > 1 ? `<div class="note small entregas"><b>Mandó ${x._grupo.length} cosas: va UN solo feedback de todo.</b> Cuando lo mandes, se cierran todas.
          <ul class="tasks" style="margin-top:6px">${x._grupo.map((y) => `<li data-gid="${y.id}"><div class="fbitem" style="gap:2px"><span><b>${esc(y.titulo || tipoNombre(y.tipo))}</b> <span class="muted small">· ${tipoNombre(y.tipo)} · ${fecha(y.creado, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span> <button type="button" class="linkbtn small quitar1" data-qid="${y.id}">Quitar</button></span>
          ${y.texto ? `<span class="small muted">${esc(String(y.texto).slice(0, 220))}</span>` : ''}${adjunto(y)}${url(y.link) ? ` <a class="small" href="${esc(y.link)}" target="_blank" rel="noopener">Abrir</a>` : ''}</div></li>`).join('')}</ul></div>` : '';
        cuerpo = pendG.length ? porSemana(pendG, (x) => lunesDe(x.creado)).map((g) => grupo(nombreSemana(g.s), `<span class="pill warn">${g.items.length}</span>`, g.items.map((x) => x.src === 'app' ? `<div class="fbitem" data-pid="${x.id}" data-grupo="${(x._grupo || [x]).map((y) => y.id).join(',')}" data-aid="${x.alumna_id}" data-tit="${esc(x.titulo || '')}" data-mail="${esc(String((x.perfil || {}).email || '').toLowerCase())}" data-or="${esc(x.origen || '')}" data-mas="${esc(((x._grupo || [x]).find((y) => y.mail_asunto) || {}).mail_asunto || '')}">
        ${x._grupo && x._grupo.length > 1 ? `<div class="row between"><b>${esc(x.nombre)} · ${x._grupo.length} cosas para un solo feedback</b><span class="muted small">${fecha(x._grupo[0].creado, { day: 'numeric', month: 'short' })}${diaISO(new Date(x._grupo[0].creado)) !== diaISO(new Date(x._grupo[x._grupo.length - 1].creado)) ? ' al ' + fecha(x._grupo[x._grupo.length - 1].creado, { day: 'numeric', month: 'short' }) : ''}</span></div>` : `<div class="row between"><b>${esc(x.nombre)} · ${esc(x.titulo || tipoNombre(x.tipo))}</b><span class="muted small">${tipoNombre(x.tipo)} · ${fecha(x.creado, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>`}
        ${(() => { const mb = (x._grupo || [x]).map((y) => y.mail_borrador).filter(Boolean).sort().pop(); return mb ? `<p class="note small gm">Ya armaste el borrador en tu Gmail (${fecha(mb, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}). Cuando lo mandes, esto se marca respondido solo.</p>` : ''; })()}
        ${x._grupo && x._grupo.length > 1 ? entregas(x) : `${x.texto ? `<pre>${esc(x.texto)}</pre>` : ''}${adjunto(x)}${url(x.link) ? ` <a class="small" href="${esc(x.link)}" target="_blank" rel="noopener">Abrir el link que mandó</a>` : ''}`}
        ${esFlor() || DB.demo ? contexto(x) : ''}
        ${(() => { const k = claseHoyDe(x); return k ? `<div class="note enclase"><b>Tiene clase hoy a las ${esc(k.hora)}: trabajalo en clase con ella.</b><br><span class="small">El material ya queda en su clase lista. Después de la clase le mandás el feedback de esto, relacionado con lo que vieron.</span><div class="row" style="gap:8px;margin-top:8px">${url(k.link) ? `<a class="btn sm" href="${esc(k.link)}" target="_blank" rel="noopener">Abrir su clase lista</a>` : ''}${url(k.meet) ? `<a class="btn ghost sm" href="${esc(k.meet)}" target="_blank" rel="noopener">Entrar a la clase</a>` : ''}</div></div><details class="despues"><summary class="small">Armar el feedback igual (mejor después de la clase)</summary>` : ''; })()}
        <p class="aviso-audio note small" hidden></p>
        ${(x._grupo || [x]).some((y) => ['audio', 'reunion'].includes(y.tipo) || y.archivo || /drive\.google/.test(y.link || '')) ? `<div class="field"><label>¿Quién es ella en la grabación?</label><small>Si en la reunión hablan varias personas, escribe su nombre (o "la que presenta el reporte") y toca «Armar de nuevo con IA». Si lo dejas vacío, la IA la busca sola.</small><input type="text" class="quien" placeholder="${esc(String(x.nombre || '').split(' ')[0])}"></div>` : ''}
        <div class="field"><label>Tu respuesta</label><small>Lo que funcionó, tu foco para ella y qué clase ver. Las correcciones van abajo: ella las ve como ejercicio (primero las encuentra, después ve tus respuestas).</small><textarea class="r" rows="6"></textarea></div>
        <div class="field"><label>Correcciones · solo las ves tú así</label><small>Ella primero ve solo su frase, la corrige y dice por qué; recién después ve tu corrección y tu por qué. Toca «Ver cómo lo ve ella».</small><div class="corrs"></div><button type="button" class="linkbtn small addc">+ Agregar corrección</button></div>
        <p class="notas small muted" hidden></p>
        <div class="row"><button class="btn send" type="button">Armar borrador en Gmail</button><button class="btn ghost ia" type="button">Borrador con IA</button><button class="btn ghost ver" type="button">Ver cómo lo ve ella</button><button class="linkbtn small borrarp" type="button">${x._grupo && x._grupo.length > 1 ? `Borrar los ${x._grupo.length}` : 'Borrar pedido'}</button></div>
        <div class="vista" hidden><span class="eyebrow">Así lo ve ella en su app</span><div class="reply"></div></div>
        ${claseHoyDe(x) ? '</details>' : ''}
      </div>` : `<div class="fbitem" data-pimp="${esc(x.email)}" data-origen="${esc(x.origen || '')}" data-mail="${esc(String(x.email || '').toLowerCase())}" data-or="${esc(x.origen || '')}">
        <div class="row between"><b>${esc(x.nombre)} · ${esc(x.titulo || tipoNombre(x.tipo))}</b><span class="muted small">${tipoNombre(x.tipo)} · ${fecha(x.creado)} · todavía sin cuenta</span></div>
        ${x.texto ? `<pre>${esc(x.texto)}</pre>` : ''}${url(x.link) ? ` <a class="small" href="${esc(x.link)}" target="_blank" rel="noopener">Abrir el link</a>` : ''}
        <div class="field"><label>Tu respuesta</label><textarea class="r" rows="5"></textarea></div>
        <div class="field"><label>Correcciones</label><div class="corrs"></div><button type="button" class="linkbtn small addc">+ Agregar corrección</button></div>
        <div class="row"><button class="btn sendi" type="button">Armar borrador en Gmail</button></div>
      </div>`).join(''))).join('') : '<section class="card"><p class="muted">No hay pedidos pendientes. 🎉</p></section>';
      }
      const filaBorrar = (x, linea) => `<div class="editrow" data-vid="${x.src === 'app' ? x.id : ''}"><span>${esc(x.nombre)} · ${esc(x.titulo || tipoNombre(x.tipo))}<br><span class="muted small">${linea}</span></span>${x.src === 'app' ? '<button type="button" class="btn ghost sm viejo-borrar">Borrar sin mandar nada</button>' : ''}</div>`;
      if (tab === 'pedidos' && b.enClase && b.enClase.length) cuerpo += `<details class="card viejos" open><summary><b>${b.enClase.length === 1 ? '1 ya lo vieron en clase' : b.enClase.length + ' ya los vieron en clase'}</b> <span class="muted small">· después de que lo subió tuvo clase y ya le mandaste el resumen: no va otro feedback. Borralo.</span></summary>
          ${b.enClase.map((x) => filaBorrar(x, `Lo mandó el ${fecha(x.creado, { day: 'numeric', month: 'long' })} · clase y resumen del ${fecha(x.clase, { day: 'numeric', month: 'long' })}`)).join('')}</details>`;
      if (tab === 'pedidos' && b.viejos && b.viejos.length) cuerpo += `<details class="card viejos"><summary><b>${b.viejos.length} ${b.viejos.length === 1 ? 'pedido viejo' : 'pedidos viejos'}</b> <span class="muted small">· de antes de la semana pasada: no se les manda feedback. Borralos.</span></summary>
          ${b.viejos.map((x) => filaBorrar(x, `Lo mandó el ${fecha(x.creado, { day: 'numeric', month: 'long' })}`)).join('')}</details>`;
      if (tab === 'weeklies') {
        cuerpo = b.sinResp.length ? porSemana(b.sinResp, (x) => x.semana).map((g) => grupo(nombreSemana(g.s), `<span class="pill warn">${g.items.length} sin responder</span>`, g.items.map((x) => `<div class="fbitem" ${x.src === 'app' ? `data-wid="${x.id}" data-aid="${x.aid}"` : `data-wimp="${esc(x.email)}"`} data-sem="${esc(x.semana)}" data-mail="${esc(String(x.email || '').toLowerCase())}">
        <div class="row between"><b>${esc(x.nombre)}</b><span class="muted small">${x.enviado_en ? 'Enviado ' + fecha(x.enviado_en, { weekday: 'short', day: 'numeric', month: 'short' }) : 'En su Google Doc'}${x.src === 'imp' ? ' · todavía sin cuenta' : ''}</span></div>
        ${x.pasada ? `<div class="note small ctx"><b>⚠️ Es de la semana pasada</b> (lo mandó el ${fecha(x.enviado_en || x.semana, { weekday: 'short', day: 'numeric', month: 'short' })}). ${x.pasada.clase ? `Después ya tuvieron clase (${fecha(x.pasada.clase, { weekday: 'short', day: 'numeric', month: 'short' })}) y le mandaste el resumen.` : 'Después no tuvieron clase con resumen.'} ${x.pasada.resp ? 'Y después ya le respondiste otra cosa.' : 'Después no le respondiste nada.'}${x.pasada.clase || x.pasada.resp ? ' Si ya está cubierto, no hace falta responderlo.' : ''}</div>` : ''}
        ${x.mail_borrador ? `<p class="note small gm">Ya armaste el borrador en tu Gmail (${fecha(x.mail_borrador, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}). Cuando lo mandes, esto se marca respondido solo.</p>` : ''}
        ${resps(x) || '<p class="muted small">(Lo escribió en su doc y todavía no se copió.)</p>'}
        <div class="field"><label>Tu respuesta</label><textarea class="r" rows="6" placeholder="Su próximo paso para esta semana. Si le corriges frases, escríbelas así: frase de ella → frase corregida. Por qué. Ella las ve como ejercicio."></textarea></div>
        ${x.src === 'app' ? `<div class="plan" hidden><span class="eyebrow">Para su “Mi semana”</span>
          <div class="field"><label>Foco de la semana</label><input type="text" class="pf"></div>
          <div class="field"><label>Por qué</label><input type="text" class="pft"></div>
          <div class="field"><label>Tareas (una por línea: tarea | dónde)</label><textarea class="pt" rows="3"></textarea></div>
          <label class="row small"><input type="checkbox" class="aplicar" checked> Cargarle este foco y estas tareas al enviar</label></div>` : ''}
        <p class="notas small muted" hidden></p>
        <div class="row"><button class="btn sendw" type="button">Armar borrador en Gmail</button><button class="btn ghost iaw" type="button">Borrador con IA</button></div>
      </div>`).join(''))).join('') : '<section class="card"><p class="muted">No hay weeklies sin responder. 🎉</p></section>';
        if (b.wViejos && b.wViejos.length) cuerpo += `<details class="card viejos"><summary><b>${b.wViejos.length} ${b.wViejos.length === 1 ? 'weekly viejo' : 'weeklies viejos'} sin responder</b> <span class="muted small">· de antes de la semana pasada o con uno más nuevo de ella: no se responden y no cuentan como pendientes.</span></summary><p class="small muted">${b.wViejos.map((x) => esc(String(x.nombre).split(' ')[0]) + ' (' + fecha(x.semana, { day: 'numeric', month: 'short' }) + ')').join(', ')}</p></details>`;
      }
      if (tab === 'respondidos') {
        const gs = porSemana(b.resp, (x) => x.semana);
        if (!gs.some((g) => g.s === DB.lunes())) gs.unshift({ s: DB.lunes(), items: [] });
        cuerpo = gs.map((g) => {
          const conW = new Set(b.W.filter((w) => w.semana === g.s).map((w) => String(w.email || '').toLowerCase()));
          const faltan = g.s >= lunesDe(Date.now() - 14 * 864e5) ? b.activas.filter((a) => !conW.has(a.email)) : [];
          return grupo(nombreSemana(g.s), `<span class="pill ok">${g.items.length} respondido${g.items.length === 1 ? '' : 's'}</span>`,
            (faltan.length ? `<p class="small muted">Todavía no mandaron su weekly: ${faltan.map((a) => esc(String(a.nombre).split(' ')[0])).join(', ')}.</p>` : '') +
            (g.items.length ? g.items.map((x) => `<details class="fbitem"><summary><b>${esc(x.nombre)}</b> <span class="muted small">${porMail(x.respuesta_flor) ? 'respondido por mail (el texto no se copió)' : 'respondido ' + fecha(x.respondido_en || x.enviado_en)}</span></summary>
            <span class="eyebrow">Lo que escribió</span>${resps(x) || '<p class="muted small">(No se copió lo que escribió.)</p>'}
            ${porMail(x.respuesta_flor) ? '' : `<div class="reply"><span class="eyebrow">Tu respuesta</span>${parrafos(x.respuesta_flor)}</div>`}</details>`).join('') : '<p class="muted small">Todavía no respondiste ningún weekly de esta semana.</p>'));
        }).join('');
      }
      if (tab === 'tareas') {
        cuerpo = b.tResp.length ? porSemana(b.tResp, (x) => lunesDe(x.respondido_en || x.creado)).map((g) => grupo(nombreSemana(g.s), `<span class="pill ok">${g.items.length}</span>`, g.items.map((x) => `<details class="fbitem"><summary><b>${esc(x.nombre)} · ${esc(x.titulo || tipoNombre(x.tipo))}</b> <span class="muted small">${tipoNombre(x.tipo)} · ${fecha(x.respondido_en || x.creado)}</span></summary>
          <span class="eyebrow">Lo que mandó</span>${x.texto ? `<pre>${esc(x.texto)}</pre>` : ''}${x.src === 'app' ? adjunto(x) : ''}${url(x.link) ? ` <a class="small" href="${esc(x.link)}" target="_blank" rel="noopener">Abrir el link</a>` : ''}
          <div class="reply"><span class="eyebrow">Tu respuesta</span>${parrafos(x.respuesta)}${fixes(x.correcciones)}</div>
          ${x.src === 'app' ? `<div class="row"><button type="button" class="linkbtn small" data-resp-edit="${x.id}">Editar mi respuesta</button><button type="button" class="linkbtn small" data-resp-del="${x.id}">Borrar</button></div>
          <form class="grid" data-resp-form="${x.id}" hidden><textarea class="re-txt" rows="8">${esc(x.respuesta || '')}</textarea><p class="muted small">Las correcciones quedan como están.</p><div class="row"><button class="btn sm" type="submit">Guardar</button></div></form>` : ''}</details>`).join(''))).join('') : '<section class="card"><p class="muted">Todavía no hay tareas con feedback.</p></section>';
      }
      return `<div class="head"><div><span class="eyebrow">Panel de Flor</span><h1>Bandeja</h1></div></div>
<div class="tabs">${T.map(([id, l, n]) => `<button type="button" data-tab="${id}" aria-pressed="${tab === id}">${l}${n !== '' ? ' (' + n + ')' : ''}</button>`).join('')}</div>
${cuerpo}`;
    },
    async mount() {
      $$('.viejo-borrar').forEach((bt) => (bt.onclick = async () => { const row = bt.closest('[data-vid]'); await intentar(() => DB.borrarPedido(+row.dataset.vid), 'Borrado'); row.remove(); }));
      $$('[data-tab]').forEach((b) => (b.onclick = () => (location.hash = 'bandeja/' + b.dataset.tab)));
      const filaCorr = (box, mal = '', bien = '', pq = '') => {
        box.insertAdjacentHTML('beforeend', `<div class="corr"><input type="text" class="mal" placeholder="Lo que dijo" value="${esc(mal)}"><input type="text" class="bien" placeholder="Cómo se dice" value="${esc(bien)}"><input type="text" class="pq" placeholder="Por qué (corto)" value="${esc(pq)}"><button type="button" class="linkbtn small quitar">Quitar</button></div>`);
      };
      const leerCorr = (it) => $$('.corr', it).map((c) => ({ mal: $('.mal', c).value.trim(), bien: $('.bien', c).value.trim(), por_que: $('.pq', c).value.trim() })).filter((c) => c.mal && c.bien);
      // Responder = armar el mail completo como borrador en Gmail. No se le manda nada a la alumna:
      // Flor lo revisa y lo envía desde Gmail, y la sincronización lo marca respondido acá.
      const aGmail = async (it, q, btn) => {
        if ($('.gm', it) && !confirm('Ya hay un borrador para esto en tu Gmail. ¿Lo reemplazo con lo que escribiste acá? (Si lo editaste en Gmail, esos cambios se pierden.)')) return false;
        const t0 = btn.textContent; btn.disabled = true; btn.textContent = 'Armando el borrador…';
        try {
          const out = await DB.borradorMail(q);
          let n = $('.gm', it);
          if (!n) { $('.row.between', it).insertAdjacentHTML('afterend', '<p class="note small gm"></p>'); n = $('.gm', it); }
          n.innerHTML = `Listo: ${out.reemplazado ? 'actualicé el borrador que ya tenías' : 'el borrador está'} en tu Gmail${out.link ? ` · <a href="${esc(gmLink(out.link))}" target="_blank" rel="noopener"><b>Abrir el borrador</b></a>` : ''}. Revísalo y mándalo desde ahí: cuando lo mandes, esto se marca respondido solo.`;
          btn.textContent = 'Armar el borrador de nuevo';
          toast('Borrador listo en tu Gmail');
          return true;
        } catch (e) { toast(e.message || 'No se pudo armar el borrador.', true); btn.textContent = t0; return false; }
        finally { btn.disabled = false; }
      };
      const quitarDeLista = (it) => { const g = it.closest('.sem-grupo'); it.remove(); if (g && !$('.fbitem', g)) g.remove(); contarBandeja(); };
      $$('[data-resp-edit]').forEach((bt) => (bt.onclick = () => { const fm = $(`[data-resp-form="${bt.dataset.respEdit}"]`); fm.hidden = !fm.hidden; }));
      $$('[data-resp-form]').forEach((fm) => (fm.onsubmit = async (e) => { e.preventDefault(); await intentar(() => DB.editarPedido(+fm.dataset.respForm || fm.dataset.respForm, { respuesta: $('.re-txt', fm).value.trim() }), 'Respuesta actualizada'); ruta(); }));
      $$('[data-resp-del]').forEach((bt) => (bt.onclick = async () => { if (!confirm('¿Borrar este pedido y tu respuesta? Ella tampoco lo va a ver más.')) return; await intentar(() => DB.borrarPedido(+bt.dataset.respDel || bt.dataset.respDel), 'Borrado'); ruta(); }));
      $$('[data-pimp]').forEach((it) => {
        const box = $('.corrs', it);
        $('.addc', it).onclick = () => filaCorr(box);
        box.onclick = (e) => { if (e.target.classList.contains('quitar')) e.target.parentElement.remove(); };
        $('.sendi', it).onclick = async () => {
          const r = $('.r', it).value.trim(); if (!r) return toast('Escribe tu respuesta.', true);
          await aGmail(it, { imp_pedido: { email: it.dataset.pimp, origen: it.dataset.origen, titulo: $('b', it).textContent.split(' · ').slice(1).join(' · ') }, respuesta: r, correcciones: leerCorr(it) }, $('.sendi', it));
        };
      });
      $$('[data-pid]').forEach((it) => {
        const box = $('.corrs', it);
        const grupo = () => String(it.dataset.grupo || it.dataset.pid).split(',').filter(Boolean).map((v) => +v || v);
        $$('.quitar1', it).forEach((bq) => (bq.onclick = async () => {
          if (!confirm('¿Sacar esto del feedback? Se borra el pedido y ella tampoco lo va a ver más.')) return;
          await intentar(() => DB.borrarPedido(+bq.dataset.qid || bq.dataset.qid), 'Sacado del feedback');
          ruta();
        }));
        $('.addc', it).onclick = () => filaCorr(box);
        box.onclick = (e) => { if (e.target.classList.contains('quitar')) e.target.parentElement.remove(); };
        it._aplicar = (r) => {
          $('.r', it).value = r.respuesta || ''; box.innerHTML = ''; (r.correcciones || []).forEach((c) => filaCorr(box, c.mal, c.bien, c.por_que || ''));
          const av = $('.aviso-audio', it);
          if (av) { av.hidden = !r.sin_audio; av.textContent = r.sin_audio ? r.notas : ''; }
          if (r.notas && !r.sin_audio) { $('.notas', it).hidden = false; $('.notas', it).textContent = 'Notas para ti: ' + r.notas; }
          const vieja = $('.trans', it); if (vieja) vieja.remove();
          if (r.transcripcion) $('.notas', it).insertAdjacentHTML('afterend', `<details class="trans small"><summary>Ver la transcripción del audio</summary><pre>${esc(r.transcripcion)}</pre></details>`);
        };
        it._generar = async () => {
          const b = $('.ia', it); b.disabled = true; b.textContent = 'Armando borrador…';
          let ok = true;
          try { it._aplicar(await DB.borrador({ pedido_id: +it.dataset.pid || it.dataset.pid, grupo: grupo().length > 1 ? grupo() : undefined, quien: $('.quien', it) ? $('.quien', it).value.trim() : '' })); } catch (er) { ok = false; toast(er.message, true); }
          b.disabled = false; b.textContent = ok ? 'Armar de nuevo con IA' : 'Borrador con IA';
          return ok;
        };
        $('.ia', it).onclick = it._generar;
        $('.ver', it).onclick = () => {
          const v = $('.vista', it); v.hidden = !v.hidden; if (v.hidden) return;
          $('.reply', v).innerHTML = devolucion($('.r', it).value, leerCorr(it), '') || '<p class="muted small">Todavía no escribiste nada.</p>';
          $$('textarea', v).forEach((t) => (t.disabled = true)); $$('button', v).forEach((x) => (x.disabled = true));
        };
        $('.borrarp', it).onclick = async () => {
          const ids = grupo();
          if (!confirm(ids.length > 1 ? `¿Borrar los ${ids.length} pedidos? Ella tampoco los va a ver más.` : '¿Borrar este pedido? Ella tampoco lo va a ver más.')) return;
          await intentar(async () => { for (const id of ids) await DB.borrarPedido(id); }, ids.length > 1 ? 'Pedidos borrados' : 'Pedido borrado'); quitarDeLista(it);
        };
        $('.send', it).onclick = async () => {
          const r = $('.r', it).value.trim(); if (!r) return toast('Escribe tu respuesta.', true);
          await aGmail(it, { pedido_id: +it.dataset.pid || it.dataset.pid, grupo: grupo().length > 1 ? grupo() : undefined, respuesta: r, correcciones: leerCorr(it) }, $('.send', it));
        };
      });
      $$('[data-wid]').forEach((it) => {
        const id = +it.dataset.wid || it.dataset.wid;
        it._aplicar = (r) => {
          $('.r', it).value = r.respuesta || '';
          if (r.foco || (r.tareas || []).length) { $('.plan', it).hidden = false; $('.pf', it).value = r.foco || ''; $('.pft', it).value = r.foco_texto || ''; $('.pt', it).value = (r.tareas || []).map((t) => t.texto + (t.donde ? ' | ' + t.donde : '')).join('\n'); }
          if (r.notas) { $('.notas', it).hidden = false; $('.notas', it).textContent = 'Notas para ti: ' + r.notas; }
        };
        it._generar = async () => {
          const b = $('.iaw', it); b.disabled = true; b.textContent = 'Armando borrador…';
          let ok = true;
          try { it._aplicar(await DB.borrador({ weekly_id: id })); } catch (er) { ok = false; toast(er.message, true); }
          b.disabled = false; b.textContent = ok ? 'Armar de nuevo con IA' : 'Borrador con IA';
          return ok;
        };
        $('.iaw', it).onclick = it._generar;
        $('.sendw', it).onclick = async () => {
          const r = $('.r', it).value.trim(); if (!r) return toast('Escribe tu respuesta.', true);
          if (!(await aGmail(it, { weekly_id: id, respuesta: r }, $('.sendw', it)))) return;
          if (!$('.plan', it).hidden && $('.aplicar', it).checked && !it._planCargado) {
            it._planCargado = true;
            const aid = it.dataset.aid, foco = $('.pf', it).value.trim();
            if (foco) await intentar(() => DB.actualizarPerfil(aid, { foco_titulo: foco, foco_texto: $('.pft', it).value.trim() })).catch(() => {});
            const ts = $('.pt', it).value.split('\n').map((l) => l.split('|')).filter((p) => p[0].trim());
            for (const [t, d = ''] of ts) await DB.crearTarea(aid, t.trim(), d.trim(), Date.now() % 1e9).catch(() => {});
            if (foco || ts.length) toast('Borrador en tu Gmail y su semana actualizada');
          }
        };
      });
      $$('[data-wimp]').forEach((it) => {
        const imp = { email: it.dataset.wimp, semana: it.dataset.sem };
        it._aplicar = (r) => { $('.r', it).value = r.respuesta || ''; if (r.notas) { $('.notas', it).hidden = false; $('.notas', it).textContent = 'Notas para ti: ' + r.notas; } };
        $('.iaw', it).onclick = async (e) => {
          const b = e.target; b.disabled = true; b.textContent = 'Armando borrador…';
          try { it._aplicar(await DB.borrador({ imp })); b.textContent = 'Armar de nuevo con IA'; } catch (er) { toast(er.message, true); b.textContent = 'Borrador con IA'; }
          b.disabled = false;
        };
        $('.sendw', it).onclick = async () => {
          const r = $('.r', it).value.trim(); if (!r) return toast('Escribe tu respuesta.', true);
          await aGmail(it, { imp, respuesta: r }, $('.sendw', it));
        };
      });
      // ¿Ya hay un borrador en Gmail para esto (el de la rutina de la mañana o uno anterior)? Se marca, para no armar dos.
      (async () => {
        const gd = await DB.borradoresGmail().catch(() => []);
        if (!gd.length) return;
        const base = (a) => String(a || '').replace(/^\s*((re|rv|fwd?)\s*:\s*)+/i, '').replace(/[^\wÀ-ÿ\/·:.\- ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        const usados = new Set();
        // Abrir el borrador directo desde la app (Flor, 19/11), también en los weeklies y cuando ya lo habías armado.
        const abrir = (d) => d.link ? ` · <a class="gm-abrir" href="${esc(gmLink(d.link))}" target="_blank" rel="noopener"><b>Abrir el borrador</b></a>` : '';
        const roto = (d) => d.roto ? ' <b>⚠️ Tiene emojis rotos:</b> tocá «Armar borrador en Gmail» de nuevo y queda bien.' : '';
        const marcar = (it, d) => {
          if (!document.body.contains(it)) return;
          const ya = $('.gm', it);
          if (ya) { if (!$('.gm-abrir', ya)) ya.insertAdjacentHTML('beforeend', abrir(d) + roto(d)); return; }
          $('.row.between', it).insertAdjacentHTML('afterend', `<p class="note small gm">Ya tenés un borrador para esto en tu Gmail${abrir(d)}. Si armás el borrador desde acá, reemplaza ese.${roto(d)}</p>`);
        };
        $$('[data-mail]').forEach((it) => {
          const mail = it.dataset.mail, or = String(it.dataset.or || ''), mas = base(it.dataset.mas), sem = it.dataset.sem;
          const ddmm = sem ? `${sem.slice(8, 10)}/${sem.slice(5, 7)}` : '';
          const d = gd.find((g) => g.para === mail && (
            (or.startsWith('mail:') && (g.hilo || []).includes(or.slice(5))) ||
            (mas && base(g.asunto) === mas) ||
            (ddmm && /weekly report/i.test(g.asunto) && g.asunto.includes(ddmm))));
          if (d) { usados.add(d); marcar(it, d); }
        });
        // Borradores para una alumna que no se pudieron unir a un pedido: aviso suave en sus pendientes.
        $$('[data-mail]').forEach((it) => {
          if ($('.gm', it)) return;
          const otros = gd.filter((g) => g.para === it.dataset.mail && !usados.has(g));
          if (otros.length) $('.row.between', it).insertAdjacentHTML('afterend', `<p class="note small gm-otro">Ojo: tenés ${otros.length === 1 ? 'un borrador' : otros.length + ' borradores'} para ella en Gmail (${otros.map((g) => g.link ? `<a href="${esc(gmLink(g.link))}" target="_blank" rel="noopener">«${esc(g.asunto)}»</a>` : `«${esc(g.asunto)}»`).join(', ')}). Fijate que no sea de esto antes de armar otro.</p>`);
        });
      })();

      // Borradores: los que ya armó la IA se cargan solos; los que faltan se arman ahora, de a uno.
      const items = $$('[data-pid],[data-wid]');
      if (items.length) {
        const bs = await DB.borradores().catch(() => []);
        const m = {}; bs.forEach((b) => { m[b.tabla + ':' + b.ref] = b.datos; });
        const faltan = [];
        items.forEach((it) => {
          let k = it.dataset.pid ? 'pedidos:' + it.dataset.pid : 'weekly:' + it.dataset.wid;
          const ids = String(it.dataset.grupo || '').split(',').filter(Boolean);
          if (ids.length > 1) {
            // Sirve solo un borrador que ya cubre todo el grupo; los sueltos de cada archivo no.
            const deTodo = ids.map((id) => m['pedidos:' + id]).find((d) => d && Array.isArray(d.grupo) && ids.every((id) => d.grupo.map(String).includes(id)));
            if (deTodo) m[k] = deTodo; else delete m[k];
          }
          if (m[k]) { it._aplicar(m[k]); const b = $('.ia,.iaw', it); if (b) b.textContent = 'Armar de nuevo con IA'; }
          else faltan.push(it);
        });
        (async () => { for (const it of faltan) { if (!document.body.contains(it) || $('.r', it).value.trim()) continue; if (!(await it._generar())) break; } })();
      }
    }
  };

  // ---------- Alumnas ----------
  // ---------- Alumnas: quién tiene clase hoy y el resumen de cada una (para Flor) ----------
  async function clasesHoy() {
    if (esDomingo()) return [];
    if (st._clasesHoy && st._clasesHoy.dia === diaISO(new Date())) return st._clasesHoy.clases;
    let c = DB.clasesHoy ? await DB.clasesHoy().catch(() => null) : null;
    // Respaldo: las clases que dejó cargadas la preparación de la madrugada (tabla hoy_flor)
    if (!c || !c.length) {
      const h = DB.hoyFlor ? await DB.hoyFlor(diaISO(new Date())).catch(() => null) : null;
      const hc = (h || []).filter((x) => x.tipo === 'clase').map((x) => ({ titulo: x.titulo, inicio: x.inicio, meet: x.meet, descripcion: x.link || '', invitadas: (x.invitadas || []).map((m) => String(m).toLowerCase()) }));
      if (hc.length || !c) c = hc.length ? hc : c;
    }
    // Solo se guarda si hay clases: si el calendario falló o todavía no se cargaron, se vuelve a buscar en la próxima vista.
    if (c && c.length) st._clasesHoy = { dia: diaISO(new Date()), clases: c };
    return c;
  }
  const hora = (iso) => (iso ? new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
  const hojaDe = (c) => { const m = /(https:\/\/docs\.google\.com\/document\/d\/[\w-]+[^\s"<]*)/.exec(c.descripcion || ''); const a = (c.adjuntos || []).find((x) => !/Recording|Notes by Gemini|Notas de Gemini/i.test(x.titulo || '')); return m ? m[1] : a ? a.url : ''; };
  // La fila de hoy_flor de su clase (para el OK): por mail invitado o, si no, por la hora de la clase.
  const filaHoyDe = (mail, clase) => { const L = (st._hoyA || []).filter((x) => x.tipo === 'clase'); return L.find((x) => (x.invitadas || []).map((m) => String(m).toLowerCase()).includes(mail)) || (clase && clase.inicio ? L.find((x) => x.inicio && Math.abs(new Date(x.inicio) - new Date(clase.inicio)) < 6e4) : null); };
  async function resumenAlumna(a, b, clase) {
    const mail = String(a.email || '').toLowerCase(), lun = DB.lunes();
    const [tareas, resus, notas] = await Promise.all([a.id ? DB.tareas(a.id).catch(() => []) : [], a.id && DB.resumenes ? DB.resumenes(a.id).catch(() => []) : [], esFlor() || DB.demo ? DB.notasClase(mail).catch(() => null) : []]);
    const ws = b.W.filter((w) => String(w.email || '').toLowerCase() === mail).sort((x, y) => (x.semana < y.semana ? 1 : -1));
    const wEsta = ws.find((w) => w.semana === lun && (w.enviado_en || Object.keys(w.respuestas || {}).length));
    const ult = ws.find((w) => Object.keys(w.respuestas || {}).length);
    const pend = b.pend.filter((x) => String((x.perfil || {}).email || x.email || '').toLowerCase() === mail);
    const fbs = [...ws.filter((w) => w.respuesta_flor).map((w) => ({ f: w.respondido_en || w.semana, t: w.respuesta_flor, de: 'Weekly del ' + fecha(w.semana, { day: 'numeric', month: 'short' }) })),
      ...b.tResp.filter((x) => String((x.perfil || {}).email || x.email || '').toLowerCase() === mail).map((x) => ({ f: x.respondido_en || x.creado, t: x.respuesta || '', de: x.titulo || tipoNombre(x.tipo) }))]
      .sort((x, y) => (String(x.f) < String(y.f) ? 1 : -1));
    const fb = fbs[0], res = resus[0], n = semanaDe(a), mod = P.modulos.find((m) => m.n === +a.modulo_actual);
    const corto = (t, k = 180) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > k ? t.slice(0, k) + '…' : t; };
    const tp = tareas.filter((t) => !t.hecha);
    const hoja = clase ? hojaDe(clase) : '';
    return `<section class="card resu">
  <div class="row between"><h3>${esc(a.nombre || a.email)}</h3>${clase ? `<span class="pill">Hoy ${hora(clase.inicio)}</span>` : ''}</div>
  ${clase ? `<div class="row okc-row" style="gap:8px;flex-wrap:wrap;align-items:center">${clase.meet ? `<a class="btn sm" href="${esc(clase.meet)}" target="_blank" rel="noopener">Entrar a la clase</a>` : ''}${hoja ? `<a class="btn ghost sm" href="${esc(hoja)}" target="_blank" rel="noopener">Hoja de la clase</a>` : ''}${a.drive_url ? `<a class="btn ghost sm" href="${esc(a.drive_url)}" target="_blank" rel="noopener">Su carpeta</a>` : ''}${okClase(filaHoyDe(mail, clase))}</div>` : ''}
  <ul class="resu-l">
    <li><b>Dónde va:</b> ${n ? `semana ${n} de 20` : 'sin fecha de inicio'}${mod ? ` · M${mod.n} ${esc(mod.nombre)}` : ''}${a.foco_titulo ? `<br><span class="muted small">Foco: ${esc(a.foco_titulo)}</span>` : ''}</li>
    <li><b>Weekly de esta semana:</b> ${wEsta ? (wEsta.respuesta_flor ? '✓ mandado y respondido' : '✓ mandado · <a href="#bandeja/weeklies">te falta responderlo</a>') : '✗ todavía no lo mandó'}</li>
    ${ult ? `<li><b>Cómo está</b> <span class="muted small">(weekly del ${fecha(ult.semana, { day: 'numeric', month: 'short' })})</span>: ${esc(corto(ult.respuestas.wins || ult.respuestas.donde, 160))}${ult.respuestas.necesito ? `<br><span class="muted small">Necesita: ${esc(corto(ult.respuestas.necesito, 140))}</span>` : ''}</li>` : ''}
    <li><b>Tareas:</b> ${tp.length ? tp.map((t) => '○ ' + esc(t.texto)).join('<br>') : '✓ nada pendiente'}${pend.length ? `<br><a href="#bandeja/pedidos">${pend.length === 1 ? 'Te mandó 1 cosa' : `Te mandó ${pend.length} cosas`} que espera${pend.length === 1 ? '' : 'n'} tu feedback</a>` : ''}</li>
    ${res ? `<li><b>Última clase</b> <span class="muted small">(${fecha(res.fecha, { weekday: 'short', day: 'numeric', month: 'short' })})</span>: ${esc(corto(res.texto.replace(/^Hola[^\n]*\n/, ''), 200))}</li>` : ''}
    ${fb ? `<li><b>Tu último feedback</b> <span class="muted small">(${esc(fb.de)} · ${fecha(fb.f, { day: 'numeric', month: 'short' })})</span>: ${esc(corto(fb.t.replace(/^Hola[^\n]*\n/, ''), 200))}</li>` : ''}
  </ul>
  ${notasHTML(mail, clase, notas)}
  ${a.id ? `<div class="row"><a class="small" href="#alumnas/${a.id}">Abrir su ficha</a></div>` : ''}
</section>`;
  }
  // Asistencia y notas internas (solo Flor). Con clase hoy: se marca. Siempre: las últimas notas.
  function notasHTML(mail, clase, notas) {
    if (notas == null) return '<p class="note small">Para marcar asistencia y dejar notas falta activar la tabla (Supabase).</p>';
    const hoyI = diaISO(new Date()), r = (notas || []).find((x) => x.fecha === hoyI) || {};
    const pasadas = (notas || []).filter((x) => x.fecha !== hoyI && (x.vino != null || x.nota));
    const est = (x) => (x.vino === true ? '✓ vino' : x.vino === false ? '✗ no vino' + (x.recuperar === 'ofrecida' ? ' · le ofreciste recuperar' : x.recuperar === 'no' ? ' · no se recupera' : '') : '');
    const b = (campo, val, txt, on) => `<button type="button" class="chip${on ? ' on' : ''}" data-cn="${esc(mail)}" data-campo="${campo}" data-val="${val}" aria-pressed="${!!on}">${txt}</button>`;
    return `<div class="cnotas" data-mail="${esc(mail)}">
    ${clase ? `<p class="hab-sec">Clase de hoy · solo para vos</p>
    <div class="row" style="gap:6px;flex-wrap:wrap">${b('vino', 'true', 'Vino', r.vino === true)}${b('vino', 'false', 'No vino', r.vino === false)}
      <span class="cn-rec" ${r.vino === false ? '' : 'hidden'}>${b('recuperar', 'ofrecida', 'Le ofrecí recuperar', r.recuperar === 'ofrecida')}${b('recuperar', 'no', 'No se recupera', r.recuperar === 'no')}</span></div>
    <textarea class="cn-t" rows="2" placeholder="Nota para vos: algo para recordar de la clase…">${esc(r.nota || '')}</textarea>
    <div class="row"><button type="button" class="btn ghost sm" data-cnsave="${esc(mail)}">Guardar nota</button></div>` : ''}
    ${pasadas.length ? `<details><summary class="small">Tus notas de clases anteriores (${pasadas.length})</summary><ul class="neg">${pasadas.map((x) => `<li class="small"><b>${fecha(x.fecha, { weekday: 'short', day: 'numeric', month: 'short' })}</b> ${est(x)}${x.nota ? '<br>' + esc(x.nota) : ''}</li>`).join('')}</ul></details>` : ''}
  </div>`;
  }
  function montarNotas() {
    const hoyI = diaISO(new Date());
    const leer = (box) => ({ email: box.dataset.mail, fecha: hoyI, vino: (box.querySelector('[data-campo="vino"].on') ? box.querySelector('[data-campo="vino"].on').dataset.val === 'true' : null), recuperar: box.querySelector('[data-campo="recuperar"].on') ? box.querySelector('[data-campo="recuperar"].on').dataset.val : null, nota: (box.querySelector('.cn-t') || {}).value || '' });
    const guardar = async (box, msg) => { try { await DB.guardarNotaClase(leer(box)); if (msg) toast(msg); } catch (e) { toast('No se guardó. Probá de nuevo.', true); } };
    $$('.cnotas [data-campo]').forEach((bt) => (bt.onclick = () => {
      const box = bt.closest('.cnotas'), grupo = box.querySelectorAll(`[data-campo="${bt.dataset.campo}"]`), yaOn = bt.classList.contains('on');
      grupo.forEach((x) => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
      if (!yaOn) { bt.classList.add('on'); bt.setAttribute('aria-pressed', 'true'); }
      if (bt.dataset.campo === 'vino') { const rec = box.querySelector('.cn-rec'); if (rec) rec.hidden = !(bt.dataset.val === 'false' && !yaOn); if (rec && rec.hidden) rec.querySelectorAll('.chip').forEach((x) => x.classList.remove('on')); }
      guardar(box, 'Guardado');
    }));
    $$('[data-cnsave]').forEach((bt) => (bt.onclick = () => guardar(bt.closest('.cnotas'), 'Nota guardada')));
  }

  V.alumnas = {
    async html(sel) {
      const al = (await DB.alumnas()).filter((x) => x.rol !== 'admin' || DB.demo);
      const ya = new Set(al.map((x) => String(x.email || '').toLowerCase()));
      st._pend = DB.pendientesImportacion ? (await DB.pendientesImportacion().catch(() => [])).filter((x) => !ya.has(x.email)) : [];
      const a = al.find((x) => String(x.id) === sel);
      let det = '';
      const bh = esFlor() ? await cargarBandeja().catch(() => null) : null;
      let ch = esFlor() ? await clasesHoy() : null;
      st._hoyA = esFlor() && DB.hoyFlor ? await DB.hoyFlor(diaISO(new Date())).catch(() => []) : [];
      // Si el calendario no respondió, las clases de hoy salen de lo que cargaron las tareas automáticas (hoy_flor).
      if (esFlor() && (!ch || !ch.length)) {
        const hc = (st._hoyA || []).filter((x) => x.tipo === 'clase').map((x) => ({ titulo: x.titulo, inicio: x.inicio, meet: x.meet, descripcion: x.link || '', invitadas: (x.invitadas || []).map((m) => String(m).toLowerCase()) }));
        if (hc.length) ch = hc;
      }
      // Por mail invitado; si no está invitada (p. ej. un grupal con una sola en la invitación), por su nombre o apodo en el título o la descripción ("Lina y Cori").
      const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const pila = (x) => norm(String(x.nombre || '').split(' ')[0]);
      const activasN = al.filter((x) => x.rol !== 'admin' && x.activa !== false);
      const nombraA = (c, x) => {
        const n = pila(x); if (n.length < 3) return false;
        const pal = norm(c.titulo + ' ' + String(c.descripcion || '').split('\n').slice(0, 3).join(' ')).split(/[^a-zñ]+/).filter((w) => w.length >= 4 || w === n);
        return pal.some((w) => n.startsWith(w) && activasN.filter((y) => pila(y).startsWith(w)).length === 1);
      };
      const claseDe = (x) => (ch || []).find((c) => (c.invitadas || []).includes(String(x.email || '').toLowerCase())) || (ch || []).find((c) => nombraA(c, x));
      if (!a && esFlor()) {
        const hoyCon = al.filter((x) => x.rol !== 'admin' && claseDe(x)).sort((x, y) => (claseDe(x).inicio < claseDe(y).inicio ? -1 : 1));
        det = `<section class="card"><div class="row between"><h2>Hoy tienen clase</h2><span class="muted small">${fecha(diaISO(new Date()), { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
          ${esDomingo() ? '<p class="muted">Hoy es domingo, tu día de descanso 🌿 No hay clases.</p>' : ch == null ? `<p class="note small">Hoy no pude ver tu calendario. No es urgente: avisale a Claude y lo resolvemos.${DB.errClases ? `<br><span class="muted">Para Claude: ${esc(DB.errClases)}</span>` : ''}</p>` : hoyCon.length ? '' : '<p class="muted">Hoy no tenés clases 1:1 con alumnas.</p>'}</section>`
          + (bh ? (await Promise.all(hoyCon.map((x) => resumenAlumna(x, bh, claseDe(x))))).join('') : '');
      }
      if (!a && !esFlor()) det = '<section class="card empty-state"><h3>Elige una alumna</h3><p class="muted small">Desde acá le cargas su foco de la semana, sus tareas, las clases que tiene que ver, su progreso y sus patrones de error. Todo lo ve en su app y lo usa Flor AI.</p></section>';
      const resuSel = a && bh ? await resumenAlumna(a, bh, claseDe(a)) : '';
      if (a) {
        const [t, pat, docs, ficha] = await Promise.all([DB.tareas(a.id), DB.patrones(a.id), DB.documentos(a.id), DB.ficha(a.id)]);
        st._docs = docs;
        st._alumna = a;
        const v = (k) => esc(a[k] ?? '');
        det = resuSel + `<form class="card" id="aform" novalidate>
  <div class="row between"><h2>${esc(a.nombre || a.email)}</h2><span class="muted small">${esc(a.email || '')}</span></div>
  <div class="grid g-2e">
    <div class="field"><label for="f-nombre">Nombre</label><input id="f-nombre" type="text" value="${v('nombre')}"></div>
    <div class="field"><label for="f-formato">Formato</label><select id="f-formato">${['LAB', '1:1'].map((o) => `<option ${a.formato === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
  </div>
  ${'apodo' in a ? `<div class="field"><label for="f-apodo">Cómo la llamás</label><small>Su nombre corto para el saludo de su inicio. Ej.: Vir, Lau, Gaby</small><input id="f-apodo" type="text" value="${v('apodo')}"></div>` : ''}
  <div class="field"><label for="f-trabajo">Su trabajo</label><small>A qué se dedica, con quién habla en inglés. Lo usa Flor AI.</small><input id="f-trabajo" type="text" value="${v('trabajo')}"></div>
  <div class="field"><label for="f-objetivo">Objetivo a 5 meses</label><textarea id="f-objetivo" rows="2">${v('objetivo')}</textarea></div>
  <div class="field"><label for="f-ficha">Lo que sabes de ella</label><small>Solo lo ves tú y lo usa Flor AI para guiarla como tú: su historia, su contexto, cómo trabaja, qué le funciona, qué la frena. Ella no lo ve.</small><textarea id="f-ficha" rows="6">${esc(ficha)}</textarea></div>
  <h3>Su semana</h3>
  <div class="field"><label for="f-foco_titulo">Foco de esta semana</label><input id="f-foco_titulo" type="text" value="${v('foco_titulo')}" placeholder="Ej.: Ordenar tu mensaje antes de hablar"></div>
  <div class="field"><label for="f-foco_texto">Por qué ese foco</label><textarea id="f-foco_texto" rows="2">${v('foco_texto')}</textarea></div>
  <div class="field"><label for="f-horario_clase">Su clase en vivo</label><small>Día y horario que ella ve en su inicio. Ej.: Viernes 08:00 (Argentina)</small><input id="f-horario_clase" type="text" value="${v('horario_clase')}"></div>
  <div class="field"><label for="f-link_clase">Link de su clase</label><input id="f-link_clase" type="url" value="${v('link_clase')}" placeholder="https://meet.google.com/..."></div>
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
  <h3>Documentos</h3><p class="muted small">Su Acuerdo de Trabajo firmado, su Starting Point, su plan de acción. Ella los ve en “Mi progreso”.</p>
  ${docs.length ? `<ul class="dates">${docs.map((d) => `<li><b>${esc((P.tiposDoc.find((x) => x[0] === d.tipo) || [, 'Documento'])[1])}</b><span><button type="button" class="linkbtn" data-archivo="${esc(d.path)}">${esc(d.nombre)}</button> <button type="button" class="linkbtn small" data-deldoc="${d.id}">Quitar</button></span></li>`).join('')}</ul>` : '<p class="muted small">Sin documentos.</p>'}
  <form class="editrow" id="adform"><select id="ad-tipo">${P.tiposDoc.map(([v2, l]) => `<option value="${v2}">${l}</option>`).join('')}</select><input type="file" id="ad-file" accept=".pdf,image/*,.doc,.docx"><button class="btn sm" type="submit">Subir</button></form>
</section>
<section class="card">
  <div class="row between"><h3>Tareas extra de la semana</h3><button class="linkbtn small" id="limpiar">Borrar las hechas</button></div>
  <ul class="tasks">${t.map((x) => `<li><div class="fbitem" style="flex-direction:row;align-items:center;justify-content:space-between"><span>${x.hecha ? '✓ ' : ''}<b>${esc(x.texto)}</b>${x.donde ? '<br><span class="muted small">' + esc(x.donde) + '</span>' : ''}</span><button type="button" class="linkbtn small" data-deltarea="${x.id}">Quitar</button></div></li>`).join('') || '<li class="muted small">Sin tareas.</li>'}</ul>
  <form class="editrow" id="tform"><input type="text" id="t-texto" placeholder="Tarea (ej.: Ver la clase Dar un update)"><input type="text" id="t-donde" placeholder="Dónde / detalle (opcional)"><button class="btn sm" type="submit">Agregar</button></form>
</section>
<form class="card" id="fbform" novalidate>
  <h3>Feedback de un audio o archivo</h3>
  <p class="muted small">¿Te mandó un audio por WhatsApp o un documento por mail? Súbelo acá: queda en su espacio y en tu Bandeja. Con «Borrador con IA» la app lo transcribe y te arma el feedback con tu criterio (pronunciación incluida). Tú lo revisas y lo envías.</p>
  <input type="text" id="fb-tit" placeholder="Qué es (ej.: Audio de su update del lunes)">
  <textarea id="fb-texto" rows="2" placeholder="Contexto para el feedback (opcional): qué quería practicar, para qué reunión…"></textarea>
  <input type="file" id="fb-file" accept="audio/*,video/*,.pdf,.txt,image/*">
  <button class="btn sm" type="submit">Llevar a mi Bandeja</button>
</form>
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
      <input type="url" id="inv-drive" placeholder="Link de su carpeta de Drive (si lo dejas vacío, la app se la crea)">
      <input type="text" id="inv-pw" placeholder="Contraseña provisoria"><button class="btn sm" type="submit">Crear alumna</button>
      <div id="inv-ok" hidden class="note small"></div></form>
    ${st._pend && st._pend.length ? `<section class="card" id="pendcard"><h3>Por crear (${st._pend.length})</h3><p class="muted small">Ya están cargadas con su formato, su carpeta, sus weeklies y tu ficha. Toca «Crear» y mándale el mensaje: cuando entre, ve todo lo suyo.</p>
      <div class="alist">${st._pend.map((x) => `<div class="editrow" data-pend="${esc(x.email)}"><span>${esc(x.nombre)}<br><span class="muted small">${esc(x.datos && x.datos.formato === 'LAB' ? 'Lab' : 'Private')} · ${esc(x.email)}</span></span><button type="button" class="btn sm pend-crear">Crear</button></div>`).join('')}</div></section>` : ''}
    <div class="alist" id="alist">${al.map((x) => `<button type="button" data-a="${x.id}" ${String(x.id) === sel ? 'aria-current="true"' : ''}><span>${esc(x.nombre || x.email)}${x.activa === false ? ' <span class="muted small">(inactiva)</span>' : ''}${esFlor() && claseDe(x) ? ` <span class="pill small">hoy ${hora(claseDe(x).inicio)}</span>` : ''}</span><span class="muted small">${esc(x.formato || '')}</span></button>`).join('')}</div>
  </div>
  <div class="grid" style="align-content:start">${det}</div>
</div>`;
    },
    mount(sel) {
      montarNotas();
      montarOk(() => st._hoyA);
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
          const dr = $('#inv-drive').value.trim();
          if (dr && !/drive\.google\.com/.test(dr)) { toast('El link de Drive tiene que ser de drive.google.com', true); btn.disabled = false; return; }
          const nueva = await intentar(() => DB.invitar(em, nom, pw, dr));
          toast(nueva && nueva.drive ? 'Alumna creada y conectada a su carpeta de Drive' : 'Alumna creada. No pude crearle la carpeta de Drive: pégala en su ficha.', !(nueva && nueva.drive));
          $('#inv-drive').value = '';
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
      $('#fbform').onsubmit = async (e) => {
        e.preventDefault();
        const file = $('#fb-file').files[0];
        if (!file) return toast('Elige el audio o el archivo.', true);
        if (file.size > 50 * 1024 * 1024) return toast('El archivo pesa más de 50 MB.', true);
        const btn = $('#fbform button[type=submit]'); btn.disabled = true; btn.textContent = 'Subiendo…';
        try {
          await intentar(async () => {
            const archivo = await DB.subirArchivo(file, 'feedback', aid);
            await DB.pedidoDeFlor({ alumna_id: aid, tipo: /^(audio|video)\//.test(file.type) ? 'audio' : 'tarea', titulo: $('#fb-tit').value.trim() || file.name, texto: $('#fb-texto').value.trim(), archivo, archivo_nombre: file.name });
          }, 'Listo, está en tu Bandeja');
          location.hash = 'bandeja/pedidos';
        } catch (er) { btn.disabled = false; btn.textContent = 'Llevar a mi Bandeja'; }
      };
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
          drive_url: g('drive_url'), activa: $('#f-activa').checked, fecha_inicio: g('fecha_inicio') || null,
          horario_clase: g('horario_clase'), link_clase: g('link_clase')
        };
        if ($('#f-apodo')) c.apodo = g('apodo') || null;
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
    async html() {
      const nuevo = labAlDia();
      if (nuevo) { try { await DB.guardarPrograma({ proximo_lab: nuevo }); st.programa.proximo_lab = nuevo; } catch (e) { st.programa.proximo_lab = nuevo; } }
      const l = lab(), k = links(), pr = st.programa;
      const inp = (id, lab_, val, ph = '', type = 'text') => `<div class="field"><label for="${id}">${lab_}</label><input id="${id}" type="${type}" value="${esc(val || '')}" placeholder="${esc(ph)}"></div>`;
      return `<div class="head"><div><span class="eyebrow">Panel de Flor</span><h1>Programa</h1></div></div>
<p class="muted intro">Lo que cargas acá lo ven todas tus alumnas (y lo sabe Flor AI). Las clases y módulos se editan en <code>app/programa.js</code>.</p>
<form class="grid" id="prform" novalidate>
  <section class="card feature unica"><span class="eyebrow">Tu próximo lab</span>
    <h2>${esc(l.fecha || '')} · 15:30</h2>
    <p class="small">${l.tema ? '<b>Tema:</b> ' + esc(l.tema) : 'Todavía no tiene tema: se arma solo los jueves a la mañana.'}</p>${l.porque ? `<p class="small muted">Por qué: ${esc(l.porque)}</p>` : ''}
    <div class="row" style="gap:8px;flex-wrap:wrap">${url(l.material) ? `<a class="btn" href="${esc(l.material)}" target="_blank" rel="noopener">🎬 Abrir todo para darlo</a>` : ''}<a class="btn ${url(l.material) ? 'ghost sm' : ''}" href="${esc(l.link || MEET_LAB)}" target="_blank" rel="noopener">Entrar al Meet</a></div>
  </section>
  <section class="card"><h3>Próximo lab · lo que ven tus alumnas</h3>
    <div class="grid g-2e">${inp('l-fecha', 'Fecha', l.fecha, 'Sábado 14 de noviembre')}${inp('l-horario', 'Horario', l.horario, HORARIO_LAB)}</div>
    ${inp('l-tema', 'Tema', l.tema, 'Small talk después de una capacitación')}${inp('l-link', 'Link de Meet', l.link, MEET_LAB, 'url')}
    ${inp('l-material', 'Material listo para darlo (carpeta con playbook, deck y guion) · solo lo ves vos', l.material, 'https://drive.google.com/drive/folders/…', 'url')}
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
          proximo_lab: { iso: (st.programa.proximo_lab || {}).iso || proximoSabado().iso, fecha: g('l-fecha'), horario: g('l-horario'), tema: g('l-tema'), link: g('l-link'), material: g('l-material') },
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
