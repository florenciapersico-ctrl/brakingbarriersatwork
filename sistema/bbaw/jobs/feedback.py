"""Feedback de alumnas a escala (rutinas/feedback-sistema.md).

1 Recepción   entregas nuevas por mail Y por Drive, de todas las alumnas activas
2 Contexto    ficha, notas de la última clase/lab, devoluciones anteriores
3 Armado      con la skill, la voz y el criterio de Flor
4 Revisión    una segunda IA, independiente, verifica cada corrección
5 Semáforo    🟢 / 🟡 / 🔴
6 Notion      una fila por entrega en "💬 Feedback para revisar"
7 Aviso       un solo mail a Flor con etiqueta
El envío a la alumna lo hace jobs/send_approved.py, solo con aprobación.
"""
from __future__ import annotations

import datetime as dt
import re
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field

from pydantic import BaseModel, Field

from .. import content, google_api as g, guard, knowledge, llm, notion_api as n
from ..config import (FLOR_EMAIL, FLOR_OTHER_EMAILS, LABEL_FEEDBACK, NOTION_ALUMNAS_DS,
                      NOTION_FEEDBACK_DS, NOTION_FEEDBACK_URL)

ACTIVE = ("Activa", "Confirmada", "Renovó")
FLOR_ADDRS = {FLOR_EMAIL, *FLOR_OTHER_EMAILS}
DELIVERY_HINTS = re.compile(r"\b(tarea|homework|weekly|report|audio|grab[eé]|te mando|te env[ií]o|ya hice|"
                            r"adjunto|attached|worksheet|hoja|practice|pr[aá]ctica)\b", re.I)


# ---------- modelo de datos ----------

@dataclass
class Student:
    page_id: str
    name: str
    email: str
    formato: str  # "1:1" o "Lab"
    folder_id: str | None
    ficha: dict


@dataclass
class Delivery:
    student: Student
    source: str  # "Mail" o "Drive"
    link: str
    key: str  # para no duplicar: id de hilo+mensaje o id de archivo+fecha
    received: str
    blocks: list[dict] = field(default_factory=list)
    thread_id: str | None = None
    reply_to_header: str | None = None
    subject: str = ""


class Draft(BaseModel):
    es_entrega: bool = Field(description="False si no es una tarea/weekly/práctica para devolver (ej. una pregunta logística)")
    motivo_si_no: str = ""
    tarea: str = Field(description="Qué entregó, en pocas palabras (ej. 'Weekly 2/11', 'audio OKR')")
    falta_info: list[str] = Field(default_factory=list, description="Lo que falta para poder armar la devolución")
    asunto: str = ""
    devolucion: str = Field(default="", description="Texto completo para la alumna, listo para mandar, en la voz de Flor")
    notas_para_flor: str = ""
    dudas_para_flor: list[str] = Field(default_factory=list,
                                       description="Cosas puntuales que Flor tiene que mirar (ej. 'escuchá 0:20')")


class Problem(BaseModel):
    tipo: str
    detalle: str


class Review(BaseModel):
    problemas: list[Problem] = Field(default_factory=list)
    devolucion_corregida: str = Field(default="", description="Vacío si no hubo que corregir nada")
    dudas_para_flor: list[str] = Field(default_factory=list)


# ---------- 1 · recepción ----------

def _folder_id(url: str) -> str | None:
    ids = content.drive_ids_in(url or "")
    return ids[0] if ids else None


def active_students() -> list[Student]:
    out = []
    for p in n.query(NOTION_ALUMNAS_DS):
        estado = n.prop_text(p, "Estado programa") or n.prop_text(p, "Estado")
        lab = n.prop_text(p, "Lab")
        email = n.prop_text(p, "Email")
        if estado not in ACTIVE or not email or lab.startswith("Grupo reducido"):
            continue
        es_lab = n.prop_text(p, "Programa") == "AT WORK grupal" or lab.startswith("Lab")
        out.append(Student(page_id=p["id"], name=n.prop_text(p, "Alumna"), email=email.strip(),
                           formato="Lab" if es_lab else "1:1",
                           folder_id=_folder_id(n.prop_text(p, "Carpeta Drive")),
                           ficha={k: n.prop_text(p, k) for k in ("Nivel", "País", "Programa", "Lab", "Notas", "Notas tracker")}))
    return out


