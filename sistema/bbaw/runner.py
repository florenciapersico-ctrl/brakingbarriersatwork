"""Corre una rutina de config/jobs.yaml."""
from __future__ import annotations

import datetime as dt
import json
import zoneinfo
from pathlib import Path

import yaml

from . import guard, knowledge, llm, tools
from .config import REPO_ROOT, SETTINGS, TZ

JOBS = Path(__file__).resolve().parents[1] / "config" / "jobs.yaml"

AGENT_PREAMBLE = """Sos la asistente de Flor Pérsico (Breaking Barriers AT WORK, coaching de inglés para el trabajo).
Corrés sola, sin que Flor esté mirando: no le hagas preguntas en el medio; lo que necesite decisión de Flor va
en el mail o en tu respuesta final. Usá SOLO las herramientas que tenés; si una regla de Flor bloquea algo,
no intentes otro camino: anotalo. Nunca inventes datos: lo que no encuentres, decilo.
A Flor le hablás en rioplatense con voseo, cálido y breve.

Si las instrucciones de abajo mencionan herramientas, subagentes, ramas de git, conectores o pasos de
"Claude Code" que no tenés, hacé lo mismo con tus herramientas, o salteá ese paso y anotalo.

===== REGLAS COMUNES Y OFERTA =====
{comunes}

===== INSTRUCCIONES DE ESTA RUTINA =====
{instrucciones}
"""


def load() -> dict:
    return yaml.safe_load(JOBS.read_text())


def run(name: str) -> str:
    cfg = load()
    job = cfg["rutinas"][name]
    guard.audit("job_start", job=name, dry_run=SETTINGS.dry_run)
    if job["tipo"] == "feedback":
        from .jobs import feedback
        result = feedback.run()
    elif job["tipo"] == "enviar_aprobados":
        from .jobs import send_approved
        result = send_approved.run()
    else:
        system = AGENT_PREAMBLE.format(comunes=knowledge.bundle(cfg["comunes"]),
                                       instrucciones=knowledge.bundle(job["instrucciones"]))
        allowed = [tools.ALL[t] for t in job["herramientas"]]
        now = dt.datetime.now(zoneinfo.ZoneInfo(TZ))
        task = (f"Ahora es {now:%A %d/%m/%Y %H:%M} en Buenos Aires. Hacé la rutina «{job['nombre']}» para hoy. "
                f"Al final respondé con un resumen de 3 a 6 líneas de lo que hiciste.")
        result = llm.run_agent(system, task, allowed)
    guard.audit("job_end", job=name, result=result[:2000])
    out = REPO_ROOT / "sistema" / "registro"
    out.mkdir(exist_ok=True)
    (out / f"{dt.date.today()}-{name}.json").write_text(
        json.dumps({"job": name, "result": result, "log": guard.audit_log()}, ensure_ascii=False, indent=1))
    return result
