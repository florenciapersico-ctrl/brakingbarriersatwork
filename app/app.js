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
    bandeja: '<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
    alumnas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 5.8"/>',
    ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.7 4.4V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>'
  };
  const svg = (k) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[k] + '</svg>';
  const VISTAS = [['semana', 'Mi semana'], ['flor', 'Flor AI'], ['feedback', 'Pedir feedback'], ['weekly', 'Weekly report'], ['camino', 'Mi camino'], ['coaches', 'Mis coaches'], ['progreso', 'Mi progreso'], ['empieza', 'Empieza acá']];
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

  function navHTML() {
    const it = ([id, l]) => '<a href="#' + id + '" data-v="' + id + '">' + svg(id) + '<span>' + l + '</span>' + (id === 'bandeja' ? '<span class="badge" id="bdg" hidden></span>' : '') + '</a>';
    return VISTAS.map(it).join('') + (st.admin ? '<div class="sep">Panel de Flor</div>' + ADMIN.map(it).join('') : '');
  }

  function shell() {
    root.innerHTML = '<div class="shell"><aside class="side"><div class="logo">AT WORK<small>Breaking Barriers</small></div><nav class="main">' + navHTML() + '</nav>' +
      '<div class="foot">' + (DB.demo ? '<span class="demo">Versión demo</span><button class="linkbtn" id="reset">Reiniciar datos de ejemplo</button>' : '') +
      '<span>' + esc(st.perfil.nombre || st.perfil.email || '') + '</span><button class="linkbtn" id="clave">Cambiar contraseña</button><button class="linkbtn" id="salir">Cerrar sesión</button></div></aside>' +
      '<main id="app"></main></div><nav class="tabbar">' + navHTML() + '</nav>';
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
  V.semana = {
    async html() {
      const [tareas, weeklies, pedidos] = await Promise.all([DB.tareas(), DB.weeklies(), DB.pedidos()]);
      st._tareas = tareas;
      const p = st.perfil, r = racha(weeklies), l = lab();
      const fb = pedidos.find((x) => x.estado === 'respondido');
      const nombre = (p.nombre || '').split(' ')[0];
      const aviso = st.programa.aviso ? '<p class="note">' + esc(st.programa.aviso) + '</p>' : '';
      const sinOnb = (p.onboarding || []).length < P.onboarding.length;
      return `
<div class="head"><div><span class="eyebrow">Semana del ${fecha(DB.lunes(), { day: 'numeric', month: 'long' })}</span><h1>Hola${nombre ? ', ' + esc(nombre) : ''}.</h1></div>${DB.demo ? '<span class="demo">Alumna de ejemplo</span>' : ''}</div>
${aviso}
${sinOnb && !(weeklies.length) ? `<section class="card feature"><span class="eyebrow">Tu primera semana</span><h2>Empieza por tu onboarding</h2><p class="muted">Dónde está cada cosa, tu punto de partida y tu primera práctica, con Flor AI. 20 a 30 minutos.</p><div class="row"><a class="btn" href="#empieza">Ir a Empieza acá</a></div></section>` : ''}
<div class="grid g-2">
  ${p.foco_titulo ? `<section class="card feature">
    <span class="eyebrow">Tu foco de esta semana · lo eligió Flor</span>
    <h2>${esc(p.foco_titulo)}</h2>
    ${p.foco_texto ? '<p class="muted">' + esc(p.foco_texto) + '</p>' : ''}
    <div class="row"><button class="btn" type="button" data-ask="Quiero practicar mi foco de esta semana: ${esc(p.foco_titulo)}">Practicarlo con Flor AI</button></div>
  </section>` : `<section class="card empty-state"><span class="eyebrow">Tu foco de esta semana</span><h3>Flor lo elige con tu material</h3><p class="muted small">Cuando le mandes tu primer audio o una reunión real desde “Pedir feedback”, Flor te dice qué entrenar.</p><a class="btn ghost" href="#feedback">Pedir feedback</a></section>`}
  <section class="card">
    <span class="eyebrow">Próximo lab en vivo</span>
    ${l.fecha ? `<h3>${esc(l.tema || 'Lab de AT WORK')}</h3><p><b>${esc(l.fecha)}</b><br><span class="muted">${esc(l.horario || '')}</span></p>
    <p class="muted small">Trae una situación real de tu trabajo. Vas a exponer 2 minutos con el playbook.</p>
    ${url(l.link) ? '<div class="row"><a class="btn ghost" href="' + esc(l.link) + '" target="_blank" rel="noopener">Entrar al lab</a></div>' : ''}` : '<p class="muted">Flor va a cargar acá la fecha del próximo lab.</p>'}
  </section>
</div>
<div class="grid g-2">
  <section class="card">
    <div class="row between"><h3>Tus tareas de esta semana</h3><span class="pill" id="taskCount"></span></div>
    ${tareas.length ? '<ul class="tasks" id="tasks">' + tareas.map((t) => `<li><label><input type="checkbox" data-id="${t.id}" ${t.hecha ? 'checked' : ''}><div><div class="t">${esc(t.texto)}</div>${t.donde ? '<div class="where">' + esc(t.donde) + '</div>' : ''}</div></label></li>`).join('') + '</ul>'
      : '<p class="muted small">Todavía no hay tareas cargadas para esta semana. Mientras tanto, completa tu weekly report.</p>'}
  </section>
  <section class="card">
    <span class="eyebrow">Weekly report · constancia</span>
    <div class="row" style="gap:12px"><span class="big">${r.actual}</span><span>${r.actual === 1 ? 'lunes seguido' : 'lunes seguidos'}<br><span class="muted small">Tu récord: ${r.rec}</span></span></div>
    <div class="streak">${r.celdas.map((c) => `<div class="${c.on ? 'on' : ''} ${c.hoy ? 'now' : ''}" title="${fecha(c.s)}">${c.on ? '✓' : c.hoy ? 'Hoy' : ''}</div>`).join('')}<div title="próxima">›</div></div>
    <a class="btn" href="#weekly">${r.hoyHecho ? 'Ver mi weekly' : 'Completar el de esta semana'}</a>
  </section>
</div>
<section class="card">
  <div class="row between"><h3>Pregúntale a Flor AI</h3><a href="#flor" class="muted small">Abrir chat</a></div>
  <p class="muted small">Ya conoce tu semana, tu foco, tu feedback y tu progreso.</p>
  <div class="askbox">
    <button type="button" data-ask="¿Qué me toca esta semana?">¿Qué me toca esta semana?</button>
    <button type="button" data-ask="Tengo una reunión pronto y me quiero preparar">Tengo una reunión pronto</button>
    <button type="button" data-ask="Ayúdame con mi weekly report">Ayúdame con mi weekly</button>
  </div>
</section>
${fb ? `<section class="card">
  <div class="row between"><h3>Último feedback de Flor</h3><span class="muted small">Sobre: ${esc(fb.titulo || fb.tipo)}</span></div>
  <div class="feedback"><p>${esc(fb.respuesta)}</p>${fixes(fb.correcciones)}</div>
  <a href="#feedback" class="small">Ver todos tus feedbacks</a>
</section>` : ''}
<section class="grid">
  <span class="eyebrow">A mano</span>
  <div class="quick">
    ${qa(lab().link, 'Link del lab', 'Sábados')}${qa(links().reservar, 'Reservar mi 1:1', '1 por mes, 45 min')}${qa(st.perfil.drive_url, 'Mi carpeta de Drive', 'Prácticas y material')}${qa(links().comunidad, 'Comunidad', 'Grupo de WhatsApp')}
  </div>
</section>`;
    },
    mount() {
      const el = $('#tasks'); if (!el) return ($('#taskCount') ? ($('#taskCount').textContent = '0') : null);
      const count = () => { $('#taskCount').textContent = el.querySelectorAll('input:checked').length + ' de ' + el.querySelectorAll('input').length; };
      el.addEventListener('change', (e) => { const i = e.target; intentar(() => DB.marcarTarea(+i.dataset.id || i.dataset.id, i.checked)).catch(() => { i.checked = !i.checked; count(); }); count(); });
      count();
    }
  };
  function qa(link, t, s) {
    return url(link) ? `<a href="${esc(link)}" target="_blank" rel="noopener"><b>${t}</b><span>${s}</span></a>` : `<a href="#empieza"><b>${t}</b><span>${s}</span></a>`;
  }

  // ---------- Flor AI y coaches (chat) ----------
  const coachDe = (id) => P.coaches.find((c) => c.id === id) || P.coaches[0];
  function enClaudeHTML() {
    const L = P.enClaude;
    return `<div class="head"><div><span class="eyebrow">Tu práctica entre clases</span><h1>Flor AI y tus coaches</h1></div></div>
<p class="muted intro">Tus coaches funcionan dentro de Claude, con tu cuenta. Tócalo y empieza a practicar: trae una situación real de tu semana, una reunión, una presentación o un mail.</p>
<div class="grid g-2e">
  <a class="card feature" href="${L.practica}" target="_blank" rel="noopener" style="text-decoration:none">
    <span class="eyebrow">Empieza por aquí</span><h2>Tu práctica de la semana</h2>
    <p class="muted">Lo haces como te sale, vemos dónde se rompió, entrenas solo eso y lo vuelves a intentar. Todo en una sesión.</p>
    <span class="btn" style="align-self:flex-start">Empezar mi práctica</span>
  </a>
  <a class="card" href="${L.coaches}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">
    <span class="eyebrow">Herramientas por separado</span><h2>Tus coaches</h2>
    <p class="muted">Para trabajar una sola cosa: ensayar con Role Play, corregir gramática con Narrative Flow, subir el nivel con Color Method o tu pronunciación.</p>
    <span class="btn ghost" style="align-self:flex-start">Abrir mis coaches</span>
  </a>
</div>
<section class="card"><h3>La primera vez</h3><ul class="dates">
  <li><b>1. Tu cuenta</b><span>Entra con tu cuenta de Claude. Si no tienes, créala gratis con tu mail en claude.ai.</span></li>
  <li><b>2. El aviso</b><span>Te va a aparecer “Este artefacto usa conectores”. Deja prendido “Usar Claude” y toca Continuar. Es normal.</span></li>
  <li><b>3. ¿Prefieres hablar?</b><span>Toca el micrófono del coach para el modo conversación, o dicta con el micrófono de tu teclado.</span></li>
</ul></section>
<p class="muted small">Lo importante, mándaselo a Flor desde <a href="#feedback">Pedir feedback</a>: ella te responde acá.</p>`;
  }

  V.flor = {
    async html() {
      if (!IA) return enClaudeHTML();
      return `<div class="head"><div><span class="eyebrow">Tu consultoría y tus coaches</span><h1>Flor AI</h1></div></div>
<div class="chat">
  <div class="chat-side">
    <label class="eyebrow" for="coachSel">Hablar con</label>
    <select id="coachSel">${P.coaches.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('')}</select>
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
    <div class="field"><label for="plink">Link al audio o video (opcional)</label><small>De tu Drive, con permiso para que Flor lo vea.</small><input id="plink" type="url" placeholder="https://drive.google.com/…"></div>
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
    <details><summary class="small">Lo que mandaste</summary><pre>${esc(x.texto)}</pre>${url(x.link) ? `<a class="small" href="${esc(x.link)}" target="_blank" rel="noopener">Abrir link</a>` : ''}</details>
    ${x.respuesta ? `<div class="reply"><span class="eyebrow">Flor · ${fecha(x.respondido_en)}</span><p>${esc(x.respuesta).replace(/\n/g, '<br>')}</p>${fixes(x.correcciones)}</div>` : ''}
  </div>`).join('') : '<p class="muted small">Todavía no mandaste nada. Empieza por tu audio de punto de partida.</p>'}
</section>`;
    },
    mount() {
      const f = $('#pform');
      f.onsubmit = async (e) => {
        e.preventDefault();
        const texto = $('#ptxt').value.trim(), link = $('#plink').value.trim();
        if (!texto && !link) return toast('Pega tu texto o un link para que Flor lo vea.', true);
        if (link && !url(link)) return toast('El link tiene que empezar con https://', true);
        $('button[type=submit]', f).disabled = true;
        try { await intentar(() => DB.crearPedido({ tipo: $('#ptipo').value, titulo: $('#ptit').value.trim(), texto, link }), 'Listo, le llegó a Flor.'); ruta(); }
        catch (er) { $('button[type=submit]', f).disabled = false; }
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
  ${P.weekly.map(([id, l, h]) => `<div class="field"><label for="w-${id}">${l}</label><small>${h}</small><textarea id="w-${id}" data-k="${id}" rows="3" ${bloqueado ? 'readonly' : ''}>${esc(w.respuestas[id] || '')}</textarea></div>`).join('')}
  ${bloqueado ? '' : `<div class="row"><button class="btn" type="submit">${w.enviado_en ? 'Actualizar mi weekly' : 'Enviar a Flor'}</button><button class="btn ghost" type="button" data-ask="Ayúdame con mi weekly report">Ordenarlo con Flor AI</button><span class="muted small" id="wsave">Tu borrador se guarda solo.</span></div>`}
</form>
${hist.length ? `<section class="card"><h3>Tus weeklies anteriores</h3>${hist.map((x) => `<details class="fbitem"><summary><b>Semana del ${fecha(x.semana, { day: 'numeric', month: 'long' })}</b> ${x.respuesta_flor ? '<span class="pill ok">Flor respondió</span>' : ''}</summary>
  ${P.weekly.map(([id, l]) => (x.respuestas[id] ? `<p class="small"><b>${l}</b><br>${esc(x.respuestas[id])}</p>` : '')).join('')}
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
        const d = datos(); if (!d.situacion && !d.win) return toast('Completa al menos tu win y la situación que quieres entrenar.', true);
        await intentar(() => DB.guardarWeekly(DB.lunes(), d, true), 'Listo, tu weekly está enviado. Avisa en la comunidad que ya lo completaste.');
        ruta();
      };
    }
  };

  // ---------- Mi camino ----------
  V.camino = {
    html() {
      const p = st.perfil, asig = p.clases_asignadas || [], act = p.modulo_actual || 0;
      return `<div class="head"><div><span class="eyebrow">Tu roadmap</span><h1>Mi camino</h1></div></div>
<p class="muted intro">El programa no se hace en orden de principio a fin. Flor revisa tus prácticas y reuniones reales y te dice qué clase ver. Las clases resaltadas son las que tienes asignadas ahora.</p>
${url(links().plataforma) ? `<div class="row"><a class="btn ghost" href="${esc(links().plataforma)}" target="_blank" rel="noopener">Ir a las clases grabadas</a></div>` : ''}
<div class="road">${P.modulos.map((m) => {
  const s = m.n < act ? 'done' : m.n === act ? 'current' : '';
  return `<div class="stage ${s}"><div class="dot">${m.n}</div><div class="card">
    <div class="row between"><h3>M${m.n} · ${esc(m.nombre)}</h3>${s === 'done' ? '<span class="pill ok">Completado</span>' : s === 'current' ? '<span class="pill warn">Estás aquí</span>' : ''}</div>
    <p class="muted">${esc(m.desc)}</p>
    <div class="lessons">${m.clases.map((c) => `<span class="${asig.includes(c) ? 'assigned' : ''}">${esc(c)}</span>`).join('')}</div>
    <p class="small muted"><i>«${esc(m.logro)}»</i></p>
  </div></div>`;
}).join('')}</div>`;
    }
  };

  // ---------- Mis coaches ----------
  V.coaches = {
    html() {
      return `<div class="head"><div><span class="eyebrow">Tu práctica entre clases</span><h1>Mis coaches</h1></div></div>
<p class="muted intro">${IA ? 'Están dentro de esta app: no necesitas cuenta de Claude ni instalar nada. Elige el que necesitas y escríbele con tus palabras, o dicta con el micrófono de tu teclado.' : 'Se abren en Claude, con tu cuenta. Elige el que necesitas y escríbele con tus palabras, o dicta con el micrófono de tu teclado.'}</p>
<section class="card">
  <h3>¿Qué coach uso hoy?</h3>
  <div class="picker" id="picker">${P.situaciones.map(([s, c], i) => `<button type="button" aria-pressed="${i === 0}" data-c="${c}">${esc(s)}</button>`).join('')}</div>
  <div class="answer" id="answer"></div>
</section>
<div class="grid g-3">${P.coaches.map((c) => `<section class="card coach" style="--c:${c.color}"><h3>${c.nombre}</h3><p class="muted small">${esc(c.desc)}</p><div class="phrase">"${esc(c.frase.trim())}"</div><div class="row">${IA ? `<a class="btn ghost sm" href="#flor/${c.id}">Abrir ${c.nombre}</a>` : `<a class="btn ghost sm" href="${c.id === 'flor' ? P.enClaude.practica : P.enClaude.coaches}" target="_blank" rel="noopener">Abrir ${c.nombre}</a>`}</div></section>`).join('')}</div>
<p class="muted small">Los coaches te ayudan a practicar. El diagnóstico de qué trabajar lo hace Flor con tus reuniones reales.</p>`;
    },
    mount() {
      const p = $('#picker');
      const show = (b) => {
        $$('button', p).forEach((x) => x.setAttribute('aria-pressed', x === b));
        const c = coachDe(b.dataset.c);
        $('#answer').innerHTML = `<span class="eyebrow">Te recomiendo</span><h3>${c.nombre}</h3><p class="small">${esc(c.desc)}</p><div class="row">${IA ? `<button class="btn" type="button" data-ask="${esc(c.frase)}" data-coach="${c.id}" data-send="${/[:\s]$/.test(c.frase) ? 'no' : 'si'}">Empezar con ${c.nombre}</button>` : `<a class="btn" href="${c.id === 'flor' ? P.enClaude.practica : P.enClaude.coaches}" target="_blank" rel="noopener">Abrir ${c.nombre} en Claude</a>`}<span class="muted small">Para empezar: “${esc(c.frase.trim())}”</span></div>`;
      };
      p.onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) show(b); };
      show($('button', p));
    }
  };

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

  // ---------- Empieza acá ----------
  V.empieza = {
    html() {
      const l = links(), lb = lab(), fechas = st.programa.fechas || [];
      const li = (t, link, desc) => `<li><b>${t}</b><span>${url(link) ? `<a href="${esc(link)}" target="_blank" rel="noopener">${desc}</a>` : desc + ' <span class="muted">(Flor lo agrega pronto)</span>'}</span></li>`;
      return `<div class="head"><div><span class="eyebrow">Tu primera semana</span><h1>Empieza acá</h1></div><span class="pill" id="onbCount"></span></div>
<p class="note small">¿Entraste con una contraseña provisoria que te mandó Flor? <button type="button" class="linkbtn" id="clave2">Crea tu propia contraseña acá</button>.</p>
<p class="muted intro">Todo lo que necesitas está en esta página. Tómate la semana con calma: no es correr. Si algo no te queda claro, escríbele a Flor. Preguntar dos o tres veces no es molestar.</p>
<section class="card feature">
  <span class="eyebrow">Tu bienvenida · 20 a 30 minutos</span>
  <h2>Haz tu onboarding con Flor AI</h2>
  <p class="muted">Te explica cómo funciona tu semana, dónde está cada cosa, toma tu punto de partida y hacen juntas tu primera práctica.</p>
  <div class="row"><button class="btn" type="button" data-ask="Soy nueva, quiero hacer mi onboarding">Empezar mi onboarding</button></div>
</section>
<div class="grid g-2">
  <section class="card"><h3>Tu checklist de onboarding</h3><ul class="tasks" id="onb">${P.onboarding.map((t, i) => `<li><label><input type="checkbox" data-i="${i}" ${(st.perfil.onboarding || []).includes(i) ? 'checked' : ''}><div><div class="t">${esc(t)}</div></div></label></li>`).join('')}</ul></section>
  <div class="grid" style="align-content:start">
    <section class="card"><h3>Tus links</h3><ul class="dates">
      ${li('Lab en vivo', lb.link, 'Link de los sábados')}
      ${li('Reservar 1:1', l.reservar, 'Tu check-in mensual de 45 min')}
      ${li('Clases', l.plataforma, 'Plataforma con las clases grabadas')}
      ${li('Mi Drive', st.perfil.drive_url, 'Tu carpeta de prácticas y material')}
      ${li('Comunidad', l.comunidad, 'Grupo de WhatsApp de AT WORK')}
      ${li('Flor', l.whatsapp_flor, 'Escribirle a Flor por WhatsApp')}
    </ul></section>
    ${fechas.length ? `<section class="card"><h3>Fechas importantes</h3><ul class="dates">${fechas.map((f) => `<li><b>${esc(f.cuando)}</b><span>${esc(f.que)}</span></li>`).join('')}</ul></section>` : ''}
    <section class="card"><h3>Tenla siempre a mano</h3>
      <p class="small"><b>iPhone:</b> abre esta página en Safari, toca compartir y elige “Agregar a inicio”.</p>
      <p class="small"><b>Android:</b> en Chrome, toca los tres puntitos y “Agregar a la pantalla principal”.</p>
      <p class="small"><b>Compu:</b> guárdala en favoritos (Ctrl + D o Cmd + D).</p>
    </section>
  </div>
</div>`;
    },
    mount() {
      $('#clave2').onclick = () => pantallaClave();
      const el = $('#onb');
      const c = () => { $('#onbCount').textContent = $$('input:checked', el).length + ' de ' + P.onboarding.length + ' listos'; };
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
        ${x.texto ? `<pre>${esc(x.texto)}</pre>` : ''}${url(x.link) ? `<a class="small" href="${esc(x.link)}" target="_blank" rel="noopener">Abrir el link que mandó</a>` : ''}
        <div class="field"><label>Tu respuesta</label><textarea class="r" rows="5" placeholder="Lo que funcionó, tu foco para ella y qué clase ver."></textarea></div>
        <div class="field"><label>Correcciones</label><div class="corrs"></div><button type="button" class="linkbtn small addc">+ Agregar corrección</button></div>
        <div class="row"><button class="btn send" type="button">Enviar respuesta</button>${IA ? '<button class="btn ghost ia" type="button">Borrador con IA</button>' : ''}</div>
      </div>`).join('') : '<p class="muted">No hay pedidos pendientes. 🎉</p>';
      if (tab === 'weeklies') cuerpo = wp.length ? wp.map((x) => `<div class="fbitem" data-wid="${x.id}">
        <div class="row between"><b>${nom(x.alumna_id)} · semana del ${fecha(x.semana, { day: 'numeric', month: 'long' })}</b><span class="muted small">Enviado ${fecha(x.enviado_en)}</span></div>
        ${P.weekly.map(([id, l]) => (x.respuestas[id] ? `<p class="small"><b>${l}</b><br>${esc(x.respuestas[id])}</p>` : '')).join('')}
        <div class="field"><label>Tu respuesta</label><textarea class="r" rows="4" placeholder="Su próximo paso para esta semana."></textarea></div>
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
          try { const r = await DB.borrador({ pedido_id: +it.dataset.pid || it.dataset.pid }); $('.r', it).value = r.respuesta; box.innerHTML = ''; (r.correcciones || []).forEach((c) => filaCorr(box, c.mal, c.bien)); }
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
          try { const r = await DB.borrador({ weekly_id: id }); $('.r', it).value = r.respuesta; } catch (er) { toast(er.message, true); }
          b.disabled = false; b.textContent = 'Borrador con IA';
        };
        $('.sendw', it).onclick = async () => {
          const r = $('.r', it).value.trim(); if (!r) return toast('Escribe tu respuesta.', true);
          await intentar(() => DB.responderWeekly(id, r), 'Respuesta enviada'); it.remove(); contarBandeja();
        };
      });
    }
  };

  // ---------- Alumnas ----------
  V.alumnas = {
    async html(sel) {
      const al = (await DB.alumnas()).filter((x) => x.rol !== 'admin' || DB.demo);
      const a = al.find((x) => String(x.id) === sel);
      let det = '<section class="card empty-state"><h3>Elige una alumna</h3><p class="muted small">Desde acá le cargas su foco de la semana, sus tareas, las clases que tiene que ver, su progreso y sus patrones de error. Todo lo ve en su app y lo usa Flor AI.</p></section>';
      if (a) {
        const [t, pat] = await Promise.all([DB.tareas(a.id), DB.patrones(a.id)]);
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
  <h3>Su semana</h3>
  <div class="field"><label for="f-foco_titulo">Foco de esta semana</label><input id="f-foco_titulo" type="text" value="${v('foco_titulo')}" placeholder="Ej.: Ordenar tu mensaje antes de hablar"></div>
  <div class="field"><label for="f-foco_texto">Por qué ese foco</label><textarea id="f-foco_texto" rows="2">${v('foco_texto')}</textarea></div>
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
  <div class="row"><button class="btn" type="submit">Guardar cambios</button><span class="muted small">Onboarding: ${(a.onboarding || []).length} de ${P.onboarding.length}</span></div>
</form>
<section class="card">
  <div class="row between"><h3>Tareas de la semana</h3><button class="linkbtn small" id="limpiar">Borrar las hechas</button></div>
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
    <div class="alist">${al.map((x) => `<button type="button" data-a="${x.id}" ${String(x.id) === sel ? 'aria-current="true"' : ''}><span>${esc(x.nombre || x.email)}${x.activa === false ? ' <span class="muted small">(inactiva)</span>' : ''}</span><span class="muted small">${esc(x.formato || '')}</span></button>`).join('')}</div>
  </div>
  <div class="grid" style="align-content:start">${det}</div>
</div>`;
    },
    mount(sel) {
      if (window.matchMedia('(max-width:860px)').matches) $('#agrid').style.gridTemplateColumns = '1fr';
      $$('[data-a]').forEach((b) => (b.onclick = () => (location.hash = 'alumnas/' + b.dataset.a)));
      const genPw = () => 'atwork-' + Math.random().toString(36).slice(2, 7);
      $('#inv-pw').value = genPw();
      $('#invform').onsubmit = async (e) => {
        e.preventDefault();
        const em = $('#inv-email').value.trim(), nom = $('#inv-nombre').value.trim(), pw = $('#inv-pw').value.trim();
        if (!em) return toast('Escribe el mail.', true);
        const btn = $('#invform button[type=submit]'); btn.disabled = true;
        try {
          await intentar(() => DB.invitar(em, nom, pw), 'Alumna creada');
          const link = location.origin + location.pathname;
          const msg = 'Hola' + (nom ? ' ' + nom.split(' ')[0] : '') + '! Ya tienes tu espacio de AT WORK 🎉\nEntra acá: ' + link + '\nMail: ' + em + '\nContraseña provisoria: ' + pw + '\nCuando entres, ve a "Empieza acá" y crea tu propia contraseña.';
          const ok = $('#inv-ok'); ok.hidden = false;
          ok.innerHTML = '<b>Mándale esto por WhatsApp:</b><pre style="white-space:pre-wrap;font:inherit;margin:6px 0">' + esc(msg) + '</pre><button type="button" class="btn sm" id="copiar">Copiar mensaje</button> <a class="btn ghost sm" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(msg) + '">Abrir WhatsApp</a>';
          $('#copiar').onclick = () => navigator.clipboard && navigator.clipboard.writeText(msg).then(() => toast('Copiado'));
          $('#inv-email').value = ''; $('#inv-nombre').value = ''; $('#inv-pw').value = genPw();
          const lista = await DB.alumnas();
          $('.alist').innerHTML = lista.filter((x) => x.rol !== 'admin' || DB.demo).map((x) => `<button type="button" data-a="${x.id}"><span>${esc(x.nombre || x.email)}</span><span class="muted small">${esc(x.formato || '')}</span></button>`).join('');
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
          drive_url: g('drive_url'), activa: $('#f-activa').checked
        };
        await intentar(() => DB.actualizarPerfil(aid, c), 'Guardado');
        if (aid === st.perfil.id) Object.assign(st.perfil, c);
      };
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
