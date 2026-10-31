"""Llamadas a Claude (API de Anthropic). Credencial: ANTHROPIC_API_KEY."""
from __future__ import annotations

from functools import lru_cache
from typing import TypeVar

import anthropic
from pydantic import BaseModel

from .config import EFFORT, MODEL

T = TypeVar("T", bound=BaseModel)

FALLBACK_BETA = "server-side-fallback-2026-07-01"


@lru_cache(maxsize=1)
def client() -> anthropic.Anthropic:
    return anthropic.Anthropic(max_retries=4, timeout=600)


def _system_blocks(system: str) -> list[dict]:
    # Las instrucciones largas (reglas, skill, voz de Flor) van primero y fijas,
    # así se reutilizan del caché entre alumnas y la corrida sale más barata.
    return [{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}]


class Refused(Exception):
    pass


def ask_json(system: str, user: str | list[dict], schema: type[T], effort: str = EFFORT) -> T:
    """Una sola llamada que devuelve un objeto validado (Pydantic).
    `user` puede ser texto o una lista de bloques (texto, imágenes, PDFs)."""
    resp = client().messages.parse(
        model=MODEL,
        max_tokens=16000,
        system=_system_blocks(system),
        output_config={"effort": effort},
        messages=[{"role": "user", "content": user}],
        output_format=schema,
    )
    if resp.stop_reason == "refusal":
        raise Refused(str(resp.stop_details))
    return resp.parsed_output


def run_agent(system: str, task: str, tools: list, effort: str = EFFORT, max_iterations: int = 60) -> str:
    """Agente con herramientas (Tool Runner). Devuelve el texto final."""
    runner = client().beta.messages.tool_runner(
        model=MODEL,
        max_tokens=32000,
        system=_system_blocks(system),
        output_config={"effort": effort},
        tools=tools,
        messages=[{"role": "user", "content": task}],
        max_iterations=max_iterations,
        betas=[FALLBACK_BETA],
        fallbacks="default",
    )
    final = runner.until_done()
    if final.stop_reason == "refusal":
        raise Refused(str(getattr(final, "stop_details", "")))
    return "".join(b.text for b in final.content if b.type == "text")
