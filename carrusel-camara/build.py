import subprocess, pathlib
D = pathlib.Path(__file__).parent
CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1440px;overflow:hidden;background:#2B221E}
.page{position:absolute;top:0;left:0;width:1080px;height:1440px;background:#2B221E;color:#F1E6AE;font-family:'Liberation Serif',serif;letter-spacing:-0.025em;
 display:flex;flex-direction:column;justify-content:center;padding:0 130px}
p{margin:0}
.dev{font-size:50px;line-height:1.16;opacity:.72}
.key{font-size:76px;line-height:1.06;font-weight:700;letter-spacing:-0.03em}
.gap{height:56px}.gap-s{height:28px}
.end{position:absolute;left:130px;bottom:150px;font-size:76px;font-weight:700}
.cover{padding:0;justify-content:flex-end}
.cover img{position:absolute;top:0;left:0;width:1080px;height:1060px;object-fit:cover;object-position:top}
.cover::after{content:'';position:absolute;left:0;top:0;width:1080px;height:1062px;background:linear-gradient(to bottom,rgba(43,34,30,0) 55%,#2B221E 100%)}
.cover .t{position:relative;z-index:1;padding:0 130px 120px;font-size:70px;line-height:1.08;font-weight:700}
"""
S = [
 ('cover', '<img src="foto.jpg"><div class="t">Quizás no te falta fluidez.<br>Quizás te pasa lo que a mí<br>frente a una CÁMARA.</div>'),
 ('', '<p class="dev">Me dicen: “Graba un video<br>explicando lo que haces.”</p><div class="gap"></div>'
      '<p class="dev">Y no puedo unir dos oraciones.<br>Conozco mi programa de memoria.</p><div class="gap"></div>'
      '<p class="key">Y frente a la cámara,<br>nada.</p>'),
 ('', '<p class="dev">Pero estoy en un bar,<br>alguien me pregunta<br>a qué me dedico…</p><div class="gap"></div>'
      '<p class="key">Y lo explico<br>PERFECTO.</p><div class="gap"></div>'
      '<p class="dev">A un desconocido.<br>Al que ni siquiera le interesaba.</p>'),
 ('', '<p class="dev">Y con el inglés pasa lo mismo.</p><div class="gap-s"></div>'
      '<p class="dev">Lo veo muchísimo en profesionales que vuelven de un viaje donde hablaron sin problema.</p><div class="gap"></div>'
      '<p class="dev">Y en la reunión del lunes piensan:</p><div class="gap-s"></div>'
      '<p class="key">“¿Por qué en el trabajo no me sale?”</p>'),
 ('', '<p class="dev">A veces, en una clase, hago algo a propósito:</p><div class="gap-s"></div>'
      '<p class="dev">dejamos de corregir por un rato y simplemente charlamos.</p><div class="gap"></div>'
      '<p class="dev">Y al final le pregunto:</p><div class="gap-s"></div>'
      '<p class="key">“¿Te diste cuenta de lo fluida que estuviste?”</p>'),
 ('', '<p class="key">En el trabajo no sabes menos inglés.</p><div class="gap"></div>'
      '<p class="dev">Pero sientes que tienes mucho más en juego.</p><div class="gap"></div>'
      '<p class="dev">Quieres estar a la altura.<br>No equivocarte.<br>Sonar profesional.</p><div class="gap"></div>'
      '<p class="dev">Y esa presión puede hacer que te cueste acceder al inglés que ya sabes.</p>'),
 ('', '<p class="dev">A mí me pasa frente a una cámara.</p><div class="gap-s"></div>'
      '<p class="key">A ti quizás te pasa en una reunión de trabajo.</p><div class="gap"></div>'
      '<p class="dev">Si en tus 1:1 hablas con fluidez,<br>pero cuando hay más gente te bloqueas…</p>'),
 ('', '<p class="key">Quizás no necesitas estudiar más inglés.</p><div class="gap"></div>'
      '<p class="dev">Quizás necesitas entrenarlo justamente en esas situaciones donde hoy sientes que no te sale.</p>'
      '<p class="end">¿Te pasa?</p>'),
]
for i,(cls,body) in enumerate(S,1):
    h = D/f'_s{i}.html'
    h.write_text(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style><body><div class="page {cls}">{body}</div></body>')
    subprocess.run(['/opt/pw-browsers/chromium-1194/chrome-linux/chrome','--headless','--no-sandbox','--hide-scrollbars',
      '--window-size=1080,1440',f'--screenshot={D}/lamina-{i:02d}.png',f'file://{h}'],check=True,capture_output=True)
    h.unlink()
print('ok')
