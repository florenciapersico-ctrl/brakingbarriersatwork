// Flor AI de AT WORK: función de servidor en Supabase (Deno).
// - modo chat (por defecto): Flor AI para la alumna, con sus datos reales y tus skills (flor-ai + onboarding-at-work).
// - modo borrador: solo Flor. Borrador de respuesta a un pedido o a un weekly con tu skill filtro-feedback-flor.
// - modo auto: cuando la alumna manda un pedido o su weekly, arma el borrador y lo deja guardado para Flor.
// - modo avisar: cuando Flor responde, le manda un mail a la alumna (desde el Apps Script de Flor).
// - modo invitar: solo Flor. Crea la usuaria de una alumna con contraseña provisoria.
// - modo drive: copia a la carpeta de Drive de la alumna un archivo que subió a la app (si está configurado).
// - modo escuchar: transcribe un audio de la alumna para que Flor AI le dé feedback.
// - modos drive_lista / drive_nuevo: el Apps Script de Flor carga en la app lo que las alumnas suben a Drive.
// - modo borrador_mail: solo Flor. Arma en su Gmail el borrador completo de la respuesta (lo manda ella).
// - modo gmail_enviado: el Apps Script de Flor avisa los feedbacks que ella mandó por mail y la app los marca respondidos.
//
// Las instrucciones viven en el repo (supabase/functions/flor-ai/prompts/*.md, se arman con tools/build.py)
// y se bajan de GitHub; quedan en memoria 10 minutos.
//
// Secretos (Supabase › Edge Functions › Secrets):
//   ANTHROPIC_API_KEY   (obligatorio para el chat y los borradores)
//   FLOR_AI_MODEL       (opcional, por defecto claude-sonnet-5-5)
//   FLOR_AI_EFFORT      (opcional: low | medium | high; por defecto low)
//   LIMITE_DIARIO       (opcional: mensajes por alumna por día; por defecto 20)
//   PROMPTS_URL         (opcional: de dónde bajar las instrucciones; por defecto la rama de producción en GitHub)
//   DRIVE_SCRIPT_URL y DRIVE_SECRET (el Apps Script de Flor: copia a Drive, avisos por mail, lee audios de Drive)
//   DEEPGRAM_API_KEY    (transcribe los audios y videos de las alumnas)

import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = Deno.env.get("FLOR_AI_MODEL") || "claude-sonnet-5-5";
const EFFORT = Deno.env.get("FLOR_AI_EFFORT") || "low";
const LIMITE = Number(Deno.env.get("LIMITE_DIARIO") || 20);
const PROMPTS_URL = (Deno.env.get("PROMPTS_URL") ||
  "https://raw.githubusercontent.com/florenciapersico-ctrl/brakingbarriersatwork/app-produccion/supabase/functions/flor-ai/prompts/").replace(/\/?$/, "/");

let _ai: Anthropic | null = null;
function ia() {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("FALTA_CLAVE");
  return (_ai ??= new Anthropic({ apiKey: key }));
}

