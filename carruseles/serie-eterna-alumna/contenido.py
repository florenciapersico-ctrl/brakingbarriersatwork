"""Serie «De eterna alumna a profesional en su propia voz» — cinco carruseles AT WORK.

Cada carrusel es una lista de placas: (fondo, cuerpo[, pie]).
fondo: "dark", "light", "sand", "foto-oscura:<nombre>", "foto-clara:<nombre>"
       o "split" con (\"split\", arriba, abajo).
pie:   "flecha" (por defecto), "logo" o "nada".

`python3 contenido.py` regenera el index.html de cada carpeta (el caption.txt
de cada una se edita a mano). Después `../_marca/exportar.sh <carpeta>` saca
los PNG, el PDF y la vista general.
"""
from pathlib import Path

AQUI = Path(__file__).parent
IMG = "../../_marca/img"
LOGO = f'<img class="logo" src="{IMG}/logo.webp" alt="Breaking Barriers at Work">'
LOGO_OSCURO = f'<img class="logo" src="{IMG}/logo-oscuro.png" alt="Breaking Barriers at Work">'
HR = '<div class="hr"></div>'


def h(t, size=""):
    return f'<p class="h {size}">{t}</p>'


def acc(t, cls=""):
    return f'<p class="acc {cls}">{t}</p>'


def t(txt, cls=""):
    return f'<p class="t {cls}">{txt}</p>'


def k(txt, cls=""):
    return f'<p class="k {cls}">{txt}</p>'


def lista(items, cls=""):
    filas = "".join(f'<div class="r"><b>{i:02d}</b><span>{x}</span></div>' for i, x in enumerate(items, 1))
    return f'<div class="list {cls}">{filas}</div>'


def lineas(items):
    return '<div class="lines">' + "".join(f"<p>{x}</p>" for x in items) + "</div>"


def marcas(items, tipo="x"):
    icono = "<i></i>" if tipo == "x" else f'<img src="{IMG}/tilde.webp" alt="">'
    return '<div class="marks">' + "".join(f'<div class="r">{icono}<span>{x}</span></div>' for x in items) + "</div>"


def pensamientos(items, escalonado=True):
    return (f'<div class="thoughts{" stagger" if escalonado else ""}">'
            + "".join(f"<p>{x}</p>" for x in items) + "</div>")


def tarjetas(items):
    return '<div class="cards">' + "".join(
        f'<p class="c"><b>{i:02d}</b><span>{x}</span></p>' for i, x in enumerate(items, 1)) + "</div>"


def cierre(texto="Seguime para aprender a usar tu inglés en el trabajo."):
    return (f'<div class="btn mt3">{texto}</div>'
            '<div class="sign"><b>AT WORK</b><span>Breaking Barriers at Work</span></div>')


def ancho(html_, px=700):
    return f'<div style="max-width:{px}px">{html_}</div>'