def known_keys() -> set[str]:
    keys = set()
    for row in n.query(NOTION_FEEDBACK_DS):
        keys.add(n.prop_text(row, "Link a la entrega"))
        keys.add(n.prop_text(row, "Hilo de Gmail"))
    keys.discard("")
    return keys


def mail_deliveries(s: Student, since: dt.datetime) -> list[Delivery]:
    out = []
    after = since.strftime("%Y/%m/%d")
    for t in g.search_threads(f"from:{s.email} after:{after}", limit=20):
        thread = g.get_thread(t["id"])
        theirs = [m for m in thread["messages"] if s.email.lower() in m["from"].lower()]
        if not theirs:
            continue
        last = theirs[-1]
        has_material = last["attachments"] or content.drive_ids_in(last["text"]) or DELIVERY_HINTS.search(
            last["subject"] + " " + last["text"][:3000])
        if not has_material:
            continue
        blocks = [{"type": "text", "text": f"MAIL de {s.name} · {last['date']} · Asunto: {last['subject']}\n\n{last['text']}"}]
        for a in last["attachments"][:6]:
            if a.get("attachmentId"):
                data = g.get_attachment(last["id"], a["attachmentId"])
                blocks += content.to_blocks(a["filename"], a.get("mimeType") or "", data)
        for fid in content.drive_ids_in(last["text"])[:4]:
            try:
                blocks.append({"type": "text", "text": f"Archivo de Drive enlazado ({fid}):\n{g.read_file_text(fid)[:30000]}"})
            except Exception as e:  # sin permiso o no es texto
                blocks.append({"type": "text", "text": f"[no se pudo abrir el Drive {fid}: {e}]"})
        out.append(Delivery(student=s, source="Mail", link=f"https://mail.google.com/mail/u/0/#all/{t['id']}",
                            key=t["id"], received=last["date"], blocks=blocks, thread_id=t["id"],
                            reply_to_header=last["message_id_header"], subject=last["subject"]))
    return out


def drive_deliveries(s: Student, since: dt.datetime) -> list[Delivery]:
    if not s.folder_id:
        return []
    out = []
    for f in g.changed_files_under(s.folder_id, since.strftime("%Y-%m-%dT%H:%M:%S")):
        editor = (f.get("lastModifyingUser") or {}).get("emailAddress", "")
        if editor in FLOR_ADDRS:  # lo modificó Flor o una rutina, no la alumna
            continue
        if f["mimeType"].startswith("application/vnd.google-apps"):
            blocks = [{"type": "text", "text": f"DRIVE · {f['path']} · modificado {f['modifiedTime']}\n\n"
                                               f"{g.read_file_text(f['id'])[:40000]}"}]
        else:
            blocks = content.to_blocks(f["name"], f["mimeType"], g.download_file(f["id"]))
            blocks.insert(0, {"type": "text", "text": f"DRIVE · {f['path']} · modificado {f['modifiedTime']}"})
        out.append(Delivery(student=s, source="Drive", link=f["webViewLink"], key=f["webViewLink"],
                            received=f["modifiedTime"], blocks=blocks, subject=f["name"]))
    return out


# ---------- 2 · contexto ----------

def class_context(s: Student) -> str:
    """Notas de Gemini / resúmenes de las últimas clases o labs con esa alumna."""
    now = dt.datetime.now(dt.timezone.utc)
    events = g.events_between((now - dt.timedelta(days=21)).isoformat(), (now + dt.timedelta(days=10)).isoformat())
    past, nxt, notes = [], None, []
    for e in events:
        guests = [a.get("email", "").lower() for a in e.get("attendees", [])]
        if s.email.lower() not in guests:
            continue
        start = e["start"].get("dateTime", e["start"].get("date", ""))
        when = dt.datetime.fromisoformat(start.replace("Z", "+00:00"))
        if when.tzinfo is None:
            when = when.replace(tzinfo=dt.timezone.utc)
        if when > now:
            nxt = nxt or f"{e.get('summary','')} · {start}"
            continue
        past.append(f"{e.get('summary','')} · {start}\n{(e.get('description') or '')[:1500]}")
        for att in e.get("attachments", []):
            if "Gemini" in att.get("title", "") and att.get("fileId"):
                try:
                    notes.append(f"Notas de {start}:\n{g.read_file_text(att['fileId'])[:15000]}")
                except Exception:
                    pass
    return ("PRÓXIMA CLASE O LAB: " + (nxt or "no figura") + "\n\nÚLTIMAS CLASES:\n" + "\n\n".join(past[-3:]) +
            "\n\nNOTAS DE LAS CLASES (solo lo de esta alumna cuenta):\n" + "\n\n".join(notes[-2:]))


