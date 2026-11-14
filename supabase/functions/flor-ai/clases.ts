// Clases 1:1 que se cierran solas, sin depender de Claude en la nube.
// El Apps Script de Flor (cada 5 min, en su cuenta de Google) busca la transcripción de cada clase que terminó
// (notas de Gemini) y la manda acá; esta función arma el resumen con el método de Flor, lo revisa contra la
// transcripción (control de calidad), carga resumen, tareas, foco y patrones en la app, y le devuelve al
// script el mail listo para mandar desde el Gmail de Flor. Los labs NUNCA llevan resumen ni mail.
//
// Estados en hoy_flor (fila de la clase): texto = transcripción · texto2 = borrador (JSON) antes del control.
//   modo clase_fuente  { email, fecha, titulo, texto, fuente, hoja? }  → guarda la transcripción y arranca el resumen
//   modo clase_mails   {}                                              → avanza lo pendiente y devuelve los mails listos
//   modo clase_enviado { fecha, clave }                               → marca el mail como enviado (botón verde)
// Todos piden el secreto del Apps Script (DRIVE_SECRET).

// deno-lint-ignore-file no-explicit-any
type Ctx = { admin: any; ia: () => any; prompt: (n: string) => Promise<string>; model: string };

const esLab = (t: string, clave = "") => clave === "clase:lab" || /(^|\s)(🧪|working\s+lab|lab\s*\d|lab\b)/i.test(t || "");
const hoyAR = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const esc = (s: string) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const links = (s: string) => esc(s).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}">${u}</a>`).replace(/\n/g, "<br>");

