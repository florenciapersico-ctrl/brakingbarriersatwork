"""Uso: python -m bbaw <rutina>   (ej. python -m bbaw feedback)
       python -m bbaw lista       (muestra las rutinas)"""
import sys

from . import runner

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] in ("lista", "-h", "--help"):
        for key, job in runner.load()["rutinas"].items():
            print(f"{key:18} {job['nombre']}  ·  {job['cuando']}")
        sys.exit(0)
    print(runner.run(sys.argv[1]))
