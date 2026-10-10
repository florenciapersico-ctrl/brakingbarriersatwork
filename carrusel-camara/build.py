"""Renderiza el carrusel «Frente a una cámara» (7 láminas, 1080x1440) a PNG.

Uso: python3 build.py   (necesita Chromium en /opt/pw-browsers)
"""
import pathlib
import subprocess

D = pathlib.Path(__file__).parent
CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
TOTAL = 7

BRUSH = ("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 44' preserveAspectRatio='none'>"
         "<path d='M4 30 C120 16 330 6 596 8 C600 9 598 12 594 12 C380 18 170 30 12 40 C4 37 0 33 4 30 Z' fill='%23F1E08F'/>"
         "<path d='M60 30 C200 22 380 18 520 19' stroke='%23F1E08F' stroke-width='2' fill='none' opacity='.6'/></svg>")
CIRCLE = ("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 220' preserveAspectRatio='none'>"
          "<path d='M300 14 C150 2 20 40 12 108 C4 176 140 212 270 208 C410 204 494 162 488 100 C482 40 380 6 210 20' "
          "stroke='%23F1E08F' stroke-width='6' fill='none' stroke-linecap='round'/>"
          "<path d='M250 24 C120 20 30 56 26 112 C22 168 150 200 280 196' stroke='%23F1E08F' stroke-width='3' "
          "fill='none' opacity='.55' stroke-linecap='round'/></svg>")

CSS = f"""
@font-face{{font-family:Display;src:url(fonts/playfair-display-latin-700-normal.woff2);font-weight:700}}
@font-face{{font-family:Body;src:url(fonts/tinos-latin-400-normal.woff2);font-weight:400}}
:root{{--bg:#2B1F18;--yellow:#F1E08F;--ivory:#F4EEE3}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1440px;overflow:hidden;background:var(--bg)}}
.page{{position:absolute;inset:0;width:1080px;height:1440px;padding:120px 100px 60px;display:flex;flex-direction:column;
  justify-content:center;color:var(--ivory);font-family:Body,serif;letter-spacing:-0.025em}}
.num{{position:absolute;top:80px;left:100px;font-family:Body;font-size:34px;color:var(--yellow);letter-spacing:.01em}}
.num::after{{content:'';display:block;width:62px;height:3px;background:var(--yellow);margin-top:22px}}
p{{font-size:76px;line-height:1.1}}
.s{{font-size:64px}}
.xs{{font-size:58px;line-height:1.1}}
.k{{font-family:Display;font-weight:700;color:var(--yellow);letter-spacing:-0.03em;line-height:1.08;font-size:86px}}
.g{{height:44px}}.g2{{height:22px}}.g3{{height:90px}}
.rule{{width:84px;height:3px;background:var(--yellow)}}
.u{{position:relative;white-space:nowrap}}
.u::after{{content:'';position:absolute;left:-14%;right:-4%;bottom:-.42em;height:.36em;background:url("{BRUSH}") no-repeat center/100% 100%}}
.circle{{position:relative;display:inline-block}}
.circle::before{{content:'';position:absolute;inset:-84px -150px -96px -128px;background:url("{CIRCLE}") no-repeat center/100% 100%}}
.bars{{border-left:3px solid var(--yellow);padding:4px 0 4px 40px;margin-left:16px}}
.bars p+p{{margin-top:14px}}
.pill{{align-self:center;background:var(--yellow);color:var(--bg);font-family:Display;font-weight:700;font-size:58px;
  padding:20px 66px 26px;border-radius:999px;letter-spacing:-0.02em}}
.cover{{padding:0 70px 110px;justify-content:flex-end}}
.cover img{{position:absolute;top:0;left:0;width:1080px}}
.cover .fade{{position:absolute;left:0;right:0;top:640px;height:552px;background:linear-gradient(to bottom,rgba(43,31,24,0),rgba(43,31,24,.5) 55%,var(--bg))}}
.cover .t{{position:relative}}
.cover h1{{font-family:Display;font-weight:700;color:var(--yellow);font-size:138px;line-height:.98;letter-spacing:-0.035em}}
.cover .sub{{font-size:80px;line-height:1.05;margin-top:22px}}
.cover .sub .u::after{{left:-55%;right:-2%;bottom:-.4em;height:.3em}}
"""

