"""Carga el criterio de Flor (rutinas, skills, voz) desde el repo.

Las instrucciones viven en archivos .md que Flor ya fue afinando. El sistema no
las copia: las lee en cada corrida, así un cambio en el repo cambia el sistema.
Una ruta "git:<rama>:<archivo>" se lee de otra rama sin hacer checkout.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

from .config import REPO_ROOT


def read(ref: str) -> str:
    if ref.startswith("git:"):
        _, branch, path = ref.split(":", 2)
        try:
            return subprocess.run(["git", "show", f"origin/{branch}:{path}"], cwd=REPO_ROOT,
                                  check=True, capture_output=True, text=True).stdout
        except subprocess.CalledProcessError:
            return f"[no se encontró {ref}]"
    p = REPO_ROOT / ref
    if p.is_dir():
        return "\n\n".join(f"### {f.relative_to(REPO_ROOT)}\n{f.read_text()}" for f in sorted(p.rglob("*.md")))
    return p.read_text() if p.exists() else f"[no se encontró {ref}]"


def bundle(refs: list[str]) -> str:
    return "\n\n".join(f"===== {r} =====\n{read(r)}" for r in refs)


FEEDBACK_KNOWLEDGE = [
    "rutinas/_reglas-comunes.md",
    "rutinas/feedback-alumnas.md",
    "rutinas/feedback-sistema.md",
    "rutinas/estilo-devoluciones.md",
    "rutinas/criterio-correccion-log.md",
    ".claude/skills/feedback-alumnas/SKILL.md",
    ".claude/skills/feedback-alumnas/referencias",
    "oferta/oferta-vigente.md",
]


def repo_root() -> Path:
    return REPO_ROOT
