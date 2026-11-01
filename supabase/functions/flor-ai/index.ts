// Flor AI y coaches de AT WORK: función de servidor en Supabase (Deno).
// La alumna escribe en la app → esta función arma su contexto con sus datos reales,
// llama a Claude con TU clave (secreto ANTHROPIC_API_KEY) y devuelve la respuesta en streaming.
//
// Secretos (Supabase › Edge Functions › Secrets):
//   ANTHROPIC_API_KEY  (obligatorio)
//   FLOR_AI_MODEL      (opcional, por defecto claude-opus-5-5)
//   FLOR_AI_EFFORT     (opcional: low | medium | high; por defecto low)
//   LIMITE_DIARIO      (opcional: mensajes por alumna por día; por defecto 60)

import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";
import { COACHES } from "./prompts.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODEL = Deno.env.get("FLOR_AI_MODEL") || "claude-opus-5-5";
const EFFORT = Deno.env.get("FLOR_AI_EFFORT") || "low";
const LIMITE = Number(Deno.env.get("LIMITE_DIARIO") || 60);
const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

const MODULOS = [
  "M0 · Lead Yourself First",
  "M1 · Activate Your English",
  "M2 · Communicate in Real Time",
  "M3 · Polish Your English",
  "M4 · Understand & Be Understood",
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

// deno-lint-ignore no-explicit-any
async function contexto(db: any, uid: string) {
  const [p, t, pe, pa, pr, w] = await Promise.all([
    db.from("perfiles").select("*").eq("id", uid).single(),
    db.from("tareas").select("texto,donde,hecha").eq("alumna_id", uid).order("orden"),
    db.from("pedidos").select("titulo,tipo,estado,respuesta,correcciones,creado").eq("alumna_id", uid).order("creado", { ascending: false }).limit(3),
    db.from("patrones").select("patron,tipo,estado").eq("alumna_id", uid),
    db.from("programa").select("*").eq("id", 1).single(),
    db.from("weekly").select("semana,respuestas,enviado_en,respuesta_flor").eq("alumna_id", uid).order("semana", { ascending: false }).limit(1),
  ]);
  const a = p.data || {};
  const prog = pr.data || {};
  const lab = prog.proximo_lab || {};
  const links = prog.links || {};
  const hoy = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" });
  const fb = (pe.data || []).map((x: any) =>
    `- ${x.titulo || x.tipo} (${x.estado})${x.respuesta ? `: ${x.respuesta}` : ""}${(x.correcciones || []).length ? ` Correcciones: ${(x.correcciones || []).map((c: any) => `"${c.mal}" → "${c.bien}"`).join("; ")}` : ""}`).join("\n");
  const ultWeekly = (w.data || [])[0];
  return `DATOS DE LA ALUMNA (lo que ve en su app; hoy es ${hoy}). Si un dato está vacío, no lo inventes.
Nombre: ${a.nombre || "(sin cargar)"}. Formato: ${a.formato || "LAB"}. Trabajo: ${a.trabajo || "(sin cargar)"}.
Objetivo a 5 meses: ${a.objetivo || "(todavía no lo definió: es parte del onboarding)"}.
Confianza al hablar en reuniones: al empezar ${a.confianza_inicio ?? "?"}/10, hoy ${a.confianza_hoy ?? "?"}/10. Audio de punto de partida: ${a.audio_inicio || "no grabado todavía"}.
Foco de esta semana (lo eligió Flor): ${a.foco_titulo ? `${a.foco_titulo}. ${a.foco_texto || ""}` : "(Flor todavía no lo cargó)"}
Dónde está en el programa: ${MODULOS[a.modulo_actual ?? 0]}. El programa no es lineal: Flor asigna las clases según su diagnóstico.
Clases asignadas ahora: ${(a.clases_asignadas || []).join(", ") || "(ninguna todavía)"}.
Tareas de esta semana:
${(t.data || []).map((x: any) => `- [${x.hecha ? "hecha" : "pendiente"}] ${x.texto}${x.donde ? ` (${x.donde})` : ""}`).join("\n") || "- (sin tareas cargadas)"}
Últimos pedidos de feedback a Flor:
${fb || "- (ninguno)"}
Patrones de error: ${(pa.data || []).map((x: any) => `${x.patron} (${x.tipo}, ${x.estado})`).join("; ") || "(sin cargar)"}.
Último weekly: ${ultWeekly ? `semana del ${ultWeekly.semana}, ${ultWeekly.enviado_en ? "enviado" : "borrador"}${ultWeekly.respuesta_flor ? `; Flor respondió: ${ultWeekly.respuesta_flor}` : ""}` : "todavía no completó ninguno"}.
Onboarding: ${(a.onboarding || []).length} de 8 pasos hechos.
Próximo lab: ${lab.fecha ? `${lab.fecha}, ${lab.horario || ""}. Tema: ${lab.tema || "(a confirmar)"}.` : "(Flor todavía no cargó la fecha)"}
Links: plataforma ${links.plataforma || "(consultar a Flor)"}; reservar 1:1 ${links.reservar || "(consultar a Flor)"}; comunidad ${links.comunidad || "(consultar a Flor)"}; su Drive ${a.drive_url || "(consultar a Flor)"}.
${prog.aviso ? `Aviso de Flor para todas: ${prog.aviso}` : ""}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const auth = req.headers.get("Authorization") || "";
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
  if (!u?.user) return json({ error: "Tienes que iniciar sesión." }, 401);
  const uid = u.user.id;

  let body: { modo?: string; chat_id?: number; mensaje?: string; pedido_id?: number; weekly_id?: number };
  try { body = await req.json(); } catch { return json({ error: "Pedido inválido" }, 400); }

  // ---------- Modo invitar: solo Flor. Le manda a la alumna el mail para crear su contraseña. ----------
  if (body.modo === "invitar") {
    const { data: yo } = await db.from("perfiles").select("rol").eq("id", uid).single();
    if (yo?.rol !== "admin") return json({ error: "Solo Flor puede invitar alumnas." }, 403);
    const b = body as { email?: string; nombre?: string; redirect?: string };
    const email = (b.email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Ese mail no parece válido." }, 400);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { nombre: (b.nombre || "").trim() },
      redirectTo: b.redirect || undefined,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  // ---------- Modo borrador: solo Flor (admin). Arma un borrador de feedback para un pedido o un weekly. ----------
  if (body.modo === "borrador") {
    const { data: yo } = await db.from("perfiles").select("rol").eq("id", uid).single();
    if (yo?.rol !== "admin") return json({ error: "Solo Flor puede usar esto." }, 403);
    let alumnaId = "", material = "";
    if (body.pedido_id) {
      const { data: x } = await db.from("pedidos").select("*").eq("id", body.pedido_id).single();
      if (!x) return json({ error: "No encontré el pedido." }, 404);
      alumnaId = x.alumna_id;
      material = `PEDIDO DE FEEDBACK (${x.tipo}): ${x.titulo}\n${x.texto}${x.link ? `\nLink: ${x.link}` : ""}`;
    } else if (body.weekly_id) {
      const { data: x } = await db.from("weekly").select("*").eq("id", body.weekly_id).single();
      if (!x) return json({ error: "No encontré el weekly." }, 404);
      alumnaId = x.alumna_id;
      material = `WEEKLY REPORT de la semana del ${x.semana}:\n${Object.entries(x.respuestas || {}).map(([k, v]) => `${k}: ${v}`).join("\n")}`;
    } else return json({ error: "Falta el pedido o el weekly." }, 400);

    const sistema = `Eres el asistente de Flor Pérsico (AT WORK). Escribes un BORRADOR de la respuesta que Flor le va a mandar a su alumna, con la voz y el criterio de Flor: cálida, directa, primero lo que funcionó con evidencia (su frase), después UN foco (máximo dos) con el para qué, después las correcciones puntuales y el próximo paso concreto (qué clase ver, qué practicar con qué coach, qué traer al lab). Español neutro con tú. Corto: lo lee en el celular. Nada de elogios vacíos. No marques como error lo que está bien.
Devuelve exactamente este formato:
RESPUESTA:
(el texto para la alumna)
CORRECCIONES:
frase con error => frase corregida
(una por línea, máximo 5; si no hay, escribe "ninguna")`;
    const ctx = await contexto(db, alumnaId);
    const r = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium" },
      system: sistema,
      messages: [{ role: "user", content: `${ctx}\n\n${material}` }],
    // deno-lint-ignore no-explicit-any
    } as any);
    if (r.stop_reason === "refusal") return json({ error: "La IA no pudo armar este borrador. Escríbelo a mano." }, 422);
    // deno-lint-ignore no-explicit-any
    const texto = r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
    const [resp, corr = ""] = texto.split(/CORRECCIONES:/i);
    const correcciones = corr.split("\n").map((l) => l.split("=>")).filter((p) => p.length === 2 && p[0].trim())
      .map(([mal, bien]) => ({ mal: mal.replace(/^[-•\s]+/, "").trim(), bien: bien.trim() }));
    return json({ respuesta: resp.replace(/RESPUESTA:/i, "").trim(), correcciones });
  }

  // ---------- Modo chat: Flor AI o un coach ----------
  const mensaje = (body.mensaje || "").trim();
  if (!mensaje || !body.chat_id) return json({ error: "Falta el mensaje." }, 400);
  if (mensaje.length > 20000) return json({ error: "El mensaje es muy largo. Pégalo en partes." }, 400);

  const { data: chat } = await db.from("chats").select("*").eq("id", body.chat_id).single();
  if (!chat) return json({ error: "No encontré esta conversación." }, 404);
  const coach = COACHES[chat.coach] || COACHES.flor;

  // Límite diario por alumna, para cuidar tu gasto.
  const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: misChats } = await db.from("chats").select("id").eq("alumna_id", uid);
  const ids = (misChats || []).map((c: { id: number }) => c.id);
  const { count } = await db.from("mensajes").select("id", { count: "exact", head: true })
    .in("chat_id", ids.length ? ids : [0]).eq("rol", "user").gte("creado", desde);
  if ((count || 0) >= LIMITE) return json({ error: "Llegaste al límite de mensajes de hoy. Mañana seguimos." }, 429);

  const { data: hist } = await db.from("mensajes").select("rol,contenido").eq("chat_id", chat.id).order("id", { ascending: false }).limit(40);
  const previos = (hist || []).reverse();
  await db.from("mensajes").insert({ chat_id: chat.id, rol: "user", contenido: mensaje });
  if (!previos.length) {
    await db.from("chats").update({ titulo: mensaje.slice(0, 60) }).eq("id", chat.id);
  }

  const ctx = await contexto(db, uid);
  const messages = [...previos.map((m: { rol: string; contenido: string }) => ({ role: m.rol, content: m.contenido })), { role: "user", content: mensaje }];

  const params = {
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: EFFORT },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default", // si el modelo declina, el servidor de Anthropic reintenta con el modelo recomendado
    system: [
      { type: "text", text: coach.prompt, cache_control: { type: "ephemeral" } },
      { type: "text", text: `${ctx}\n\nEs un chat en vivo: empieza tu respuesta visible enseguida.` },
    ],
    messages,
  };

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      let completo = "";
      try {
        // deno-lint-ignore no-explicit-any
        const s = anthropic.beta.messages.stream(params as any);
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
        const aviso = "\n\n_Se cortó la conexión con Flor AI. Intenta de nuevo en un momento._";
        completo += aviso;
        ctrl.enqueue(enc.encode(aviso));
      }
      if (completo.trim()) await db.from("mensajes").insert({ chat_id: chat.id, rol: "assistant", contenido: completo });
      ctrl.close();
    },
  });

  return new Response(stream, { headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" } });
});