S = [
    ('cover', '<img src="foto-portada.jpg"><div class="fade"></div>'
              '<div class="t"><h1>Quizás no<br>te falta fluidez.</h1>'
              '<p class="sub">Quizás te pasa lo que a mí<br>frente a una <span class="u">CÁMARA</span>.</p></div>'),
    ('', '<p>Me dicen:</p><div class="g2"></div>'
         '<p class="k" style="font-size:78px">“Graba un video<br>&nbsp;&nbsp;explicando lo que haces.”</p><div class="g"></div>'
         '<p>Y no puedo unir<br>dos oraciones.<br>Conozco mi programa<br>de memoria.<br>Y frente a la cámara, nada.</p>'
         '<div class="g3"></div><div class="rule"></div>'),
    ('', '<p>Pero estoy en un bar,<br>alguien me pregunta a qué<br>me dedico…</p><div class="g2"></div>'
         '<p>y lo explico <span class="u">PERFECTO.</span></p><div class="g3"></div>'
         '<p>A un desconocido.<br>Al que ni siquiera<br>le interesaba.</p><div style="height:200px"></div>'),
    ('', '<p class="k">Y con el inglés<br>pasa lo mismo.</p><div class="g2"></div>'
         '<p>Lo veo muchísimo<br>en profesionales que<br>vuelven de un viaje<br>donde hablaron<br>sin problema.</p><div class="g"></div>'
         '<p>Y en la reunión del lunes<br>piensan:</p><div class="g2"></div>'
         '<p class="k"><span class="u" style="white-space:normal">“¿Por qué en el trabajo<br>&nbsp;&nbsp;no me sale?”</span></p>'),
    ('', '<p>A veces, en una clase,<br>hago algo a propósito:</p><div class="g"></div>'
         '<p>Dejamos de corregir<br>por un rato y simplemente<br>charlamos.</p><div class="g"></div>'
         '<p>Y al final le pregunto:</p><div style="height:110px"></div>'
         '<div style="padding-left:56px"><p class="k circle" style="font-size:80px">“¿Te diste cuenta<br>de lo fluida que<br>estuviste?”</p></div><div class="g"></div>'),
    ('', '<p>En el trabajo no sabes<br>menos inglés.</p><div class="g2"></div>'
         '<p>Pero sientes que tienes<br>mucho más en juego.</p><div class="g"></div>'
         '<div class="bars"><p class="s">Quieres estar a la altura.</p><p class="s">No equivocarte.</p>'
         '<p class="s">Sonar profesional.</p></div><div class="g"></div>'
         '<p>Y esa presión puede hacer<br>que te cueste acceder<br>al inglés que ya sabes.</p>'
         '<div class="g3"></div><div class="rule"></div>'),
    ('', '<p class="s">A mí me pasa frente a una cámara.<br>A ti quizás te pasa en una reunión<br>de trabajo.</p>'
         '<div class="g"></div>'
         '<p class="xs">Porque si puedes hablar inglés<br>con fluidez en tus 1:1, pero<br>cuando hay más gente te bloqueas…</p>'
         '<div class="g"></div><p class="k" style="font-size:96px">Quizás no necesitas<br>estudiar más inglés.</p><div class="g2"></div>'
         '<p class="xs">Quizás necesitas entrenarlo<br>justamente en esas situaciones<br>donde hoy sientes que no te sale.</p>'
         '<div class="g"></div><div class="rule"></div><div class="g"></div><div class="pill">¿Te pasa?</div>'),
]

for i, (cls, body) in enumerate(S, 1):
    num = f'<div class="num">{i:02d}/{TOTAL:02d}</div>'
    h = D / f'_s{i}.html'
    h.write_text(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>'
                 f'<body><div class="page {cls}">{body}{num}</div></body>')
    subprocess.run([CHROME, '--headless', '--no-sandbox', '--hide-scrollbars', '--virtual-time-budget=3000',
                    '--window-size=1080,1440', f'--screenshot={D}/lamina-{i:02d}.png', f'file://{h}'],
                   check=True, capture_output=True)
    h.unlink()
print('ok')