def previous_feedback(s: Student) -> str:
    rows = n.query(NOTION_FEEDBACK_DS, filter={"property": "Mail de la alumna", "email": {"equals": s.email}},
                   sorts=[{"property": "Recibida", "direction": "descending"}])
    out = []
    for r in [r for r in rows if n.prop_text(r, "Estado") == "Enviado"][:3]:
        sec = n.page_sections(r["id"])
        out.append(f"{n.prop_text(r, 'Entrega')}:\n{sec.get('✉️ Devolución (esto es lo que se manda)', '')[:4000]}")
    return "\n\n".join(out) or "Sin devoluciones anteriores en el sistema."


# ---------- 3, 4, 5 · armado, revisión, semáforo ----------

REVIEW_SYSTEM = """Sos la segunda revisora del feedback de Flor Pérsico (AT WORK). No escribiste la devolución.
Recibís la entrega ORIGINAL de la alumna, su ficha y la devolución propuesta. Chequeá, uno por uno:
1. Cada corrección de inglés es correcta. Si las dos formas son correctas, no se corrige: marcalo.
2. Cada frase citada de la alumna aparece de verdad en la entrega (nada inventado ni de otra tarea).
3. Nombre correcto de la alumna; trato correcto (tú si no es argentina, vos si es argentina); sin "¡" ni "¿".
4. Ninguna frase prohibida de estilo-devoluciones.md; suena a Flor y no a IA; completa pero sin agobiar.
5. Los trainings o clases nombrados existen con ese nombre exacto (si no podés verificarlo, es una duda).
6. Alumna de lab: la devolución es completa y personal (regla de Flor), no recortada.
7. Si algo de lo que Flor explicó en clase está mal, va como duda para Flor con la explicación correcta.
Si encontrás errores que podés arreglar, devolvé la devolución completa corregida en devolucion_corregida.
Si algo no se puede resolver sin Flor, ponelo en dudas_para_flor con el lugar exacto (ej. "escuchá 0:20").

Criterio de Flor:
"""


def build(d: Delivery, knowledge_text: str) -> dict:
    s = d.student
    header = (f"ALUMNA: {s.name} · {s.email} · formato {s.formato}\nFICHA: {s.ficha}\n\n"
              f"{class_context(s)}\n\nDEVOLUCIONES ANTERIORES:\n{previous_feedback(s)}\n\n"
              f"ENTREGA NUEVA (vía {d.source}, {d.received}):")
    user = [{"type": "text", "text": header}, *d.blocks,
            {"type": "text", "text": "Armá la devolución siguiendo la skill y feedback-sistema.md. Si no es una "
                                     "entrega para devolver, es_entrega=false. Si falta información, completá falta_info."}]
    draft = llm.ask_json("Sos el asistente de feedback de Flor Pérsico (AT WORK).\n\n" + knowledge_text, user, Draft)
    if not draft.es_entrega:
        return {"skip": True, "reason": draft.motivo_si_no}
    if draft.falta_info or not draft.devolucion.strip():
        return {"skip": False, "semaforo": "🔴 Falta info", "draft": draft, "final": "", "review": None}

    review = llm.ask_json(REVIEW_SYSTEM + knowledge_text, [
        {"type": "text", "text": f"ALUMNA: {s.name} · {s.email} · {s.formato}\nFICHA: {s.ficha}\n\nENTREGA ORIGINAL:"},
        *d.blocks,
        {"type": "text", "text": f"DEVOLUCIÓN PROPUESTA:\n{draft.devolucion}"},
    ], Review)
    final = review.devolucion_corregida.strip() or draft.devolucion
    dudas = draft.dudas_para_flor + review.dudas_para_flor
    if any("¡" in x or "¿" in x for x in (final,)):
        final = final.replace("¡", "").replace("¿", "")
    audio = any("TRANSCRIPCIÓN AUTOMÁTICA" in b.get("text", "") for b in d.blocks)
    semaforo = "🟡 Revisar" if (dudas or audio) else "🟢 Verde"
    return {"skip": False, "semaforo": semaforo, "draft": draft, "final": final, "review": review, "dudas": dudas}


# ---------- 6 · Notion ----------