// ---------- instrucciones (con caché) ----------
const RESPALDO = `Eres Flor AI, la consultoría con IA de Flor Pérsico para sus alumnas de AT WORK. Hablas como Flor: cálida, directa, con criterio, en español neutro con tú; mensajes cortos y una pregunta por vez. Ayudas a la alumna a ver qué situación real de su trabajo entrenar, diagnosticas si se traba en el qué (el mensaje), el cómo (el inglés) o el quién (desde dónde habla), y cierras con un paso concreto. Nunca inventas clases, links ni fechas: si falta algo, "Eso consúltalo con Flor".`;
const cache: Record<string, { t: number; txt: string }> = {};
async function prompt(nombre: string): Promise<string> {
  const c = cache[nombre];
  if (c && Date.now() - c.t < 10 * 60 * 1000) return c.txt;
  try {
    const r = await fetch(PROMPTS_URL + nombre, { headers: { "Cache-Control": "no-cache" } });
    if (!r.ok) throw new Error(String(r.status));
    const txt = await r.text();
    cache[nombre] = { t: Date.now(), txt };
    return txt;
  } catch (e) {
    console.error("No pude bajar", nombre, e);
    return c?.txt || (nombre === "programa.md" ? "" : RESPALDO);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

const MODULOS = ["M0 · Start Here", "M1 · Activate Your English", "M2 · Communicate in Real Time", "M3 · Polish Your English", "M4 · Understand & Be Understood", "M5 · Own Your Voice"];
const ETIQ: Record<string, string> = { wins: "01 Wins", donde: "02 Dónde estoy", foco: "03 Foco", training1: "04 Training 1", training2: "04 Training 2", situacion: "05 Situación real", necesito: "06 Qué necesito de Flor" };

function semanaDe(fi?: string | null) {
  if (!fi) return null;
  const d = Math.floor((Date.now() - new Date(fi + "T00:00:00").getTime()) / (7 * 864e5)) + 1;
  return Math.max(1, Math.min(20, d));
}

// deno-lint-ignore no-explicit-any
async function contexto(db: any, admin: any, uid: string) {
  const [p, t, pe, pa, pr, w, d, f, rc] = await Promise.all([
    db.from("perfiles").select("*").eq("id", uid).single(),
    db.from("tareas").select("texto,donde,hecha").eq("alumna_id", uid).order("orden"),
    db.from("pedidos").select("titulo,tipo,texto,estado,respuesta,correcciones,creado").eq("alumna_id", uid).order("creado", { ascending: false }).limit(5),
    db.from("patrones").select("patron,tipo,estado").eq("alumna_id", uid),
    db.from("programa").select("*").eq("id", 1).single(),
    db.from("weekly").select("semana,respuestas,enviado_en,respuesta_flor").eq("alumna_id", uid).order("semana", { ascending: false }).limit(3),
    db.from("documentos").select("nombre,tipo,creado").eq("alumna_id", uid).order("creado", { ascending: false }).limit(10),
    admin.from("fichas").select("texto").eq("alumna_id", uid).maybeSingle(),
    admin.from("resumenes").select("fecha,texto").eq("alumna_id", uid).order("fecha", { ascending: false }).limit(2),
  ]);
  const a = p.data || {};
  const prog = pr.data || {};
  const lab = prog.proximo_lab || {};
  const hoy = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" });
  const sem = semanaDe(a.fecha_inicio);
  const corto = (s: string, n = 600) => (s && s.length > n ? s.slice(0, n) + "…" : s || "");
  // deno-lint-ignore no-explicit-any
  const fb = (pe.data || []).map((x: any) =>
    `- ${x.creado?.slice(0, 10)} · ${x.titulo || x.tipo} (${x.estado})${x.texto ? `\n  Lo que mandó: ${corto(x.texto, 400)}` : ""}${x.respuesta ? `\n  Flor respondió: ${corto(x.respuesta)}` : ""}${(x.correcciones || []).length ? `\n  Correcciones: ${(x.correcciones || []).map((c: any) => `"${c.mal}" → "${c.bien}"`).join("; ")}` : ""}`).join("\n");
  // deno-lint-ignore no-explicit-any
  const ws = (w.data || []).map((x: any) => `- Semana del ${x.semana}${x.enviado_en ? "" : " (borrador)"}: ${Object.entries(x.respuestas || {}).map(([k, v]) => `${ETIQ[k] || k}: ${corto(String(v), 300)}`).join(" | ")}${x.respuesta_flor ? `\n  Flor respondió: ${corto(x.respuesta_flor, 400)}` : ""}`).join("\n");
  const ficha = (f.data && f.data.texto) || "";
  return `DATOS DE LA ALUMNA (hoy es ${hoy}). Son reales: úsalos para guiarla. Si un dato está vacío, no lo inventes.
Nombre: ${a.nombre || "(sin cargar)"}. Formato: ${a.formato === "1:1" ? "AT WORK Private (1:1)" : "AT WORK Lab (grupal)"}. Trabajo: ${a.trabajo || "(sin cargar)"}.
Objetivo a 5 meses: ${a.objetivo || "(todavía no lo definió: es parte del onboarding)"}.
Confianza al hablar en reuniones: al empezar ${a.confianza_inicio ?? "?"}/10, hoy ${a.confianza_hoy ?? "?"}/10. Starting Point: ${a.audio_inicio ? "grabado el " + a.audio_inicio : "no grabado todavía"}.
Camino: ${sem ? `semana ${sem} de 20 (empezó el ${a.fecha_inicio})` : "Flor todavía no cargó su fecha de inicio"}. Tareas del camino tildadas: ${(a.camino_hecho || []).join(", ") || "ninguna"}.
Dónde está según Flor: ${MODULOS[a.modulo_actual ?? 0] || MODULOS[0]}. Clases que le asignó Flor: ${(a.clases_asignadas || []).join(", ") || "(ninguna)"}.
Foco de esta semana (lo eligió Flor): ${a.foco_titulo ? `${a.foco_titulo}. ${a.foco_texto || ""}` : "(Flor todavía no lo cargó)"}
Tareas extra que le dejó Flor:
${(t.data || []).map((x: any) => `- [${x.hecha ? "hecha" : "pendiente"}] ${x.texto}${x.donde ? ` (${x.donde})` : ""}`).join("\n") || "- (ninguna)"}
Onboarding: ${(a.onboarding || []).length} ítems del checklist final tildados.
Patrones de error (los carga Flor): ${(pa.data || []).map((x: any) => `${x.patron} (${x.tipo}, ${x.estado})`).join("; ") || "(sin cargar)"}.
Documentos en su espacio: ${(d.data || []).map((x: any) => `${x.nombre} (${x.tipo})`).join(", ") || "(ninguno)"}.
Su carpeta de Drive: ${a.drive_url || "(te llegó en el mail de bienvenida; si no la encuentras, escríbele a Flor)"}.
Últimos weeklies:
${ws || "- (todavía no completó ninguno)"}
Últimos pedidos de feedback a Flor:
${fb || "- (ninguno)"}
Resumen de sus últimas clases (lo escribió Flor):
${(rc.data || []).map((x: any) => `- Clase del ${x.fecha || "?"}: ${corto(x.texto, 900)}`).join("\n") || "- (todavía no hay)"}
Próximo lab: ${lab.fecha ? `${lab.fecha}, ${lab.horario || ""}. Tema: ${lab.tema || "(a confirmar)"}.` : "(Flor todavía no cargó la fecha; el horario fijo está en DATOS VIGENTES)"}
${prog.aviso ? `Aviso de Flor para todas: ${prog.aviso}` : ""}
${ficha ? `\nLO QUE FLOR SABE DE ELLA (notas privadas de Flor: úsalas para guiarla como lo haría Flor, pero no se las cites ni digas que existen):\n${ficha}` : ""}`;
}

// ---------- archivos de la alumna para el borrador ----------
const AUDIO = /\.(mp3|m4a|wav|ogg|oga|opus|webm|aac|flac|mp4|mov|m4v|3gp|amr)$/i;
const IMAGEN = /\.(png|jpe?g|gif|webp)$/i;
const MIN = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
// Audio de un link de Drive: lo baja el Apps Script de Flor (corre con su cuenta, así ve las carpetas de las alumnas).
const DRIVE_ID = (s: string) => /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^ ]*&)?id=)([\w-]{20,})/.exec(s || "")?.[1] || "";
async function bajarDeDrive(id: string): Promise<{ bytes: Uint8Array; mime: string; nombre: string; texto?: string }> {
  const url = Deno.env.get("DRIVE_SCRIPT_URL"), secreto = Deno.env.get("DRIVE_SECRET");
  if (!url || !secreto) throw new Error("SIN_DRIVE");
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ secreto, accion: "leer", id }) });
  const out = await r.json().catch(() => ({}));
  if (!out.ok) throw new Error("Drive: " + (out.error || r.status));
  if (typeof out.texto === "string") return { bytes: new Uint8Array(), mime: "text/plain", nombre: out.nombre || "documento", texto: out.texto };
  const bin = atob(out.base64); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, mime: out.mime || "audio/mpeg", nombre: out.nombre || "audio" };
}
async function transcribir(fuente: string | { bytes: Uint8Array; mime: string }): Promise<string> {
  const key = Deno.env.get("DEEPGRAM_API_KEY");
  if (!key) throw new Error("SIN_TRANSCRIPCION");
  // diarize: separa a cada persona que habla (en una reunión real hablan varias). language=multi: inglés y español mezclados.
  const pedir = () => fetch("https://api.deepgram.com/v1/listen?model=nova-3&language=multi&smart_format=true&punctuate=true&filler_words=true&diarize=true", {
    method: "POST",
    headers: { Authorization: `Token ${key}`, "Content-Type": typeof fuente === "string" ? "application/json" : fuente.mime },
    body: typeof fuente === "string" ? JSON.stringify({ url: fuente }) : fuente.bytes,
  });
  // Hasta 3 intentos: que un corte de red no deje a la alumna sin feedback.
  let r = await pedir();
  for (let i = 0; i < 2 && !r.ok && r.status >= 500; i++) { await new Promise((ok) => setTimeout(ok, 1500 * (i + 1))); r = await pedir(); }
  if (!r.ok) throw new Error("Deepgram " + r.status + ": " + (await r.text()).slice(0, 200));
  // deno-lint-ignore no-explicit-any
  const j: any = await r.json();
  const alt = j?.results?.channels?.[0]?.alternatives?.[0];
  // deno-lint-ignore no-explicit-any
  const words: any[] = alt?.words || [];
  if (!words.length) return "(No se entendió nada en el audio: puede estar vacío, muy bajo o en español.)";
  // Un renglón por turno de cada persona (o cada ~20 s), con su minuto y las palabras dudosas marcadas [así?]
  const lineas: string[] = []; let act: string[] = []; let ini = words[0].start; let quien = words[0].speaker ?? 0;
  const cerrar = () => { if (act.length) lineas.push(`(${MIN(ini)}) [Persona ${Number(quien) + 1}] ${act.join(" ")}`); act = []; };
  for (const w of words) {
    const sp = w.speaker ?? 0;
    if (sp !== quien || (w.start - ini > 20 && act.length && /[.?!]$/.test(act[act.length - 1]))) { cerrar(); ini = w.start; quien = sp; }
    const t = w.punctuated_word || w.word;
    act.push(w.confidence < 0.7 ? `[${t}?]` : t);
  }
  cerrar();
  const personas = new Set(words.map((w) => w.speaker ?? 0)).size;
  const dudosas = words.filter((w) => w.confidence < 0.7).length;
  // Cuánto habla cada una y cuántas palabras dudosas tiene (la alumna suele ser la de más palabras dudosas en inglés)
  const resumen = [...new Set(words.map((w) => w.speaker ?? 0))].map((sp) => {
    const ws = words.filter((w) => (w.speaker ?? 0) === sp);
    return `Persona ${Number(sp) + 1}: ${ws.length} palabras, ${ws.filter((w) => w.confidence < 0.7).length} dudosas`;
  }).join(" · ");
  return `TRANSCRIPCIÓN AUTOMÁTICA (${MIN(words[words.length - 1].end)} min, ${words.length} palabras, ${personas} ${personas === 1 ? "persona" : "personas distintas"}, ${dudosas} palabras dudosas marcadas [así?]).
${personas > 1 ? `Quién habla: ${resumen}.\n` : ""}${lineas.join("\n")}`;
}

