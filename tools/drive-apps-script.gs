/**
 * AT WORK · Copia a Drive y avisos por mail
 * 1) Recibe de la función flor-ai (Supabase) un archivo que la alumna subió a la app y lo guarda en su
 *    carpeta personal de Drive, en la subcarpeta que corresponde (01 a 05).
 * 2) Cuando Flor responde un feedback o un weekly en la app, le manda a la alumna un mail corto
 *    desde la cuenta de Google de Flor ("Tienes feedback nuevo de Flor" + botón a la app).
 *
 * Cómo publicarlo (una sola vez, desde la cuenta de Google de Flor):
 * 1. Entrá a script.google.com › Nuevo proyecto. Nombre: "AT WORK · Copia a Drive". Pegá este archivo entero.
 * 2. Configuración del proyecto (ícono de engranaje) › Propiedades del script › Agregar propiedad:
 *      SECRETO = una clave larga que inventás (la misma que vas a poner en Supabase como DRIVE_SECRET).
 * 3. Implementar › Nueva implementación › Tipo: Aplicación web.
 *      Ejecutar como: Yo.  Quién tiene acceso: Cualquier persona.  › Implementar › Autorizar.
 * 4. Copiá la URL que termina en /exec.
 * 5. En Supabase › Edge Functions › Secrets agregá:
 *      DRIVE_SCRIPT_URL = esa URL
 *      DRIVE_SECRET     = la misma clave del paso 2
 * 3) Lee un audio que una alumna mandó como link de Drive, para que la app lo escuche y le dé feedback.
 * 4) Cada 15 minutos revisa las carpetas 02, 04 y 05 de cada alumna: lo que suban a Drive aparece en la
 *    app como pedido de feedback (y si es un audio, la app lo escucha y te deja el borrador en la bandeja).
 *    Para prenderlo: en el editor elegí la función activarRevision y tocá Ejecutar (una sola vez).
 * 5) Cuando creás una alumna en la app sin link de Drive, le crea su carpeta (con 01 a 05) dentro de
 *    "AT WORK · Alumnas" y se la comparte. Si querés usar otra carpeta madre, agregá la propiedad
 *    CARPETA_ALUMNAS con su id. Si tenés una carpeta modelo, agregá PLANTILLA con su id y copia sus subcarpetas.
 * 6) Cada 15 minutos (con la misma revisión) lee los mails que Flor mandó con la etiqueta "AT WORK/Enviado a alumnas":
 *    si es la respuesta a una tarea, a un weekly o un "Feedback de…", la app lo marca respondido con su texto.
 *    La primera vez que se agrega esto hay que ejecutar activarRevision a mano para darle permiso a Gmail.
 * 7) Cuando Flor responde en la bandeja de la app, arma el mail completo como BORRADOR en su Gmail
 *    (a la alumna, con Flor en CCO). Nunca envía nada: lo revisa y lo manda Flor.
 * Si ya lo tenías publicado: pegá esta versión y hacé Implementar › Gestionar implementaciones › editar › Versión nueva.
 * El script solo actúa si el secreto coincide: guarda en la carpeta de la alumna que le indica la función
 * y lee únicamente el archivo de audio que le pide la función.
 */
function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    var secreto = PropertiesService.getScriptProperties().getProperty('SECRETO');
    if (!secreto || p.secreto !== secreto) return salida({ ok: false, error: 'secreto' });

    if (p.accion === 'mail') {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.para || '')) return salida({ ok: false, error: 'mail' });
      MailApp.sendEmail({ to: p.para, subject: p.asunto || 'Tienes feedback nuevo de Flor', htmlBody: p.html || '', name: 'Flor · AT WORK' });
      return salida({ ok: true });
    }

    // 7) Flor respondió en la app: el mail completo queda como BORRADOR en su Gmail (no se envía nada).
    //    Si la alumna mandó la tarea por mail, el borrador es la respuesta en ese mismo hilo.
    if (p.accion === 'borrador') return salida(armarBorrador(p));

    // 8) Buscar la tarea en la carpeta de la alumna: lista los archivos que subió o cambió desde una fecha.
    if (p.accion === 'buscar') return salida(buscarEnCarpeta(p));

    // 5) Alumna nueva: le crea su carpeta con las subcarpetas 01 a 05 y se la comparte.
    if (p.accion === 'crear_carpeta') return salida(crearCarpetaAlumna(p.nombre, p.email));

    if (p.accion === 'leer') {
      var f0 = DriveApp.getFileById(p.id);
      if (f0.getMimeType() === 'application/vnd.google-apps.document') {
        return salida({ ok: true, nombre: f0.getName(), mime: 'text/plain', texto: DocumentApp.openById(p.id).getBody().getText().slice(0, 60000) });
      }
      if (f0.getSize() > 30 * 1024 * 1024) return salida({ ok: false, error: 'el archivo pesa más de 30 MB' });
      var b0 = f0.getBlob();
      return salida({ ok: true, nombre: f0.getName(), mime: b0.getContentType(), base64: Utilities.base64Encode(b0.getBytes()) });
    }

    var raiz = DriveApp.getFolderById(p.carpeta);
    var destino = raiz;
    var subs = raiz.getFolders();
    while (subs.hasNext()) {
      var f = subs.next();
      if (f.getName().indexOf(p.subcarpeta) === 0) { destino = f; break; }
    }
    var r = UrlFetchApp.fetch(p.url, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return salida({ ok: false, error: 'descarga ' + r.getResponseCode() });
    var hoy = Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
    var archivo = destino.createFile(r.getBlob().setName(hoy + ' · ' + (p.nombre || 'archivo')));
    archivo.setDescription('AT WORK app'); // así la revisión de carpetas no lo vuelve a cargar como nuevo
    return salida({ ok: true, link: archivo.getUrl() });
  } catch (err) {
    return salida({ ok: false, error: String(err).slice(0, 200) });
  }
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Drive → app ----------
var FUNCION = 'https://mcjjzpuvvorugqpjyxza.supabase.co/functions/v1/flor-ai';
var REVISAR = ['02', '04', '05'];

