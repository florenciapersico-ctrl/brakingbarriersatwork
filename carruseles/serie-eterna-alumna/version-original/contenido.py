"""Serie «De eterna alumna a profesional en su propia voz» — cinco carruseles AT WORK.

Cada carrusel es una lista de placas. Una placa es (fondo, cuerpo) o
("split", arriba, abajo). Correr `python3 contenido.py` regenera el
index.html de cada carpeta; después `../_marca/exportar.sh <carpeta>` saca
los PNG, el PDF y la vista general.
"""
from pathlib import Path

AQUI = Path(__file__).parent
LOGO = '<img class="logo" src="../../../_marca/img/logo.webp" alt="Breaking Barriers at Work">'
TILDE = '<img src="../../../_marca/img/tilde.webp" alt="">'
MARK = '<img class="mark" src="../../../_marca/img/comillas-terracota.png" alt="">'
CUT = '<div class="cut"><i></i><i></i><i></i></div>'


def rows(items, serif=False, num=True):
    out = "".join(
        f'<div class="r">{f"<b>{i:02d}</b>" if num else ""}<span>{t}</span></div>'
        for i, t in enumerate(items, 1))
    return f'<div class="rows{" serif" if serif else ""}">{out}</div>'


def cards(items, icon="tilde", strong=False):
    out = ""
    for i, t in enumerate(items, 1):
        mark = TILDE if icon == "tilde" else f"<b>{i:02d}</b>"
        out += f'<p class="c">{mark}<span>{t}</span></p>'
    return f'<div class="cards{" strong" if strong else ""}">{out}</div>'


def thoughts(items, stagger=True):
    return (f'<div class="thoughts{" stagger" if stagger else ""}">'
            + "".join(f"<p>{t}</p>" for t in items) + "</div>")


def cta(texto="Seguime para aprender a usar tu inglés en el trabajo."):
    return (f'<div class="cta mt3"><p>{texto}</p>'
            '<div class="brand">AT WORK · Breaking Barriers at Work</div></div>')


