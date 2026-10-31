"""Notion de Flor. Credencial: NOTION_TOKEN (integración interna con acceso a
ECOSISTEMA AT WORK, HOY y el programa)."""
from __future__ import annotations

import os
from functools import lru_cache

from notion_client import Client

from . import guard


@lru_cache(maxsize=1)
def client() -> Client:
    return Client(auth=os.environ["NOTION_TOKEN"])


def query(data_source_id: str, filter: dict | None = None, sorts: list | None = None) -> list[dict]:
    out, cursor = [], None
    while True:
        kwargs = {"data_source_id": data_source_id, "page_size": 100}
        if filter:
            kwargs["filter"] = filter
        if sorts:
            kwargs["sorts"] = sorts
        if cursor:
            kwargs["start_cursor"] = cursor
        res = client().data_sources.query(**kwargs)
        out.extend(res["results"])
        if not res.get("has_more"):
            return out
        cursor = res["next_cursor"]


def prop_text(page: dict, name: str) -> str:
    p = page.get("properties", {}).get(name)
    if not p:
        return ""
    t = p["type"]
    if t in ("title", "rich_text"):
        return "".join(x.get("plain_text", "") for x in p[t])
    if t == "select":
        return (p["select"] or {}).get("name", "")
    if t == "multi_select":
        return ", ".join(x["name"] for x in p["multi_select"])
    if t in ("email", "url", "phone_number"):
        return p[t] or ""
    if t == "checkbox":
        return "yes" if p["checkbox"] else ""
    if t == "date":
        return (p["date"] or {}).get("start", "")
    if t == "number":
        return "" if p["number"] is None else str(p["number"])
    if t == "relation":
        return ",".join(r["id"] for r in p["relation"])
    if t == "formula":
        f = p["formula"]
        return str(f.get(f.get("type"), ""))
    return ""


# ----- construcción de propiedades -----

def title(v: str) -> dict:
    return {"title": [{"text": {"content": v[:2000]}}]}


def text(v: str) -> dict:
    return {"rich_text": [{"text": {"content": v[:2000]}}]}


def select(v: str) -> dict:
    return {"select": {"name": v}}


def checkbox(v: bool) -> dict:
    return {"checkbox": v}


def date(v: str) -> dict:
    return {"date": {"start": v}}


def url(v: str) -> dict:
    return {"url": v or None}


def email(v: str) -> dict:
    return {"email": v or None}


def relation(ids: list[str]) -> dict:
    return {"relation": [{"id": i} for i in ids]}


# ----- contenido de páginas -----

def _para(s: str) -> dict:
    return {"object": "block", "type": "paragraph",
            "paragraph": {"rich_text": [{"type": "text", "text": {"content": s[:2000]}}]}}


def _h2(s: str) -> dict:
    return {"object": "block", "type": "heading_2",
            "heading_2": {"rich_text": [{"type": "text", "text": {"content": s}}]}}


def sections_to_blocks(sections: list[tuple[str, str]]) -> list[dict]:
    """[(título, texto)] -> bloques de Notion. Cada párrafo del texto es un bloque."""
    blocks = []
    for heading, body in sections:
        blocks.append(_h2(heading))
        for para in [c for c in body.split("\n\n") if c.strip()] or [" "]:
            # Notion corta cada bloque en 2000 caracteres: los párrafos largos se parten.
            for i in range(0, len(para), 1900):
                blocks.append(_para(para[i:i + 1900]))
    return blocks


def create_row(data_source_id: str, properties: dict, sections: list[tuple[str, str]] = ()) -> dict:
    blocks = sections_to_blocks(list(sections))
    page = client().pages.create(parent={"type": "data_source_id", "data_source_id": data_source_id},
                                 properties=properties, children=blocks[:100])
    for i in range(100, len(blocks), 100):  # Notion acepta 100 bloques por pedido
        client().blocks.children.append(block_id=page["id"], children=blocks[i:i + 100])
    guard.audit("notion_row_created", id=page["id"])
    return page


def update_props(page_id: str, properties: dict) -> None:
    client().pages.update(page_id=page_id, properties=properties)
    guard.audit("notion_updated", id=page_id, fields=list(properties))


