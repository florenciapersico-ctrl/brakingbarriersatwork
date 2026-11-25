// Auditor de contenido de la app de Flor (botón «Auditar con el criterio de Ann» en la solapa Contenido).
// Aplica la skill auditoria-de-contenido (prompts/auditor.md de flor-ai, leída desde GitHub) y propone hooks
// modelados sobre el banco public.hooks_validados. Solo Flor (rol admin).
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const MODEL = Deno.env.get("FLOR_AI_MODEL") || "claude-sonnet-5-5";
const PROMPTS_URL = (Deno.env.get("PROMPTS_URL") ||
  "https://raw.githubusercontent.com/florenciapersico-ctrl/brakingbarriersatwork/app-produccion/supabase/functions/flor-ai/prompts/").replace(/\/?$/, "/");
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}
let _ai: Anthropic | null = null;
const ia = () => (_ai ??= new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") }));
let _skill: { t: number; txt: string } | null = null;
async function prompt(_nombre: string): Promise<string> {
  if (_skill && Date.now() - _skill.t < 10 * 60 * 1000) return _skill.txt;
  try {
    const r = await fetch(PROMPTS_URL + "auditor.md", { headers: { "Cache-Control": "no-cache" } });
    if (!r.ok) throw new Error(String(r.status));
    _skill = { t: Date.now(), txt: await r.text() };
    return _skill.txt;
  } catch (_e) { return _skill ? _skill.txt : ""; }
}
// deno-lint-ignore no-explicit-any
async function esAdmin(db: any, uid: string) {
  const { data } = await db.from("perfiles").select("rol").eq("id", uid).single();
  return data?.rol === "admin";
}

// ---------- auditor de contenido con el criterio de Ann Sahakyan (skill auditoria-de-contenido) ----------
const AUDITOR = `USO DENTRO DE LA APP DE FLOR: arriba tenés la skill completa de Auditoría de Contenido (criterio de Ann Sahakyan). Aplicala tal cual a esta pieza de Instagram de Flor Pérsico (AT WORK, @ysi_speakenglish). No hagas las preguntas del Paso 1: los datos de Flor están acá abajo. En vez del formato de texto del Paso 4, devolvé el JSON del final (mismos contenidos: lo que funciona, Brecha o Solución, puntaje, el verdadero problema, dónde aparece, por qué frena, el cambio de enfoque y el próximo paso), y además dejá la pieza mejor: hooks del banco validado y las láminas que más frenan reescritas.

CLIENTA IDEAL (ICP1) DE FLOR: mujer profesional hispanohablante, B1+ a B2, que YA trabaja en inglés en relación de dependencia (reuniones, presentaciones, auditorías, clientes internacionales; muchas recién empiezan un puesto nuevo). Se bloquea en el momento, traduce mentalmente y siente que su inglés no refleja su nivel profesional. Ya probó cursos, apps y profes de conversación. NO es dueña de empresa, ni emprendedora, ni empieza de cero. Etapa del ecosistema de Flor: En marcha.

LA PREGUNTA QUE MANDA: ¿esta pieza hace que la clienta vea su problema distinto y cuestione lo que viene haciendo (BRECHA), o le da información para guardar y seguir igual (SOLUCIÓN)? Lentes en orden: 1) ¿le habla al ICP1 (la que ya intentó y falló) o al nicho? 2) ¿instala una creencia o da información? 3) ¿nombra el mecanismo o el síntoma? (culpá al sistema, no a la persona) 4) ¿frena el scroll? (hook) 5) ¿abre una conversación o un camino? (CTA como GPS, con palabra clave y algo concreto que recibe) 6) ¿parece un anuncio?

HOOKS: NUNCA inventes un hook de cero. Cada hook que propongas MODELA la ESTRUCTURA de palabras de UN hook del banco de hooks validados que te paso (estructura vs piel: se copia el esqueleto, se cambian las palabras a la idea de Flor y a su clienta). Elegí el hook validado cuya estructura le sirva a la idea de la pieza, no al revés; si el original le habla a otro público, igual podés usar su esqueleto, pero las palabras tienen que ser de la clienta de Flor. El hook de portada se tiene que entender en un segundo en el feed: titulo (bold) + titulo_i (remate en itálica), entre 4 y 12 palabras en total, y abre un bucle que la lámina 2 no cierra. Copiá exacto, en "modelado_de", la cuenta, el hook original y el link del banco.

REGLAS DE FLOR: español neutro con TÚ (no voseo) en todo lo que va a la pieza. Alumnas con nombre solo Belem, Sol y Lina. Sin rayas largas. «Estadounidenses», nunca «americanos». Nada de READY salvo que la pieza sea de conversión. Nunca inventes números, testimonios ni resultados: si falta una prueba, marcá el hueco [acá va un resultado real]. Prohibido: «empodérate», «desbloquea», «descubre», «transforma tu vida», «zona de confort», tono de academia.

SI LA PIEZA TIENE LÁMINAS: proponé reescrituras SOLO de las láminas que más frenan (máximo 4), conservando la voz, la historia y los hechos de Flor. Una idea por lámina, títulos de 15 palabras como mucho. Si una lámina está bien, no la toques. Si Flor pide algo puntual en su pedido, hacelo con este mismo criterio.

DEVOLVÉ SOLO UN JSON, sin texto antes ni después, con esta forma:
{"puntaje": 1-10, "clasificacion": "Brecha" o "Solución", "funciona": ["2 o 3 cosas reales que ya funcionan, citando la línea"], "problema": "una frase: la causa raíz principal", "donde": "lámina o línea exacta, con cita corta", "por_que": ["3 puntos: qué piensa o siente la clienta al llegar ahí"], "cambio": "un párrafo: la dirección para arreglarlo, aplicada a esta pieza", "hooks": [{"titulo": "…", "titulo_i": "…", "por_que": "una línea", "modelado_de": {"cuenta": "…", "hook": "…", "link": "…"}}], "laminas": [{"n": número de lámina (1 = portada), "titulo": "…", "titulo_i": "…", "cuerpo": "…", "por_que": "una línea"}], "cta": "CTA propuesto (palabra clave + qué recibe), o vacío si el actual está bien", "proximo_paso": "una acción chica y concreta"}
Siempre 3 hooks. "laminas" puede ir vacío. El diagnóstico y los "por_que" van en español rioplatense (vos), cortos y directos, como Ann en una revisión en vivo.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const auth = req.headers.get("Authorization") || "";
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: u } = await db.auth.getUser(auth.replace("Bearer ", ""));
  if (!u || !u.user) return json({ error: "Iniciá sesión de nuevo." }, 401);
  const uid = u.user.id;
  // deno-lint-ignore no-explicit-any
  let body: any = {};
  try { body = await req.json(); } catch (_e) { return json({ error: "Pedido inválido." }, 400); }
  if (!(await esAdmin(db, uid))) return json({ error: "Solo Flor puede usar esto." }, 403);
    if (!Deno.env.get("ANTHROPIC_API_KEY")) return json({ error: "Para auditar con IA falta cargar ANTHROPIC_API_KEY en Supabase › Edge Functions › Secrets." }, 503);
    const { data: fila } = await admin.from("hoy_flor").select("fecha,clave,titulo,detalle,texto,texto2,carrusel").eq("clave", String(body.clave || "")).eq("fecha", String(body.fecha || "")).maybeSingle();
    if (!fila) return json({ error: "No encontré esa pieza." }, 404);
    const { data: hooks } = await admin.from("hooks_validados").select("cuenta,hook,formato,metrica,veces,link").order("veces", { ascending: false, nullsFirst: false }).limit(80);
    const { data: prev } = await admin.from("hoy_flor").select("fecha,titulo").like("clave", "pieza:%").lt("fecha", fila.fecha).order("fecha", { ascending: false }).limit(15);
    // deno-lint-ignore no-explicit-any
    const pl = ((fila.carrusel && fila.carrusel.placas) || []).map((p: any, i: number) => `${i + 1} · [${p.forma}] ` + Object.entries(p).filter(([k, v]) => typeof v === "string" && v && !k.startsWith("_") && !["forma", "foto", "tpl", "color", "pos"].includes(k)).map(([k, v]) => `${k}: ${v}`).join(" | ")).join("\n");
    // deno-lint-ignore no-explicit-any
    const banco = (hooks || []).map((h: any, i: number) => `H${i + 1} · @${h.cuenta} · ${h.formato || ""} · ${h.metrica || ""}${h.veces ? ` (${h.veces}x su mediana)` : ""} · ${h.link}\n   «${h.hook}»`).join("\n");
    const material = `PIEZA DEL ${fila.fecha}\nTítulo: ${fila.titulo || ""}\nDetalle: ${fila.detalle || ""}\n\nLÁMINAS ACTUALES DEL DISEÑO:\n${pl || "(todavía sin diseño)"}\n\nGUION / TEXTO DE LAS PLACAS:\n${fila.texto2 || ""}\n\nCAPTION:\n${fila.texto || ""}\n\nBANCO DE HOOKS VALIDADOS (outliers de referentes y de Flor):\n${banco || "(vacío)"}\n\nÚLTIMAS PIEZAS (no repetir hook ni estructura):\n${(prev || []).map((x: { fecha: string; titulo: string }) => `- ${x.fecha}: ${x.titulo}`).join("\n")}\n\nPEDIDO DE FLOR: ${String(body.pedido || "").slice(0, 1500) || "(auditá la pieza y proponé 3 hooks del banco)"}`;
    const skill = await prompt("auditor.md");
    try {
      const r = await ia().messages.create({
        model: MODEL, max_tokens: 12000, output_config: { effort: "medium" },
        system: [{ type: "text", text: (/Auditor[ií]a de Contenido/i.test(skill) ? skill + "\n\n" : "") + AUDITOR, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: material }],
      // deno-lint-ignore no-explicit-any
      } as any);
      if (r.stop_reason === "refusal") throw new Error("La IA no pudo auditar esta pieza.");
      // deno-lint-ignore no-explicit-any
      const t = r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
      const m = t.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("La IA no devolvió la auditoría. Probá de nuevo.");
      return json({ ok: true, auditoria: JSON.parse(m[0]) });
    } catch (e) {
      console.error(e);
      return json({ error: String((e as Error).message) }, 500);
    }
  
});