CARRUSELES = {
# ─────────────────────────────────────────────────────────────── 1
"c1-tu-confianza": dict(
  titulo="Tu confianza está puesta en el lugar equivocado",
  placas=[
    ("dark", '<p class="s2 soft">Tu problema no es que te falte confianza para hablar inglés.</p>'
             + CUT +
             '<p class="b2">Es que estás poniendo tu confianza en <em>el lugar equivocado.</em></p>', "logo"),
    ("light", rows(["Te sentís segura cuando preparaste todo.",
                    "Cuando sabés exactamente qué vas a decir.",
                    "Cuando practicás las frases hasta que te salen <em>fluidas.</em>"],
                   serif=True, num=False)),
    ("sand", '<p class="s1">Pero alguien te hace una pregunta que no esperabas.</p>'
             '<div class="mt2">' + rows(["Te interrumpe.",
                                          "Te pide que expliques algo de otra manera."]) + '</div>'
             '<p class="b2 mt3">Y toda esa seguridad <em>desaparece.</em></p>'),
    ("split", '<p class="b3" style="font-size:170px">¿Por qué?</p>',
              '<p class="b1" style="font-weight:500">Porque tu confianza dependía de que la conversación saliera '
              '<em>exactamente como la habías imaginado.</em></p>'),
    ("light", '<p class="b1">Pero en tu trabajo no podés controlar todas las preguntas.</p>'
              '<p class="s2 soft mt3">Ni todas las interrupciones.</p>'
              '<p class="s2 soft mt1">Ni cómo van a reaccionar los demás.</p>'),
    ("sand", '<p class="s2">Lo que sí podés entrenar es cómo responder <em>cuando algo cambia.</em></p>'
             '<div class="mt3">' + rows(["Cómo pedir tiempo.", "Cómo aclarar una idea.",
                                          "Cómo hacer una pregunta.",
                                          "Cómo retomar la conversación si te trabaste."]) + '</div>'),
    ("dark", MARK + '<p class="b1" style="font-weight:500">La confianza no es saber que todo va a salir como lo planeaste.</p>'
             '<p class="s1 mt3">Es saber que, si no sale como esperabas, <em>tenés recursos para resolverlo.</em></p>', "logo"),
    ("light", '<p class="b1">No necesitás memorizar conversaciones perfectas.</p>'
              '<p class="s2 mt2">Necesitás entrenar <em>conversaciones reales.</em></p>' + cta(), "none"),
  ],
  caption="""¿Te pasa que podés practicar una presentación en inglés perfectamente, pero cuando alguien te interrumpe sentís que perdés toda la seguridad?

Quizás estás construyendo tu confianza sobre algo que no podés controlar: que todo salga como lo preparaste.

En el trabajo real, las conversaciones cambian. Y tu inglés tiene que poder acompañarte en esos cambios.

Por eso no alcanza con ensayar lo que vas a decir. También necesitás entrenar cómo responder cuando las cosas no salen como esperabas.

La confianza no viene de tener todas las respuestas preparadas. También se construye aprendiendo a manejar lo inesperado.

🤎 Seguime para aprender a usar tu inglés en el trabajo.

#InglésProfesional #InglésParaElTrabajo #ATWORK"""),

# ─────────────────────────────────────────────────────────────── 2
"c2-no-tenes-que-resolver-todo": dict(
  titulo="No tenés que resolver todo en el momento",
  placas=[
    ("dark", '<p class="b2" style="font-size:104px">Que tu jefa te pida algo en inglés no significa que tengas que resolverlo todo '
             '<em>en ese instante.</em></p>', "logo"),
    ("light", '<p class="s2">Estás presentando una propuesta.</p>'
              '<p class="s1 soft mt2">Tu jefa te interrumpe y empieza a pedirte cambios.</p>'
              '<div class="mt3">' + rows(["Quiere que elimines algo.", "Que agregues otra cosa.",
                                           "Que lo escribas mientras te lo explica."]) + '</div>'),
    ("sand", '<p class="s2">Y vos intentás hacer todo al mismo tiempo.</p>'
             '<div class="mt3" style="display:grid;grid-template-columns:1fr 1fr;row-gap:24px">'
             '<p class="b1">Escuchar.</p><p class="b1">Entender.</p>'
             '<p class="b1">Escribir.</p><p class="b1">Responder.</p></div>'
             '<p class="s2 mt3">Y no equivocarte <em>en inglés.</em></p>'),
    ("dark", '<p class="b3">Hasta que te bloqueás.</p>'
             '<p class="k mt3">Y pensás:</p><div class="mt2">'
             + thoughts(["«Tendría que poder hacer esto».",
                         "«Una profesional con buen inglés no tendría este problema»."], stagger=False) + '</div>'),
    ("light", '<p class="s2 soft">Pero ser profesional no significa poder hacer absolutamente todo al mismo tiempo.</p>'
              '<div class="rule"></div>'
              '<p class="b1">También significa saber cómo manejar una situación para <em>resolverla mejor.</em></p>'),
    ("sand", '<p class="k">Por ejemplo, podés decir:</p><div class="mt2"></div>'
             '<div class="en"><div class="lbl">IN ENGLISH</div>'
             '<p class="q">“Let me take note of your feedback, and I’ll send you an updated version after the meeting.”</p></div>'
             '<p class="tr">Voy a tomar nota de tus comentarios y enviarte una versión actualizada después de la reunión.</p>'),
    ("light", '<p class="s1 soft">No estás evitando la tarea.</p>'
              '<p class="s1 soft mt1">No estás demostrando que tu inglés es insuficiente.</p>'
              '<p class="b1 mt3">Estás proponiendo una manera más eficiente de trabajar.</p>'
              '<p class="s2 mt2">Y eso también es comunicarte <em>con autoridad.</em></p>'),
    ("dark", '<p class="b1" style="font-weight:500">La profesional en su propia voz no necesita demostrar que puede con todo.</p>'
             '<p class="s1 soft mt2">Necesita saber cómo comunicar, negociar y resolver.</p>'
             '<p class="s2 it mt2"><em>Y eso también se entrena en inglés.</em></p>' + cta(), "none"),
  ],
  caption="""Una de las cosas que más trabajamos en AT WORK es aprender a manejar situaciones reales de trabajo en inglés.

No solamente qué decir.

También cómo responder cuando alguien te interrumpe, te pide cambios o necesita algo que no podés resolver en ese momento.

Porque comunicarte con autoridad no significa responder inmediatamente a todo.

A veces significa proponer una alternativa, pedir una aclaración o explicar cómo vas a resolver una tarea.

Y para eso necesitás inglés, sí.

Pero también necesitás dejar de pensar que cualquier dificultad es una prueba de que todavía no sos suficientemente buena.

Tu inglés tiene que ayudarte a hacer tu trabajo, no convertirse en otro obstáculo para hacerlo.

🤎 Guardá este carrusel para tu próxima reunión.

Seguime para aprender a usar tu inglés en el trabajo.

#BusinessEnglish #InglésProfesional #ATWORK"""),

# ─────────────────────────────────────────────────────────────── 3
"c3-nunca-avanzas": dict(
  titulo="¿Por qué sentís que nunca avanzás en inglés?",
  placas=[
    ("dark", '<p class="s2 soft">Llevás años mejorando tu inglés.</p>' + CUT +
             '<p class="b2">Pero seguís sintiendo que <em>nunca es suficiente.</em></p>', "logo"),
    ("light", cards(["Hoy entendés reuniones que antes te costaban muchísimo.",
                     "Usás expresiones que antes no conocías.",
                     "Te animás a participar más.",
                     "Podés explicar ideas que hace un año no sabías cómo comunicar."])),
    ("sand", rows(["Pero cometés un error con un tiempo verbal.", "Te olvidás de una palabra.",
                   "O te trabás cuando alguien te hace una pregunta."], serif=True, num=False)),
    ("dark", '<p class="b1">Y de repente, todo lo demás <em>desaparece.</em></p><div class="mt3">'
             + thoughts(["«Mi inglés sigue siendo horrible».", "«No avanzo».",
                         "«Todavía me falta muchísimo»."]) + '</div>'),
    ("split", '<p class="k">Pero quiero preguntarte algo.</p>'
              '<p class="s1 mt2">¿Por qué tus errores cuentan como evidencia de que no sos suficiente…</p>',
              '<p class="b1" style="font-size:96px">…y tus avances <em>no cuentan</em> como evidencia de que estás mejorando?</p>'),
    ("light", '<p class="s1 soft">No se trata de ignorar lo que necesitás corregir.</p>'
              '<p class="b1 mt2" style="font-size:80px">Se trata de aprender a mirar tu <em>progreso completo.</em></p>'
              '<div class="mt3">' + rows(["Lo que hoy podés hacer.", "Lo que todavía te cuesta.",
                                           "Y lo que vas a entrenar para seguir mejorando."]) + '</div>'),
    ("sand", '<p class="s1">Después de tu próxima reunión, hacé este ejercicio:</p><div class="mt2">'
             + cards(["¿Qué pude comunicar?", "¿Qué hice mejor que antes?",
                      "¿Qué situación necesito practicar para la próxima?"], icon="num", strong=True)
             + '</div><p class="s1 soft it mt2">No solamente: «¿En qué me equivoqué?».</p>'),
    ("light", '<p class="s1">Si solamente medís tu progreso por lo que todavía te falta…</p>'
              '<p class="b1 mt2">Siempre vas a sentir que estás <em>empezando de cero.</em></p>'
              '<p class="p soft mt2">Reconocer tus avances también es parte de construir confianza en tu inglés.</p>'
              + cta(), "none"),
  ],
  caption="""¿Y si estuvieras avanzando mucho más de lo que pensás?

Una de las cosas que veo constantemente en mis alumnas es lo difícil que les resulta reconocer sus propios avances.

Pueden entender mejor, expresarse con más claridad y participar más que hace unos meses.

Pero un error durante una reunión puede hacerles sentir que nada de eso cuenta.

Y no se trata de conformarse ni de dejar de corregir errores.

Se trata de evaluar el progreso con más perspectiva.

Porque mejorar tu inglés profesional también significa poder hacer cosas que antes no podías hacer.

No solamente cometer menos errores.

🤎 Guardá este carrusel y volvé a leerlo después de una reunión en la que sientas que no te fue bien.

Seguime para aprender a usar tu inglés en el trabajo.

#InglésProfesional #ConfianzaAlHablar #ATWORK"""),

# ─────────────────────────────────────────────────────────────── 4
"c4-lo-que-tu-jefa-piensa": dict(
  titulo="No sabés lo que tu jefa está pensando",
  placas=[
    ("dark", '<p class="s2 soft">Tu jefa te corrigió en una reunión en inglés.</p>' + CUT +
             '<p class="b2" style="font-size:104px">Y vos ya estabas pensando que <em>se arrepentía de haberte contratado.</em></p>', "logo"),
    ("light", rows(["Te interrumpió.", "Te pidió que cambiaras algo.", "No sonrió como siempre."], num=False)
              + '<p class="k mt3">Y tu cabeza empezó:</p><div class="mt2">'
              + thoughts(["«Seguro piensa que mi inglés es horrible»."], stagger=False) + '</div>'),
    ("sand", thoughts(["«No entiende por qué me contrataron».", "«Estoy quedando como una incompetente».",
                       "«Tengo que mejorar mi inglés urgentemente»."])),
    ("dark", '<p class="k">Pero quiero preguntarte algo.</p>'
             '<p class="s2 soft mt2">¿Tu jefa te dijo todo eso?</p><div class="rule"></div>'
             '<p class="b1" style="font-size:96px">¿O es <em>la historia que vos construiste</em> sobre lo que pasó?</p>'),
    ("light", '<p class="k">Porque una cosa es el hecho:</p>'
              '<p class="fact mt1">«Mi jefa me pidió cambios en la presentación».</p>'
              '<p class="k mt3">Y otra muy distinta es tu interpretación:</p>'
              '<p class="interp mt1">«Mi jefa piensa que no soy suficientemente buena».</p>'),
    ("sand", '<p class="s1 soft">Y mientras intentás adivinar qué piensa de vos…</p>'
             '<p class="s2 mt2">También estás tratando de escuchar, formular tus ideas y responder en inglés.</p>'
             '<p class="b1 mt3" style="font-size:80px">¿Te das cuenta de todo lo que estás intentando hacer <em>al mismo tiempo?</em></p>'),
    ("dark", '<p class="s1">La próxima vez, separá estas dos preguntas:</p><div class="mt3">'
             + cards(["¿Qué pasó realmente?", "¿Qué estoy suponiendo sobre lo que pasó?"], icon="num", strong=True)
             + '</div><p class="s2 it mt3"><em>Y volvé a concentrarte en la conversación.</em></p>', "logo"),
    ("light", '<p class="b1" style="font-size:78px">No conviertas cada corrección en una sentencia sobre tu capacidad profesional.</p>'
              '<p class="s1 mt2">Tu trabajo es comunicar, aprender y resolver. <em>No adivinar lo que los demás piensan.</em></p>'
              + cta(), "none"),
  ],
  caption="""A veces lo más difícil de una reunión en inglés no es encontrar las palabras.

Es todo lo que empezás a decirte mientras intentás hablar.

«Seguro no me entiende».

«Estoy haciendo el ridículo».

«Debe pensar que no tengo el nivel suficiente».

Y terminás más pendiente de cómo te están evaluando que de lo que necesitás comunicar.

La próxima vez que algo no salga como esperabas, probá separar los hechos de tus interpretaciones.

Que alguien te corrija o te pida cambios no significa automáticamente que esté cuestionando tu capacidad.

No necesitás saber lo que los demás están pensando para poder seguir haciendo tu trabajo.

🤎 Seguime para aprender a comunicarte con más claridad y seguridad en inglés.

#InglésProfesional #ComunicaciónProfesional #ATWORK"""),

# ─────────────────────────────────────────────────────────────── 5
"c5-quien-te-dijo-que-no-estas-lista": dict(
  titulo="¿Quién te dijo que todavía no estás lista?",
  placas=[
    ("dark", '<p class="s2">Tenés experiencia.</p><p class="s2">Tenés ideas.</p>'
             '<p class="s2">Tenés un trabajo internacional.</p>'
             '<p class="p soft mt3">Pero cuando hablás inglés…</p>' + CUT +
             '<p class="b3" style="font-size:132px">Seguís sintiéndote <em>una alumna.</em></p>', "logo"),
    ("light", rows(["Esperás a estar segura antes de hablar.", "Traducís mentalmente cada frase.",
                    "Usás las mismas expresiones de siempre."], num=False)
              + '<p class="b1 mt3" style="font-size:78px">Y a veces preferís callarte antes que <em>equivocarte.</em></p>'),
    ("sand", '<p class="b2">Como si cada reunión fuera <em>un examen.</em></p>'
             '<p class="s2 soft mt3">Y cada persona que te escucha fuera a ponerte una nota.</p>'),
    ("dark", '<p class="k">Pero quiero recordarte algo.</p>'
             '<p class="s1 soft mt2">No estás en esa reunión porque alguien necesita evaluar tu nivel de inglés.</p>'
             '<p class="b1 mt3">Estás ahí porque tenés un trabajo que hacer y <em>conocimientos que aportar.</em></p>'),
    ("split", '<p class="k">La eterna alumna piensa:</p>'
              '<p class="s2 it mt2">«Cuando tenga mejor inglés, voy a participar más».</p>',
              '<p class="k">La profesional en su propia voz piensa:</p>'
              '<p class="b1 it mt2" style="font-weight:500">«Voy a aprender a participar mejor <em>con el inglés que tengo hoy</em>».</p>'),
    ("light", '<p class="s1 soft">La eterna alumna intenta no cometer errores.</p>'
              '<p class="b1 mt2" style="font-size:80px">La profesional intenta <em>comunicar su mensaje.</em></p>'
              '<div class="mt3">' + cards(["Y si se equivoca, se corrige.", "Si no entiende, pregunta.",
                                            "Si necesita tiempo, lo pide."]) + '</div>'),
    ("sand", '<p class="s1">Eso no significa que la gramática no importe.</p>'
             '<p class="s1 mt1">Ni que no necesites seguir mejorando tu vocabulario o tu fluidez.</p>'
             '<div class="rule"></div>'
             '<p class="b1" style="font-size:80px">Significa que tu desarrollo profesional <em>no tiene que quedar en pausa</em> mientras mejorás tu inglés.</p>'),
    ("dark", MARK + '<p class="b1" style="font-size:92px">No necesitás esperar a hablar como una nativa para empezar a <em>ocupar tu lugar.</em></p>'
             '<p class="s1 soft mt3">Necesitás entrenar el inglés que te permita participar, defender tus ideas y hacer tu trabajo.</p>', "logo"),
    ("light", '<p class="s1">Dejá de prepararte solamente para demostrar cuánto inglés sabés.</p>'
              '<p class="b1 mt2">Empezá a entrenar para comunicar <em>todo lo que tenés para aportar.</em></p>'
              + cta(), "none"),
  ],
  caption="""Hay algo que me gustaría que todas las mujeres que trabajan en inglés entendieran.

No necesitás convertirte en una estudiante perfecta para poder desenvolverte como profesional.

Podés seguir mejorando tu gramática.

Podés seguir incorporando vocabulario.

Podés trabajar tu pronunciación, tu fluidez y tu comprensión.

Pero mientras hacés todo eso, también podés aprender a participar, presentar propuestas, defender ideas y resolver situaciones reales.

Porque el objetivo no es solamente saber más inglés.

Es poder hacer más con el inglés que ya tenés, mientras seguís mejorándolo.

Esa es la transformación que trabajamos en AT WORK.

De eterna alumna a profesional en su propia voz.

🤎 Seguime para aprender a usar tu inglés en el trabajo.

#InglésProfesional #MujeresProfesionales #ATWORK"""),
}