function activarRevision() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'revisarCarpetas') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('revisarCarpetas').timeBased().everyMinutes(15).create();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('DESDE')) props.setProperty('DESDE', String(Date.now() - 3 * 24 * 3600 * 1000)); // arranca con los últimos 3 días
  revisarCarpetas();
}

function llamar(o) {
  o.secreto = PropertiesService.getScriptProperties().getProperty('SECRETO');
  var r = UrlFetchApp.fetch(FUNCION, { method: 'post', contentType: 'application/json', payload: JSON.stringify(o), muteHttpExceptions: true });
  try { return JSON.parse(r.getContentText()); } catch (e) { return { ok: false, error: r.getContentText().slice(0, 200) }; }
}

function revisarCarpetas() {
  try { revisarEnviados(); } catch (e) { console.error('gmail', e); }
  var props = PropertiesService.getScriptProperties();
  var desde = Number(props.getProperty('DESDE') || (Date.now() - 24 * 3600 * 1000));
  var ahora = Date.now();
  var lista = llamar({ modo: 'drive_lista' });
  if (!lista.ok) { console.error('drive_lista', lista.error); return; }
  lista.alumnas.forEach(function (a) {
    try {
      var subs = DriveApp.getFolderById(a.carpeta).getFolders();
      while (subs.hasNext()) {
        var sub = subs.next(), cod = sub.getName().slice(0, 2);
        if (REVISAR.indexOf(cod) < 0) continue;
        revisarCarpeta(a, sub, cod, desde);
      }
    } catch (e) { console.error(a.email, e); }
  });
  props.setProperty('DESDE', String(ahora - 60 * 1000));
}

// ---------- Gmail → app ----------
// Flor sigue mandando su feedback por mail. Cada 15 minutos se leen sus mails con la etiqueta
// "AT WORK/Enviado a alumnas" y la app se pone al día: tarea o weekly respondido, con su respuesta.
var ETIQUETA_ENVIADOS = 'AT WORK/Enviado a alumnas';
var ETIQUETA_REVISAR = 'AT WORK/Feedback para revisar';

function revisarEnviados() {
  var props = PropertiesService.getScriptProperties();
  var desde = Number(props.getProperty('DESDE_MAIL') || (Date.now() - 7 * 24 * 3600 * 1000)); // la primera vez, los últimos 7 días
  var ahora = Date.now();
  var yo = Session.getEffectiveUser().getEmail().toLowerCase();
  var q = 'in:sent label:"' + ETIQUETA_ENVIADOS + '" after:' + Math.floor((desde - 3600 * 1000) / 1000);
  var hilos = GmailApp.search(q, 0, 100);
  hilos.forEach(function (h) {
    var ms = h.getMessages();
    var ids = ms.map(function (m) { return m.getId(); });
    ms.forEach(function (m) {
      if (m.getDate().getTime() < desde) return;
      if (m.getFrom().toLowerCase().indexOf(yo) < 0) return; // solo lo que mandó Flor
      var para = (m.getTo().match(/[^\s<>,;"]+@[^\s<>,;"]+/) || [''])[0].toLowerCase();
      if (!para || para === yo) return;
      var r = llamar({ modo: 'gmail_enviado', email: para, asunto: m.getSubject(), fecha: m.getDate().toISOString(), texto: sinCita(m.getPlainBody()), id: m.getId(), hilo: ids });
      if (!r.ok) console.error('gmail_enviado', para, m.getSubject(), r.error || r.destino);
    });
  });
  props.setProperty('DESDE_MAIL', String(ahora - 60 * 1000));
}

