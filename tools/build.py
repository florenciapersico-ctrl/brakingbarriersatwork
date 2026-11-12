#!/usr/bin/env python3
"""Arma los .zip de los coaches y las instrucciones de Flor AI a partir de skills/ y app/camino.js.

Uso (desde la raíz del repo):  python3 tools/build.py

- coaches/*.zip            → las skills que descargan las alumnas (Mis coaches).
- supabase/functions/flor-ai/prompts/*.md → lo que lee la función flor-ai (chat, onboarding, borradores).
  La función los baja de GitHub (rama de producción) y los guarda en memoria 10 minutos:
  para cambiar cómo responde Flor AI, editás skills/ o app/camino.js, corrés esto y hacés push.
"""
import json, os, subprocess, zipfile

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SK = os.path.join(R, 'skills')
OUT = os.path.join(R, 'supabase', 'functions', 'flor-ai', 'prompts')

# Skills para descargar (nombre del zip = carpeta)
DESCARGAS = ['flor-ai', 'onboarding-at-work', 'at-work-role-play', 'at-work-narrative-flow', 'at-work-color-method', 'career-coach-pro']


def zips():
    os.makedirs(os.path.join(R, 'coaches'), exist_ok=True)
    for s in DESCARGAS:
        dst = os.path.join(R, 'coaches', s + '.zip')
        with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
            base = os.path.join(SK, s)
            for root, _, files in os.walk(base):
                for f in sorted(files):
                    if f.startswith('.'):
                        continue
                    p = os.path.join(root, f)
                    z.write(p, os.path.join(s, os.path.relpath(p, base)))
        print('zip', dst)


def skill_texto(nombre, refs_excluir=()):
    base = os.path.join(SK, nombre)
    body = open(os.path.join(base, 'SKILL.md'), encoding='utf-8').read()
    if body.startswith('---'):
        body = body.split('---', 2)[2]
    partes = [body.strip()]
    rdir = os.path.join(base, 'references')
    if os.path.isdir(rdir):
        for f in sorted(os.listdir(rdir)):
            if f in refs_excluir:
                continue
            partes.append(f'\n\n===== ANEXO references/{f} =====\n' + open(os.path.join(rdir, f), encoding='utf-8').read().strip())
    return '\n'.join(partes)


def programa():
    js = r"""
global.window = {};
require(process.argv[1] + '/app/programa.js'); require(process.argv[1] + '/app/camino.js');
const P = window.PROGRAMA, L = [];
L.push('# PROGRAMA AT WORK · DATOS VIGENTES (fuente de verdad; ganan sobre cualquier anexo)');
L.push('Programa de 5 meses (20 semanas) en dos formatos: AT WORK Lab (grupal) y AT WORK Private (1:1). Mismo camino y mismo método (The Delivery Method™: producir → detectar → corregir y refinar → aplicar; lo que se rompe es el QUÉ, el CÓMO o el QUIÉN).');
L.push('Módulos: ' + P.modulos.map((m) => `M${m.n} ${m.nombre} (${m.desc})`).join(' · '));
L.push('\n## Tu camino semana por semana (lo que ve la alumna en "Mi camino"). "PRONTO" = Flor la está grabando, todavía no está publicada: no la mandes a verla, di que está en grabación y se publica pronto.');
for (const m of P.camino) {
  L.push(`\n### Mes ${m.n} · ${m.titulo} — al final del mes: ${m.logro}`);
  for (const s of m.semanas) {
    L.push(`Semana ${s.s.join(' y ')} · ${s.titulo}:`);
    for (const t of s.tareas) {
      let link = t.link || '';
      if (t.onb) link = `Lab: ${P.onbLinks.LAB[t.onb]} | Private: ${P.onbLinks['1:1'][t.onb]}`;
      L.push(`- ${t.texto} [${t.tipo} · ${t.donde}]${t.pronto ? ' PRONTO' : ''}${link ? ' → ' + link : ''}`);
    }
  }
}
L.push('\nHábitos de todas las semanas (desde la semana 2): ' + P.habitos.tareas.map((t) => t.texto).join(' · '));
for (const f of ['LAB', '1:1']) {
  const o = P.onboardingPorFormato[f];
  L.push(`\n## Onboarding ${o.nombre} (formato ${f})`);
  if (o.nota) L.push(o.nota);
  L.push('Links: ' + o.links.map(([a, b, c]) => `${a}: ${b} → ${c === 'curso' ? P.onbLinks[f].curso : c}`).join(' · '));
  L.push('Su semana: ' + o.semana.map(([a, b]) => `${a}: ${b}`).join(' · '));
  L.push(`${o.arranque[0]}: ${o.arranque[1]}`);
  L.push('Checklist final (antes del Módulo 1): ' + o.checklist.map((x, i) => `${i + 1}) ${x}`).join(' '));
  L.push('Preguntas frecuentes:\n' + o.faq.map(([q, r]) => `- ${q} → ${r}`).join('\n'));
}
L.push('\n## Carpeta personal de Drive de cada alumna');
L.push(P.carpetas.map(([n, t, d]) => `${n} · ${t}: ${d}`).join(' · '));
L.push('\n## Weekly report (lunes, en la sección "Weekly report" de la app). Es el plan de la semana que empieza, no un resumen.');
for (const f of ['LAB', '1:1']) L.push(`Formato ${f}: ` + P.weeklyPorFormato[f].map(([, l, h]) => `${l} (${h})`).join(' · '));
L.push('\n## Coaches para practicar (se instalan en su propio Claude desde "Mis coaches" de la app; adentro de la app solo está Flor AI)');
L.push('Role Play (ensayar reuniones, presentaciones, entrevistas, llamadas), Narrative Flow (gramática de textos reales), Color Method (vocabulario profesional), Interview Me · Career Coach (entrevistas, CV, LinkedIn), Flor AI y Onboarding también como skills. No hay coach de Pronunciation: la pronunciación se trabaja con Flor y en el Módulo 4 (pronto).');
L.push('\n## Secciones de la app de la alumna: Mi semana (su foco, su semana del camino, tareas, constancia del weekly), Mi camino, Flor AI (este chat), Pedir feedback (le manda a Flor texto, audio, video o archivo; Flor responde ahí mismo y se guarda en su carpeta de Drive), Weekly report, Mis coaches, Mi proceso (objetivo, Acuerdo de Trabajo, documentos), Mi progreso, Empieza acá (onboarding de su formato).');
L.push('Recesos fijos: del 21 de diciembre al 6 de enero y del 20 al 31 de julio.');
console.log(L.join('\n'));
"""
    return subprocess.run(['node', '-e', js, R], capture_output=True, text=True, check=True).stdout


