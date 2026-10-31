"""Configuración del sistema de Flor (AT WORK).

Todo lo que es fijo del negocio vive acá. Las credenciales vienen de variables
de entorno (GitHub Actions › Secrets); nunca se escriben en el código.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
TZ = "America/Argentina/Buenos_Aires"

FLOR_EMAIL = "florenciapersico@breakingbarriers.site"
FLOR_OTHER_EMAILS = ("mariaflorenciaper@gmail.com",)

# Notion
NOTION_ALUMNAS_DS = "59d40821-721b-4597-9b86-4b856c800e87"
NOTION_FEEDBACK_DS = "f4eff02f-31c7-4da7-bb92-b04ec4629db8"
NOTION_FEEDBACK_URL = "https://app.notion.com/p/26e9491983c94fa8a54c98ff244ffe0e"
NOTION_HOY_PAGE = "3e35708d644881f89db3f34d02323485"
NOTION_PROGRAMA_DS = "b2c445b1-b3ad-41c2-9bd5-e2ff81858d53"

# Drive
DRIVE_VIP_STUDENTS = "1EKSntEU0pkzws27TxeovcAI1yz58ykTv"

# Gmail
LABEL_FEEDBACK = "AT WORK/Feedback para revisar"

# IA
MODEL = os.environ.get("BBAW_MODEL", "claude-opus-5-5")
EFFORT = os.environ.get("BBAW_EFFORT", "high")

# Nunca se nombra a estas personas en nada que salga hacia alumnas.
NEVER_NAME = ("Maribel", "Luz Cañas")


@dataclass
class Settings:
    """Modo de ejecución. Por defecto, MODO PRUEBA: nada sale hacia alumnas."""

    dry_run: bool = field(default_factory=lambda: os.environ.get("BBAW_DRY_RUN", "1") != "0")
    # Regla de Flor (31/10): "no quiero perder la humanidad dentro de mi negocio".
    # Ningún feedback ni respuesta a alumnas sale sin su aprobación. No hay
    # interruptor para cambiarlo: el envío automático de 🟢 no existe.
    # Tope de seguridad: máximo de mails a alumnas por corrida.
    max_student_emails_per_run: int = field(
        default_factory=lambda: int(os.environ.get("BBAW_MAX_STUDENT_EMAILS", "60"))
    )


SETTINGS = Settings()
