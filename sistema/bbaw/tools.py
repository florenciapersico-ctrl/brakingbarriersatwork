"""Herramientas que la IA puede usar en las rutinas. Cada una pasa por guard.

Cada rutina recibe SOLO las herramientas que necesita (ver config/jobs.yaml).
No existe ninguna herramienta para borrar archivos, mover plata, pagar,
mandar feedback sin aprobación ni escribirle a prospectas.
"""
from __future__ import annotations

import functools
import json

from anthropic import beta_tool

from . import google_api as g, guard, knowledge, notion_api as n
from .config import FLOR_EMAIL


def _safe(fn):
    """Los errores vuelven a la IA como texto, en vez de cortar la rutina."""
    @functools.wraps(fn)
    def wrapper(*a, **k):
        try:
            return fn(*a, **k)
        except guard.Blocked as e:
            return f"⛔ BLOQUEADO por las reglas de Flor: {e}"
        except Exception as e:
            return f"ERROR: {type(e).__name__}: {e}"
    return wrapper


# ---------- Gmail ----------

@beta_tool
@_safe
def gmail_search(query: str, limit: int = 20) -> str:
    """Busca hilos en el Gmail de Flor con la sintaxis de Gmail (from:, newer_than:, subject:, label:...).

    Args:
        query: Búsqueda de Gmail.
        limit: Máximo de hilos (hasta 50).
    """
    out = []
    for t in g.search_threads(query, min(limit, 50)):
        th = g.get_thread(t["id"])
        last = th["messages"][-1]
        out.append({"thread_id": t["id"], "messages": len(th["messages"]), "last_from": last["from"],
                    "last_date": last["date"], "subject": last["subject"], "snippet": last["text"][:300]})
    return json.dumps(out, ensure_ascii=False)


@beta_tool
@_safe
def gmail_read_thread(thread_id: str) -> str:
    """Lee un hilo completo de Gmail (remitente, fecha, asunto, texto, adjuntos).

    Args:
        thread_id: Id del hilo.
    """
    return json.dumps(g.get_thread(thread_id), ensure_ascii=False)[:60000]


@beta_tool
@_safe
def gmail_create_draft_for_flor_to_send(to: str, subject: str, text: str, thread_id: str = "") -> str:
    """Deja un BORRADOR en el Gmail de Flor para que ella lo revise y lo mande. No envía nada.

    Args:
        to: Mail de la destinataria.
        subject: Asunto.
        text: Texto del borrador.
        thread_id: Hilo al que responde, si existe.
    """
    if "¡" in text or "¿" in text:
        return "⛔ BLOQUEADO: Flor no usa ¡ ni ¿. Reescribilo."
    return "borrador creado: " + g.create_draft(to=[to], subject=subject, text=text, thread_id=thread_id or None)


@beta_tool
@_safe
def email_flor(subject: str, html: str) -> str:
    """Manda un mail SOLO a Flor (resúmenes, avisos, pedidos de revisión). Nunca a otra persona.

    Args:
        subject: Asunto.
        html: Cuerpo en HTML simple.
    """
    return "enviado: " + str(g.send_email(kind=guard.Kind.TO_FLOR, to=[FLOR_EMAIL], subject=subject, html=html))


@beta_tool
@_safe
def email_student_weekly_link(to: str, subject: str, html: str) -> str:
    """Manda a una alumna el mail de los lunes con el link de SU weekly report (autorizado por Flor). Flor va en CCO.

    Args:
        to: Mail de la alumna.
        subject: Asunto (ej. "Your weekly report · semana del 02/11 📝").
        html: Cuerpo en HTML con el link.
    """
    return "enviado: " + str(g.send_email(kind=guard.Kind.WEEKLY_LINK, to=[to], subject=subject, html=html,
                                          bcc=[FLOR_EMAIL]))


# ---------- Drive ----------

@beta_tool
@_safe
def drive_list_folder(folder_id: str) -> str:
    """Lista los archivos y subcarpetas de una carpeta de Drive.

    Args:
        folder_id: Id de la carpeta.
    """
    return json.dumps(g.list_children(folder_id), ensure_ascii=False)[:40000]


@beta_tool
@_safe
def drive_read_file(file_id: str) -> str:
    """Lee el texto de un archivo de Drive (Doc, Sheet, Slides, texto).

    Args:
        file_id: Id del archivo.
    """
    return g.read_file_text(file_id)[:80000]


@beta_tool
@_safe
def drive_create_doc(title: str, html: str, parent_folder_id: str) -> str:
    """Crea un Google Doc a partir de HTML (con el branding de Flor) dentro de una carpeta.

    Args:
        title: Título del documento.
        html: Contenido en HTML con estilos inline.
        parent_folder_id: Carpeta donde se crea.
    """
    return json.dumps(g.create_doc_from_html(title, html, parent_folder_id))