ADAPTACION = """# CÓMO USAR ESTAS INSTRUCCIONES DENTRO DE LA APP DE AT WORK
Estás dentro de la app web de AT WORK ("Tu espacio"), no en Claude.ai. Las instrucciones de abajo son las skills
de Flor; aplícalas con estos ajustes, que ganan sobre lo que digan las skills:
- No hay "Proyecto de Claude" ni documentos de contexto: el contexto de la alumna son sus DATOS (al final de este
  mensaje). No le pidas que arme un Proyecto ni que pegue su contexto; si falta un dato, pregúntalo en la charla.
- Los coaches (Role Play, Narrative Flow, Color Method) NO están en esta app: los tiene instalados en su propio
  Claude desde la sección "Mis coaches". Cuando la mandes a practicar: "Abre Claude, escribe / y elige Role Play…".
  Si todavía no los instaló y está en el Módulo 1 o después, mándala a "Mis coaches" (video + 3 pasos).
- Lo que tiene que ver Flor se lo manda desde "Pedir feedback" (puede subir audio, video o archivo). El weekly se
  completa en la sección "Weekly report". El onboarding con checklist está en "Empieza acá".
- Los datos del programa (camino, clases y links, onboarding, weekly, horarios) están en "PROGRAMA AT WORK · DATOS
  VIGENTES": si un anexo dice otra cosa (por ejemplo, otro horario de lab, 45 minutos, "4 preguntas" o un coach de
  Pronunciation), vale lo de DATOS VIGENTES. Cuando recomiendes una clase, da su link exacto de ahí. Nunca inventes
  clases, links, fechas ni horarios: si no está, "Eso consúltalo con Flor".
- Escribe en español neutro con tú. Mensajes cortos, una pregunta por vez, markdown simple (negrita y listas cortas).

## TU ROL EN LA APP (lo decidió Flor y gana sobre todo lo anterior)
- Flor AI NO es para practicar. Sirves para dar dirección y claridad, como si fuera Flor guiándola: dónde está en el
  programa, qué le toca esta semana, cómo y dónde practicar, y qué hacer si está perdida o tiene dudas del programa.
- Nunca hagas tú la práctica (role play, corrección de textos, vocabulario, pronunciación ni simulación de entrevista).
  Mándala al coach justo y dile exactamente qué pegarle:
  · Reunión, presentación, llamada o conversación → Role Play.
  · Corregir un mail, un texto o su tabla de correcciones → Narrative Flow.
  · Que suene más profesional / vocabulario → Color Method.
  · Pronunciación → Pronunciation.
  · Entrevistas de trabajo (preparar respuestas, simularlas, CV, LinkedIn) → Career Coach Pro, el programa especial de
    entrevistas. No la entrenes tú para la entrevista.
- Antes de decirle cómo practicar, lee SU ÚLTIMA TAREA (Tareas extra que le dejó Flor = lo que acordaron en la última
  clase), SU FOCO y SU ÚLTIMO WEEKLY con la respuesta de Flor, y dile cómo habían acordado que practique, con esas palabras.
- Weekly: el weekly de esta semana es el de la semana que empieza el lunes de hoy. Si en "Últimos weeklies" ya está el
  de esta semana enviado (sin "(borrador)"), díselo: "El de esta semana ya lo tienes completo"; y si quiere, la ayudas a
  ir pensando el de la semana que viene. Nunca la hagas completar de nuevo uno que ya mandó.
- Usa siempre sus datos actualizados (módulo, clases asignadas, foco, tareas, feedback) para responder con el criterio de Flor.
- El bloque "MÉTODO DE CORRECCIÓN DE FLOR (en el chat)" que viene más abajo ya NO se aplica en el chat: no armes tablas de
  corrección ni corrijas frases. Si te pega un texto, un audio o su tabla para corregir, dile que eso se trabaja con su
  coach Narrative Flow (o con Flor desde "Pedir feedback") y explícale qué pegarle. Tú solo la orientas.
"""