function jsonDe(txt: string): any {
  const t = String(txt || "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return JSON.parse(a >= 0 ? t.slice(a, b + 1) : t);
}

async function pedir(c: Ctx, system: string, user: string, effort = "medium"): Promise<any> {
  const r = await c.ia().messages.create({
    model: c.model, max_tokens: 16000, output_config: { effort },
    system: [{ type: "text", text: system }], messages: [{ role: "user", content: user }],
  } as any);
  const txt = r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
  return jsonDe(txt);
}

async function filaClase(admin: any, fecha: string, email: string) {
  const { data } = await admin.from("hoy_flor").select("*").eq("fecha", fecha).eq("tipo", "clase").contains("invitadas", [email]);
  return (data || []).find((x: any) => !esLab(x.titulo, x.clave)) || null;
}

// ---------- 1. el script manda la transcripción ----------
export async function claseFuente(c: Ctx, body: any) {
  const email = String(body.email || "").toLowerCase().trim();
  const fecha = String(body.fecha || hoyAR()).slice(0, 10);
  const texto = String(body.texto || "").trim();
  if (esLab(body.titulo)) return { ok: true, lab: true };
  if (!email || texto.length < 500) return { ok: false, error: "sin transcripción" };
  const { data: perfil } = await c.admin.from("perfiles").select("id").ilike("email", email).maybeSingle();
  if (!perfil) return { ok: false, error: "alumna no encontrada" };
  const fila = await filaClase(c.admin, fecha, email);
  if (!fila) return { ok: false, error: "la clase no está en hoy_flor" };
  if (fila.enviado_en) return { ok: true, ya: true };
  const { data: nota } = await c.admin.from("clase_notas").select("vino").ilike("email", email).eq("fecha", fecha).maybeSingle();
  if (nota && nota.vino === false) {
    await c.admin.from("hoy_flor").update({ estado: "No vino: no se manda resumen", actualizado: new Date().toISOString() }).eq("fecha", fecha).eq("clave", fila.clave);
    return { ok: true, no_vino: true };
  }
  const cambios: any = { hecho: true, actualizado: new Date().toISOString() };
  if (!fila.texto || fila.texto.length < texto.length) {
    cambios.texto = `FUENTE: ${String(body.fuente || "gemini").slice(0, 200)}\nHOJA: ${String(body.hoja || fila.link || "")}\n\n${texto.slice(0, 120000)}`;
  }
  const { data: ya } = await c.admin.from("resumenes").select("id").eq("alumna_id", perfil.id).eq("fecha", fecha).limit(1);
  if (!ya || !ya.length) cambios.estado = "Encontré la grabación: armando el resumen.";
  await c.admin.from("hoy_flor").update(cambios).eq("fecha", fecha).eq("clave", fila.clave);
  return { ok: true };
}

// ---------- 2. avanzar lo pendiente y devolver los mails listos ----------
export async function claseMails(c: Ctx) {
  const hoy = hoyAR(), ayer = new Date(Date.parse(hoy) - 86400000).toISOString().slice(0, 10);
  const { data: filas } = await c.admin.from("hoy_flor").select("*").in("fecha", [ayer, hoy]).eq("tipo", "clase").is("enviado_en", null);
  const listos: any[] = [], trabajos: Promise<any>[] = [];
  for (const f of filas || []) {
    if (esLab(f.titulo, f.clave)) {
      await c.admin.from("hoy_flor").update({ enviado_en: new Date().toISOString(), estado: "Lab: no se manda resumen a las alumnas (regla de Flor, 14/11)." }).eq("fecha", f.fecha).eq("clave", f.clave);
      continue;
    }
    const email = (f.invitadas || [])[0];
    if (!email) continue;
    const { data: perfil } = await c.admin.from("perfiles").select("id,email,nombre,apodo").ilike("email", email).maybeSingle();
    if (!perfil) continue;
    const { data: res } = await c.admin.from("resumenes").select("asunto,texto,origen").eq("alumna_id", perfil.id).eq("fecha", f.fecha).limit(1).maybeSingle();
    if (res) {
      if (res.origen && /^clase:/.test(res.origen)) { // solo los que arma esta función (los demás los maneja Flor o la tarea de Claude)
        let html = "";
        try { const j = JSON.parse(f.texto2 || "{}"); if (j.__final) html = mailHTML(j); } catch { /* sin html guardado */ }
        listos.push({ fecha: f.fecha, clave: f.clave, email: perfil.email.toLowerCase(), asunto: res.asunto, texto: res.texto, html: html || links(res.texto) });
      }
      continue;
    }
    if (!f.texto || f.texto.length < 500) continue;
    // Un paso por corrida para no pasarnos del tiempo de la función: borrador → control de calidad → guardado.
    const marca = Date.parse(f.actualizado || 0);
    if (/^(Armando|Revisando)/.test(f.estado || "") && Date.now() - marca < 6 * 60 * 1000) continue; // ya está en curso
    trabajos.push(f.texto2 ? revisarYGuardar(c, f, perfil) : armarBorrador(c, f, perfil));
  }
  if (trabajos.length) (globalThis as any).EdgeRuntime?.waitUntil?.(Promise.allSettled(trabajos));
  return { ok: true, mails: listos };
}

export async function claseEnviado(c: Ctx, body: any) {
  const fecha = String(body.fecha || "").slice(0, 10), clave = String(body.clave || "");
  if (!fecha || !clave) return { ok: false };
  await c.admin.from("hoy_flor").update({ hecho: true, enviado_en: new Date().toISOString(), estado: null }).eq("fecha", fecha).eq("clave", clave);
  return { ok: true };
}

// ---------- borrador ----------
async function contextoAlumna(c: Ctx, f: any, perfil: any) {
  const { data: prev } = await c.admin.from("resumenes").select("fecha,texto").eq("alumna_id", perfil.id).lt("fecha", f.fecha).order("fecha", { ascending: false }).limit(2);
  const d = new Date(f.fecha + "T12:00:00Z");
  return `ALUMNA: ${perfil.nombre} · apodo: ${perfil.apodo || String(perfil.nombre || "").split(" ")[0]}
CLASE: ${f.titulo} · ${DIAS[d.getUTCDay()]} ${f.fecha.slice(8, 10)}/${f.fecha.slice(5, 7)}
OBJETIVO DE LA CLASE: ${f.detalle || "(no figura)"}
HOJA DE LA CLASE (material): ${f.link || "(no hay)"}
HOY ES: ${hoyAR()} (si una tarea dependía de algo que ya pasó, escribila sin esa fecha)

RESÚMENES ANTERIORES DE ESTA ALUMNA (para el trato y la voz; no copies su contenido):
${(prev || []).map((p: any) => `--- ${p.fecha}\n${String(p.texto).slice(0, 2500)}`).join("\n") || "(ninguno)"}

TRANSCRIPCIÓN DE LA CLASE:
${f.texto}`;
}

async function armarBorrador(c: Ctx, f: any, perfil: any) {
  const ahora = () => new Date().toISOString();
  await c.admin.from("hoy_flor").update({ estado: "Armando el resumen…", actualizado: ahora() }).eq("fecha", f.fecha).eq("clave", f.clave);
  try {
    // El método del resumen viaja con este mismo código (mismo commit), así nunca queda desfasado.
    const sist = await fetch(new URL("./prompts/resumen-clase.md", import.meta.url)).then((r) => (r.ok ? r.text() : c.prompt("resumen-clase.md")));
    const j = await pedir(c, sist, await contextoAlumna(c, f, perfil), "medium");
    await c.admin.from("hoy_flor").update({ texto2: JSON.stringify(j), estado: "Revisando el resumen (control de calidad)…", actualizado: new Date(Date.now() - 7 * 60 * 1000).toISOString() }).eq("fecha", f.fecha).eq("clave", f.clave);
  } catch (e) {
    console.error("borrador clase", e);
    await c.admin.from("hoy_flor").update({ estado: "No pude armar el resumen: reintento en unos minutos.", actualizado: new Date(Date.now() - 7 * 60 * 1000).toISOString() }).eq("fecha", f.fecha).eq("clave", f.clave);
  }
}

const CONTROL = `Sos la revisora final de Flor Pérsico (profesora de inglés de AT WORK). Te paso la transcripción de una clase 1:1 y el borrador del resumen que le va a llegar por mail a la alumna (JSON). Corregilo para que salga SIN ERRORES. Revisá:
1. Cada "dijo" está en la transcripción y es lo que ELLA dijo, textual. Si no está, sacá esa frase.
2. Están TODAS las frases que Flor corrigió en la clase (máx. 12). Si falta alguna, agregala con dijo/va/porque.
3. Cada "va" es inglés correcto y natural (artículos, tiempos, -s, preposiciones, orden) y es lo que quedó en clase. No marca como error algo que está bien; si era "se puede, pero no es lo natural", el "porque" lo dice así.
4. Cada "porque" explica la regla real, en español claro, sin datos falsos (ej.: -ed = /t/ después de p, k, f, s, sh, ch; /d/ después de sonidos sonoros; /id/ solo después de t o d) y nunca vago ("suena mejor" solo no alcanza).
5. "estructura" tiene las reglas correctas aunque en clase se hayan dicho mal, con ejemplos que salen de la transcripción (nada inventado), e incluye el método o criterio que explicó Flor si lo explicó.
6. "pronunciacion" tiene todas las palabras que trabajaron (y ninguna que no).
7. "tareas" son las que Flor dio en esta clase, sin nada de la app y sin fechas que ya pasaron. "lo_que_sigue" solo si Flor lo dijo.
8. Trato (tú o vos) igual al que usa Flor con ella, en todo el texto. Apodo correcto. Nada personal, de salud, de plata, de la app ni de otras alumnas.
Devolvé SOLO el JSON corregido con las mismas claves, más "cambios": [lista corta de lo que corregiste].`;

async function revisarYGuardar(c: Ctx, f: any, perfil: any) {
  await c.admin.from("hoy_flor").update({ estado: "Revisando el resumen (control de calidad)…", actualizado: new Date().toISOString() }).eq("fecha", f.fecha).eq("clave", f.clave);
  try {
    const borrador = JSON.parse(f.texto2);
    const j = await pedir(c, CONTROL, `${await contextoAlumna(c, f, perfil)}\n\nBORRADOR (JSON):\n${JSON.stringify(borrador)}`, "high");
    const d = new Date(f.fecha + "T12:00:00Z");
    const asunto = `Resumen de tu clase · ${DIAS[d.getUTCDay()]} ${f.fecha.slice(8, 10)}/${f.fecha.slice(5, 7)}`;
    j.__final = true; j.material = f.link || ""; j.asunto = asunto;
    const texto = mailTexto(j);
    const fuente = /FUENTE:\s*(.*)/.exec(f.texto || "")?.[1] || "gemini";
    const { error } = await c.admin.from("resumenes").insert({ alumna_id: perfil.id, fecha: f.fecha, asunto, texto, origen: "clase:" + fuente.slice(0, 120) });
    if (error && !/duplicate|unique/i.test(error.message)) throw error;
    const donde = `Resumen de la clase del ${f.fecha.slice(8, 10)}/${f.fecha.slice(5, 7)}`;
    const tareas = (j.tareas || []).map((t: string) => String(t).replace(/^[-•\s]+/, "").trim()).filter(Boolean);
    if (tareas.length) {
      const { data: hay } = await c.admin.from("tareas").select("id").eq("alumna_id", perfil.id).eq("donde", donde).limit(1);
      if (!hay || !hay.length) await c.admin.from("tareas").insert(tareas.map((t: string, i: number) => ({ alumna_id: perfil.id, texto: t, donde, orden: i + 1, hecha: false })));
    }
    if (j.foco && j.foco.titulo) await c.admin.from("perfiles").update({ foco_titulo: String(j.foco.titulo).slice(0, 80), foco_texto: String(j.foco.texto || "").slice(0, 300) }).eq("id", perfil.id);
    if (Array.isArray(j.patrones) && j.patrones.length) {
      const { data: abiertos } = await c.admin.from("patrones").select("id,patron").eq("alumna_id", perfil.id).neq("estado", "Superado");
      const regla = (p: string) => String(p).split(":")[0].trim().toLowerCase();
      let libres = 12 - (abiertos || []).length;
      for (const p of j.patrones) {
        const igual = (abiertos || []).find((a: any) => regla(a.patron) === regla(p.patron));
        if (igual) await c.admin.from("patrones").update({ patron: p.patron }).eq("id", igual.id);
        else if (libres-- > 0) await c.admin.from("patrones").insert({ alumna_id: perfil.id, patron: p.patron, tipo: p.tipo || "Falta de base", estado: "Practicando" });
      }
    }
    await c.admin.from("hoy_flor").update({ texto2: JSON.stringify(j), estado: "Resumen listo y revisado: sale el mail en unos minutos.", actualizado: new Date().toISOString() }).eq("fecha", f.fecha).eq("clave", f.clave);
  } catch (e) {
    console.error("control clase", e);
    await c.admin.from("hoy_flor").update({ estado: "No pude revisar el resumen: reintento en unos minutos.", actualizado: new Date(Date.now() - 7 * 60 * 1000).toISOString() }).eq("fecha", f.fecha).eq("clave", f.clave);
  }
}

// ---------- el mail ----------
function mailTexto(j: any) {
  const p: string[] = [String(j.intro || "").trim()];
  if (j.estructura) p.push("LA ESTRUCTURA QUE USAMOS\n" + String(j.estructura).trim());
  if (j.version_final) p.push("TU VERSIÓN FINAL\n" + String(j.version_final).trim());
  if ((j.frases || []).length) p.push("TUS FRASES PARA EL POST-IT\n\n" + j.frases.map((f: any, i: number) => `${i + 1}. Lo que dijiste: "${f.dijo}"\nCómo va: "${f.va}"\nPor qué: ${f.porque}`).join("\n\n"));
  if ((j.pronunciacion || []).length) p.push("PRONUNCIACIÓN PARA REPETIR\n" + j.pronunciacion.map((x: string) => "- " + String(x).replace(/^[-•\s]+/, "")).join("\n"));
  if ((j.tareas || []).length) p.push((j.trato === "vos" ? "TU TAREA PARA LA SEMANA" : "TU TAREA PARA LA SEMANA") + "\n" + j.tareas.map((x: string) => "- " + String(x).replace(/^[-•\s]+/, "")).join("\n"));
  if (j.lo_que_sigue) p.push("LO QUE SIGUE\n" + String(j.lo_que_sigue).trim());
  if (j.material) p.push("Material de la clase: " + j.material);
  p.push(String(j.cierre || "Nos vemos! 💙\nFlor").trim());
  return p.filter(Boolean).join("\n\n");
}

function mailHTML(j: any) {
  const h3 = (t: string) => `<h3 style="color:#82552e;margin:22px 0 8px">${t}</h3>`;
  const caja = (t: string) => `<div style="border:1px solid #c68c6c;padding:12px">${links(t)}</div>`;
  let h = `<div style="font-family:'Open Sans',Arial,sans-serif;font-size:14px;color:#222;max-width:680px"><p>${links(String(j.intro || ""))}</p>`;
  if (j.estructura) h += h3("LA ESTRUCTURA QUE USAMOS") + caja(j.estructura);
  if (j.version_final) h += h3("TU VERSIÓN FINAL") + caja(j.version_final);
  if ((j.frases || []).length) {
    h += h3("TUS FRASES PARA EL POST-IT") + `<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%"><tr><th style="color:#b3261e">Lo que dijiste</th><th style="color:#1e7b34">Cómo va</th><th>¿Por qué?</th></tr>` +
      j.frases.map((f: any) => `<tr><td style="color:#b3261e;vertical-align:top">${esc(f.dijo)}</td><td style="color:#1e7b34;vertical-align:top">${esc(f.va)}</td><td style="vertical-align:top">${links(f.porque)}</td></tr>`).join("") + `</table>`;
  }
  if ((j.pronunciacion || []).length) h += h3("PRONUNCIACIÓN PARA REPETIR") + `<ul>${j.pronunciacion.map((x: string) => `<li>${links(String(x).replace(/^[-•\s]+/, ""))}</li>`).join("")}</ul>`;
  if ((j.tareas || []).length) h += h3("TU TAREA PARA LA SEMANA") + `<ul>${j.tareas.map((x: string) => `<li>${links(String(x).replace(/^[-•\s]+/, ""))}</li>`).join("")}</ul>`;
  if (j.lo_que_sigue) h += h3("LO QUE SIGUE") + `<p>${links(j.lo_que_sigue)}</p>`;
  if (j.material) h += `<p>Material de la clase: <a href="${esc(j.material)}">${esc(j.material)}</a></p>`;
  h += `<p>${links(String(j.cierre || "Nos vemos! 💙\nFlor"))}</p></div>`;
  return h;
}