CARRUSELES = {
# ─────────────────────────────────────────────────────────────── 1
"c1-tu-confianza": ("Tu confianza está puesta en el lugar equivocado", [
    ("light", h("Tu problema no es que te falte confianza para hablar inglés.") + HR
             + acc("Es que estás poniendo tu confianza en el lugar equivocado."), "logo"),
    ("light", h("Te sentís segura cuando preparaste todo.") + HR
              + lista(["Cuando sabés exactamente qué vas a decir.",
                       "Cuando practicás las frases hasta que te salen fluidas."], "big")),
    ("light", t("Pero alguien te hace una pregunta que no esperabas.") + '<div class="mt2"></div>'
              + lineas(["Te interrumpe.", "Te pide que expliques algo de otra manera."])
              + acc("Y toda esa seguridad desaparece.", "mt2")),
    ("light", '<p class="x">¿Por qué?</p>' + HR
              + h("Porque tu confianza dependía de que la conversación saliera exactamente como la habías imaginado.", "m")),
    ("light", h("Pero en tu trabajo <em>no podés controlar</em>") + '<div class="mt3"></div>'
             + marcas(["todas las preguntas.", "todas las interrupciones.",
                       "ni cómo van a reaccionar los demás."])),
    ("light", h("Lo que sí podés entrenar es cómo responder cuando algo cambia.", "m") + HR
              + lista(["Cómo pedir tiempo.", "Cómo aclarar una idea.", "Cómo hacer una pregunta.",
                       "Cómo retomar la conversación si te trabaste."])),
    ("light", h("La confianza no es saber que todo va a salir como lo planeaste.") + HR
             + acc("Es saber que, si no sale como esperabas, tenés recursos para resolverlo."), "logo"),
    ("light", h("No necesitás memorizar conversaciones perfectas.", "m") + HR
              + acc("Necesitás entrenar conversaciones reales.", "b") + cierre(), "nada"),
]),

# ─────────────────────────────────────────────────────────────── 2
"c2-no-tenes-que-resolver-todo": ("No tenés que resolver todo en el momento", [
    ("dark", h("Que tu jefa te pida algo en inglés") + HR
             + acc("no significa que tengas que resolverlo todo en ese instante."), "logo"),
    ("light", h("Estás presentando una propuesta.", "m")
              + t("Tu jefa te interrumpe y empieza a pedirte cambios.", "soft mt1") + HR
              + lista(["Quiere que elimines algo.", "Que agregues otra cosa.",
                       "Que lo escribas mientras te lo explica."])),
    ("sand", h("Y vos intentás hacer todo al mismo tiempo.", "m") + HR
             + '<div style="display:grid;grid-template-columns:1fr 1fr;row-gap:22px">'
             + "".join(h(x) for x in ["Escuchar.", "Entender.", "Escribir.", "Responder."]) + "</div>"
             + acc("Y no equivocarte en inglés.", "mt3")),
    ("foto-oscura:sala", h("Hasta que te bloqueás.") + k("Y pensás:", "mt2") + '<div class="mt1"></div>'
              + pensamientos(["«Tendría que poder hacer esto».",
                              "«Una profesional con buen inglés no tendría este problema»."], False)),
    ("light", h("Pero ser profesional no significa poder hacer absolutamente todo al mismo tiempo.", "m") + HR
              + acc("También significa saber cómo manejar una situación para resolverla mejor.")),
    ("sand", k("Por ejemplo, podés decir:") + '<div class="mt2"></div>'
             + '<div class="en"><p class="q">“Let me take note of your feedback, and I’ll send you an updated version after the meeting.”</p></div>'
             + '<p class="tr">Voy a tomar nota de tus comentarios y enviarte una versión actualizada después de la reunión.</p>'),
    ("dark", marcas(["No estás evitando la tarea.",
                     "No estás demostrando que tu inglés es insuficiente."]) + HR
             + h("Estás proponiendo una manera más eficiente de trabajar.", "m")
             + acc("Y eso también es comunicarte con autoridad.", "m mt2")),
    ("foto-clara:cortina", ancho(h("La profesional en su propia voz no necesita demostrar que puede con todo.", "s")
              + t("Necesita saber cómo comunicar, negociar y resolver.", "mt1") + HR
              + acc("Y eso también se entrena en inglés.", "b m") + cierre(), 700), "nada"),
]),

# ─────────────────────────────────────────────────────────────── 3
"c3-nunca-avanzas": ("¿Por qué sentís que nunca avanzás en inglés?", [
    ("dark", h("Llevás años mejorando tu inglés.") + HR
             + acc("Pero seguís sintiendo que nunca es suficiente."), "logo"),
    ("light", marcas(["Hoy entendés reuniones que antes te costaban muchísimo.",
                      "Usás expresiones que antes no conocías.",
                      "Te animás a participar más.",
                      "Podés explicar ideas que hace un año no sabías cómo comunicar."], "tilde")),
    ("sand", lineas(["Pero cometés un error con un tiempo verbal.", "Te olvidás de una palabra.",
                     "O te trabás cuando alguien te hace una pregunta."])),
    ("foto-oscura:anteojos", h("Y de repente, todo lo demás <em>desaparece.</em>", "m") + '<div class="mt2"></div>'
              + pensamientos(["«Mi inglés sigue siendo horrible».", "«No avanzo».",
                              "«Todavía me falta muchísimo»."])),
    ("split", k("Pero quiero preguntarte algo.")
              + t("¿Por qué tus errores cuentan como evidencia de que no sos suficiente…", "mt1"),
              h("…y tus avances <em>no cuentan</em> como evidencia de que estás mejorando?")),
    ("light", t("No se trata de ignorar lo que necesitás corregir.", "soft")
              + h("Se trata de aprender a mirar tu <em>progreso completo.</em>", "m mt1") + HR
              + lista(["Lo que hoy podés hacer.", "Lo que todavía te cuesta.",
                       "Y lo que vas a entrenar para seguir mejorando."])),
    ("sand", t("Después de tu próxima reunión, hacé este ejercicio:") + '<div class="mt2"></div>'
             + tarjetas(["¿Qué pude comunicar?", "¿Qué hice mejor que antes?",
                         "¿Qué situación necesito practicar para la próxima?"])
             + acc("No solamente: «¿En qué me equivoqué?».", "m mt2")),
    ("foto-clara:claro", ancho(t("Si solamente medís tu progreso por lo que todavía te falta…")
              + acc("Siempre vas a sentir que estás empezando de cero.", "b mt1") + HR
              + t("Reconocer tus avances también es parte de construir confianza en tu inglés.", "soft s")
              + cierre(), 700), "nada"),
]),

# ─────────────────────────────────────────────────────────────── 4
"c4-lo-que-tu-jefa-piensa": ("No sabés lo que tu jefa está pensando", [
    ("dark", h("Tu jefa te corrigió en una reunión en inglés.") + HR
             + acc("Y vos ya estabas pensando que se arrepentía de haberte contratado."), "logo"),
    ("light", lineas(["Te interrumpió.", "Te pidió que cambiaras algo.", "No sonrió como siempre."])
              + k("Y tu cabeza empezó:", "mt3") + '<div class="mt1"></div>'
              + pensamientos(["«Seguro piensa que mi inglés es horrible»."], False)),
    ("foto-oscura:sala", pensamientos(["«No entiende por qué me contrataron».",
                                       "«Estoy quedando como una incompetente».",
                                       "«Tengo que mejorar mi inglés urgentemente»."])),
    ("dark", k("Pero quiero preguntarte algo.") + h("¿Tu jefa te dijo todo eso?", "m mt1") + HR
             + acc("¿O es la historia que vos construiste sobre lo que pasó?")),
    ("light", k("Porque una cosa es el hecho:") + '<p class="fact mt1">«Mi jefa me pidió cambios en la presentación».</p>'
              + k("Y otra muy distinta es tu interpretación:", "mt3")
              + '<p class="interp mt1">«Mi jefa piensa que no soy suficientemente buena».</p>'),
    ("sand", t("Y mientras intentás adivinar qué piensa de vos…", "soft")
             + h("También estás tratando de escuchar, formular tus ideas y responder en inglés.", "m mt1") + HR
             + acc("¿Te das cuenta de todo lo que estás intentando hacer al mismo tiempo?")),
    ("dark", t("La próxima vez, separá estas dos preguntas:") + '<div class="mt2"></div>'
             + tarjetas(["¿Qué pasó realmente?", "¿Qué estoy suponiendo sobre lo que pasó?"])
             + acc("Y volvé a concentrarte en la conversación.", "m mt2"), "logo"),
    ("foto-clara:cortina", ancho(h("No conviertas cada corrección en una sentencia sobre tu capacidad profesional.", "s")
              + HR + t("Tu trabajo es comunicar, aprender y resolver.")
              + acc("No adivinar lo que los demás piensan.", "b m mt1") + cierre(), 700), "nada"),
]),

# ─────────────────────────────────────────────────────────────── 5
"c5-quien-te-dijo-que-no-estas-lista": ("¿Quién te dijo que todavía no estás lista?", [
    ("dark", h("Tenés experiencia.<br>Tenés ideas.<br>Tenés un trabajo internacional.", "m")
             + t("Pero cuando hablás inglés…", "soft mt2") + HR
             + acc("Seguís sintiéndote una alumna.", "b"), "logo"),
    ("light", lineas(["Esperás a estar segura antes de hablar.", "Traducís mentalmente cada frase.",
                      "Usás las mismas expresiones de siempre."])
              + acc("Y a veces preferís callarte antes que equivocarte.", "mt3")),
    ("foto-oscura:escritorio", h("Como si cada reunión fuera <em>un examen.</em>")
              + t("Y cada persona que te escucha fuera a ponerte una nota.", "soft mt2")),
    ("dark", k("Pero quiero recordarte algo.")
             + t("No estás en esa reunión porque alguien necesita evaluar tu nivel de inglés.", "soft mt1") + HR
             + h("Estás ahí porque tenés un trabajo que hacer y <em>conocimientos que aportar.</em>", "m")),
    ("split", k("La eterna alumna piensa:")
              + t("«Cuando tenga mejor inglés, voy a participar más».", "mt1"),
              k("La profesional en su propia voz piensa:")
              + acc("«Voy a aprender a participar mejor con el inglés que tengo hoy».", "mt1")),
    ("light", t("La eterna alumna intenta no cometer errores.", "soft")
              + h("La profesional intenta <em>comunicar su mensaje.</em>", "m mt1") + HR
              + marcas(["Y si se equivoca, se corrige.", "Si no entiende, pregunta.",
                        "Si necesita tiempo, lo pide."], "tilde")),
    ("sand", t("Eso no significa que la gramática no importe.")
             + t("Ni que no necesites seguir mejorando tu vocabulario o tu fluidez.", "mt1") + HR
             + acc("Significa que tu desarrollo profesional no tiene que quedar en pausa mientras mejorás tu inglés.")),
    ("dark", h("No necesitás esperar a hablar como una nativa para empezar a <em>ocupar tu lugar.</em>") + HR
             + t("Necesitás entrenar el inglés que te permita participar, defender tus ideas y hacer tu trabajo.", "soft"),
     "logo"),
    ("foto-clara:claro", ancho(t("Dejá de prepararte solamente para demostrar cuánto inglés sabés.") + HR
              + acc("Empezá a entrenar para comunicar todo lo que tenés para aportar.", "b") + cierre(), 700), "nada"),
]),
}


