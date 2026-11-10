/**
 * AT WORK · Copia a Drive
 * Recibe de la función flor-ai (Supabase) un archivo que la alumna subió a la app y lo guarda en su
 * carpeta personal de Drive, en la subcarpeta que corresponde (01 a 05).
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
 * El script no lee nada de Drive salvo la carpeta de la alumna que le indica la función, y solo si el
 * secreto coincide.
 */
function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    var secreto = PropertiesService.getScriptProperties().getProperty('SECRETO');
    if (!secreto || p.secreto !== secreto) return salida({ ok: false, error: 'secreto' });

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
    return salida({ ok: true, link: archivo.getUrl() });
  } catch (err) {
    return salida({ ok: false, error: String(err).slice(0, 200) });
  }
}

function salida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