# ---------- Calendar ----------

@beta_tool
@_safe
def calendar_events(start_iso: str, end_iso: str) -> str:
    """Eventos del calendario de Flor entre dos fechas (ISO con zona, ej. 2026-11-02T00:00:00-03:00).

    Args:
        start_iso: Desde.
        end_iso: Hasta.
    """
    evs = g.events_between(start_iso, end_iso)
    slim = [{k: e.get(k) for k in ("id", "summary", "start", "end", "description", "attendees", "attachments",
                                   "hangoutLink", "recurringEventId")} for e in evs]
    return json.dumps(slim, ensure_ascii=False)[:60000]


@beta_tool
@_safe
def calendar_update_description(event_id: str, new_description: str) -> str:
    """Cambia la descripción de un evento SIN notificar a nadie (marcas internas, 'CLASE LISTA').

    Args:
        event_id: Id del evento.
        new_description: Descripción completa nueva (incluí lo que ya tenía si hay que conservarlo).
    """
    g.update_event(event_id, {"description": new_description}, notify_attendees=False, is_student_event=True)
    return "ok"


# ---------- Notion ----------

@beta_tool
@_safe
def notion_query(data_source_id: str, filter_json: str = "") -> str:
    """Consulta una base de Notion (data source). Devuelve id, url y propiedades en texto.

    Args:
        data_source_id: Id de la base (sin "collection://").
        filter_json: Filtro de la API de Notion en JSON (opcional).
    """
    rows = n.query(data_source_id, json.loads(filter_json) if filter_json else None)
    out = [{"id": r["id"], "url": r["url"], **{k: n.prop_text(r, k) for k in r["properties"]}} for r in rows]
    return json.dumps(out, ensure_ascii=False)[:80000]


@beta_tool
@_safe
def notion_read_page(page_id: str) -> str:
    """Lee el cuerpo de una página de Notion, agrupado por títulos.

    Args:
        page_id: Id de la página.
    """
    return json.dumps(n.page_sections(page_id), ensure_ascii=False)[:80000]


@beta_tool
@_safe
def notion_replace_section(page_id: str, heading: str, new_content: str) -> str:
    """Reemplaza el contenido de UNA sección de una página (debajo de su título). Nunca toca "MIS NOTAS".
    Formato: una línea por bloque; "- [ ] " tarea, "- " viñeta, "### " subtítulo.

    Args:
        page_id: Id de la página.
        heading: Comienzo del título de la sección (ej. "✅ HOY").
        new_content: Contenido nuevo.
    """
    return n.replace_section(page_id, heading, new_content)


@beta_tool
@_safe
def notion_update_properties(page_id: str, properties_json: str) -> str:
    """Actualiza propiedades de una fila de Notion. JSON con el formato de la API de Notion.

    Args:
        page_id: Id de la fila.
        properties_json: Propiedades en JSON (ej. {"Estado": {"select": {"name": "Activa"}}}).
    """
    n.update_props(page_id, json.loads(properties_json))
    return "ok"


@beta_tool
@_safe
def notion_prepend_note(page_id: str, property_name: str, note: str) -> str:
    """Agrega una nota AL PRINCIPIO de un campo de texto de una fila, sin borrar lo que había.

    Args:
        page_id: Id de la fila.
        property_name: Campo (ej. "Notas tracker").
        note: Nota (ej. "📧 02/11: resumen de clase enviado").
    """
    n.prepend_note(page_id, property_name, note)
    return "ok"


@beta_tool
@_safe
def notion_create_row(data_source_id: str, properties_json: str, body_text: str = "") -> str:
    """Crea una fila nueva en una base de Notion.

    Args:
        data_source_id: Id de la base.
        properties_json: Propiedades en JSON con el formato de la API de Notion.
        body_text: Texto del cuerpo de la página (opcional).
    """
    page = n.create_row(data_source_id, json.loads(properties_json), [("Detalle", body_text)] if body_text else [])
    return page["url"]


# ---------- repo ----------

@beta_tool
@_safe
def read_repo_file(path: str) -> str:
    """Lee un archivo de instrucciones del repo (ej. rutinas/discovery-calls.md, o git:<rama>:<archivo>).

    Args:
        path: Ruta del archivo.
    """
    return knowledge.read(path)[:80000]


ALL = {t.name: t for t in [
    gmail_search, gmail_read_thread, gmail_create_draft_for_flor_to_send, email_flor, email_student_weekly_link,
    drive_list_folder, drive_read_file, drive_create_doc, calendar_events, calendar_update_description,
    notion_query, notion_read_page, notion_replace_section, notion_update_properties, notion_prepend_note,
    notion_create_row, read_repo_file,
]}