// ---------- método de Flor (va siempre, arriba de lo que dicen los prompts) ----------
const METODO_BORRADOR = `MÉTODO DE CORRECCIÓN DE FLOR (manda sobre cualquier otra indicación de formato):
- En la app la alumna ve primero tu RESPUESTA y después una tabla con SUS frases para que ELLA encuentre el error y diga por qué. Recién después ve la tabla con las respuestas. Por eso:
  · En RESPUESTA no escribas las correcciones ni las frases corregidas: anticipa que abajo tiene sus frases para encontrar el error ("Abajo te dejo X frases tuyas: encontrá el error y decime por qué antes de mirar la respuesta").
  · En CORRECCIONES, una por línea, con este formato exacto: frase textual de ella => frase corregida || por qué, en una línea corta y en la voz de Flor (la regla en español, sin tecnicismos).
- Si hay transcripción de un audio: tú SÍ lo escuchaste a través de la transcripción. Nunca escribas que no lo escuchaste, que no pudiste escucharlo o que lo vas a escuchar después. Comenta momentos concretos (con su frase o el minuto) y da feedback de PRONUNCIACIÓN:
  · Las palabras marcadas [así?] son las que el sistema no entendió con claridad: casi siempre es un sonido que hay que trabajar. Y una palabra que no tiene sentido en el contexto (ej.: "road" donde iba "row", "reminding" donde iba "remaining") es la pista de que la pronunció de otra forma: corrígela como Flor ("ROW, NO ROAD: la fila del Excel es row y se dice 'rou'").
  · Da el respelling a la española con la sílaba fuerte en mayúsculas ("ri-MÉI-ning"), el acento de la oración y el connected speech cuando haga falta. Máximo 3 puntos de pronunciación; el objetivo es que se entienda, no borrar el acento.
  · Las correcciones de pronunciación también van en CORRECCIONES: cómo sonó (entre comillas, ej. "road") => cómo va (row, "rou") || por qué.
  · En NOTAS PARA FLOR: los minutos que conviene que Flor escuche ella misma (las palabras [así?] más dudosas).
- REUNIONES CON VARIAS PERSONAS: la transcripción separa a cada una como [Persona 1], [Persona 2]… Tu trabajo es encontrar cuál es la alumna (su nombre está en DATOS DE LA ALUMNA o en "ALUMNA EN LA GRABACIÓN"). Pistas: alguien la llama por su nombre o ella se presenta; habla de su rol o su equipo; es la que habla inglés como segunda lengua (más palabras dudosas, estructuras del español); el contexto de su trabajo. Da feedback SOLO de lo que dijo ella. NUNCA le preguntes a la alumna en qué minutos habla ni le digas que no la pudiste distinguir: decide tú con las pistas. En NOTAS PARA FLOR escribe "La alumna es la Persona N (por: …)" y, si no estás segura, "Chequear: creo que es la Persona N", para que Flor lo confirme antes de enviar.`;

const METODO_CHAT = `MÉTODO DE CORRECCIÓN DE FLOR (en el chat, siempre en este orden):
1. Primero tu devolución: lo que funcionó con evidencia (su frase) y UN foco.
2. Después una tabla con SUS frases con error para que ella las corrija: | # | Tu frase | ¿Dónde está el error? | ¿Por qué? |, con las dos últimas columnas vacías. Pídele que la complete y te la mande.
3. Cuando te responde, le dices qué encontró bien y en qué se equivocó, y recién ahí le das la tabla con las respuestas: | # | Tu frase | Corrección | Por qué |.
Nunca le des la corrección antes de que lo intente ella, salvo que te la pida.
Si su mensaje trae una TRANSCRIPCIÓN AUTOMÁTICA de un audio: lo escuchaste a través de esa transcripción, nunca digas que no pudiste escucharlo. Si hablan varias personas ([Persona 1], [Persona 2]…), identifica cuál es ella (la llaman por su nombre, habla de su rol, es la que habla inglés como segunda lengua) y comenta solo lo suyo; si dudas, dile en una línea a quién estás tomando como ella (\"Te tomo como la Persona 2, la que presenta el reporte\") y sigue. Comenta momentos concretos y da feedback de pronunciación: las palabras marcadas [así?] son las que no se entendieron con claridad, y una palabra que no tiene sentido en el contexto es la pista de que la pronunció de otra forma. Da el respelling con la sílaba fuerte en mayúsculas ("ri-MÉI-ning"). Máximo 3 puntos; el objetivo es que se entienda, no borrar el acento. Después, que lo vuelva a grabar.`;

