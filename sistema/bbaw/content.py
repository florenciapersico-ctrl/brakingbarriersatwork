"""Convierte lo que entrega una alumna (mail, adjunto, archivo de Drive, audio)
en algo que la IA pueda leer: texto o imagen."""
from __future__ import annotations

import base64
import io
import os
import re
import tempfile

AUDIO_EXT = (".mp3", ".m4a", ".wav", ".ogg", ".opus", ".aac", ".webm", ".mp4")
IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"}
DRIVE_ID = re.compile(r"(?:/d/|/folders/|id=)([A-Za-z0-9_-]{20,})")


def drive_ids_in(text: str) -> list[str]:
    return list(dict.fromkeys(DRIVE_ID.findall(text or "")))


def docx_text(data: bytes) -> str:
    import docx  # python-docx
    d = docx.Document(io.BytesIO(data))
    parts = [p.text for p in d.paragraphs]
    for t in d.tables:
        for row in t.rows:
            parts.append(" | ".join(c.text for c in row.cells))
    return "\n".join(parts)


def pdf_text(data: bytes) -> str:
    from pypdf import PdfReader
    return "\n".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(data)).pages)


def transcribe(data: bytes, suffix: str) -> str:
    """Transcribe un audio con marcas de tiempo (faster-whisper, corre en GitHub)."""
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return "[audio sin transcribir: falta faster-whisper]"
    size = os.environ.get("BBAW_WHISPER_MODEL", "small")
    with tempfile.NamedTemporaryFile(suffix=suffix) as f:
        f.write(data)
        f.flush()
        model = WhisperModel(size, device="cpu", compute_type="int8")
        segments, _ = model.transcribe(f.name, language="en", vad_filter=True)
        lines = [f"[{int(s.start // 60)}:{int(s.start % 60):02d}] {s.text.strip()}" for s in segments]
    return "TRANSCRIPCIÓN AUTOMÁTICA (verificar pronunciación con Flor):\n" + "\n".join(lines)


def to_blocks(name: str, mime: str, data: bytes) -> list[dict]:
    """Bytes de un archivo -> bloques de contenido para Claude."""
    low = name.lower()
    if mime in IMAGE_TYPES:
        return [{"type": "text", "text": f"Imagen: {name}"},
                {"type": "image", "source": {"type": "base64", "media_type": mime,
                                              "data": base64.b64encode(data).decode()}}]
    if mime == "application/pdf" or low.endswith(".pdf"):
        return [{"type": "document", "title": name,
                 "source": {"type": "base64", "media_type": "application/pdf",
                            "data": base64.b64encode(data).decode()}}]
    if low.endswith(".docx"):
        return [{"type": "text", "text": f"Archivo {name}:\n{docx_text(data)}"}]
    if low.endswith(AUDIO_EXT) or mime.startswith("audio/"):
        ext = next((e for e in AUDIO_EXT if low.endswith(e)), ".m4a")
        return [{"type": "text", "text": f"Audio {name}:\n{transcribe(data, ext)}"}]
    if mime.startswith("text/"):
        return [{"type": "text", "text": f"Archivo {name}:\n{data.decode('utf-8', 'replace')}"}]
    return [{"type": "text", "text": f"[adjunto {name} ({mime}) que no se pudo leer]"}]
