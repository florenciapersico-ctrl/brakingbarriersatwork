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
