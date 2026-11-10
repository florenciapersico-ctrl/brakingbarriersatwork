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
L.push('\n## Tu camino semana por semana (lo que ve la alumna en "Mi camino"). "PRONTO" = todavía no está publicada: no la mandes a verla, di que se publica pronto.');
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
  los mails de Flor. Español neutro con tú.
- Usa los DATOS de la alumna y el PROGRAMA (abajo) para nombrar bien la clase (con su link), el coach o el lab.
- Si es un WEEKLY REPORT: además del mensaje, propone el foco de la semana y 1 a 3 tareas concretas para su
  "Mi semana" (sacadas del camino o de su situación real), sin inventar clases.
Devuelve EXACTAMENTE este formato (sin nada antes):
RESPUESTA:
(el texto para la alumna)
CORRECCIONES:
frase con error => frase corregida   (una por línea, máximo 5; si no hay, "ninguna")
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
    for n, t in [('programa.md', prog), ('flor-ai.md', flor), ('borrador.md', filtro)]:
        open(os.path.join(OUT, n), 'w', encoding='utf-8').write(t)
        print('prompt', n, len(t), 'caracteres')


if __name__ == '__main__':
    zips()
    prompts()