def save(d: Delivery, r: dict) -> str:
    s, draft = d.student, r["draft"]
    review: Review | None = r.get("review")
    dudas = r.get("dudas") or draft.falta_info
    notas = draft.notas_para_flor
    if review and review.problemas:
        notas += "\n\nLa segunda revisión corrigió: " + "; ".join(f"{p.tipo}: {p.detalle}" for p in review.problemas)
    page = n.create_row(NOTION_FEEDBACK_DS, {
        "Entrega": n.title(f"{s.name} · {draft.tarea} · {dt.date.today():%d/%m}"),
        "Alumna": n.relation([s.page_id]),
        "Formato": n.select(s.formato),
        "Semáforo": n.select(r["semaforo"]),
        "Estado": n.select("Para revisar"),
        "Qué revisar": n.text(" · ".join(dudas) if dudas else "Nada puntual: leer y aprobar."),
        "Fuente": n.select(d.source),
        "Link a la entrega": n.url(d.link),
        "Mail de la alumna": n.email(s.email),
        "Asunto": n.text(("Re: " + d.subject) if d.thread_id and d.subject else (draft.asunto or f"Tu {draft.tarea}")),
        "Hilo de Gmail": n.text(d.thread_id or ""),
        "Recibida": n.date(dt.date.today().isoformat()),
    }, [
        ("✉️ Devolución (esto es lo que se manda)", r["final"] or "(no se armó: ver Qué revisar)"),
        ("📝 Notas para Flor (no se manda)", notas or " "),
        ("🔒 Borrador original (no tocar)", r["final"] or " "),
        ("🔗 Datos para responder (no tocar)", f"reply_to={d.reply_to_header or ''}"),
    ])
    return page["url"]


# ---------- corrida ----------

def run(hours_back: int = 30) -> str:
    since = dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=hours_back)
    students = active_students()
    seen = known_keys()
    deliveries: list[Delivery] = []
    for s in students:
        try:
            for d in mail_deliveries(s, since) + drive_deliveries(s, since):
                if d.key not in seen and d.link not in seen:
                    deliveries.append(d)
                    seen.add(d.key)
        except Exception as e:
            guard.audit("intake_error", student=s.name, error=str(e))
    guard.audit("feedback_intake", students=len(students), deliveries=len(deliveries))
    if not deliveries:
        return "Hoy no hay entregas nuevas."

    knowledge_text = knowledge.bundle(knowledge.FEEDBACK_KNOWLEDGE)
    results = []

    def work(d: Delivery):
        try:
            r = build(d, knowledge_text)
            if r["skip"]:
                return None
            return d, r, save(d, r)
        except Exception as e:
            guard.audit("feedback_error", student=d.student.name, error=str(e))
            return d, {"semaforo": "🔴 Falta info", "error": str(e)}, None

    with ThreadPoolExecutor(max_workers=6) as pool:
        for res in pool.map(work, deliveries):
            if res:
                results.append(res)

    counts = {k: sum(1 for _, r, _ in results if r.get("semaforo") == k) for k in ("🟢 Verde", "🟡 Revisar", "🔴 Falta info")}
    lines = "".join(
        f"<li><b>{d.student.name}</b> · {r.get('semaforo')} · <a href='{url or NOTION_FEEDBACK_URL}'>abrir</a>"
        f"{' · error: ' + r['error'] if r.get('error') else ''}</li>" for d, r, url in results)
    html = (f"<p>Respondé este mail con «ok Nombre» u «ok todas», o tildá ✅ Aprobar en "
            f"<a href='{NOTION_FEEDBACK_URL}'>💬 Feedback para revisar</a>.</p>"
            f"<p>🟢 {counts['🟢 Verde']} · 🟡 {counts['🟡 Revisar']} · 🔴 {counts['🔴 Falta info']}</p><ul>{lines}</ul>")
    subject = f"💬 Feedback para revisar · {dt.date.today():%d/%m} · {len(results)} alumnas"
    msg_id = g.send_email(kind=guard.Kind.TO_FLOR, to=[FLOR_EMAIL], subject=subject, html=html)
    if msg_id:
        lab = g.label_id(LABEL_FEEDBACK)
        if lab:
            sent = g.gmail().users().messages().get(userId="me", id=msg_id, format="minimal").execute()
            g.label_thread(sent["threadId"], add=[lab])
    return f"{len(results)} devoluciones en Notion · 🟢 {counts['🟢 Verde']} 🟡 {counts['🟡 Revisar']} 🔴 {counts['🔴 Falta info']}"
