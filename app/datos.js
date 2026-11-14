// Capa de datos de la app. Dos versiones con las mismas funciones:
//  - Supabase (la real), cuando config.js tiene la URL y la clave pública.
//  - Demo (en este navegador, con datos de ejemplo), cuando config.js está vacío o la URL tiene ?demo.
(function () {
  const cfg = window.ATW_CONFIG || {};
  const DEMO = !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || /[?&]demo\b/.test(location.search);

  function lunes(d = new Date()) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dia = (x.getDay() + 6) % 7; // 0 = lunes
    x.setDate(x.getDate() - dia);
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  }

  // ======================= Supabase =======================
  function supa() {
    const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' }
    });
    const ok = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
    let uid = null;
    const fn = cfg.SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/flor-ai';

    async function token() { const { data } = await sb.auth.getSession(); return data.session && data.session.access_token; }
    async function llamar(body) {
      const r = await fetch(fn, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: cfg.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + await token() }, body: JSON.stringify(body) });
      return r;
    }
    async function errorDe(r) { try { const j = await r.json(); return j.error || ('Error ' + r.status); } catch (e) { return 'Error ' + r.status; } }

    return {
      demo: false, lunes,
      // ---- sesión ----
      async sesion() { const { data } = await sb.auth.getSession(); uid = data.session ? data.session.user.id : null; return data.session; },
      onAuth(cb) { sb.auth.onAuthStateChange((ev, s) => { uid = s ? s.user.id : null; cb(ev, s); }); },
      async login(email, clave) { ok(await sb.auth.signInWithPassword({ email, password: clave })); },
      async logout() { await sb.auth.signOut(); },
      async recuperar(email) { ok(await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname })); },
      async cambiarClave(clave) { ok(await sb.auth.updateUser({ password: clave })); },

      // ---- alumna ----
      async miPerfil() { return ok(await sb.from('perfiles').select('*').eq('id', uid).single()); },
      async marcarCoaches(si) { ok(await sb.rpc('marcar_coaches', { p_instalados: !!si })); },
      async guardarMiPerfil(c) { ok(await sb.rpc('guardar_mi_perfil', { p_nombre: c.nombre ?? null, p_objetivo: c.objetivo ?? null, p_onboarding: c.onboarding ?? null, p_camino: c.camino_hecho ?? null, p_compromisos: c.compromisos ?? null })); },
      // ---- archivos y documentos (bucket privado "atwork", carpeta = id de la alumna) ----
      async subirArchivo(file, carpeta, a = uid) {
        const limpio = file.name.normalize('NFD').replace(/[^\w.\-]+/g, '_').slice(-80);
        const path = a + '/' + carpeta + '/' + Date.now() + '-' + limpio;
        ok(await sb.storage.from('atwork').upload(path, file, { contentType: file.type || undefined }));
        return path;
      },
      async urlArchivo(path) { if (/^https?:\/\//.test(path || '')) return path; const d = ok(await sb.storage.from('atwork').createSignedUrl(path, 3600)); return d.signedUrl; },
      async documentos(a = uid) { return ok(await sb.from('documentos').select('*').eq('alumna_id', a).order('creado', { ascending: false })); },
      async agregarDocumento(tipo, nombre, path, a = uid) { ok(await sb.from('documentos').insert({ alumna_id: a, tipo, nombre, path })); },
      async subirDocumento(a, file, tipo, nombre) {
        const path = await this.subirArchivo(file, 'documentos', a);
        const d = ok(await sb.from('documentos').insert({ alumna_id: a, tipo, nombre: nombre || file.name, path }).select().single());
        this.copiarDrive({ path, tipo, nombre: nombre || file.name, tabla: 'documentos', id: d.id });
      },
      // Copia a la carpeta de Drive de la alumna (si Flor lo configuró). Nunca frena a la alumna si falla.
      // Copia de seguridad diaria de toda la app (la hace la función; acá solo se dispara, una vez por día y por navegador).
      async backupDiario() { try { const k = 'atw-backup', hoy = new Date().toISOString().slice(0, 10); if (localStorage.getItem(k) === hoy) return; const r = await llamar({ modo: 'backup' }); if (r.ok) localStorage.setItem(k, hoy); } catch (e) { /* nunca frena la app */ } },
      async copiarDrive(q) { try { const r = await llamar({ modo: 'drive', ...q }); return r.ok ? r.json() : null; } catch (e) { return null; } },
      async borrarDocumento(d) { await sb.storage.from('atwork').remove([d.path]); ok(await sb.from('documentos').delete().eq('id', d.id)); },
      async tareas(a = uid) { return ok(await sb.from('tareas').select('*').eq('alumna_id', a).order('orden').order('id')); },
      async marcarTarea(id, hecha) { ok(await sb.rpc('marcar_tarea', { p_id: id, p_hecha: hecha })); },
      async weeklies(a = uid) { return ok(await sb.from('weekly').select('*').eq('alumna_id', a).order('semana', { ascending: false }).limit(30)); },
      async guardarWeekly(semana, respuestas, enviar) {
        const fila = { alumna_id: uid, semana, respuestas };
        if (enviar) fila.enviado_en = new Date().toISOString();
        const w = ok(await sb.from('weekly').upsert(fila, { onConflict: 'alumna_id,semana' }).select('id').single());
        if (enviar && w) llamar({ modo: 'auto', weekly_id: w.id }).catch(() => {});
      },
      async todosResumenes() { try { return ok(await sb.from('resumenes').select('alumna_id, fecha, asunto, texto, creado').order('fecha', { ascending: false }).limit(1000)); } catch (e) { return []; } },
      async resumenes(a = uid) { try { return ok(await sb.from('resumenes').select('*').eq('alumna_id', a).order('fecha', { ascending: false }).limit(60)); } catch (e) { return []; } },
      async pedidos(a = uid) { return ok(await sb.from('pedidos').select('*').eq('alumna_id', a).order('creado', { ascending: false }).limit(50)); },
      async crearPedido(p) {
        const x = ok(await sb.from('pedidos').insert({ ...p, alumna_id: uid }).select().single());
        llamar({ modo: 'auto', pedido_id: x.id }).catch(() => {});
        if (p.archivo) this.copiarDrive({ path: p.archivo, tipo: p.tipo, nombre: p.archivo_nombre, tabla: 'pedidos', id: x.id });
        return x;
      },
      async patrones(a = uid) { return ok(await sb.from('patrones').select('*').eq('alumna_id', a).order('id')); },
      async programa() { return ok(await sb.from('programa').select('*').eq('id', 1).single()); },

      // ---- chats ----
      async chats() { return ok(await sb.from('chats').select('*').eq('alumna_id', uid).order('creado', { ascending: false }).limit(60)); },
      async crearChat(coach) { return ok(await sb.from('chats').insert({ alumna_id: uid, coach }).select().single()); },
      async borrarChat(id) { ok(await sb.from('chats').delete().eq('id', id)); },
      async mensajes(chatId) { return ok(await sb.from('mensajes').select('*').eq('chat_id', chatId).order('id')); },
      async enviar(chatId, mensaje, onDelta) {
        const r = await llamar({ chat_id: chatId, mensaje });
        if (!r.ok) throw new Error(await errorDe(r));
        const lector = r.body.getReader(), dec = new TextDecoder();
        let todo = '';
        for (;;) { const { done, value } = await lector.read(); if (done) break; todo += dec.decode(value, { stream: true }); onDelta(todo); }
        return todo;
      },

      // ---- admin (Flor) ----
      async alumnas() { return ok(await sb.from('perfiles').select('*').order('nombre')); },
      async actualizarPerfil(id, c) { ok(await sb.from('perfiles').update(c).eq('id', id)); },
      async invitar(email, nombre, password, drive_url) {
        const r = await llamar({ modo: 'invitar', email, nombre, password, drive_url: drive_url || '', redirect: location.origin + location.pathname });
        if (!r.ok) throw new Error(await errorDe(r));
        return r.json().catch(() => ({}));
      },
      async pedidoDeFlor(p) {
        const x = ok(await sb.from('pedidos').insert({ ...p, estado: 'pendiente' }).select().single());
        llamar({ modo: 'auto', pedido_id: x.id }).catch(() => {});
        return x;
      },
      async borradores() { return ok(await sb.from('borradores').select('tabla,ref,datos')); },
      async habitos(desde) { return ok(await sb.from('habitos_flor').select('*').gte('fecha', desde)); },
      // Lo de hoy + el video de YouTube de la semana (se carga un día y vale para toda la semana).
      async hoyFlor(f) {
        const [d, y] = await Promise.all([sb.from('hoy_flor').select('*').eq('fecha', f).not('clave', 'like', 'lab:%').order('orden'), sb.from('hoy_flor').select('*').like('clave', 'youtube:%').gte('fecha', lunes(new Date(f + 'T12:00:00'))).lte('fecha', f).order('fecha', { ascending: false })]);
        const L = ok(d) || [];
        const yt = (y.data || []).find((x) => !L.some((z) => z.clave === x.clave));
        return yt ? L.concat(yt) : L;
      },
      // Labs (panel de Flor): filas de hoy_flor con clave 'lab:guion' (guion + feedback) y 'lab:registro' (qué se hizo), tipo 'otro'.
      async labsFlor() { return ok(await sb.from('hoy_flor').select('*').like('clave', 'lab:%').order('fecha', { ascending: false }).limit(200)); },
      async guardarLabFlor(f, clave, c) {
        const fila = { fecha: f, clave, tipo: 'otro', orden: 99, actualizado: new Date().toISOString(), ...c };
        const r = await sb.from('hoy_flor').update(c).eq('fecha', f).eq('clave', clave).select('clave');
        if (r.error) throw new Error(r.error.message);
        if (!r.data || !r.data.length) ok(await sb.from('hoy_flor').insert(fila));
      },
      async hoyHecho(f, clave, hecho) { ok(await sb.from('hoy_flor').update({ hecho, actualizado: new Date().toISOString() }).eq('fecha', f).eq('clave', clave)); },
      // OK de una clase: la marca como dada. La tarea "🎓 Clases del día" ve el OK, arma el resumen, se lo manda y actualiza su app.
      // Si la base todavía no tiene la columna ok_en (migración 15), guarda solo el "hecho".
      async claseOk(f, clave, on) {
        const base = { hecho: on, actualizado: new Date().toISOString() };
        const r = await sb.from('hoy_flor').update({ ...base, ok_en: on ? new Date().toISOString() : null }).eq('fecha', f).eq('clave', clave);
        if (r.error) ok(await sb.from('hoy_flor').update(base).eq('fecha', f).eq('clave', clave));
      },
      async notasClase(email) { return ok(await sb.from('clase_notas').select('*').eq('email', email).order('fecha', { ascending: false }).limit(10)); },
      async guardarNotaClase(r) { ok(await sb.from('clase_notas').upsert({ ...r, actualizado: new Date().toISOString() })); },
      async marcarHabito(fecha, hechos, minima) { ok(await sb.from('habitos_flor').upsert({ fecha, hechos, minima, actualizado: new Date().toISOString() })); },
      async clasesHoy() { const r = await llamar({ modo: 'clases_hoy' }); const j = await r.json().catch(() => ({})); return j.ok ? j.clases || [] : null; },
      async borradoresGmail() { try { const r = await llamar({ modo: 'borradores_gmail' }); const j = await r.json(); return j.borradores || []; } catch (e) { return []; } },
      async borradorMail(q) { const r = await llamar({ modo: 'borrador_mail', ...q }); const j = await r.json().catch(() => ({})); if (!r.ok || !j.ok) throw new Error(j.error || 'No se pudo armar el borrador en Gmail.'); return j; },
      async avisar(q) { try { const r = await llamar({ modo: 'avisar', link: location.origin + location.pathname, ...q }); return r.ok ? r.json() : null; } catch (e) { return null; } },
      async pendientesImportacion() { return ok(await sb.from('importacion').select('email,nombre,datos').is('aplicado', null).order('orden')); },
      async todosPedidos() { return ok(await sb.from('pedidos').select('*').order('creado', { ascending: false }).limit(200)); },
      async responderPedido(id, respuesta, correcciones) { ok(await sb.from('pedidos').update({ respuesta, correcciones, estado: 'respondido', respondido_en: new Date().toISOString() }).eq('id', id)); },
      async todosWeeklies() { return ok(await sb.from('weekly').select('*').not('enviado_en', 'is', null).order('enviado_en', { ascending: false }).limit(200)); },
      async responderWeekly(id, texto) { ok(await sb.from('weekly').update({ respuesta_flor: texto, respondido_en: new Date().toISOString() }).eq('id', id)); },
      async crearTarea(a, texto, donde, orden) { ok(await sb.from('tareas').insert({ alumna_id: a, texto, donde, orden })); },
      async actualizarTarea(id, c) { ok(await sb.from('tareas').update(c).eq('id', id)); },
      async borrarTarea(id) { ok(await sb.from('tareas').delete().eq('id', id)); },
      async borrarTareasHechas(a) { ok(await sb.from('tareas').delete().eq('alumna_id', a).eq('hecha', true)); },
      async crearPatron(a, patron, tipo, estado) { ok(await sb.from('patrones').insert({ alumna_id: a, patron, tipo, estado })); },
      async actualizarPatron(id, c) { ok(await sb.from('patrones').update(c).eq('id', id)); },
      async borrarPatron(id) { ok(await sb.from('patrones').delete().eq('id', id)); },
      async ficha(a) { const { data } = await sb.from('fichas').select('texto').eq('alumna_id', a).maybeSingle(); return (data && data.texto) || ''; },
      async guardarFicha(a, texto) { ok(await sb.from('fichas').upsert({ alumna_id: a, texto, actualizado: new Date().toISOString() })); },
      async guardarPrograma(c) { ok(await sb.from('programa').update(c).eq('id', 1)); },
      async borrador(q) {
        const r = await llamar({ modo: 'borrador', ...q });
        if (!r.ok) throw new Error(await errorDe(r));
        return r.json();
      },
      // ---- bandeja completa: también las alumnas que todavía no crearon su cuenta (tabla importacion) ----
      async importacionTodas() { return ok(await sb.from('importacion').select('email,nombre,datos,weeklies,aplicado').order('orden')); },
      async todosWeekliesAdmin() { return ok(await sb.from('weekly').select('*').order('semana', { ascending: false }).limit(1000)); },
      async todosPedidosAdmin() { return ok(await sb.from('pedidos').select('*').order('creado', { ascending: false }).limit(1000)); },
      async responderWeeklyImp(email, semana, texto) { const r = ok(await sb.rpc('admin_responder_weekly', { p_email: email, p_semana: semana, p_texto: texto })); if (r === 'no_encontrada') throw new Error('No encontré a esa alumna.'); },
      async responderPedidoImp(email, origen, respuesta, correcciones) { ok(await sb.rpc('admin_responder_pedido_imp', { p_email: email, p_origen: origen, p_respuesta: respuesta, p_correcciones: correcciones })); },
      // ---- intentos de la alumna en la tabla de corrección ----
      async intento(clave) { const { data } = await sb.from('intentos').select('*').eq('alumna_id', uid).eq('clave', clave).maybeSingle(); return data; },
      async guardarIntento(clave, respuestas, revelado) { ok(await sb.from('intentos').upsert({ alumna_id: uid, clave, respuestas, revelado: !!revelado, actualizado: new Date().toISOString() })); },
      // ---- Flor AI escucha un audio (transcripción con las palabras dudosas marcadas) ----
      async escuchar(path) {
        const r = await llamar({ modo: 'escuchar', path });
        if (!r.ok) throw new Error(await errorDe(r));
        return (await r.json()).transcripcion;
      },
      async guardarFlor(flor) { ok(await sb.from('programa').update({ flor }).eq('id', 1)); },
      async winsComunidad() { return ok(await sb.rpc('wins_comunidad')) || []; },
      // ---- editar o borrar un pedido (la alumna: mientras Flor no respondió; Flor: siempre) ----
      async editarPedido(id, c) { const d = ok(await sb.from('pedidos').update(c).eq('id', id).select('id')); if (!d || !d.length) throw new Error('Ya no se puede editar: Flor ya lo respondió.'); },
      async borrarPedido(id) { const d = ok(await sb.from('pedidos').delete().eq('id', id).select('id')); if (!d || !d.length) throw new Error('Ya no se puede borrar: Flor ya lo respondió.'); }
    };
  }

  // ======================= Demo =======================
  function demo() {
    const KEY = 'atw-demo-v1';
    const hoy = lunes();
    const semanaAnt = (n) => { const d = new Date(hoy + 'T12:00:00'); d.setDate(d.getDate() - 7 * n); return lunes(d); };
    const seed = () => ({
      sesion: true, seq: 100,
      perfiles: [
        { id: 'flor', email: 'flor@demo', nombre: 'Flor', rol: 'admin', formato: 'LAB', trabajo: '', objetivo: '', foco_titulo: '', foco_texto: '', modulo_actual: 0, clases_asignadas: [], onboarding: [], activa: true },
        { id: 'val', email: 'valeria@demo', nombre: 'Valeria', rol: 'alumna', formato: 'LAB', trabajo: 'Finanzas (forecast, capex) en una multinacional; presenta números a equipos de EE.UU.',
          objetivo: 'Controlar los nervios, no enredarme al explicar y animarme a dar ideas en reuniones grandes.',
          foco_titulo: 'Ordenar tu mensaje antes de hablar',
          foco_texto: 'Cuando hablas rápido es porque estás ordenando la idea mientras hablas. Esta semana entrenas la estructura antes de entrar a la reunión.',
          modulo_actual: 2, clases_asignadas: ['Organiza tus ideas de manera simple', 'Numbers and Figures'],
          confianza_inicio: 6, confianza_hoy: 7, audio_inicio: '2026-10-31', fecha_inicio: semanaAnt(5), camino_hecho: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2.1', '2.2', '2.3', '3.1', '3.2', '3.3', '4.1', '4.2', '4.3', '5.1', '5.2'], compromisos: [0, 1, 2], drive_url: 'https://drive.google.com/', onboarding: [0, 1, 2, 3], activa: true },
        { id: 'car', email: 'carla@demo', nombre: 'Carla', rol: 'alumna', formato: '1:1', trabajo: 'Product manager en una startup', objetivo: '', foco_titulo: '', foco_texto: '', modulo_actual: 0, clases_asignadas: [], onboarding: [0], activa: true }
      ],
      tareas: [
        { id: 1, alumna_id: 'val', texto: 'Ver la clase "Organiza tus ideas de manera simple"', donde: 'Módulo 2 · Communicate in Real Time', hecha: true, orden: 1 },
        { id: 2, alumna_id: 'val', texto: 'Grabar un audio de 2–3 min con Main point → Why → Next', donde: 'Mándalo desde "Pedir feedback"', hecha: false, orden: 2 },
        { id: 3, alumna_id: 'val', texto: 'Mandar una reunión real de esta semana', donde: 'Cambia los datos confidenciales si quieres', hecha: false, orden: 3 },
        { id: 4, alumna_id: 'val', texto: 'Ver la clase "Numbers and Figures"', donde: 'Módulo 3 · million, billion, trillion', hecha: false, orden: 4 }
      ],
      weekly: [1, 2, 3, 4, 5, 6].map((n, i) => ({ id: 10 + i, alumna_id: 'val', semana: semanaAnt(n), respuestas: { wins: 'Hablé en la daily sin leer.', situacion: 'Update de capex' }, enviado_en: semanaAnt(n) + 'T10:00:00Z', respuesta_flor: n === 1 ? 'Muy bien el win. Esta semana trabajamos el orden: Main point → Why → Next.' : 'Leído. Seguimos con tu foco.' }))
        .concat([{ id: 30, alumna_id: 'car', semana: hoy, respuestas: { wins: 'Me animé a preguntar en la reunión de producto.', donde: 'Semana 1, onboarding', foco: 'Grabar mi Starting Point', training1: 'Martes 8 h · Role Play del roadmap', situacion: 'Presentar el roadmap del trimestre', necesito: 'Me trabo cuando me interrumpen.' }, enviado_en: new Date().toISOString(), respuesta_flor: null }]),
      pedidos: [
        { id: 40, alumna_id: 'val', tipo: 'audio', titulo: 'Audio del update de capex', texto: 'Les comparto el update de capex: we are ten millions dollars below forecast and the main reason is because the directors of each businesses delayed approvals.', link: '', estado: 'respondido',
          respuesta: 'Explicaste la variación, las causas y lo que seguía. Ahora vamos a ordenarlo: primero el dato principal, después el por qué. Marca una pausa en cada first y second para darte tiempo a pensar.',
          correcciones: [{ mal: 'ten millions dollars', bien: 'ten million dollars' }, { mal: 'the main reason is because…', bien: 'the main reason is… / this is because…' }, { mal: 'the directors of each businesses', bien: 'the directors of each business' }],
          creado: semanaAnt(1) + 'T15:00:00Z', respondido_en: semanaAnt(1) + 'T20:00:00Z' },
        { id: 41, alumna_id: 'car', tipo: 'mail', titulo: 'Mail al equipo de diseño', texto: 'Hi team, I want to ask you if is possible to move the review for next week because we dont have the data yet.', link: '', estado: 'pendiente', respuesta: null, correcciones: [], creado: new Date().toISOString() }
      ],
      patrones: [
        { id: 50, alumna_id: 'val', patron: '"million" con número exacto, sin s', tipo: 'Falta de base', estado: 'Practicando' },
        { id: 51, alumna_id: 'val', patron: '"the reason is because" → "the reason is"', tipo: 'Fosilizado', estado: 'Practicando' },
        { id: 52, alumna_id: 'val', patron: '"each" + singular', tipo: 'Fosilizado', estado: 'Resuelto' },
        { id: 53, alumna_id: 'val', patron: 'Billion = mil millones', tipo: 'Falso amigo', estado: 'Resuelto' }
      ],
      programa: {
        id: 1,
        proximo_lab: { fecha: 'Sábado 7 de noviembre', horario: '18:00 Argentina · 15:00 Costa Rica · 15:00 México', tema: 'Cómo dar un update claro en una reunión', link: 'https://zoom.us/' },
        links: { plataforma: 'https://academy.breakingbarriers.site', reservar: 'https://calendly.com/', comunidad: 'https://chat.whatsapp.com/', whatsapp_flor: 'https://wa.me/' },
        fechas: [{ cuando: 'Sáb 7 nov', que: 'Lab · 18:00 Argentina' }, { cuando: 'Lun 9 nov', que: 'Weekly report' }, { cuando: 'Antes del 30 nov', que: 'Reserva tu 1:1 de noviembre' }, { cuando: 'Fin de año', que: 'Receso de labs' }],
        aviso: ''
      },
      documentos: [{ id: 60, alumna_id: 'val', tipo: 'acuerdo', nombre: 'Acuerdo de Trabajo firmado.pdf', path: 'val/documentos/acuerdo.pdf', creado: semanaAnt(5) + 'T12:00:00Z' }],
      chats: [], mensajes: []
    });
    let S;
    try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (e) { S = seed(); }
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
    const id = () => ++S.seq;
    const yo = () => (new URLSearchParams(location.search).get('como') === 'flor' ? 'flor' : 'val');
    const copia = (x) => JSON.parse(JSON.stringify(x));
    const espera = (ms) => new Promise((r) => setTimeout(r, ms));
    let authCb = () => {};

    return {
      demo: true, lunes,
      reiniciar() { S = seed(); save(); },
      async sesion() { return S.sesion ? { user: { id: yo() } } : null; },
      onAuth(cb) { authCb = cb; },
      async login() { S.sesion = true; save(); authCb('SIGNED_IN', { user: { id: yo() } }); },
      async logout() { S.sesion = false; save(); authCb('SIGNED_OUT', null); },
      async recuperar() {}, async cambiarClave() {},
      async miPerfil() { const p = copia(S.perfiles.find((x) => x.id === yo())); if (p.id === 'val') p.rol = 'admin'; return p; },
      async marcarCoaches(si) { const p = S.perfiles.find((x) => x.id === yo()); p.coaches_instalados = si ? new Date().toISOString() : null; save(); },
      async guardarMiPerfil(c) { const p = S.perfiles.find((x) => x.id === yo()); for (const k of ['nombre', 'objetivo', 'onboarding', 'camino_hecho', 'compromisos']) if (c[k] != null) p[k] = c[k]; save(); },
      async subirArchivo(file, carpeta, a = yo()) { await espera(200); return a + '/' + carpeta + '/' + file.name; },
      async urlArchivo() { return '#'; },
      async documentos(a = yo()) { return copia((S.documentos || []).filter((d) => d.alumna_id === a)); },
      async agregarDocumento(tipo, nombre, path, a = yo()) { (S.documentos = S.documentos || []).unshift({ id: id(), alumna_id: a, tipo, nombre, path, creado: new Date().toISOString() }); save(); },
      async subirDocumento(a, file, tipo, nombre) { (S.documentos = S.documentos || []).unshift({ id: id(), alumna_id: a, tipo, nombre: nombre || file.name, path: a + '/documentos/' + file.name, creado: new Date().toISOString() }); save(); },
      async borrarDocumento(d) { S.documentos = (S.documentos || []).filter((x) => x.id !== d.id); save(); },
      async tareas(a = yo()) { return copia(S.tareas.filter((t) => t.alumna_id === a).sort((x, y) => x.orden - y.orden)); },
      async marcarTarea(tid, hecha) { const t = S.tareas.find((x) => x.id === tid); if (t) t.hecha = hecha; save(); },
      async weeklies(a = yo()) { return copia(S.weekly.filter((w) => w.alumna_id === a).sort((x, y) => (x.semana < y.semana ? 1 : -1))); },
      async guardarWeekly(semana, respuestas, enviar) {
        let w = S.weekly.find((x) => x.alumna_id === yo() && x.semana === semana);
        if (!w) { w = { id: id(), alumna_id: yo(), semana, respuestas: {}, enviado_en: null, respuesta_flor: null }; S.weekly.push(w); }
        w.respuestas = respuestas; if (enviar) w.enviado_en = new Date().toISOString(); save();
      },
      async todosResumenes() { return copia(S.resumenes || []); },
      async resumenes(a = yo()) { return copia((S.resumenes || []).filter((r) => r.alumna_id === a)); },
      async pedidos(a = yo()) { return copia(S.pedidos.filter((p) => p.alumna_id === a).sort((x, y) => (x.creado < y.creado ? 1 : -1))); },
      async crearPedido(p) { S.pedidos.push({ id: id(), alumna_id: yo(), estado: 'pendiente', respuesta: null, correcciones: [], creado: new Date().toISOString(), ...p }); save(); },
      async patrones(a = yo()) { return copia(S.patrones.filter((p) => p.alumna_id === a)); },
      async programa() { return copia(S.programa); },
      async chats() { return copia(S.chats.filter((c) => c.alumna_id === yo()).sort((x, y) => y.id - x.id)); },
      async crearChat(coach) { const c = { id: id(), alumna_id: yo(), coach, titulo: 'Nueva conversación', creado: new Date().toISOString() }; S.chats.push(c); save(); return copia(c); },
      async borrarChat(cid) { S.chats = S.chats.filter((c) => c.id !== cid); S.mensajes = S.mensajes.filter((m) => m.chat_id !== cid); save(); },
      async mensajes(cid) { return copia(S.mensajes.filter((m) => m.chat_id === cid)); },
      async enviar(cid, mensaje, onDelta) {
        const c = S.chats.find((x) => x.id === cid);
        if (!S.mensajes.some((m) => m.chat_id === cid)) c.titulo = mensaje.slice(0, 60);
        S.mensajes.push({ id: id(), chat_id: cid, rol: 'user', contenido: mensaje });
        const txt = 'Esta es la **versión demo**, así que todavía no respondo de verdad. Cuando Flor conecte la app a Supabase y a su clave de Anthropic, acá vas a hablar con ' +
          (c.coach === 'flor' ? 'Flor AI' : 'tu coach') + ', que ya conoce tu foco, tus tareas, tu feedback y tu progreso.\n\nMientras tanto, fíjate: ¿cuál es la situación real de tu trabajo que, si la entrenas esta semana, más cambia cómo te sientes hablando inglés?';
        let out = '';
        for (const w of txt.split(/(\s+)/)) { out += w; onDelta(out); await espera(12); }
        S.mensajes.push({ id: id(), chat_id: cid, rol: 'assistant', contenido: out }); save();
        return out;
      },
      async alumnas() { return copia(S.perfiles); },
      async actualizarPerfil(pid, c) { Object.assign(S.perfiles.find((x) => x.id === pid), c); save(); },
      async invitar(email, nombre) { S.perfiles.push({ id: 'a' + id(), email, nombre: nombre || email.split('@')[0], rol: 'alumna', formato: 'LAB', trabajo: '', objetivo: '', foco_titulo: '', foco_texto: '', modulo_actual: 0, clases_asignadas: [], onboarding: [], activa: true }); save(); },
      async pedidoDeFlor(p) { S.pedidos.push({ id: id(), estado: 'pendiente', respuesta: null, correcciones: [], creado: new Date().toISOString(), ...p }); save(); },
      async pendientesImportacion() { return []; },
      async borradores() { return []; },
      async habitos(desde) { return copia((S.habitos || []).filter((r) => r.fecha >= desde)); },
      async hoyFlor(f) { const i = new Date(); i.setHours(15, 0, 0, 0); return [{ fecha: f, clave: 'clase:demo', tipo: 'clase', orden: 1, titulo: 'Ana · 1:1 · Week 5 · Dar un update', detalle: 'Objetivo: contar el avance del proyecto en tres frases.', link: 'https://docs.google.com/document/d/demo/edit', meet: 'https://meet.google.com/demo', inicio: i.toISOString(), invitadas: ['ana@demo.com'] }, { fecha: f, clave: 'reel:demo', tipo: 'grabar', orden: 1, titulo: 'Reel a cámara · Te faltan TUS frases', detalle: '≈40 s, vertical, mirá al lente.', link: 'https://www.canva.com/folder/demo', link2: 'https://app.notion.com/p/demo', texto: 'Caption de ejemplo…', texto2: 'Tu inglés en las reuniones no está mal…\nsolo te faltan tres palabras.' }]; },
      async hoyHecho() {},
      async labsFlor() { return copia(S.labs || [{ fecha: S.programa.proximo_lab.iso || lunes(), clave: 'lab:guion', tipo: 'otro', titulo: 'Lab de ejemplo', texto: '## Step 1 · Welcome\n- **"Hi everyone!"**\n- Paste in the chat: A, B or C', texto2: '', link: 'https://docs.google.com/document/d/demo/edit' }]); },
      async guardarLabFlor(f, clave, c) { S.labs = S.labs || []; let x = S.labs.find((r) => r.fecha === f && r.clave === clave); if (!x) S.labs.push((x = { fecha: f, clave, tipo: 'otro' })); Object.assign(x, c); save(); },
      async claseOk() {},
      async notasClase(email) { return copia((S.notas || []).filter((r) => r.email === email)); },
      async guardarNotaClase(r) { S.notas = (S.notas || []).filter((x) => !(x.email === r.email && x.fecha === r.fecha)).concat([r]); save(); },
      async marcarHabito(fecha, hechos, minima) { S.habitos = (S.habitos || []).filter((r) => r.fecha !== fecha).concat([{ fecha, hechos, minima }]); save(); },
      async clasesHoy() { return []; },
      async borradoresGmail() { return []; },
      async borradorMail() { return { ok: true, link: '' }; },
      async avisar() { return null; },
      async todosPedidos() { return copia(S.pedidos.sort((x, y) => (x.creado < y.creado ? 1 : -1))); },
      async responderPedido(pid, respuesta, correcciones) { Object.assign(S.pedidos.find((x) => x.id === pid), { respuesta, correcciones, estado: 'respondido', respondido_en: new Date().toISOString() }); save(); },
      async todosWeeklies() { return copia(S.weekly.filter((w) => w.enviado_en).sort((x, y) => (x.enviado_en < y.enviado_en ? 1 : -1))); },
      async responderWeekly(wid, texto) { Object.assign(S.weekly.find((x) => x.id === wid), { respuesta_flor: texto, respondido_en: new Date().toISOString() }); save(); },
      async crearTarea(a, texto, donde, orden) { S.tareas.push({ id: id(), alumna_id: a, texto, donde, orden, hecha: false }); save(); },
      async actualizarTarea(tid, c) { Object.assign(S.tareas.find((x) => x.id === tid), c); save(); },
      async borrarTarea(tid) { S.tareas = S.tareas.filter((x) => x.id !== tid); save(); },
      async borrarTareasHechas(a) { S.tareas = S.tareas.filter((x) => !(x.alumna_id === a && x.hecha)); save(); },
      async crearPatron(a, patron, tipo, estado) { S.patrones.push({ id: id(), alumna_id: a, patron, tipo, estado }); save(); },
      async actualizarPatron(pid, c) { Object.assign(S.patrones.find((x) => x.id === pid), c); save(); },
      async borrarPatron(pid) { S.patrones = S.patrones.filter((x) => x.id !== pid); save(); },
      async guardarPrograma(c) { Object.assign(S.programa, c); save(); },
      async borrador() { await espera(400); return { respuesta: '(Demo) Acá aparece el borrador que arma la IA con tu voz y tu criterio. Lo editas y lo envías.', correcciones: [{ mal: 'if is possible', bien: 'if it is possible' }, { mal: 'we dont have', bien: "we don't have" }], foco: 'Ordenar tu update antes de hablar', foco_texto: 'Tu mensaje se pierde cuando arrancas por el detalle.', tareas: [{ texto: 'Ver M2 · The Message Map', donde: 'Módulo 2' }], notas: '(Demo) Notas para ti.' }; },
      async ficha(a) { return (S.fichas || {})[a] || ''; },
      async guardarFicha(a, t) { (S.fichas = S.fichas || {})[a] = t; save(); },
      async backupDiario() { return null; },
      async copiarDrive() { return null; },
      async importacionTodas() { return []; },
      async todosWeekliesAdmin() { return copia(S.weekly); },
      async todosPedidosAdmin() { return copia(S.pedidos); },
      async responderWeeklyImp() {}, async responderPedidoImp() {},
      async intento(clave) { return copia((S.intentos || {})[clave] || null); },
      async guardarIntento(clave, respuestas, revelado) { (S.intentos = S.intentos || {})[clave] = { clave, respuestas, revelado }; save(); },
      async escuchar() { await espera(400); return 'TRANSCRIPCIÓN AUTOMÁTICA (demo): So overall we are on [track?] and the main reason is because the directors delayed the [approvals?].'; },
      async guardarFlor(flor) { S.programa.flor = flor; save(); },
      async winsComunidad() { return S.weekly.filter((w) => w.enviado_en && w.respuestas.win).map((w) => ({ nombre: (S.perfiles.find((p) => p.id === w.alumna_id) || {}).nombre, semana: w.semana, wins: w.respuestas.win })); },
      async editarPedido(pid, c) { Object.assign(S.pedidos.find((x) => x.id === pid), c); save(); },
      async borrarPedido(pid) { S.pedidos = S.pedidos.filter((x) => x.id !== pid); save(); }
    };
  }

  window.DB = DEMO ? demo() : supa();
})();
