# Chequeo de pronunciación (prototipo, 30/10/2026)

Marca los segundos donde probablemente hay un error de pronunciación típico de hispanohablantes, para que Flor los escuche y confirme. NO es corrección automática: nada de esto va a la alumna sin que Flor lo haya escuchado.

Uso: `python3 pron_check.py <audio> [--json out.json] [--min-conf 0.75]` (necesita faster-whisper, transformers con facebook/wav2vec2-lv-60-espeak-cv-ft, espeak-ng y data/cmudict.dict). ~1 min de proceso por minuto de audio en CPU.

Detecta: live adjetivo dicho como "vivir", -ed con sílaba de más, v→b, th, ɪ↔iː, e- antes de s+consonante, -s final omitida, schwa. No detecta acento de palabra ni entonación.
Validación: audio del OKR de Vir (30/10) — encontró los dos errores que Flor escuchó (live 0:12, skipped 0:39). Falta calibrar con más audios marcados por Flor. Las -s finales omitidas pueden ser connected speech normal.
