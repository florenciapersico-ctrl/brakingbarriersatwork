// Flor AI de AT WORK: función de servidor en Supabase (Deno).
// - modo chat (por defecto): Flor AI para la alumna, con sus datos reales y tus skills (flor-ai + onboarding-at-work).
// - modo borrador: solo Flor. Borrador de respuesta a un pedido o a un weekly con tu skill filtro-feedback-flor.
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

  // ---------- borrador (solo Flor) ----------
  if (body.modo === "borrador") {
    if (!(await esAdmin(db, uid))) return json({ error: "Solo Flor puede usar esto." }, 403);
    let alumnaId = "", material = "";
    if (body.pedido_id) {
      const { data: x } = await db.from("pedidos").select("*").eq("id", body.pedido_id).single();
      if (!x) return json({ error: "No encontré el pedido." }, 404);
      alumnaId = x.alumna_id;
      material = `PEDIDO DE FEEDBACK (${x.tipo}): ${x.titulo}\n${x.texto}${x.link ? `\nLink: ${x.link}` : ""}${x.archivo ? `\n(Adjuntó un archivo: ${x.archivo_nombre || x.archivo}. Tú no lo puedes abrir: no inventes su contenido; si hace falta, pon en las notas que Flor lo escuche o lo lea.)` : ""}`;
    } else if (body.weekly_id) {
      const { data: x } = await db.from("weekly").select("*").eq("id", body.weekly_id).single();
      if (!x) return json({ error: "No encontré el weekly." }, 404);
      alumnaId = x.alumna_id;
      material = `WEEKLY REPORT de la semana del ${x.semana}:\n${Object.entries(x.respuestas || {}).map(([k, v]) => `${ETIQ[k] || k}: ${v}`).join("\n")}`;
    } else return json({ error: "Falta el pedido o el weekly." }, 400);

    const [sist, prog, ctx] = await Promise.all([prompt("borrador.md"), prompt("programa.md"), contexto(admin, admin, alumnaId)]);
    const r = await ia().messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium" },
      system: [{ type: "text", text: sist + "\n\n" + prog, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: `${ctx}\n\n${material}` }],
    // deno-lint-ignore no-explicit-any
    } as any);
    if (r.stop_reason === "refusal") return json({ error: "La IA no pudo armar este borrador. Escríbelo a mano." }, 422);
    // deno-lint-ignore no-explicit-any
    const texto = r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    const parte = (et: string) => {
      const m = new RegExp(`${et}:\\s*([\\s\\S]*?)(?=\\n(?:RESPUESTA|CORRECCIONES|FOCO|POR QUÉ|TAREAS|NOTAS PARA FLOR):|$)`, "i").exec(texto);
      return m ? m[1].trim() : "";
    };
    const no = (s: string) => !s || /^ninguna?\.?$/i.test(s);
    const correcciones = no(parte("CORRECCIONES")) ? [] : parte("CORRECCIONES").split("\n").map((l) => l.split("=>")).filter((p) => p.length === 2 && p[0].trim())
      .map(([mal, bien]) => ({ mal: mal.replace(/^[-•\s]+/, "").trim(), bien: bien.trim() }));
    const tareas = no(parte("TAREAS")) ? [] : parte("TAREAS").split("\n").map((l) => l.replace(/^[-•\d.)\s]+/, "").split("|")).filter((p) => p[0].trim())
      .map(([t, d = ""]) => ({ texto: t.trim(), donde: d.trim() })).slice(0, 3);
    return json({
      respuesta: parte("RESPUESTA") || texto.trim(),
      correcciones,
      foco: no(parte("FOCO")) ? "" : parte("FOCO"),
      foco_texto: parte("POR QUÉ"),
      tareas,
      notas: parte("NOTAS PARA FLOR"),
    });
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
      { type: "text", text: flor + "\n\n" + prog, cache_control: { type: "ephemeral" } },
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
