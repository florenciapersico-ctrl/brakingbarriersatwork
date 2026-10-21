---
name: editar-reels
description: Edita los reels de Flor Pérsico (AT WORK · Breaking Barriers at Work) con el formato que aprobó el 20/10/2026: mejora la luz, el color y el audio, corta silencios y muletillas, pone subtítulos karaoke debajo de la cara con su tipografía y sus colores, y un hook visual grande debajo de los subtítulos, con placa final de marca. Usala cuando Flor mande un video para editar, diga «editá este reel», «poné subtítulos», «mejorá la luz o el audio», «sacá las muletillas» o «hacelo como el de robótico».
---

# Editar reels · formato AT WORK

> **Por defecto (Flor, 21/10: «ok hazlo»):** formato **marco**, **remera negra** y **fondo de oficina**. Primero `ROPA=38,36,38 python3 $S/fondo.py`, después `LAYOUT=marco python3 $S/reel.py render`. Solo si ella pide otra cosa se usa el formato sin marco o el fondo original. Subí el MP4 final a la carpeta de Canva del día.

El modelo aprobado es `carruseles/reels/r1-traduccion-literal/` («¿Por qué tu inglés suena robótico?»). Flor lo aprobó con un «perfecto, quedó perfecto». Todo reel nuevo sale igual, salvo que ella pida otra cosa.

## Lo que Flor pidió (no negociable)

1. **Calidad profesional.** Más luz, piel cálida, imagen nítida y audio limpio, con voz presente y volumen nivelado.
2. **Material original.** Pedí siempre el archivo original por Drive o como documento. WhatsApp comprime a 576 × 1024 y lo que se pierde ahí no se recupera. Si llega por WhatsApp, procesalo igual y avisale.
3. **Cortes.** Sacá los silencios largos, las muletillas («eh», «em», «mmm») y los arranques en falso. Que no se noten los saltos.
4. **Subtítulos con la puntuación bien.** Llevan mayúsculas, comas, puntos y dos puntos. Cuando cita a alguien (una alumna, una frase en inglés), va entre «comillas» y la frase en inglés en cursiva. Cada recuadro termina donde termina la idea, sin cortar a mitad de frase, con 2 a 4 palabras por recuadro.
5. **Usá sus palabras exactas.** Solo se agrega puntuación, nunca se cambian ni se resumen.
6. **Formato de su reel de referencia, con su marca:**
   - **Subtítulos:** van justo debajo de la cara (y = 1020 sobre 1920), en un recuadro sólido redondeado marrón #3F1E0D. Usan Crimson Pro Regular de 66 px. La palabra que se está diciendo se enciende en crema #FAF4EC y las que siguen quedan en terracota #C49678.
   - **Hook visual:** va DEBAJO de los subtítulos y más grande, nunca en la frente ni sobre la cara. Es un recuadro crema #F9F5EE redondeado, con Crimson Pro SemiBold de 92 px en marrón #3F1E0D y dos líneas. Queda fijo durante todo el video.
   - **Placa final de 2,8 s:** «No era el inglés. / Era la relación con el inglés.» + el CTA + «AT WORK · Clear, not native.»
7. **Hook:** una pregunta corta que nombre el problema en su lenguaje. El de referencia es «¿Por qué tu inglés suena robótico?»: Flor lo prefirió a «suena a traducción». Proponé 2 o 3 opciones si no lo dio ella.
8. **CTA:** el que diga ella en el video. Si dice una palabra distinta de READY, avisale que la agregue como palabra clave en ManyChat.

## Cómo se hace

Los requisitos son `pip install faster-whisper`, ffmpeg y PIL. Las fuentes están en `fonts/`. Si el sistema de Notion o Drive no deja descargar, usá `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`.

```bash
S=.claude/skills/editar-reels/scripts
python3 $S/reel.py transcribir <video> <carpeta>
# Revisá <carpeta>/subtitulos.txt: una línea = un recuadro. Puntuá, poné «comillas», mayúsculas y cortes por idea.
#   Tiene que tener EXACTAMENTE las mismas palabras que el audio y en el mismo orden (el script lo verifica).
#   Si querés cortar un arranque en falso, agregá su (inicio, fin) a <carpeta>/silencios.json y borrá esas palabras de words.json y subtitulos.txt.
python3 $S/reel.py render <video> <carpeta> "¿Hook línea 1|línea 2?" "Texto chico del CTA|COMENTA PALABRA"
```

La salida es `<carpeta>/REEL_FINAL.mp4`, vertical 1080 × 1920 a 30 fps, en H.264 con audio AAC a −14 LUFS.

## Versión con fondo de oficina (opcional)

Flor la pidió el 20/10 («que parezca que estoy en una oficina»). Antes del render, corré `python3 $S/fondo.py <video> <carpeta>/fondo.mov` y después `reel.py render` sobre `fondo.mov`.

- **Fondo:** su propio espacio de trabajo real, desenfocado: `fondo-oficina-plantas.png`, sacado de su foto del café de las plantas. Nunca uses fondos de IA ni de stock.
- **Entregas:** mandá las dos versiones (fondo original y fondo de oficina) para que elija, salvo que ella ya haya dicho cuál quiere.
- **Control:** revisá los bordes del pelo y las manos con un recorte ampliado.

## Formato «marco» (si la cabeza quedó cortada)

Flor lo pidió el 21/10 porque la cabeza cortada «queda rarísimo». Con `LAYOUT=marco python3 $S/reel.py render ...` el video sale así:
- **Arriba:** una franja crema #F4EADF con el hook grande en marrón.
- **Abajo:** el video en una tarjeta redondeada de 1000 × 1440, con los subtítulos sobre el video.

Así el corte queda en el borde del marco y parece un encuadre a propósito. Usalo siempre que la cabeza toque el borde de arriba.

## Ropa: color sin arrugas (gratis)

Con `ROPA=38,36,38 python3 $S/fondo.py ...` la remera queda negra y plana. Para marrón, usá `92,60,40`. El crema todavía se mezcla con el pantalón: no lo uses. Cambiar la prenda por otra (por ejemplo, de remera a blazer) no se puede gratis: hace falta IA generativa paga, como Runway Aleph por API, con la clave en `RUNWAYML_API_SECRET`.

## Antes de entregar

- **Revisá los fotogramas** con Read en 3 o 4 momentos: que los subtítulos no tapen la boca, que el hook no tape la cara y que las comillas aparezcan bien.
- **Leé `subtitulos.txt` completo** buscando errores de transcripción en palabras en inglés y en nombres propios.
- **Guardá el reel** en `carruseles/reels/<rN-tema>/` con `descripcion.txt` (el caption, con TÚ) y el `subtitulos.txt` final.
- **Subilo** a la carpeta de Canva del día y avisale a Flor qué hiciste, en voseo y en pocas líneas.

## Ajustes de imagen y audio (por si hay que retocar)

- **Imagen:**
  - `hqdn3d=1:1:2:2` (si es de WhatsApp, `2:1.5:4:4`)
  - curva que levanta sombras y medios (`0/0.02 0.25/0.30 0.5/0.57 0.75/0.80 1/1`)
  - `eq contrast=1.04 saturation=1.08`
  - `colortemperature 5500 mix 0.4` (más cálido)
  - `unsharp 5:5:0.35`
- **Audio:**
  - `highpass 80`
  - `afftdn nf=-25`
  - EQ: −2 dB en 200 Hz, +3 dB en 3,5 kHz
  - compresor 3:1
  - `loudnorm I=-14`
- **Silencios:** `silencedetect -30dB` de 0,22 s o más, dejando 0,07 s de aire de cada lado.
