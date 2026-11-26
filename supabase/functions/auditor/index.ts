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
const AUDITOR = `USO DENTRO DE LA APP DE FLOR: arriba tenés la skill completa de Auditoría de Contenido (criterio de Ann Sahakyan) y, al final, las reglas de la app de Flor, que MANDAN sobre todo lo demás (regla de oro de los hooks textuales del banco, el hook partido para la portada que tiene el posteo y el formato del JSON). Aplicalas a esta pieza de Instagram de Flor Pérsico (AT WORK, @ysi_speakenglish). No hagas las preguntas del Paso 1: los datos de Flor están acá abajo.

CLIENTA IDEAL (ICP1) DE FLOR: mujer profesional hispanohablante, B1+ a B2, que YA trabaja en inglés en relación de dependencia (reuniones, presentaciones, auditorías, clientes internacionales; muchas recién empiezan un puesto nuevo). Se bloquea en el momento, traduce mentalmente y siente que su inglés no refleja su nivel profesional. Ya probó cursos, apps y profes de conversación. NO es dueña de empresa, ni emprendedora, ni empieza de cero. Etapa del ecosistema de Flor: En marcha.

REGLAS DE FLOR: español neutro con TÚ (no voseo) en todo lo que va a la pieza. Alumnas con nombre solo Belem, Sol y Lina. Sin rayas largas. «Estadounidenses», nunca «americanos». Nada de READY salvo que la pieza sea de conversión. Nunca inventes números, testimonios ni resultados: si falta una prueba, marcá el hueco [acá va un resultado real]. Prohibido: «empodérate», «desbloquea», «descubre», «transforma tu vida», «zona de confort», tono de academia.

DEVOLVÉ SOLO UN JSON, sin texto antes ni después, con el formato de «Formato del JSON» de las reglas de la app.`;
const FORMATO = `Formato del JSON: {"puntaje": 1-10, "clasificacion": "Brecha" o "Solución", "funciona": ["…"], "problema": "…", "donde": "…", "por_que": ["…"], "cambio": "…", "hooks": [{"titulo": "…", "titulo_i": "…", "pre": "…", "palabra": "…", "pill": "…", "opciones": "…", "por_que": "…", "modelado_de": {"cuenta": "…", "hook": "…", "link": "…"}}], "laminas": [{"n": 2, "titulo": "…", "titulo_i": "…", "cuerpo": "…", "por_que": "…"}], "cta": "…", "proximo_paso": "…"}. Los 3 hooks salen TEXTUALES del banco de hooks validados.`;
// Reels (Flor, 26/11): la auditoría de un reel le devuelve también el prompter nuevo, listo para grabar.
const REEL = `SI LA PIEZA ES UN REEL (el título empieza con «Reel»): además de todo lo anterior, sumá al JSON dos campos:
"pantalla": el texto en pantalla nuevo (el hook que elegirías, una línea),
"prompter": el prompter COMPLETO para grabar, ya con el cambio aplicado (no solo el hook): primera línea «TONO: …» con cómo decirlo y ≈cuántas palabras (130 a 170), una línea en blanco, y después el guion en bloques cortos separados por una línea en blanco, cada línea terminada en « /» donde Flor respira, en la voz de Flor hablándole a una alumna (TÚ), sin historias del día. Si es un carrusel, no agregues esos campos.`;
// Pasar un reel a carrusel (Flor, 26/11).
const A_CARRUSEL = `TAREA: Flor quiere convertir este REEL en un CARRUSEL de Instagram con la misma idea central, aplicando el criterio de Ann (Brecha vs Solución, una creencia por pieza, hook del banco de hooks validados) y sus reglas. Esta tarea REEMPLAZA el formato de auditoría: devolvé SOLO este JSON:
{"hook": "el hook de la portada", "tipo": "Valor" | "Demanda" | "Crecimiento" | "Inspira" | "Conversión", "placas": "7 a 9 líneas, una por lámina, con el formato «N · frase principal / frase en itálica / cuerpo opcional». La 1 es la portada (el hook partido en dos). Una creencia tachada va entre ~~ ~~ (ej.: «4 · Lo que pensabas: / ~~Me falta vocabulario~~ / Te faltaba orden.»). La última lámina es el cierre y termina con el CTA (Guárdalo / Comenta PALABRA).", "caption": "el caption completo, en la voz de Flor", "historias": "4 líneas «N · …» con las historias del día", "modelado_de": {"cuenta": "…", "hook": "…", "link": "…"}, "por_que": "en una línea, por qué funciona mejor como carrusel"}`;
// Crear un posteo nuevo desde un hook del banco (Flor, 26/11: «usar ese hook para crear un posteo, tal cual o adaptado a mí»).
const DESDE_HOOK = (talCual: boolean) => `TAREA: Flor eligió un hook de su banco de hooks validados para crear un CARRUSEL nuevo de Instagram. ${talCual ? "Usá el hook TAL CUAL en la portada (solo pasalo a español neutro con TÚ si hace falta; no cambies palabras)." : "MODELÁ el hook: mantené su estructura y su gancho, pero adaptalo a la clienta ideal de Flor, a su método y a su voz (puede cambiar la escena para que sea del trabajo de ella)."} Si el posteo original depende de una cultura (británica, estadounidense) o de la historia personal de otra persona, llevalo a la situación de la clienta de Flor. Aplicá el criterio de Ann (Brecha vs Solución, una creencia por pieza) y las reglas de Flor. Revisá la lista de lo que Flor YA PUBLICÓ: no repitas un hook, una historia ni una idea central de ahí. Devolvé SOLO este JSON:
{"hook": "el hook de la portada", "tipo": "Valor" | "Demanda" | "Crecimiento" | "Inspira" | "Conversión", "placas": "7 a 9 líneas, una por lámina, con el formato «N · frase principal / frase en itálica / cuerpo opcional». La 1 es la portada (el hook partido en dos). Una creencia tachada va entre ~~ ~~ (ej.: «4 · Lo que pensabas: / ~~Me falta vocabulario~~ / Te faltaba orden.»). La última lámina es el cierre y termina con el CTA (Guárdalo / Comenta PALABRA).", "caption": "el caption completo, en la voz de Flor", "historias": "4 líneas «N · …» con las historias del día", "por_que": "en una línea, qué tomaste del original y qué cambiaste"}`;
const pubTxt = (pub: { fecha: string; tipo: string; caption: string }[] | null) => (pub || []).map((x) => `- ${String(x.fecha).slice(0, 10)} · ${x.tipo === "Video" ? "Reel" : "Carrusel"} · ${String(x.caption || "").replace(/\s+/g, " ").slice(0, 300)}`).join("\n") || "(sin datos)";
const DIA = 864e5;

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
    // Descartar un hook del banco.
    if (body.modo === "descartar_hook") {
      const { error } = await admin.from("hooks_validados").update({ descartado: true }).eq("id", Number(body.hook_id));
      return error ? json({ error: error.message }, 500) : json({ ok: true });
    }
    // Crear un posteo desde un hook del banco y dejarlo en el próximo día libre de carrusel (martes a sábado).
    if (body.modo === "desde_hook") {
      const { data: h } = await admin.from("hooks_validados").select("id,cuenta,hook,formato,metrica,veces,link").eq("id", Number(body.hook_id)).maybeSingle();
      if (!h) return json({ error: "No encontré ese hook." }, 404);
      const { data: pub0 } = await admin.from("ig_publicados").select("fecha,tipo,caption").order("fecha", { ascending: false }).limit(60);
      const hoyAR = new Date(Date.now() - 3 * 3600e3), desde = new Date(Date.UTC(hoyAR.getUTCFullYear(), hoyAR.getUTCMonth(), hoyAR.getUTCDate()) + DIA);
      const iso = (d: Date) => d.toISOString().slice(0, 10);
      const { data: ocup } = await admin.from("hoy_flor").select("fecha,titulo").eq("tipo", "subir").like("clave", "pieza:%").gte("fecha", iso(desde)).lte("fecha", iso(new Date(desde.getTime() + 60 * DIA)));
      const { data: plan } = await admin.from("hoy_flor").select("fecha,titulo").like("clave", "pieza:%").gte("fecha", iso(new Date(desde.getTime() - 14 * DIA))).order("fecha");
      const usadas = new Set((ocup || []).map((x: { fecha: string }) => x.fecha));
      let fecha = "";
      for (let i = 0; i < 60 && !fecha; i++) { const d = new Date(desde.getTime() + i * DIA), w = d.getUTCDay(); if (w >= 2 && w <= 6 && !usadas.has(iso(d))) fecha = iso(d); }
      const skill0 = await prompt("auditor.md");
      const mat = `HOOK ELEGIDO: «${h.hook}»\nDe @${h.cuenta} · ${h.formato || ""} · ${h.metrica || ""}${h.veces ? ` · ${h.veces}x su mediana` : ""} · ${h.link || ""}\n\nYA PUBLICADO EN SU INSTAGRAM (no repetir):\n${pubTxt(pub0)}\n\nPIEZAS YA PLANIFICADAS (no repetir):\n${(plan || []).map((x: { fecha: string; titulo: string }) => `- ${x.fecha}: ${x.titulo}`).join("\n")}\n\nPEDIDO DE FLOR: ${String(body.pedido || "").slice(0, 1500) || "(ninguno)"}`;
      try {
        const r = await ia().messages.create({
          model: MODEL, max_tokens: 8000, output_config: { effort: "medium" },
          system: [{ type: "text", text: (/Auditor[ií]a de Contenido/i.test(skill0) ? skill0 + "\n\n" : "") + AUDITOR + "\n\n" + DESDE_HOOK(!!body.tal_cual) }],
          messages: [{ role: "user", content: mat }],
        // deno-lint-ignore no-explicit-any
        } as any);
        // deno-lint-ignore no-explicit-any
        const t = r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
        const m = t.match(/\{[\s\S]*\}/);
        if (!m) throw new Error("La IA no devolvió el posteo. Probá de nuevo.");
        const c = JSON.parse(m[0]);
        const clave = "pieza:hook-" + h.id + "-" + Date.now().toString(36);
        const fila = {
          fecha, clave, tipo: "subir", orden: 1, hecho: false,
          titulo: "Carrusel · " + (c.hook || h.hook),
          detalle: `${c.tipo || "Valor"} · HOOK ${body.tal_cual ? "VALIDADO TEXTUAL" : "MODELADO"} de @${h.cuenta} (${h.metrica || ""}${h.veces ? `, ${h.veces}x su mediana` : ""}): «${h.hook}». Creado desde el banco de hooks el ${iso(hoyAR)}.${c.por_que ? " " + c.por_que : ""}`,
          link: h.link || null, texto: c.caption || "",
          texto2: (String(c.placas || "").trim() + (c.historias ? "\n\n📱 HISTORIAS DEL DÍA\n" + String(c.historias).trim() : "")).trim(),
        };
        const { error } = await admin.from("hoy_flor").insert(fila);
        if (error) throw new Error(error.message);
        await admin.from("hooks_validados").update({ usado_fecha: fecha, usado_clave: clave }).eq("id", h.id);
        return json({ ok: true, fecha, clave, pieza: fila });
      } catch (e) {
        console.error(e);
        return json({ error: String((e as Error).message) }, 500);
      }
    }
    const { data: fila } = await admin.from("hoy_flor").select("fecha,clave,titulo,detalle,texto,texto2,carrusel").eq("clave", String(body.clave || "")).eq("fecha", String(body.fecha || "")).maybeSingle();
    if (!fila) return json({ error: "No encontré esa pieza." }, 404);
    const { data: hooks } = await admin.from("hooks_validados").select("cuenta,hook,formato,metrica,veces,link").eq("descartado", false).order("veces", { ascending: false, nullsFirst: false }).limit(80);
    // Lo que ya está publicado en Instagram (Flor, 26/11: «que se fije lo que ya está publicado para no repetir»).
    const { data: pub } = await admin.from("ig_publicados").select("fecha,tipo,caption").order("fecha", { ascending: false }).limit(60);
    const { data: prev } = await admin.from("hoy_flor").select("fecha,titulo").like("clave", "pieza:%").lt("fecha", fila.fecha).order("fecha", { ascending: false }).limit(15);
    // deno-lint-ignore no-explicit-any
    const pl = ((fila.carrusel && fila.carrusel.placas) || []).map((p: any, i: number) => `${i + 1} · [${p.forma}] ` + Object.entries(p).filter(([k, v]) => typeof v === "string" && v && !k.startsWith("_") && !["forma", "foto", "tpl", "color", "pos"].includes(k)).map(([k, v]) => `${k}: ${v}`).join(" | ")).join("\n");
    // deno-lint-ignore no-explicit-any
    const banco = (hooks || []).map((h: any, i: number) => `H${i + 1} · @${h.cuenta} · ${h.formato || ""} · ${h.metrica || ""}${h.veces ? ` (${h.veces}x su mediana)` : ""} · ${h.link}\n   «${h.hook}»`).join("\n");
    const material = `PIEZA DEL ${fila.fecha}\nTítulo: ${fila.titulo || ""}\nDetalle: ${fila.detalle || ""}\n\nLÁMINAS ACTUALES DEL DISEÑO:\n${pl || "(todavía sin diseño)"}\n\nGUION / TEXTO DE LAS PLACAS:\n${fila.texto2 || ""}\n\nCAPTION:\n${fila.texto || ""}\n\nBANCO DE HOOKS VALIDADOS (outliers de referentes y de Flor):\n${banco || "(vacío)"}\n\nYA PUBLICADO EN SU INSTAGRAM (@ysi_speakenglish), del más nuevo al más viejo. REGLA DURA: no propongas un hook, una historia de alumna ni un mecanismo que ya esté acá. Si la pieza que auditás repite algo de esta lista (mismo hook, misma alumna con el mismo episodio o la misma idea central), decilo primero en «problema» indicando la fecha del posteo publicado, bajá el puntaje y proponé un ángulo nuevo:\n${(pub || []).map((x: { fecha: string; tipo: string; caption: string }) => `- ${String(x.fecha).slice(0, 10)} · ${x.tipo === "Video" ? "Reel" : "Carrusel"} · ${String(x.caption || "").replace(/\s+/g, " ").slice(0, 300)}`).join("\n") || "(sin datos)"}\n\nÚLTIMAS PIEZAS PLANIFICADAS (no repetir hook ni estructura):\n${(prev || []).map((x: { fecha: string; titulo: string }) => `- ${x.fecha}: ${x.titulo}`).join("\n")}\n\nPEDIDO DE FLOR: ${String(body.pedido || "").slice(0, 1500) || "(auditá la pieza y proponé 3 hooks del banco)"}`;
    const skill = await prompt("auditor.md");
    const aCarr = body.modo === "carrusel";
    try {
      const r = await ia().messages.create({
        model: MODEL, max_tokens: 12000, output_config: { effort: "medium" },
        system: [{ type: "text", text: (/Auditor[ií]a de Contenido/i.test(skill) ? skill + "\n\n" : "") + AUDITOR + (/Formato del JSON/.test(skill) ? "" : "\n\n" + FORMATO) + "\n\n" + REEL + (aCarr ? "\n\n" + A_CARRUSEL : ""), cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: material }],
      // deno-lint-ignore no-explicit-any
      } as any);
      if (r.stop_reason === "refusal") throw new Error("La IA no pudo auditar esta pieza.");
      // deno-lint-ignore no-explicit-any
      const t = r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
      const m = t.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("La IA no devolvió la auditoría. Probá de nuevo.");
      return json(aCarr ? { ok: true, carrusel: JSON.parse(m[0]) } : { ok: true, auditoria: JSON.parse(m[0]) });
    } catch (e) {
      console.error(e);
      return json({ error: String((e as Error).message) }, 500);
    }
  
});