// ---------- borrador de feedback (se guarda en borradores; solo lo ve Flor) ----------
// deno-lint-ignore no-explicit-any
async function generarBorrador(admin: any, tabla: string, ref: number, imp?: { email: string; semana: string }, quien?: string) {
    let alumnaId = "", material = "", transcripcion = "", aviso = "", sinAudio = false, ctxImp = "";
    // deno-lint-ignore no-explicit-any
    let adjunto: any = null;
    if (tabla === "pedidos") {
      const { data: x } = await admin.from("pedidos").select("*").eq("id", ref).single();
      if (!x) throw new Error("No encontré el pedido.");
      alumnaId = x.alumna_id;
      material = `PEDIDO DE FEEDBACK (${x.tipo}): ${x.titulo}\n${x.texto || ""}${x.link ? `\nLink: ${x.link}` : ""}`;
      if (quien) material += `\nALUMNA EN LA GRABACIÓN (lo dice Flor): ${quien}. Da feedback solo de lo que dice ella y llámala por ese nombre.`;
      if (x.archivo) {
        const nombre = String(x.archivo_nombre || x.archivo);
        const { data: f } = await admin.storage.from("atwork").createSignedUrl(x.archivo, 900);
        const url = f?.signedUrl || "";
        if (url && (AUDIO.test(nombre) || AUDIO.test(x.archivo))) {
          try { transcripcion = await transcribir(url); material += `\n\nADJUNTÓ UN AUDIO/VIDEO (${nombre}).\n${transcripcion}`; }
          catch (e) {
            const sin = String((e as Error).message) === "SIN_TRANSCRIPCION";
            if (!sin) console.error(e);
            sinAudio = true;
            aviso = sin ? "⚠️ NO PUDE ESCUCHAR EL AUDIO: falta activar la transcripción (DEEPGRAM_API_KEY en Supabase › Edge Functions › Secrets). No armé el borrador para no mandarle algo sin haberla escuchado."
              : "⚠️ NO PUDE ESCUCHAR EL AUDIO esta vez (falló la transcripción). Tocá «Armar de nuevo con IA» en un rato.";
          }
        } else if (url && IMAGEN.test(nombre)) {
          adjunto = { type: "image", source: { type: "url", url } }; material += `\n(Adjuntó una imagen: ${nombre}. La tienes arriba.)`;
        } else if (url && /\.pdf$/i.test(nombre)) {
          adjunto = { type: "document", source: { type: "url", url } }; material += `\n(Adjuntó un PDF: ${nombre}. Lo tienes arriba.)`;
        } else if (url && /\.(txt|md|csv|vtt|srt)$/i.test(nombre)) {
          const t = await fetch(url).then((r) => r.text()).catch(() => "");
          material += `\n\nADJUNTÓ ESTE TEXTO (${nombre}):\n${t.slice(0, 40000)}`;
        } else {
          material += `\n(Adjuntó un archivo: ${nombre}. Tú no lo puedes abrir: no inventes su contenido; si hace falta, pon en las notas que Flor lo lea.)`;
        }
      } else if (DRIVE_ID(`${x.link || ""} ${x.texto || ""}`)) {
        // Mandó el audio como link de Drive: lo bajo con el Apps Script de Flor y lo escucho igual.
        try {
          const d = await bajarDeDrive(DRIVE_ID(`${x.link || ""} ${x.texto || ""}`));
          if (d.texto != null) material += `\n\nEL DOCUMENTO DEL LINK (${d.nombre}):\n${d.texto}`;
          else if (d.mime === "application/pdf") { let b = ""; for (let i = 0; i < d.bytes.length; i += 0x8000) b += String.fromCharCode(...d.bytes.subarray(i, i + 0x8000)); adjunto = { type: "document", source: { type: "base64", media_type: "application/pdf", data: btoa(b) } }; material += `\n(El link es un PDF: ${d.nombre}. Lo tienes arriba.)`; }
          else if (!/^(audio|video)\//.test(d.mime) && !AUDIO.test(d.nombre)) throw new Error("NO_AUDIO");
          else { transcripcion = await transcribir(d); material += `\n\nEL AUDIO/VIDEO DEL LINK (${d.nombre}).\n${transcripcion}`; }
        } catch (e) {
          const m = String((e as Error).message);
          const pareceAudio = x.tipo === "audio" || x.tipo === "reunion" || AUDIO.test(`${x.link || ""}`);
          if (m !== "NO_AUDIO" && !pareceAudio) material += `\n(Mandó un link de Drive que no pude abrir: no inventes su contenido; pon en las notas que Flor lo revise.)`;
          else if (m !== "NO_AUDIO") {
            console.error(e); sinAudio = true;
            aviso = m === "SIN_TRANSCRIPCION" ? "⚠️ NO PUDE ESCUCHAR EL AUDIO: falta activar la transcripción (DEEPGRAM_API_KEY en Supabase › Edge Functions › Secrets)."
              : m === "SIN_DRIVE" ? "⚠️ NO PUDE ESCUCHAR EL AUDIO DEL LINK DE DRIVE: falta conectar tu Apps Script (DRIVE_SCRIPT_URL y DRIVE_SECRET)."
              : "⚠️ NO PUDE ABRIR EL AUDIO DEL LINK DE DRIVE (" + m.slice(0, 120) + "). Revisá que el archivo esté en tu Drive o compartido con vos y tocá «Armar de nuevo con IA».";
          }
        }
      }
    } else if (imp) {
      // Alumna que todavía no creó su cuenta: su weekly vive en la tabla importacion.
      const { data: x } = await admin.from("importacion").select("nombre,datos,weeklies").eq("email", imp.email.toLowerCase()).single();
      // deno-lint-ignore no-explicit-any
      const w = (x?.weeklies || []).find((e: any) => e.semana === imp.semana);
      if (!w) throw new Error("No encontré ese weekly.");
      const d = x.datos || {};
      material = `WEEKLY REPORT de la semana del ${w.semana}:\n${Object.entries(w.respuestas || {}).map(([k, v]) => `${ETIQ[k] || k}: ${v}`).join("\n")}`;
      ctxImp = `DATOS DE LA ALUMNA: ${x.nombre}. Formato: ${d.formato || "LAB"}. Trabajo: ${d.trabajo || "(sin cargar)"}. Objetivo: ${d.objetivo || "(sin cargar)"}. Empezó: ${d.fecha_inicio || "?"} (semana ${semanaDe(d.fecha_inicio) ?? "?"} de 20). Foco actual: ${d.foco_titulo || "(sin cargar)"}.
Weeklies anteriores con la respuesta de Flor:
${(x.weeklies || []).filter((e: any) => e.semana < imp.semana).slice(0, 3).map((e: any) => `- ${e.semana}: ${String(e.respuesta_flor || "").slice(0, 500)}`).join("\n") || "- (ninguno)"}`;
    } else {
      const { data: x } = await admin.from("weekly").select("*").eq("id", ref).single();
      if (!x) throw new Error("No encontré el weekly.");
      alumnaId = x.alumna_id;
      material = `WEEKLY REPORT de la semana del ${x.semana}:\n${Object.entries(x.respuestas || {}).map(([k, v]) => `${ETIQ[k] || k}: ${v}`).join("\n")}`;
    }

    // Si mandó un audio y no lo pude escuchar, no armo un borrador que hable sin haberla escuchado.
    if (sinAudio) {
      const datos = { respuesta: "", correcciones: [], foco: "", foco_texto: "", tareas: [], notas: aviso, transcripcion: "", sin_audio: true };
      if (!imp) await admin.from("borradores").upsert({ tabla, ref, datos, creado: new Date().toISOString() });
      return datos;
    }

    if (!Deno.env.get("ANTHROPIC_API_KEY")) throw new Error("FALTA_CLAVE");
    const [sist, prog, ctx] = await Promise.all([prompt("borrador.md"), prompt("programa.md"), imp ? Promise.resolve(ctxImp) : contexto(admin, admin, alumnaId)]);
    const r = await ia().messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium" },
      system: [{ type: "text", text: sist + "\n\n" + prog, cache_control: { type: "ephemeral" } }, { type: "text", text: METODO_BORRADOR }],
      messages: [{ role: "user", content: adjunto ? [adjunto, { type: "text", text: `${ctx}\n\n${material}` }] : `${ctx}\n\n${material}` }],
    // deno-lint-ignore no-explicit-any
    } as any);
    if (r.stop_reason === "refusal") throw new Error("La IA no pudo armar este borrador. Escríbelo a mano.");
    // deno-lint-ignore no-explicit-any
    const texto = r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    const parte = (et: string) => {
      const m = new RegExp(`${et}:\\s*([\\s\\S]*?)(?=\\n(?:RESPUESTA|CORRECCIONES|FOCO|POR QUÉ|TAREAS|NOTAS PARA FLOR):|$)`, "i").exec(texto);
      return m ? m[1].trim() : "";
    };
    const no = (s: string) => !s || /^ninguna?\.?$/i.test(s);
    const correcciones = no(parte("CORRECCIONES")) ? [] : parte("CORRECCIONES").split("\n").map((l) => l.split("=>")).filter((p) => p.length === 2 && p[0].trim())
      .map(([mal, resto]) => { const [bien, por_que = ""] = resto.split("||"); return { mal: mal.replace(/^[-•\d.)\s]+/, "").trim(), bien: bien.trim(), por_que: por_que.trim() }; });
    const tareas = no(parte("TAREAS")) ? [] : parte("TAREAS").split("\n").map((l) => l.replace(/^[-•\d.)\s]+/, "").split("|")).filter((p) => p[0].trim())
      .map(([t, d = ""]) => ({ texto: t.trim(), donde: d.trim() })).slice(0, 3);
    const datos = {
      respuesta: parte("RESPUESTA") || texto.trim(),
      correcciones,
      foco: no(parte("FOCO")) ? "" : parte("FOCO"),
      foco_texto: parte("POR QUÉ"),
      tareas,
      notas: [aviso, parte("NOTAS PARA FLOR")].filter(Boolean).join("\n"),
      transcripcion,
    };
    if (!imp) await admin.from("borradores").upsert({ tabla, ref, datos, creado: new Date().toISOString() });
    return datos;
}

