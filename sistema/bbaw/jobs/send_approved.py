"""Envío de devoluciones aprobadas (rutinas/feedback-sistema.md, punto 6).

Sale SOLO lo que Flor aprobó: ✅ en Notion, u "ok <nombre>" / "ok todas" como
respuesta al mail "💬 Feedback para revisar". El semáforo solo ordena la
revisión de Flor: ninguna devolución sale sin su ok, ni siquiera las 🟢. Se manda exactamente el texto que quedó en
"✉️ Devolución", con Flor en CCO, y se registra qué cambió Flor.
"""
from __future__ import annotations

import datetime as dt
import html as html_lib
import re
import unicodedata

from .. import google_api as g, guard, notion_api as n
from ..config import FLOR_EMAIL, LABEL_FEEDBACK, NOTION_FEEDBACK_DS, REPO_ROOT, SETTINGS

SEC_FINAL = "✉️ Devolución (esto es lo que se manda)"
SEC_ORIG = "🔒 Borrador original (no tocar)"
SEC_REPLY = "🔗 Datos para responder (no tocar)"
LOG = REPO_ROOT / "rutinas" / "criterio-correccion-log.md"


def _norm(s: str) -> str:
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower().strip()


def text_to_html(t: str) -> str:
    out = []
    for para in [p for p in t.split("\n\n") if p.strip()]:
        lines = para.split("\n")
        if all(re.match(r"^\s*([•\-*]|\d+[.)])\s", l) for l in lines):
            items = "".join(f"<li>{html_lib.escape(re.sub(r'^\s*([•*-]|\d+[.)])\s', '', l))}</li>" for l in lines)
            out.append(f"<ul>{items}</ul>")
        else:
            out.append("<p>" + "<br>".join(html_lib.escape(l) for l in lines) + "</p>")
    return "".join(out)


def approvals_from_email() -> set[str]:
    """Nombres aprobados por mail ("ok Vir", "ok todas") en respuestas de Flor."""
    names: set[str] = set()
    for t in g.search_threads(f'from:{FLOR_EMAIL} subject:"Feedback para revisar" newer_than:3d', limit=20):
        for m in g.get_thread(t["id"])["messages"]:
            if FLOR_EMAIL not in m["from"]:
                continue
            reply = m["text"].split("\nEl ")[0].split("\nOn ")[0]  # sin el texto citado
            for line in reply.splitlines():
                mm = re.match(r"^\s*ok\s+(.+)$", line.strip(), re.I)
                if mm:
                    names.update(_norm(x) for x in re.split(r",| y ", mm.group(1)) if x.strip())
    return names


def _approved_by_name(row: dict, names: set[str]) -> bool:
    if "todas" in names:
        return True
    who = _norm(n.prop_text(row, "Entrega").split("·")[0])
    return any(nm and (nm in who or who.split()[0] == nm) for nm in names)


def log_change(row: dict, original: str, final: str) -> None:
    entry = (f"\n- {dt.date.today():%d/%m} · {n.prop_text(row, 'Entrega')}: Flor cambió el texto antes de aprobar. "
             f"Antes: «{original[:300]}…» → Después: «{final[:300]}…». (Revisar qué criterio sumar a la skill.)\n")
    with LOG.open("a") as f:
        f.write(entry)


def run() -> str:
    names = approvals_from_email()
    rows = n.query(NOTION_FEEDBACK_DS, filter={"property": "Estado", "select": {"equals": "Para revisar"}})
    rows += n.query(NOTION_FEEDBACK_DS, filter={"property": "Estado", "select": {"equals": "Aprobado"}})
    sent, skipped = 0, 0
    lab = g.label_id(LABEL_FEEDBACK)
    for row in rows:
        semaforo = n.prop_text(row, "Semáforo")
        approved = n.prop_text(row, "✅ Aprobar") == "yes" or _approved_by_name(row, names)
        if not approved or semaforo == "🔴 Falta info":
            continue
        sec = n.page_sections(row["id"])
        final = sec.get(SEC_FINAL, "").strip()
        to = n.prop_text(row, "Mail de la alumna")
        if not final or not to:
            skipped += 1
            continue
        reply_to = (sec.get(SEC_REPLY, "").split("reply_to=")[-1] or None)
        try:
            msg_id = g.send_email(
                kind=guard.Kind.FEEDBACK_APPROVED,
                to=[to], subject=n.prop_text(row, "Asunto") or "Tu feedback", html=text_to_html(final), text=final,
                bcc=[FLOR_EMAIL], thread_id=n.prop_text(row, "Hilo de Gmail") or None, in_reply_to=reply_to,
                approved=approved)
        except guard.Blocked as e:
            guard.audit("send_blocked", row=row["id"], reason=str(e))
            n.update_props(row["id"], {"Qué revisar": n.text(f"⛔ No se mandó: {e}")})
            skipped += 1
            continue
        if msg_id is None:  # modo prueba
            continue
        changed = _norm(final) != _norm(sec.get(SEC_ORIG, ""))
        n.update_props(row["id"], {"Estado": n.select("Enviado"), "✅ Aprobar": n.checkbox(True),
                                   "Enviado el": n.date(dt.datetime.now().isoformat(timespec="minutes")),
                                   "Flor cambió el texto": n.checkbox(changed)})
        for rel in (row["properties"].get("Alumna", {}).get("relation") or []):
            n.prepend_note(rel["id"], "Notas tracker",
                           f"📧 {dt.date.today():%d/%m}: feedback de {n.prop_text(row, 'Entrega').split('·')[1].strip()} enviado")
        if changed:
            log_change(row, sec.get(SEC_ORIG, ""), final)
        sent += 1
    # Cuando ya no queda nada por revisar, los mails de revisión salen de la etiqueta.
    pending = n.query(NOTION_FEEDBACK_DS, filter={"property": "Estado", "select": {"equals": "Para revisar"}})
    if lab and not pending and not SETTINGS.dry_run:
        for t in g.search_threads(f'label:"{LABEL_FEEDBACK}"', limit=50):
            g.label_thread(t["id"], remove=[lab])
    return f"Enviadas: {sent} · no se pudieron mandar: {skipped}" + (" · MODO PRUEBA: no salió nada" if SETTINGS.dry_run else "")
