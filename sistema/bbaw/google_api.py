"""Gmail, Drive, Docs y Calendar de Flor, con su cuenta (OAuth).

Credenciales (GitHub › Settings › Secrets): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
GOOGLE_REFRESH_TOKEN. Se obtienen una sola vez con setup/obtener_token_google.py.
"""
from __future__ import annotations

import base64
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import lru_cache

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from . import guard
from .config import FLOR_EMAIL

SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/calendar",
]


@lru_cache(maxsize=1)
def _creds() -> Credentials:
    return Credentials(
        token=None,
        refresh_token=os.environ["GOOGLE_REFRESH_TOKEN"],
        client_id=os.environ["GOOGLE_CLIENT_ID"],
        client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=SCOPES,
    )


@lru_cache(maxsize=None)
def service(name: str, version: str):
    return build(name, version, credentials=_creds(), cache_discovery=False)


def gmail():
    return service("gmail", "v1")


def drive():
    return service("drive", "v3")


def calendar():
    return service("calendar", "v3")


# ---------- Gmail ----------

def _header(msg: dict, name: str) -> str:
    for h in msg.get("payload", {}).get("headers", []):
        if h["name"].lower() == name.lower():
            return h["value"]
    return ""


def _body_text(payload: dict) -> str:
    if payload.get("mimeType", "").startswith("text/plain") and payload.get("body", {}).get("data"):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", "replace")
    for part in payload.get("parts", []) or []:
        text = _body_text(part)
        if text:
            return text
    if payload.get("body", {}).get("data"):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", "replace")
    return ""


def _attachments(payload: dict) -> list[dict]:
    out = []
    for part in payload.get("parts", []) or []:
        if part.get("filename"):
            out.append({"filename": part["filename"], "mimeType": part.get("mimeType"),
                        "attachmentId": part.get("body", {}).get("attachmentId")})
        out.extend(_attachments(part))
    return out


def search_threads(query: str, limit: int = 50) -> list[dict]:
    res = gmail().users().threads().list(userId="me", q=query, maxResults=limit).execute()
    return res.get("threads", [])


def get_thread(thread_id: str) -> dict:
    """Hilo completo, simplificado: mensajes con remitente, fecha, asunto, texto y adjuntos."""
    t = gmail().users().threads().get(userId="me", id=thread_id, format="full").execute()
    msgs = []
    for m in t.get("messages", []):
        msgs.append({
            "id": m["id"],
            "message_id_header": _header(m, "Message-ID"),
            "from": _header(m, "From"),
            "to": _header(m, "To"),
            "date": _header(m, "Date"),
            "subject": _header(m, "Subject"),
            "text": _body_text(m.get("payload", {}))[:20000],
            "attachments": _attachments(m.get("payload", {})),
            "labels": m.get("labelIds", []),
        })
    return {"id": t["id"], "messages": msgs}


def get_attachment(message_id: str, attachment_id: str) -> bytes:
    a = gmail().users().messages().attachments().get(userId="me", messageId=message_id, id=attachment_id).execute()
    return base64.urlsafe_b64decode(a["data"])


def label_id(name: str) -> str | None:
    for lab in gmail().users().labels().list(userId="me").execute().get("labels", []):
        if lab["name"] == name:
            return lab["id"]
    return None


def label_thread(thread_id: str, add: list[str] = (), remove: list[str] = ()) -> None:
    gmail().users().threads().modify(userId="me", id=thread_id,
                                     body={"addLabelIds": list(add), "removeLabelIds": list(remove)}).execute()