def placa(i, total, spec):
    top = f'<div class="top"><span>At Work</span><span class="n">{i:02d} / {total:02d}</span></div>'
    if spec[0] == "split":
        _, arriba, abajo = spec
        return (f'<section class="slide split" id="s{i}"><div class="upper">{top}{arriba}</div>'
                f'<div class="lower"><div class="body">{abajo}</div>'
                f'<div class="foot"><span></span><span class="arrow"></span></div></div></section>')
    fondo, cuerpo, *resto = spec
    pie = resto[0] if resto else "flecha"
    clase, estilo, body = fondo, "", "body"
    if fondo.startswith("foto-"):
        tipo, nombre = fondo.split(":")
        clase = "photo " + ("photo-dark" if tipo == "foto-oscura" else "photo-light")
        estilo = f' style="background-image:url({IMG}/foto-{nombre}.jpg)"'
        if tipo == "foto-oscura":
            body = "body up"
    claro = fondo in ("light", "sand") or fondo.startswith("foto-clara")
    izq = (LOGO_OSCURO if claro else LOGO) if pie == "logo" else "<span></span>"
    der = "<span></span>" if (i == total or pie == "nada") else '<span class="arrow"></span>'
    return (f'<section class="slide {clase}" id="s{i}"{estilo}>{top}<div class="{body}">{cuerpo}</div>'
            f'<div class="foot">{izq}{der}</div></section>')


def html(titulo, placas):
    secs = "\n".join(placa(i, len(placas), p) for i, p in enumerate(placas, 1))
    return f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>AT WORK · {titulo}</title>
<link rel="stylesheet" href="../../_marca/atwork.css">
</head><body>
{secs}
</body></html>
"""


if __name__ == "__main__":
    for carpeta, (titulo, placas) in CARRUSELES.items():
        d = AQUI / carpeta
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(html(titulo, placas), encoding="utf-8")
        print(carpeta, len(placas), "placas")