function buscarEnCarpeta(p) {
  var m = String(p.carpeta || '').match(/folders\/([\w-]{20,})/);
  if (!m) return { ok: false, error: 'sin carpeta' };
  var desde = p.desde ? new Date(p.desde) : new Date(Date.now() - 14 * 864e5);
  var out = [];
  function rec(f, ruta, prof) {
    var it = f.getFiles();
    while (it.hasNext()) {
      var x = it.next();
      if (x.getLastUpdated() >= desde) out.push({ id: x.getId(), nombre: x.getName(), mime: x.getMimeType(), fecha: x.getLastUpdated().toISOString(), carpeta: ruta, duena: (x.getOwner() ? x.getOwner().getEmail() : '') });
    }
    if (prof < 3) { var sub = f.getFolders(); while (sub.hasNext()) { var s = sub.next(); rec(s, ruta + '/' + s.getName(), prof + 1); } }
  }
  rec(DriveApp.getFolderById(m[1]), '', 0);
  out.sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  return { ok: true, archivos: out.slice(0, 60) };
}

function armarBorrador(p) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.para || '')) return { ok: false, error: 'mail de la alumna' };
  var yo = Session.getEffectiveUser().getEmail();
  var op = { htmlBody: p.html || '', bcc: yo, name: 'Florencia Persico' };
  var borrador = null;
  if (p.responder) {
    try {
      var original = GmailApp.getMessageById(p.responder);
      if (original && original.getFrom().toLowerCase().indexOf(String(p.para).toLowerCase()) >= 0) borrador = original.createDraftReply(p.texto || '', op);
    } catch (e) { console.error('responder', e); }
  }
  if (!borrador) borrador = GmailApp.createDraft(p.para, p.asunto || 'Feedback', p.texto || '', op);
  var hilo = borrador.getMessage().getThread();
  var et = GmailApp.getUserLabelByName(ETIQUETA_ENVIADOS) || GmailApp.createLabel(ETIQUETA_ENVIADOS);
  hilo.addLabel(et); // así, cuando Flor lo manda, la revisión de Enviados lo encuentra
  // Y la etiqueta "AT WORK/Feedback para revisar": ahí quedan todos los borradores que arma la app, para que Flor los revise y los mande.
  var rev = GmailApp.getUserLabelByName(ETIQUETA_REVISAR) || GmailApp.createLabel(ETIQUETA_REVISAR);
  hilo.addLabel(rev);
  var link = p.responder && hilo.getMessageCount() > 1 ? hilo.getPermalink() : 'https://mail.google.com/mail/u/0/#drafts?compose=' + borrador.getMessage().getId();
  return { ok: true, asunto: borrador.getMessage().getSubject(), link: link };
}

// Saca del cuerpo el mail anterior que Gmail cita debajo de la respuesta.
function sinCita(t) {
  t = String(t || '');
  var corte = t.search(/\n\s*(On [\s\S]{5,300}?wrote:|El [\s\S]{5,300}?escribió:)/);
  if (corte > 0) t = t.slice(0, corte);
  return t.replace(/\n{3,}/g, '\n\n').trim().slice(0, 40000);
}

function revisarCarpeta(a, carpeta, cod, desde) {
  var fs = carpeta.getFiles();
  while (fs.hasNext()) {
    var f = fs.next();
    if (f.getDateCreated().getTime() < desde) continue;
    if (f.getDescription() === 'AT WORK app') continue; // vino de la app
    if (/^application\/vnd\.google-apps\.folder/.test(f.getMimeType())) continue;
    llamar({ modo: 'drive_nuevo', email: a.email, archivo: { id: f.getId(), nombre: f.getName(), mime: f.getMimeType(), link: f.getUrl(), subcarpeta: cod, creado: f.getDateCreated().toISOString() } });
  }
  var hijas = carpeta.getFolders(); // subcarpetas adentro (ej. 04 › noviembre)
  while (hijas.hasNext()) revisarCarpeta(a, hijas.next(), cod, desde);
}

// ---------- Carpeta de una alumna nueva ----------
var SUBS = ['01 · MI PUNTO DE PARTIDA', '02 · MI MATERIAL REAL', '03 · MIS SESIONES', '04 · MIS PRÁCTICAS', '05 · MIS WEEKLY REPORTS'];
function crearCarpetaAlumna(nombre, email) {
  var props = PropertiesService.getScriptProperties();
  var madreId = props.getProperty('CARPETA_ALUMNAS'), madre;
  if (madreId) madre = DriveApp.getFolderById(madreId);
  else {
    var it = DriveApp.getFoldersByName('AT WORK · Alumnas');
    madre = it.hasNext() ? it.next() : DriveApp.createFolder('AT WORK · Alumnas');
    props.setProperty('CARPETA_ALUMNAS', madre.getId());
  }
  var titulo = (nombre || email || 'Alumna').trim();
  var ya = madre.getFoldersByName(titulo);
  var carpeta = ya.hasNext() ? ya.next() : madre.createFolder(titulo);
  var nombres = SUBS;
  var plantilla = props.getProperty('PLANTILLA');
  if (plantilla) {
    nombres = []; var ps = DriveApp.getFolderById(plantilla).getFolders();
    while (ps.hasNext()) nombres.push(ps.next().getName());
    nombres.sort();
  }
  nombres.forEach(function (n) { if (!carpeta.getFoldersByName(n).hasNext()) carpeta.createFolder(n); });
  if (email) { try { carpeta.addEditor(email); } catch (e) { console.error('compartir', e); } }
  return { ok: true, link: carpeta.getUrl(), id: carpeta.getId() };
}