def placa(i, total, spec):
    num = f'<span class="n">{i:02d} / {total:02d}</span>'
    top = f'<div class="top"><span>At Work</span>{num}</div>'
    if spec[0] == "split":
        _, arriba, abajo, *rest = spec
        return (f'<section class="slide split" id="s{i}"><div class="upper">{top}{arriba}</div>'
                f'<div class="lower"><div class="body">{abajo}</div>'
                f'<div class="foot"><span></span><span class="arrow"></span></div></div></section>')
    fondo, cuerpo, *rest = spec
    pie = rest[0] if rest else "arrow"
    izq = LOGO if pie == "logo" else "<span></span>"
    der = '<span></span>' if i == total else '<span class="arrow"></span>'
    return (f'<section class="slide {fondo}" id="s{i}">{top}<div class="body">{cuerpo}</div>'
            f'<div class="foot">{izq}{der}</div></section>')


def html(titulo, placas):
    secs = "\n".join(placa(i, len(placas), p) for i, p in enumerate(placas, 1))
    return f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>AT WORK · {titulo}</title>
<link rel="stylesheet" href="../../../_marca/atwork-original.css">
</head><body>
{secs}
</body></html>
"""


if __name__ == "__main__":
    for carpeta, c in CARRUSELES.items():
        d = AQUI / carpeta
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(html(c["titulo"], c["placas"]), encoding="utf-8")
        (d / "caption.txt").write_text(c["caption"] + "\n", encoding="utf-8")
        print(carpeta, len(c["placas"]), "placas")
