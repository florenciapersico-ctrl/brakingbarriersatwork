---
name: fabrica-de-clases
description: Arma el kit completo de una clase grabada del programa AT WORK de Flor Pérsico (prompter, deck, worksheet en docx y pdf, y la ficha para la plataforma) con su criterio, lo audita y lo deja listo para grabar; y después de grabar, revisa el video contra el prompter. Usala cuando Flor diga "armame la clase de X", "preparame el prompter", "la worksheet de X", "qué falta para grabar", "revisá el video que grabé" o cuando una rutina de grabación pida el próximo kit.
---

# Fábrica de clases · AT WORK

El objetivo es que Flor **solo grabe**. Todo lo demás llega hecho, auditado y en su
lugar: ella revisa en 10–15 minutos, graba y sube el .mp4.

## Fuentes (leer siempre antes de armar)

- Criterios de módulo: `programa/modulo3-criterios.md` (y el de cada módulo si existe).
  Si un módulo no tiene archivo de criterios, se usa el de Módulo 3 como base.
- Estado real: Notion › base AT WORK y «Estudio de grabación · AT WORK»; Drive ›
  «AT WORK 2026 FINAL» (videos, prompters, decks, worksheets ya hechos).
- Modelos de formato que ya funcionan (copiar estructura, no contenido):
  - Prompter: `onboarding/prompters/13 — Antes de empezar el Módulo 1 · PROMPTER LISTO.docx`
    (rama `claude/awesome-brown-0jjg6u`).
  - Deck: `at-work/clases/M2.07_Presentaciones_v6.pptx` (rama `claude/elegant-edison-jyv117`).
  - Worksheet: `at-work/clases/Clase2_Futuro_WORKSHEET.docx` (misma rama).
- Si existe un guion, deck o worksheet anterior de esa clase, se parte de ahí: **no se
  reescribe lo que ya está bien**, se corrige según los criterios.

## Reglas fijas (todas las piezas)

1. **Español neutro con tú** en prompter y worksheet. El inglés, natural y del trabajo.
2. **Contenido permanente, sin modalidad** (decisión de Flor del 15/10): nunca "lab",
   "tu sesión", "encuentro", "la hacemos juntas", "Weekly Report", ni carpetas de Drive
   de la alumna (por ejemplo "04 · MIS PRÁCTICAS"). Usar las frases de reemplazo de
   `modulo3-criterios.md`.
3. **Un problema central por clase.** Lo extra va a la worksheet o a una microlección.
4. **Nada de reglas absolutas**: "normalmente", "una estructura muy frecuente", "en el
   inglés del trabajo".
5. **Duración 10–18 min** (≈ 130 palabras por minuto de prompter: 1300–2300 palabras).
6. Nada inventado sobre alumnas: los ejemplos son situaciones de trabajo genéricas.

## Estructura del video (el prompter y el deck la siguen igual)

1. Problema comunicativo: una frase real o un error (1–2 min).
2. Explicación focalizada (4–6 min).
3. Recuperación activa: «Pause the video. Try it yourself. Then press play to compare.»
   La respuesta va en la slide siguiente.
4. Aplicación guiada al trabajo (2–4 min).
5. Cierre con tres acciones: **Apply it** · **Practice it** (en voz alta o en Role Play)
   · **Review it** (Retry y Personal Error Radar).

## El kit (lo que se entrega por clase)

Nombre base: `<código> · <título>` (por ejemplo `M3.05 · Relative Clauses`).

| Pieza | Formato | Cómo |
|---|---|---|
| Prompter | `.docx` + `.txt` para la app de teleprompter | Bloques `SLIDE n` con el texto para decir, frases cortas, una idea por párrafo. El mismo texto va en las **notas del orador** de cada slide del deck. |
| Deck | `.pptx` con la marca del modelo M2.07 | Una slide por bloque del prompter, rótulo `NN · SECCIÓN`, poco texto, ejemplos ✗/✓. Slide de pausa + slide de respuestas. |
| Worksheet | `.docx` + `.pdf` | Secciones: Notice · Practice (respuestas al final, con el porqué) · Apply to Your Work · Speak & Retry (con el prompt para pegar en el coach de Role Play) · Review it / Personal Error Radar. |
| Ficha de la plataforma | texto | Título, descripción de 2 líneas, objetivo, duración estimada, links a la worksheet y al coach. |

## Pasos

1. **Elegir** la próxima pieza: la primera del plan de «Estudio de grabación» que no
   tenga kit completo. Si te nombran una clase, esa.
2. **Armar** prompter → deck → worksheet → ficha, en ese orden.
3. **Auditar** con este checklist y corregir hasta que pase todo:
   - [ ] Un solo problema central.
   - [ ] Ninguna regla absoluta ni explicación incorrecta (revisar cada regla gramatical
         contra una gramática de referencia; ante la duda, matizar).
   - [ ] Al menos una pausa de recuperación con su slide de respuesta.
   - [ ] Cierre con Apply it · Practice it · Review it.
   - [ ] Cero palabras de modalidad (buscar: lab, sesión, encuentro, juntas, weekly,
         Drive, carpeta, MIS PRÁCTICAS).
   - [ ] No repite otra clase del programa.
   - [ ] Prompter dentro de 1300–2300 palabras; cada slide del deck tiene sus notas.
   - [ ] La worksheet tiene respuestas para todo lo de Practice.
4. **Entregar**: subir el kit a la carpeta de la clase en Drive › «AT WORK 2026 FINAL»;
   en Notion poner el estado «Kit listo · revisar» con los links; nunca «Grabado».
5. **Avisar**: un solo mail a Flor (florenciapersico@breakingbarriers.site) con las
   piezas listas, en voseo y corto: links, duración estimada y «lo que tenés que
   decidir vos» (solo si algo no se pudo resolver con los criterios).

## Después de grabar (cuando aparece un .mp4 nuevo en la carpeta de la clase)

1. Transcribir el video (faster-whisper) y compararlo con el prompter: marcar con el
   minuto los errores de contenido, de inglés o los saltos de bloque. Aclarar que la
   transcripción no evalúa pronunciación.
2. Generar los subtítulos `.srt` desde la transcripción.
3. En Notion: estado «Grabado · revisado» con el link del video y la lista de clips
   para corregir (o «sin correcciones»). Tildar la línea del día en Estudio de grabación.
4. Si hay algo para regrabar, va primero en el próximo bloque de grabación.

## Nunca

Publicar en la plataforma, escribirle a alumnas, borrar archivos ni marcar una pieza
como grabada sin el .mp4 en Drive.
