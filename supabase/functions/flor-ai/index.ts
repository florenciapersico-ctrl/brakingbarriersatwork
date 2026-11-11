// Flor AI de AT WORK: función de servidor en Supabase (Deno).
// - modo chat (por defecto): Flor AI para la alumna, con sus datos reales y tus skills (flor-ai + onboarding-at-work).
// - modo borrador: solo Flor. Borrador de respuesta a un pedido o a un weekly con tu skill filtro-feedback-flor.
// - modo auto: cuando la alumna manda un pedido o su weekly, arma el borrador y lo deja guardado para Flor.
// - modo avisar: cuando Flor responde, le manda un mail a la alumna (desde el Apps Script de Flor).
// - modo invitar: solo Flor. Crea la usuaria de una alumna con contraseña provisoria.
// - modo drive: copia a la carpeta de Drive de la alumna un archivo que subió a la app (si está configurado).
//
// Las instrucciones viven en el repo (supabase/functions/flor-ai/prompts/*.md, se arman con tools/build.py)
// y se bajan de GitHub; quedan en memoria 10 minutos. Para cambiar cómo responde Flor AI no hace falta
// volver a publicar la función: editás skills/ o app/camino.js, corrés tools/build.py y hacés push.
//
// Secretos (Supabase › Edge Functions › Secrets):
//   ANTHROPIC_API_KEY   (obligatorio para el chat y los borradores)
//   FLOR_AI_MODEL       (opcional, por defecto claude-sonnet-5-5)
//   FLOR_AI_EFFORT      (opcional: low | medium | high; por defecto low)
//   LIMITE_DIARIO       (opcional: mensajes por alumna por día; por defecto 20)
//   PROMPTS_URL         (opcional: de dónde bajar las instrucciones; por defecto la rama de producción en GitHub)
//   DRIVE_SCRIPT_URL y DRIVE_SECRET (opcionales: el Apps Script que copia archivos a Drive)
//   DEEPGRAM_API_KEY    (opcional: transcribe los audios y videos de las alumnas para el borrador de feedback)

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
  const [p, t, pe, pa, pr, w, d, f] = await Promise.all([
    db.from("perfiles").select("*").eq("id", uid).single(),
    db.from("tareas").select("texto,donde,hecha").eq("alumna_id", uid).order("orden"),
    db.from("pedidos").select("titulo,tipo,texto,estado,respuesta,correcciones,creado").eq("alumna_id", uid).order("creado", { ascending: false }).limit(5),
    db.from("patrones").select("patron,tipo,estado").eq("alumna_id", uid),
    db.from("programa").select("*").eq("id", 1).single(),
    db.from("weekly").select("semana,respuestas,enviado_en,respuesta_flor").eq("alumna_id", uid).order("semana", { ascending: false }).limit(3),
    db.from("documentos").select("nombre,tipo,creado").eq("alumna_id", uid).order("creado", { ascending: false }).limit(10),
    admin.from("fichas").select("texto").eq("alumna_id", uid).maybeSingle(),
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
async function bajarDeDrive(id: string): Promise<{ bytes: Uint8Array; mime: string; nombre: string }> {
  const url = Deno.env.get("DRIVE_SCRIPT_URL"), secreto = Deno.env.get("DRIVE_SECRET");
  if (!url || !secreto) throw new Error("SIN_DRIVE");
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ secreto, accion: "leer", id }) });
  const out = await r.json().catch(() => ({}));
  if (!out.ok) throw new Error("Drive: " + (out.error || r.status));
  const bin = atob(out.base64); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, mime: out.mime || "audio/mpeg", nombre: out.nombre || "audio" };
}
async function transcribir(fuente: string | { bytes: Uint8Array; mime: string }): Promise<string> {
  const key = Deno.env.get("DEEPGRAM_API_KEY");
  if (!key) throw new Error("SIN_TRANSCRIPCION");
  const pedir = () => fetch("https://api.deepgram.com/v1/listen?model=nova-3&language=en&smart_format=true&punctuate=true&filler_words=true&paragraphs=true", {
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
  // Frases de ~20 s con su minuto, y las palabras dudosas marcadas [así?]
  const lineas: string[] = []; let act: string[] = []; let ini = words[0].start;
  for (const w of words) {
    const t = w.punctuated_word || w.word;
    act.push(w.confidence < 0.7 ? `[${t}?]` : t);
    if (w.end - ini > 20 && /[.?!]$/.test(t)) { lineas.push(`(${MIN(ini)}) ${act.join(" ")}`); act = []; ini = w.end; }
  }
  if (act.length) lineas.push(`(${MIN(ini)}) ${act.join(" ")}`);
  const dudosas = words.filter((w) => w.confidence < 0.7).length;
  return `TRANSCRIPCIÓN AUTOMÁTICA (${MIN(words[words.length - 1].end)} min, ${words.length} palabras, ${dudosas} dudosas marcadas [así?]):\n${lineas.join("\n")}`;
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
  · En NOTAS PARA FLOR: los minutos que conviene que Flor escuche ella misma (las palabras [así?] más dudosas).`;

const METODO_CHAT = `MÉTODO DE CORRECCIÓN DE FLOR (en el chat, siempre en este orden):
1. Primero tu devolución: lo que funcionó con evidencia (su frase) y UN foco.
2. Después una tabla con SUS frases con error para que ella las corrija: | # | Tu frase | ¿Dónde está el error? | ¿Por qué? |, con las dos últimas columnas vacías. Pídele que la complete y te la mande.
3. Cuando te responde, le dices qué encontró bien y en qué se equivocó, y recién ahí le das la tabla con las respuestas: | # | Tu frase | Corrección | Por qué |.
Nunca le des la corrección antes de que lo intente ella, salvo que te la pida.
Si su mensaje trae una TRANSCRIPCIÓN AUTOMÁTICA de un audio: lo escuchaste a través de esa transcripción, nunca digas que no pudiste escucharlo. Comenta momentos concretos y da feedback de pronunciación: las palabras marcadas [así?] son las que no se entendieron con claridad, y una palabra que no tiene sentido en el contexto es la pista de que la pronunció de otra forma. Da el respelling con la sílaba fuerte en mayúsculas ("ri-MÉI-ning"). Máximo 3 puntos; el objetivo es que se entienda, no borrar el acento. Después, que lo vuelva a grabar.`;

// ---------- borrador de feedback (se guarda en borradores; solo lo ve Flor) ----------
// deno-lint-ignore no-explicit-any
async function generarBorrador(admin: any, tabla: string, ref: number, imp?: { email: string; semana: string }) {
    let alumnaId = "", material = "", transcripcion = "", aviso = "", sinAudio = false, ctxImp = "";
    // deno-lint-ignore no-explicit-any
    let adjunto: any = null;
    if (tabla === "pedidos") {
      const { data: x } = await admin.from("pedidos").select("*").eq("id", ref).single();
      if (!x) throw new Error("No encontré el pedido.");
      alumnaId = x.alumna_id;
      material = `PEDIDO DE FEEDBACK (${x.tipo}): ${x.titulo}\n${x.texto || ""}${x.link ? `\nLink: ${x.link}` : ""}`;
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
      } else if (DRIVE_ID(`${x.link || ""} ${x.texto || ""}`) && (x.tipo === "audio" || x.tipo === "reunion" || AUDIO.test(`${x.link || ""}`))) {
        // Mandó el audio como link de Drive: lo bajo con el Apps Script de Flor y lo escucho igual.
        try {
          const d = await bajarDeDrive(DRIVE_ID(`${x.link || ""} ${x.texto || ""}`));
          if (!/^(audio|video)\//.test(d.mime) && !AUDIO.test(d.nombre)) throw new Error("NO_AUDIO");
          transcripcion = await transcribir(d);
          material += `\n\nEL AUDIO/VIDEO DEL LINK (${d.nombre}).\n${transcripcion}`;
        } catch (e) {
          const m = String((e as Error).message);
          if (m !== "NO_AUDIO") {
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
  const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
  if (!u?.user) return json({ error: "Tienes que iniciar sesión." }, 401);
  const uid = u.user.id;

  // deno-lint-ignore no-explicit-any
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Pedido inválido" }, 400); }

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
      return json({ ok: true, id: data.user?.id });
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
    try { return json(await generarBorrador(admin, tabla, Number(body.pedido_id || body.weekly_id || 0), body.imp)); }
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
  if (mensaje.length > 20000) return json({ error: "El mensaje es muy largo. Pégalo en partes." }, 400);

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
