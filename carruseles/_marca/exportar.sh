#!/bin/sh
# Uso: ./exportar.sh <carpeta> [<carpeta> ...]
cd "$(dirname "$0")"
for c in "$@"; do node exportar.mjs "$c" && python3 armar.py "$c"; done