// deno-lint-ignore no-explicit-any
async function esAdmin(db: any, uid: string) {
  const { data } = await db.from("perfiles").select("rol").eq("id", uid).single();
  return data?.rol === "admin";
}

const SUBCARPETA: Record<string, string> = {
  acuerdo: "01", starting: "01", contexto: "01",
  reunion: "02", mail: "02", material: "02",
  sesion: "03",
  audio: "04", tarea: "04", practica: "04", otro: "04",
  weekly: "05", plan: "05", progreso: "05",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const auth = req.headers.get("Authorization") || "";
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // ---------- Drive → app: el Apps Script de Flor avisa los archivos nuevos de las carpetas de las alumnas ----------
  // deno-lint-ignore no-explicit-any
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Pedido inválido" }, 400); }

  // ---------- Gmail → app: Flor respondió por mail (como siempre) y la app se pone al día sola ----------
  // El Apps Script de Flor manda cada mail suyo con la etiqueta "AT WORK/Enviado a alumnas":
  // { email, asunto, fecha, texto, id, hilo: [ids de los mails del hilo] }.
  // 1) Si el hilo tiene el mail con el que la alumna mandó una tarea (origen mail:<id>) → esa tarea queda respondida.
  // 2) "Re: Your weekly report · semana del DD/MM" → respuesta de Flor en el weekly de esa semana.
  // 3) "Feedback de …" → si tiene una sola tarea pendiente, la cierra; si no, queda como feedback nuevo ya respondido.
  // 0) "Resumen de tu clase · lunes 09/11" → se guarda en resumenes (lo ve la alumna y lo usa Flor AI).
  // Lo demás (recordatorios, etc.) no toca la app.
  if (body.modo === "gmail_enviado") {
    const secreto = Deno.env.get("DRIVE_SECRET");
    if (!secreto || body.secreto !== secreto) return json({ ok: false, error: "secreto" }, 403);
    const email = String(body.email || "").toLowerCase().trim();
    const asunto = String(body.asunto || "").trim();
    const texto = String(body.texto || "").trim();
    const fecha = new Date(body.fecha || Date.now());
    if (!email || !texto || !body.id) return json({ ok: false, error: "faltan datos" }, 400);
    const { data: perfil } = await admin.from("perfiles").select("id").ilike("email", email).maybeSingle();

    // Si este mail ya se cargó (por la tarea de la noche o por una corrida anterior), no se repite.
    if (perfil) {
      const { data: ya } = await admin.from("pedidos").select("id").eq("alumna_id", perfil.id).in("origen", ["gmail:" + body.id, "flor:" + body.id]).limit(1).maybeSingle();
      if (ya) return json({ ok: true, ya: true });
    }

    // 0) resumen de clase
    const rs = /^(re:\s*)?resumen de tu clase/i.test(asunto) ? /(\d{1,2})\/(\d{1,2})/.exec(asunto) : null;
    if (/^(re:\s*)?resumen de tu clase/i.test(asunto)) {
      if (!perfil) return json({ ok: true, que: "resumen", sin_cuenta: true });
      let fechaClase: string | null = null;
      if (rs) {
        const mes = Number(rs[2]); let anio = fecha.getUTCFullYear();
        if (mes > fecha.getUTCMonth() + 2) anio -= 1;
        fechaClase = `${anio}-${String(mes).padStart(2, "0")}-${String(Number(rs[1])).padStart(2, "0")}`;
      }
      const { error } = await admin.from("resumenes").upsert({ alumna_id: perfil.id, fecha: fechaClase || fecha.toISOString().slice(0, 10), asunto, texto, origen: "gmail:" + body.id }, { onConflict: "origen" });
      if (error) return json({ ok: false, error: error.message }, 500);
      return json({ ok: true, que: "resumen", fecha: fechaClase });
    }

    // 1) respuesta en el mismo hilo de una tarea que mandó por mail
    const hilo = (Array.isArray(body.hilo) ? body.hilo : []).map((x: unknown) => "mail:" + String(x));
    if (perfil && hilo.length) {
      const { data: t } = await admin.from("pedidos").select("id,estado").eq("alumna_id", perfil.id).in("origen", hilo).order("creado", { ascending: false }).limit(1).maybeSingle();
      if (t) {
        if (t.estado !== "respondido") await admin.from("pedidos").update({ respuesta: texto, estado: "respondido", respondido_en: fecha.toISOString() }).eq("id", t.id);
        return json({ ok: true, que: "tarea", id: t.id });
      }
    }

    // 1b) borrador que armó la app (mismo asunto que quedó guardado en el pedido)
    if (perfil) {
      const base = asunto.replace(/^(re|rv|fwd?):\s*/i, "").trim();
      const { data: t } = await admin.from("pedidos").select("id").eq("alumna_id", perfil.id).eq("estado", "pendiente").eq("mail_asunto", base).limit(1).maybeSingle();
      if (t) {
        await admin.from("pedidos").update({ respuesta: texto, estado: "respondido", respondido_en: fecha.toISOString() }).eq("id", t.id);
        return json({ ok: true, que: "tarea", id: t.id });
      }
    }

    // 2) weekly
    const w = /weekly report.*semana del (\d{1,2})\/(\d{1,2})/i.exec(asunto);
    if (w && /^re:/i.test(asunto)) {
      const mes = Number(w[2]), dia = Number(w[1]);
      let anio = fecha.getUTCFullYear();
      if (mes > fecha.getUTCMonth() + 2) anio -= 1; // weekly de diciembre respondido en enero
      const semana = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const { data: r } = await admin.rpc("sync_weekly", { p_email: email, p_semana: semana, p_respuestas: {}, p_enviado: fecha.toISOString(), p_respuesta_flor: texto, p_respondido: fecha.toISOString() });
      return json({ ok: r !== "no_encontrada", que: "weekly", semana, destino: r });
    }

    // 3) feedback suelto
    if (/^(re:\s*)?feedback/i.test(asunto)) {
      if (perfil) {
        const { data: pend } = await admin.from("pedidos").select("id").eq("alumna_id", perfil.id).eq("estado", "pendiente").lte("creado", fecha.toISOString());
        if ((pend || []).length === 1) {
          await admin.from("pedidos").update({ respuesta: texto, estado: "respondido", respondido_en: fecha.toISOString() }).eq("id", pend![0].id);
          return json({ ok: true, que: "tarea", id: pend![0].id });
        }
      }
      const titulo = asunto.replace(/^re:\s*/i, "").slice(0, 160);
      const { data: r } = await admin.rpc("sync_tarea_mail", { p_email: email, p_origen: "gmail:" + body.id, p_tipo: "tarea", p_titulo: titulo, p_texto: "Feedback que Flor le mandó por mail.", p_respuesta: texto, p_correcciones: [], p_creado: fecha.toISOString(), p_respondido: fecha.toISOString(), p_link: "" });
      return json({ ok: r !== "no_encontrada", que: "feedback", destino: r });
    }
    return json({ ok: true, que: "nada" });
  }
  if (body.modo === "drive_lista" || body.modo === "drive_nuevo") {
    const secreto = Deno.env.get("DRIVE_SECRET");
    if (!secreto || body.secreto !== secreto) return json({ ok: false, error: "secreto" }, 403);
    const carpetaDe = (u: string) => /\/folders\/([\w-]+)/.exec(u || "")?.[1] || /[?&]id=([\w-]+)/.exec(u || "")?.[1] || "";
    const [{ data: ps }, { data: im }] = await Promise.all([
      admin.from("perfiles").select("id,email,nombre,drive_url,rol,activa"),
      admin.from("importacion").select("email,nombre,datos"),
    ]);
    // deno-lint-ignore no-explicit-any
    const conCuenta = new Set((ps || []).map((p: any) => String(p.email || "").toLowerCase()));
    // deno-lint-ignore no-explicit-any
    const alumnas = (ps || []).filter((p: any) => p.rol !== "admin" && p.activa !== false && carpetaDe(p.drive_url)).map((p: any) => ({ email: p.email, nombre: p.nombre, carpeta: carpetaDe(p.drive_url) }))
      // deno-lint-ignore no-explicit-any
      .concat((im || []).filter((i: any) => !conCuenta.has(String(i.email).toLowerCase()) && carpetaDe(i.datos?.drive_url)).map((i: any) => ({ email: i.email, nombre: i.nombre, carpeta: carpetaDe(i.datos.drive_url) })));
    if (body.modo === "drive_lista") return json({ ok: true, alumnas });

    // drive_nuevo: un archivo nuevo → pedido de feedback (sin duplicar: origen = drive:<id>)
    const f = body.archivo || {};
    const email = String(body.email || "").toLowerCase();
    if (!f.id || !email) return json({ ok: false, error: "faltan datos" }, 400);
    const sub = String(f.subcarpeta || "04");
    // Los Google Docs del weekly (05) los arma Flor y se cargan como weekly, no como tarea.
    if (sub === "05" && /google-apps\.document/.test(String(f.mime || ""))) return json({ ok: true, omitido: "weekly_doc" });
    const esAudio = /^(audio|video)\//.test(f.mime || "") || AUDIO.test(f.nombre || "");
    const tipo = sub === "02" ? (esAudio ? "reunion" : "mail") : sub === "05" ? "tarea" : esAudio ? "audio" : "tarea";
    const titulo = (sub === "05" ? "Weekly (desde Drive): " : sub === "02" ? "Material real (desde Drive): " : "Desde Drive: ") + String(f.nombre || "archivo").slice(0, 120);
    const origen = "drive:" + f.id;
    // deno-lint-ignore no-explicit-any
    const perfil = (ps || []).find((p: any) => String(p.email || "").toLowerCase() === email);
    if (perfil) {
      const { data: ya } = await admin.from("pedidos").select("id").eq("origen", origen).maybeSingle();
      if (ya) return json({ ok: true, ya: true });
      const { data: x, error } = await admin.from("pedidos").insert({ alumna_id: perfil.id, tipo, titulo, texto: `Lo subió a su carpeta ${sub} de Drive.`, link: f.link || "", estado: "pendiente", creado: f.creado || new Date().toISOString(), origen }).select("id").single();
      if (error) return json({ ok: false, error: error.message }, 500);
      if (Deno.env.get("ANTHROPIC_API_KEY")) {
        const tarea = generarBorrador(admin, "pedidos", x.id).catch((e) => console.error("drive auto", e));
        // deno-lint-ignore no-explicit-any
        (globalThis as any).EdgeRuntime?.waitUntil?.(tarea);
      }
      return json({ ok: true, id: x.id });
    }
    const { data: r } = await admin.rpc("sync_tarea_mail", { p_email: email, p_origen: origen, p_tipo: tipo, p_titulo: titulo, p_texto: `Lo subió a su carpeta ${sub} de Drive.`, p_respuesta: null, p_correcciones: [], p_creado: f.creado || new Date().toISOString(), p_respondido: null, p_link: f.link || "" });
    return json({ ok: r !== "no_encontrada", destino: r });
  }

  const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
  if (!u?.user) return json({ error: "Tienes que iniciar sesión." }, 401);
  const uid = u.user.id;


  // ---------- invitar (solo Flor) ----------
  if (body.modo === "invitar") {
    if (!(await esAdmin(db, uid))) return json({ error: "Solo Flor puede invitar alumnas." }, 403);
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Ese mail no parece válido." }, 400);
    const nombre = String(body.nombre || "").trim();
    if (body.password) {
      if (String(body.password).length < 8) return json({ error: "La contraseña provisoria tiene que tener al menos 8 caracteres." }, 400);
      const { data, error } = await admin.auth.admin.createUser({ email, password: body.password, email_confirm: true, user_metadata: { nombre } });
      if (error) return json({ error: /already/i.test(error.message) ? "Ya existe una alumna con ese mail." : error.message }, 400);
      if (nombre && data.user) await admin.from("perfiles").update({ nombre }).eq("id", data.user.id);
      // Su carpeta de Drive: la que puso Flor, la que ya tenía cargada o, si no hay, una nueva con 01 a 05.
      let drive = "";
      if (data.user) {
        const dUrl = String(body.drive_url || "").trim();
        if (/drive\.google\.com/.test(dUrl)) await admin.from("perfiles").update({ drive_url: dUrl }).eq("id", data.user.id);
        const { data: pf } = await admin.from("perfiles").select("drive_url").eq("id", data.user.id).single();
        drive = pf?.drive_url || "";
        const sUrl = Deno.env.get("DRIVE_SCRIPT_URL"), secreto = Deno.env.get("DRIVE_SECRET");
        if (!drive && sUrl && secreto) {
          try {
            const r = await fetch(sUrl, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ secreto, accion: "crear_carpeta", nombre, email }) });
            const out = await r.json().catch(() => ({}));
            if (out.ok && out.link) { drive = out.link; await admin.from("perfiles").update({ drive_url: drive }).eq("id", data.user.id); }
          } catch (e) { console.error("crear_carpeta", e); }
        }
      }
      return json({ ok: true, id: data.user?.id, drive });
    }
    const { error } = await admin.auth.admin.inviteUserByEmail(email, { data: { nombre }, redirectTo: body.redirect || undefined });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  // ---------- drive: copia un archivo subido a la carpeta de Drive de la alumna ----------
  if (body.modo === "drive") {
    const url = Deno.env.get("DRIVE_SCRIPT_URL"), secreto = Deno.env.get("DRIVE_SECRET");
    if (!url || !secreto) return json({ ok: false, motivo: "sin_configurar" });
    const path = String(body.path || "");
    const duena = path.split("/")[0];
    if (!path || (duena !== uid && !(await esAdmin(db, uid)))) return json({ error: "Archivo no válido." }, 403);
    const { data: perfil } = await admin.from("perfiles").select("nombre,drive_url").eq("id", duena).single();
    const carpeta = /\/folders\/([\w-]+)/.exec(perfil?.drive_url || "")?.[1] || /[?&]id=([\w-]+)/.exec(perfil?.drive_url || "")?.[1];
    if (!carpeta) return json({ ok: false, motivo: "sin_carpeta" });
    const { data: firmada } = await admin.storage.from("atwork").createSignedUrl(path, 600);
    if (!firmada?.signedUrl) return json({ ok: false, motivo: "sin_archivo" });
    const sub = SUBCARPETA[String(body.tipo || "otro")] || "04";
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ secreto, carpeta, subcarpeta: sub, url: firmada.signedUrl, nombre: body.nombre || path.split("/").pop() }) });
      const out = await r.json().catch(() => ({}));
      const estado = out.ok ? "ok" : String(out.error || "error");
      if (body.tabla === "pedidos" && body.id) await admin.from("pedidos").update({ drive: estado }).eq("id", body.id);
      if (body.tabla === "documentos" && body.id) await admin.from("documentos").update({ drive: estado }).eq("id", body.id);
      return json({ ok: !!out.ok, link: out.link || "" });
    } catch (e) {
      console.error(e);
      return json({ ok: false, motivo: "error" });
    }
  }

  // ---------- borrador (solo Flor): lo arma de nuevo y lo guarda ----------
  if (body.modo === "borrador") {
    if (!(await esAdmin(db, uid))) return json({ error: "Solo Flor puede usar esto." }, 403);
    const tabla = body.pedido_id ? "pedidos" : body.weekly_id || body.imp ? "weekly" : "";
    if (!tabla) return json({ error: "Falta el pedido o el weekly." }, 400);
    try { return json(await generarBorrador(admin, tabla, Number(body.pedido_id || body.weekly_id || 0), body.imp, String(body.quien || "").trim().slice(0, 80) || undefined)); }
    catch (e) {
      const m = String((e as Error).message);
      if (m !== "FALTA_CLAVE") console.error(e);
      return json({ error: m === "FALTA_CLAVE" ? "Para los borradores con IA falta cargar ANTHROPIC_API_KEY en Supabase › Edge Functions › Secrets." : m }, m === "FALTA_CLAVE" ? 503 : 500);
    }
  }

  // ---------- auto: la alumna acaba de mandar un pedido o su weekly → se arma el borrador para Flor ----------
  if (body.modo === "auto") {
    const tabla = body.pedido_id ? "pedidos" : body.weekly_id ? "weekly" : "";
    const ref = Number(body.pedido_id || body.weekly_id);
    if (!tabla || !ref) return json({ ok: false });
    const { data: x } = await admin.from(tabla).select("alumna_id").eq("id", ref).single();
    if (!x || (x.alumna_id !== uid && !(await esAdmin(db, uid)))) return json({ ok: false }, 403);
    if (!Deno.env.get("ANTHROPIC_API_KEY")) return json({ ok: false, motivo: "sin_clave" });
    // deno-lint-ignore no-explicit-any
    const tarea = generarBorrador(admin, tabla, ref).catch((e) => console.error("auto", e));
    // deno-lint-ignore no-explicit-any
    (globalThis as any).EdgeRuntime?.waitUntil?.(tarea);
    return json({ ok: true });
  }

  // ---------- avisar: Flor respondió → mail a la alumna (desde la cuenta de Google de Flor, vía el Apps Script) ----------
  if (body.modo === "avisar") {
    if (!(await esAdmin(db, uid))) return json({ ok: false }, 403);
    const url = Deno.env.get("DRIVE_SCRIPT_URL"), secreto = Deno.env.get("DRIVE_SECRET");
    if (!url || !secreto) return json({ ok: false, motivo: "sin_configurar" });
    const { data: a } = await admin.from("perfiles").select("nombre,email").eq("id", body.alumna_id).single();
    if (!a?.email) return json({ ok: false, motivo: "sin_mail" });
    const nombre = String(a.nombre || "").split(" ")[0];
    const app = String(body.link || "https://app.breakingbarriers.site/app/");
    const que = body.que === "weekly" ? "tu Weekly Report" : `tu pedido de feedback${body.titulo ? ` («${body.titulo}»)` : ""}`;
    const asunto = body.que === "weekly" ? "Flor respondió tu Weekly Report" : "Tienes feedback nuevo de Flor";
    const esc = (t: string) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#2a211b;line-height:1.5">
<p>Hola${nombre ? " " + esc(nombre) : ""}:</p>
<p>Ya te respondí ${esc(que)} en tu espacio de AT WORK.</p>
<p><a href="${app}#${body.que === "weekly" ? "weekly" : "feedback"}" style="background:#d4a37f;color:#1d1814;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Ver mi feedback</a></p>
<p>Léelo con calma y haz tu segundo intento.</p><p>Flor</p></div>`;
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ secreto, accion: "mail", para: a.email, asunto, html }) });
      const out = await r.json().catch(() => ({}));
      return json({ ok: !!out.ok });
    } catch (e) { console.error(e); return json({ ok: false }); }
  }

  // ---------- borrador_mail (solo Flor): la respuesta completa queda como borrador en su Gmail ----------
  // No se le manda nada a la alumna: Flor lo revisa y lo envía. Al enviarlo, gmail_enviado lo marca respondido.
  if (body.modo === "borrador_mail") {
    if (!(await esAdmin(db, uid))) return json({ error: "Solo Flor puede usar esto." }, 403);
    const url = Deno.env.get("DRIVE_SCRIPT_URL"), secreto = Deno.env.get("DRIVE_SECRET");
    if (!url || !secreto) return json({ error: "Falta conectar tu Apps Script (DRIVE_SCRIPT_URL y DRIVE_SECRET)." }, 503);
    const respuesta = String(body.respuesta || "").replace(/\r/g, "").trim();
    if (!respuesta) return json({ error: "Escribe tu respuesta." }, 400);
    // deno-lint-ignore no-explicit-any
    const corr = (Array.isArray(body.correcciones) ? body.correcciones : []).filter((c: any) => c && String(c.mal || "").trim() && String(c.bien || "").trim());
    const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
    const limpiar = (t: string) => String(t || "").replace(/^(weekly|material real)?\s*\(desde drive\):\s*|^desde drive:\s*/i, "").trim();
    let email = "", asunto = "", responder = "", tabla = "", ref = 0;
    if (body.pedido_id) {
      const { data: x } = await admin.from("pedidos").select("id,alumna_id,titulo,tipo,origen").eq("id", body.pedido_id).single();
      if (!x) return json({ error: "No encontré el pedido." }, 404);
      const { data: a } = await admin.from("perfiles").select("email").eq("id", x.alumna_id).single();
      email = a?.email || ""; tabla = "pedidos"; ref = x.id;
      asunto = `Feedback · ${limpiar(x.titulo) || "tu práctica"}`;
      if (String(x.origen || "").startsWith("mail:")) responder = String(x.origen).slice(5);
    } else if (body.weekly_id) {
      const { data: x } = await admin.from("weekly").select("id,alumna_id,semana").eq("id", body.weekly_id).single();
      if (!x) return json({ error: "No encontré el weekly." }, 404);
      const { data: a } = await admin.from("perfiles").select("email").eq("id", x.alumna_id).single();
      email = a?.email || ""; tabla = "weekly"; ref = x.id;
      asunto = `Re: Your weekly report · semana del ${ddmm(String(x.semana))} 📝`;
    } else if (body.imp?.email && body.imp?.semana) {
      email = String(body.imp.email); asunto = `Re: Your weekly report · semana del ${ddmm(String(body.imp.semana))} 📝`;
    } else if (body.imp_pedido?.email) {
      email = String(body.imp_pedido.email);
      asunto = `Feedback · ${limpiar(body.imp_pedido.titulo) || "tu práctica"}`;
      if (String(body.imp_pedido.origen || "").startsWith("mail:")) responder = String(body.imp_pedido.origen).slice(5);
    } else return json({ error: "Falta qué estás respondiendo." }, 400);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Esa alumna no tiene un mail válido cargado." }, 400);

    // El cuerpo, con el formato de los mails de Flor: las correcciones antes del saludo final.
    const ps = respuesta.split(/\n{2,}/);
    const cierre = ps.length > 1 && ps[ps.length - 1].length <= 160 ? ps.pop()! : "";
    // deno-lint-ignore no-explicit-any
    const lineas = corr.map((c: any) => `${String(c.mal).trim()} → ${String(c.bien).trim()}.${c.por_que ? " " + String(c.por_que).trim() : ""}`.replace(/\.\./g, "."));
    const texto = [...ps, ...lineas, cierre].filter(Boolean).join("\n\n");
    const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
    const p = (t: string) => `<p>${esc(t).replace(/\n/g, "<br>")}</p>`;
    // deno-lint-ignore no-explicit-any
    const htmlCorr = corr.map((c: any) => `<p><i>${esc(String(c.mal).trim())}</i> → <i><b>${esc(String(c.bien).trim())}</b></i>.${c.por_que ? " " + esc(String(c.por_que).trim()) : ""}</p>`).join("\n");
    const html = `<div style="font-family:'Open Sans',Arial,sans-serif;font-size:15px;color:#333;line-height:1.55;max-width:640px">\n${ps.map(p).join("\n")}\n${htmlCorr}\n${cierre ? p(cierre) : ""}\n</div>`;

    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ secreto, accion: "borrador", para: email, asunto, texto, html, responder }) });
      const out = await r.json().catch(() => ({}));
      if (!out.ok) return json({ error: `No se pudo armar el borrador en Gmail (${String(out.error || r.status).slice(0, 120)}). Si todavía no publicaste la versión nueva del Apps Script, publícala y prueba de nuevo.` }, 502);
      const ahora = new Date().toISOString();
      if (tabla === "pedidos") await admin.from("pedidos").update({ mail_borrador: ahora, mail_asunto: String(out.asunto || asunto).replace(/^(re|rv|fwd?):\s*/i, "").trim() }).eq("id", ref);
      if (tabla === "weekly") await admin.from("weekly").update({ mail_borrador: ahora }).eq("id", ref);
      if (tabla) {
        const { data: b } = await admin.from("borradores").select("datos").eq("tabla", tabla).eq("ref", ref).maybeSingle();
        await admin.from("borradores").upsert({ tabla, ref, datos: { ...(b?.datos || {}), respuesta, correcciones: corr }, creado: ahora });
      }
      return json({ ok: true, link: out.link || "", asunto });
    } catch (e) { console.error(e); return json({ error: "No pude conectar con tu Gmail. Prueba de nuevo en un rato." }, 502); }
  }

  // ---------- escuchar: la alumna sube un audio para que Flor AI le dé feedback ya ----------
  if (body.modo === "escuchar") {
    const path = String(body.path || "");
    if (!path || (path.split("/")[0] !== uid && !(await esAdmin(db, uid)))) return json({ error: "Archivo no válido." }, 403);
    const { data: f } = await admin.storage.from("atwork").createSignedUrl(path, 900);
    if (!f?.signedUrl) return json({ error: "No encontré el audio." }, 404);
    try { return json({ transcripcion: await transcribir(f.signedUrl) }); }
    catch (e) {
      const sin = String((e as Error).message) === "SIN_TRANSCRIPCION";
      if (!sin) console.error(e);
      return json({ error: sin ? "Flor AI todavía no puede escuchar audios. Mándaselo a Flor con «Enviar a Flor»." : "No pude escuchar tu audio esta vez. Prueba de nuevo en un rato o mándaselo a Flor." }, sin ? 503 : 500);
    }
  }

  // ---------- chat con Flor AI ----------
  const mensaje = String(body.mensaje || "").trim();
  if (!mensaje || !body.chat_id) return json({ error: "Falta el mensaje." }, 400);
  if (mensaje.length > 40000) return json({ error: "El mensaje es muy largo. Pégalo en partes." }, 400);

  const { data: chat } = await db.from("chats").select("*").eq("id", body.chat_id).single();
  if (!chat) return json({ error: "No encontré esta conversación." }, 404);

  // Límite diario por alumna, para cuidar tu gasto.
  const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: misChats } = await db.from("chats").select("id").eq("alumna_id", uid);
  const ids = (misChats || []).map((c: { id: number }) => c.id);
  const { count } = await db.from("mensajes").select("id", { count: "exact", head: true })
    .in("chat_id", ids.length ? ids : [0]).eq("rol", "user").gte("creado", desde);
  if (!(await esAdmin(db, uid)) && (count || 0) >= LIMITE) return json({ error: "Llegaste al límite de mensajes de hoy. Mañana seguimos. Si es urgente, mándaselo a Flor desde Pedir feedback." }, 429);

  const { data: hist } = await db.from("mensajes").select("rol,contenido").eq("chat_id", chat.id).order("id", { ascending: false }).limit(40);
  const previos = (hist || []).reverse();
  await db.from("mensajes").insert({ chat_id: chat.id, rol: "user", contenido: mensaje });
  if (!previos.length) await db.from("chats").update({ titulo: mensaje.slice(0, 60) }).eq("id", chat.id);

  const [flor, prog, ctx] = await Promise.all([prompt("flor-ai.md"), prompt("programa.md"), contexto(db, admin, uid)]);
  const messages = [...previos.map((m: { rol: string; contenido: string }) => ({ role: m.rol, content: m.contenido })), { role: "user", content: mensaje }];
  const params = {
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: EFFORT },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: flor + "\n\n" + prog + "\n\n" + METODO_CHAT, cache_control: { type: "ephemeral" } },
      { type: "text", text: `${ctx}\n\nEs un chat en vivo dentro de su app: empieza tu respuesta visible enseguida.` },
    ],
    messages,
  };

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      let completo = "";
      try {
        // deno-lint-ignore no-explicit-any
        const s = ia().beta.messages.stream(params as any);
        for await (const ev of s) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            completo += ev.delta.text;
            ctrl.enqueue(enc.encode(ev.delta.text));
          }
        }
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal" && !completo) {
          completo = "No puedo ayudarte con esto. Si es algo del programa, escríbele a Flor.";
          ctrl.enqueue(enc.encode(completo));
        }
      } catch (e) {
        console.error(e);
        const aviso = String((e as Error).message) === "FALTA_CLAVE"
          ? "Flor AI todavía no está encendida. Mientras tanto, mándale tu consulta a Flor desde Pedir feedback."
          : "\n\n_Se cortó la conexión con Flor AI. Intenta de nuevo en un momento._";
        completo += aviso;
        ctrl.enqueue(enc.encode(aviso));
      }
      if (completo.trim()) await db.from("mensajes").insert({ chat_id: chat.id, rol: "assistant", contenido: completo });
      ctrl.close();
    },
  });
  return new Response(stream, { headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" } });
});
