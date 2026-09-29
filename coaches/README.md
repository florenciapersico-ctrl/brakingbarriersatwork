# Coaches de práctica

Los bots del Breaking Barriers Method, como páginas de Claude. Cada alumna los usa con su propia cuenta de Claude.

Página de inicio para las alumnas: https://claude.ai/artifact/5T1MfqyeU5QvF7WzL7iWwW (`practica.html`)

| Coach | Enlace |
|---|---|
| Narrative Flow at Work | https://claude.ai/artifact/1moJCW661jk4h6QauSs9hG |
| Color Method at Work | https://claude.ai/artifact/XgsDo619gwFYgvQ6M39epr |
| Role Play at Work | https://claude.ai/artifact/NUsmKufsVpoP7bCcwAXrVT |
| Flor English Coach | https://claude.ai/artifact/S4GpX2vR8NHPmzVMdyNe4G |

## Cómo cambiar un coach

1. Editá los archivos de `src/<coach>/`: `01-instrucciones.md` tiene las instrucciones del GPT original y los demás `.md` son sus archivos de conocimiento. `config.json` tiene el nombre, la descripción y los botones de inicio.
2. Corré `python3 coaches/build.py`. Genera `dist/<coach>.html`.
3. Publicá de nuevo la página en el mismo enlace.

`template.html` es el diseño común a todos los coaches.