def send_email(*, kind: guard.Kind, to: list[str], subject: str, html: str, text: str = "",
               bcc: list[str] = (), thread_id: str | None = None, in_reply_to: str | None = None,
               approved: bool = False) -> str | None:
    """Manda un mail desde la cuenta de Flor, después de pasar por guard."""
    bcc = list(bcc)
    if kind in guard.STUDENT_KINDS and FLOR_EMAIL not in bcc:
        bcc.append(FLOR_EMAIL)
    decision = guard.check_email(kind=kind, to=list(to), bcc=bcc, body=(text or html), subject=subject,
                                 approved=approved)
    if decision.dry_run:
        guard.audit("email_dry_run", kind=kind.value, to=to, subject=subject)
        return None

    msg = MIMEMultipart("alternative")
    msg["To"] = ", ".join(to)
    msg["From"] = FLOR_EMAIL
    msg["Subject"] = subject
    if bcc:
        msg["Bcc"] = ", ".join(bcc)
    if in_reply_to:
        msg["In-Reply-To"] = in_reply_to
        msg["References"] = in_reply_to
    msg.attach(MIMEText(text or "Abrí este mail en Gmail para verlo con formato.", "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))
    body = {"raw": base64.urlsafe_b64encode(msg.as_bytes()).decode()}
    if thread_id:
        body["threadId"] = thread_id
    sent = gmail().users().messages().send(userId="me", body=body).execute()
    guard.audit("email_sent", kind=kind.value, to=to, subject=subject, id=sent["id"])
    return sent["id"]


def create_draft(*, to: list[str], subject: str, text: str, thread_id: str | None = None,
                 in_reply_to: str | None = None) -> str:
    """Borrador en Gmail para que Flor lo revise y lo mande ella. No sale nada."""
    msg = MIMEText(text, "plain", "utf-8")
    msg["To"] = ", ".join(to)
    msg["Subject"] = subject
    if in_reply_to:
        msg["In-Reply-To"] = in_reply_to
        msg["References"] = in_reply_to
    body = {"message": {"raw": base64.urlsafe_b64encode(msg.as_bytes()).decode()}}
    if thread_id:
        body["message"]["threadId"] = thread_id
    d = gmail().users().drafts().create(userId="me", body=body).execute()
    guard.audit("draft_created", to=to, subject=subject, id=d["id"])
    return d["id"]


# ---------- Drive ----------

FOLDER = "application/vnd.google-apps.folder"


def list_children(folder_id: str) -> list[dict]:
    out, token = [], None
    while True:
        res = drive().files().list(
            q=f"'{folder_id}' in parents and trashed=false",
            fields="nextPageToken, files(id,name,mimeType,modifiedTime,webViewLink,lastModifyingUser(emailAddress))",
            pageSize=200, pageToken=token).execute()
        out.extend(res.get("files", []))
        token = res.get("nextPageToken")
        if not token:
            return out


def changed_files_under(folder_id: str, since_iso: str, max_depth: int = 4) -> list[dict]:
    """Archivos modificados desde `since_iso` en una carpeta y sus subcarpetas."""
    found, stack = [], [(folder_id, 0, "")]
    while stack:
        fid, depth, path = stack.pop()
        for f in list_children(fid):
            if f["mimeType"] == FOLDER:
                if depth < max_depth:
                    stack.append((f["id"], depth + 1, f"{path}/{f['name']}"))
            elif f["modifiedTime"] > since_iso:
                f["path"] = f"{path}/{f['name']}"
                found.append(f)
    return found


def read_file_text(file_id: str) -> str:
    meta = drive().files().get(fileId=file_id, fields="mimeType,name").execute()
    mt = meta["mimeType"]
    if mt == "application/vnd.google-apps.document":
        data = drive().files().export(fileId=file_id, mimeType="text/plain").execute()
    elif mt == "application/vnd.google-apps.spreadsheet":
        data = drive().files().export(fileId=file_id, mimeType="text/csv").execute()
    elif mt == "application/vnd.google-apps.presentation":
        data = drive().files().export(fileId=file_id, mimeType="text/plain").execute()
    elif mt.startswith("text/"):
        data = drive().files().get_media(fileId=file_id).execute()
    else:
        return f"[archivo {meta['name']} de tipo {mt}: no es texto; usar download_file]"
    return data.decode("utf-8", "replace") if isinstance(data, bytes) else str(data)


def download_file(file_id: str) -> bytes:
    return drive().files().get_media(fileId=file_id).execute()


def create_doc_from_html(title: str, html: str, parent_id: str | None = None) -> dict:
    """Crea un Google Doc convirtiendo HTML (así se mantiene el branding)."""
    from googleapiclient.http import MediaInMemoryUpload
    meta = {"name": title, "mimeType": "application/vnd.google-apps.document"}
    if parent_id:
        meta["parents"] = [parent_id]
    media = MediaInMemoryUpload(html.encode("utf-8"), mimetype="text/html", resumable=False)
    f = drive().files().create(body=meta, media_body=media, fields="id,webViewLink").execute()
    guard.audit("doc_created", title=title, id=f["id"])
    return f


def share_with_student(file_id: str, email: str) -> None:
    guard.audit("drive_share", file=file_id, to=email)
    drive().permissions().create(fileId=file_id, sendNotificationEmail=True,
                                 body={"type": "user", "role": "writer", "emailAddress": email}).execute()


def move_file(file_id: str, new_parent: str) -> None:
    f = drive().files().get(fileId=file_id, fields="parents").execute()
    drive().files().update(fileId=file_id, addParents=new_parent,
                           removeParents=",".join(f.get("parents", [])), fields="id").execute()


# ---------- Calendar ----------

def events_between(start_iso: str, end_iso: str) -> list[dict]:
    res = calendar().events().list(calendarId="primary", timeMin=start_iso, timeMax=end_iso,
                                   singleEvents=True, orderBy="startTime", maxResults=250).execute()
    return res.get("items", [])


def update_event(event_id: str, patch: dict, *, notify_attendees: bool, is_student_event: bool) -> dict:
    level = guard.check_calendar_change(notify_attendees=notify_attendees, is_student_event=is_student_event)
    guard.audit("calendar_update", event=event_id, fields=list(patch), notify=level)
    return calendar().events().patch(calendarId="primary", eventId=event_id, body=patch,
                                     sendUpdates="all" if level == "ALL" else "none").execute()
