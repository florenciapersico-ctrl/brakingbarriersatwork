"""Reglas de seguridad del sistema. Se aplican en código, no dependen de la IA.

Toda acción que sale hacia afuera (mails, cambios de calendario, compartir
archivos) pasa por acá. Si una regla no se cumple, la acción se bloquea y queda
registrada; la IA no puede saltearse esto aunque se equivoque.

Reglas de Flor que se hacen cumplir:
- Feedback (tareas, mails, weekly reports) y respuestas a alumnas: SIEMPRE con
  la aprobación de Flor (✅ en Notion u "ok" por mail). Sin excepciones.
- Sí se puede sin preguntar: avisos de calendario a la alumna, compartir su
  carpeta de Drive y el mail de los lunes con el link de su weekly.
- Flor siempre en CCO en lo que sale hacia alumnas.
- Sin "¡" ni "¿" en mails a alumnas. Nunca nombrar a Maribel ni a Luz Cañas.
- Nunca mover plata, nunca pedir contraseñas, nunca borrar.
"""
from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass
from enum import Enum

from .config import FLOR_EMAIL, FLOR_OTHER_EMAILS, NEVER_NAME, SETTINGS


class Kind(str, Enum):
    TO_FLOR = "to_flor"  # resúmenes, avisos y pedidos de revisión para Flor
    FEEDBACK_APPROVED = "feedback_approved"  # Flor tildó ✅ o respondió "ok"
    WEEKLY_LINK = "weekly_link"  # mail de los lunes con el link del weekly
    CALENDAR_NOTICE = "calendar_notice"  # invitación o aviso de calendario
    DRIVE_SHARE = "drive_share"  # compartir la carpeta de la alumna


STUDENT_KINDS = {Kind.FEEDBACK_APPROVED, Kind.WEEKLY_LINK, Kind.CALENDAR_NOTICE, Kind.DRIVE_SHARE}
_FLOR_ADDRESSES = {FLOR_EMAIL.lower(), *(e.lower() for e in FLOR_OTHER_EMAILS)}
_PASSWORD_ASK = re.compile(r"\b(contraseña|password|clave de acceso|tu clave)\b", re.I)


class Blocked(Exception):
    """La acción viola una regla de Flor y no se ejecuta."""


@dataclass
class Decision:
    allowed: bool
    dry_run: bool
    reason: str = ""


_student_emails_this_run = 0
_log: list[dict] = []


def audit(event: str, **data) -> None:
    entry = {"t": time.strftime("%Y-%m-%dT%H:%M:%S"), "event": event, **data}
    _log.append(entry)
    print(json.dumps(entry, ensure_ascii=False))


def audit_log() -> list[dict]:
    return list(_log)


def _is_flor(addr: str) -> bool:
    return addr.strip().lower() in _FLOR_ADDRESSES


def check_email(*, kind: Kind, to: list[str], bcc: list[str], body: str, subject: str,
                approved: bool = False) -> Decision:
    """Decide si un mail puede salir. Lanza Blocked si viola una regla."""
    global _student_emails_this_run
    if not to:
        raise Blocked("mail sin destinatario")
    if _PASSWORD_ASK.search(body):
        raise Blocked("el mail pide una contraseña o clave")

    if kind == Kind.TO_FLOR:
        if not all(_is_flor(a) for a in to + bcc):
            raise Blocked("un mail 'para Flor' tiene otros destinatarios")
        return Decision(True, dry_run=False)

    # A partir de acá, el mail va a una alumna.
    if any(_is_flor(a) for a in to):
        raise Blocked("mail de alumna dirigido a Flor: usar Kind.TO_FLOR")
    if FLOR_EMAIL.lower() not in {b.lower() for b in bcc}:
        raise Blocked("falta Flor en CCO")
    if "¡" in body or "¿" in body or "¡" in subject or "¿" in subject:
        raise Blocked("el texto tiene ¡ o ¿ (Flor no los usa)")
    for name in NEVER_NAME:
        if name.lower() in body.lower():
            raise Blocked(f"el texto nombra a {name}")

    if kind == Kind.FEEDBACK_APPROVED and not approved:
        raise Blocked("feedback sin aprobación de Flor")

    if _student_emails_this_run >= SETTINGS.max_student_emails_per_run:
        raise Blocked("se alcanzó el tope de mails a alumnas de esta corrida")
    _student_emails_this_run += 1
    return Decision(True, dry_run=SETTINGS.dry_run)


def check_calendar_change(*, notify_attendees: bool, is_student_event: bool) -> str:
    """Devuelve el notificationLevel permitido."""
    if notify_attendees and not is_student_event:
        raise Blocked("solo se notifica a alumnas por sus propias clases")
    return "ALL" if notify_attendees else "NONE"


def forbid(action: str) -> None:
    """Acciones que el sistema nunca hace."""
    raise Blocked(f"acción prohibida: {action}")