def page_sections(page_id: str) -> dict[str, str]:
    """Lee el cuerpo de una página y lo devuelve como {título de sección: texto}."""
    out: dict[str, list[str]] = {}
    current = ""
    cursor = None
    while True:
        kwargs = {"block_id": page_id, "page_size": 100}
        if cursor:
            kwargs["start_cursor"] = cursor
        res = client().blocks.children.list(**kwargs)
        for b in res["results"]:
            t = b["type"]
            rich = b.get(t, {}).get("rich_text", [])
            s = "".join(x.get("plain_text", "") for x in rich)
            if t.startswith("heading_"):
                current = s.strip()
                out.setdefault(current, [])
            elif s:
                out.setdefault(current, []).append(("• " if t.endswith("list_item") else "") + s)
        if not res.get("has_more"):
            break
        cursor = res["next_cursor"]
    return {k: "\n\n".join(v) for k, v in out.items()}


PROTECTED_HEADINGS = ("MIS NOTAS", "Accesos rápidos", "Para revisar")


def _all_children(block_id: str) -> list[dict]:
    out, cursor = [], None
    while True:
        kwargs = {"block_id": block_id, "page_size": 100}
        if cursor:
            kwargs["start_cursor"] = cursor
        res = client().blocks.children.list(**kwargs)
        out.extend(res["results"])
        if not res.get("has_more"):
            return out
        cursor = res["next_cursor"]


def replace_section(page_id: str, heading_starts_with: str, new_text: str) -> str:
    """Reemplaza el contenido debajo de un título (hasta el próximo título del mismo
    nivel). Nunca toca secciones protegidas como "MIS NOTAS" de Flor."""
    if any(p.lower() in heading_starts_with.lower() for p in PROTECTED_HEADINGS):
        guard.forbid(f"editar la sección protegida «{heading_starts_with}»")
    blocks = _all_children(page_id)
    start, level = None, None
    for i, b in enumerate(blocks):
        t = b["type"]
        if t.startswith("heading_"):
            s = "".join(x.get("plain_text", "") for x in b[t]["rich_text"]).strip()
            if start is None and s.lstrip("#🪞✅🎯 ").startswith(heading_starts_with.lstrip("#🪞✅🎯 ")):
                start, level = i, t
            elif start is not None and t <= level:
                end = i
                break
    else:
        end = len(blocks)
    if start is None:
        return f"No encontré la sección «{heading_starts_with}»"
    for b in blocks[start + 1:end]:
        client().blocks.delete(block_id=b["id"])  # solo contenido que arma la rutina
    new_blocks = []
    for line in [l for l in new_text.split("\n") if l.strip()]:
        if line.startswith("### "):
            new_blocks.append({"object": "block", "type": "heading_3",
                               "heading_3": {"rich_text": [{"type": "text", "text": {"content": line[4:][:1900]}}]}})
        elif line.lstrip().startswith(("- [ ]", "- [x]")):
            done = "[x]" in line[:6]
            new_blocks.append({"object": "block", "type": "to_do", "to_do": {
                "checked": done, "rich_text": [{"type": "text", "text": {"content": line.split("]", 1)[1].strip()[:1900]}}]}})
        elif line.lstrip().startswith(("- ", "• ")):
            new_blocks.append({"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {
                "rich_text": [{"type": "text", "text": {"content": line.lstrip()[2:][:1900]}}]}})
        else:
            new_blocks.append(_para(line))
    after = blocks[start]["id"]
    for i in range(0, len(new_blocks), 100):
        res = client().blocks.children.append(block_id=page_id, children=new_blocks[i:i + 100], after=after)
        after = res["results"][-1]["id"]
    guard.audit("notion_section_replaced", page=page_id, section=heading_starts_with, blocks=len(new_blocks))
    return "ok"


def prepend_note(page_id: str, prop_name: str, note: str) -> None:
    """Agrega una nota AL PRINCIPIO de un campo de texto, sin borrar lo que había."""
    page = client().pages.retrieve(page_id=page_id)
    old = prop_text(page, prop_name)
    update_props(page_id, {prop_name: text((note + (" || " + old if old else ""))[:2000])})