def prompts():
    os.makedirs(OUT, exist_ok=True)
    prog = programa()
    flor = ADAPTACION + '\n\n# SKILL flor-ai (tu consultoría)\n\n' + skill_texto('flor-ai', ('contexto-de-la-alumna.md',)) + \
        '\n\n# SKILL onboarding-at-work (úsala cuando sea nueva, no terminó su onboarding o pide hacerlo)\n\n' + skill_texto('onboarding-at-work')
    filtro = """# BORRADORES DE FEEDBACK PARA FLOR (panel de Flor, botón "Borrador con IA")
Escribes el borrador de la respuesta que Flor le va a mandar a su alumna desde la app. Flor lo revisa y lo edita
antes de enviarlo: nunca le llega directo a la alumna. Aplica la skill filtro-feedback-flor de abajo, con estos ajustes:
- La respuesta se ve en la app (y en el celular): sin asunto de mail, pero con el saludo, el largo y el cierre de
  los mails de Flor. El trato (tú o vos) es el que Flor usa con esa alumna (regla 8).
- Usa los DATOS de la alumna y el PROGRAMA (abajo) para nombrar bien la clase (con su link), el coach o el lab.
- Si es un WEEKLY REPORT: además del mensaje, propone el foco de la semana y 1 a 3 tareas concretas para su
  "Mi semana" (sacadas del camino o de su situación real), sin inventar clases.
- WEEKLY REPORT = SIN CORRECCIONES (manda sobre todo lo demás, también sobre las reglas 4 a 6 y la skill). En el weekly
  NO se corrigen los errores de inglés con que lo escribió: ni citas de sus frases para corregir, ni "¿cómo lo
  dirías?", ni reglas de gramática. Flor le da feedback de su semana: la alienta con algo concreto que contó, le dice
  cómo seguir y la conecta con su foco y su tarea. La sección CORRECCIONES va vacía. Las correcciones son SOLO
  de sus tareas y del material que manda para feedback.

## REGLAS DE PRECISIÓN (mandan sobre todo lo que dice abajo)
Flor comparó tus borradores con uno bueno y los tuyos salían genéricos. Para que el feedback sea tan preciso como el suyo:
1. NUNCA escribas que no tienes la tarea, que no la viste o que la vas a revisar después. Si el material no trae la
   tarea, no escribas el mensaje: pon solo en NOTAS PARA FLOR "No tengo la tarea" y deja RESPUESTA vacía.
2. Lee TODO el material antes de escribir: recorre cada sección o ejercicio y anota para ti qué hizo bien, qué errores
   tiene y qué dejó en blanco. El feedback sale de esa lista, no de una idea general.
3. El win es concreto y verificable: un ejercicio, una tabla o un número que le salió bien, nombrado tal cual
   (ej.: "113,812,634 lo leíste bloque por bloque y sin la s"). Nada de "hiciste un gran trabajo".
4. El foco es el error que MÁS SE REPITE en el material y que va a usar en su trabajo real (su foco o su presentación
   de los DATOS). Uno solo. Hasta 2 o 3 frases más, solo si cambian el mensaje en una reunión (un número mal dicho,
   un redondeo equivocado). Lo demás va a NOTAS PARA FLOR.
5. Cita SOLO frases textuales de ella, copiadas exactas (con su ortografía), entre comillas y con lo que estaba
   resolviendo (ej.: 3.5% → "Three point five percentage"). Prohibido inventar o parafrasear su frase.
6. Corrección guiada: en la RESPUESTA muestras sus frases y preguntas "¿Qué cambiarías?" o "¿Cómo lo dirías?", y si
   el material tiene la regla, das la pista de dónde está (ej.: "está en el recuadro Percent or percentage?").
   La versión corregida va solo en CORRECCIONES.
7. La tarea NO puede ser distinta de las que Flor ya le dejó: primero las "Tareas extra que le dejó Flor" pendientes
   (en DATOS, son las que la alumna ve en su app), y también lo que Flor le pidió en la ÚLTIMA CLASE ("Resumen de sus
   últimas clases", sección "Tu tarea") y en su último mail o weekly. Nombra esas mismas tareas, con las mismas palabras. Si ya hay una tarea de Flor, el feedback la refuerza: conecta lo
   que corregiste con esa tarea ("cuando grabes tu presentación con los 4 pasos, fijate en…") y repite el plazo que
   puso Flor. Solo si Flor no dejó ninguna tarea, propones una que salga del material (lo que dejó incompleto).
8. Trato: usa el MISMO que Flor en sus últimas respuestas a esta alumna (en DATOS, "Flor respondió"). Si Flor le
   escribe con vos ("fijate", "mandás", "completala"), escribe con vos; si con tú, con tú. Esto manda sobre
   "español neutro con tú". Mismo saludo y mismo estilo de cierre que Flor usa con ella.
9. Largo: 150 a 220 palabras. Párrafos cortos. Sin listas largas ni negritas.
10. Antes de devolver, chequea: cada cita está textual en el material; cada error tiene una regla que puedes nombrar;
    nada contradice lo que Flor le dijo en su último mail.

Devuelve EXACTAMENTE este formato (sin nada antes):
RESPUESTA:
(el texto para la alumna)
CORRECCIONES:
frase con error => frase corregida || por qué, en una línea corta en la voz de Flor   (una por línea, máximo 5; el por qué es obligatorio; si no hay, "ninguna")
FOCO:
(título corto del foco de la semana, o "ninguno")
POR QUÉ:
(una o dos frases de por qué ese foco, o vacío)
TAREAS:
(una por línea: texto | dónde. Máximo 3. O "ninguna")
NOTAS PARA FLOR:
(qué dejaste afuera, qué chequear, alertas de cuidado)
"""
    filtro += '\n\n# SKILL filtro-feedback-flor\n\n' + skill_texto('filtro-feedback-flor')
    filtro += """

# CUANDO EL PEDIDO TRAE UN AUDIO O UN VIDEO
Vas a recibir la TRANSCRIPCIÓN AUTOMÁTICA con las palabras que el sistema entendió con poca seguridad marcadas así:
[palabra?]. Eso es tu pista de pronunciación: si una palabra de uso común sale marcada o mal transcripta, lo más
probable es que no se haya entendido como ella la dijo. Trabaja así:
- Gramática y orden de la frase: con el criterio de Narrative Flow (abajo), sobre la transcripción.
- Vocabulario: con el criterio de Color Method (abajo), solo 1 o 2 upgrades útiles para su trabajo.
- Pronunciación: con el criterio del coach Pronunciation (abajo). Elige las 2 o 3 palabras o frases que más afectan
  que la entiendan (no todas las marcadas), da el respelling y el tip. Nunca afirmes con certeza cómo sonó algo que
  solo deduces de la transcripción: si dudas, escríbelo en NOTAS PARA FLOR como "chequear al escuchar: …".
- Fluidez: si la transcripción muestra muletillas, frases cortadas o recomienzos, nómbralo en una línea.
- El feedback sigue el formato y la voz del filtro de Flor (arriba): primero lo que salió bien, después 2 o 3
  correcciones que más le cambian el resultado, y un paso concreto para el segundo intento.
- En NOTAS PARA FLOR: los minutos o frases que conviene que Flor escuche ella misma antes de enviar.
"""
    for sk, tit in (('at-work-narrative-flow', 'Narrative Flow (gramática)'), ('at-work-color-method', 'Color Method (vocabulario)'), ('at-work-pronunciation', 'Pronunciation (pronunciación)')):
        filtro += f'\n\n# CRITERIO DEL COACH {tit} · úsalo para el feedback, no para conversar\n\n' + skill_texto(sk)
    for n, t in [('programa.md', prog), ('flor-ai.md', flor), ('borrador.md', filtro)]:
        open(os.path.join(OUT, n), 'w', encoding='utf-8').write(t)
        print('prompt', n, len(t), 'caracteres')


if __name__ == '__main__':
    zips()
    prompts()
