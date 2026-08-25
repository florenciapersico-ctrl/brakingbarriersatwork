---
name: contenido
description: Escribe el contenido de Instagram de Breaking Barriers at Work / AT WORK con el sistema real de Flor. Usalo cuando se hable de armar el mes, escribir un posteo, carrusel o reel, revisar si un copy pasa el control de calidad, procesar transcripts de clase, o preguntar qué se publica hoy. Se activa con "el mes de contenido", "qué publico", "escribime el posteo de", "pasalo por el filtro", "Content OS", "transcripts".
---

# Content OS — Breaking Barriers at Work

> ⚠️ **Reescrito el 25/08/2026, segunda vez.** Las dos versiones anteriores estaban
> mal: inventaban contenido desde un banco de ideas estático en vez de leer las
> fuentes reales de Flor. Ese contenido ya estaba publicado y habría hecho repetir.
> **Nada se escribe sin leer primero `config/content_sources.yaml`.**

## La regla que rompió todo antes

El contenido de Flor **no sale de un banco de ideas**. Sale de:

```
ROADMAP CANONICAL DE AT WORK   (qué problemas puede resolver legítimamente)
        ∩
TRANSCRIPTS DE CLASES REALES   (cómo aparece ese problema en la vida real)
        ↓
DIAGNÓSTICO DE FLOR
        ↓
CRITERIO NADIA + EJECUCIÓN FINMARK
        ↓
PIEZA
```

El roadmap **no** se usa para inventar dolores.
Los transcripts **no** se usan para redefinir el programa.

## Antes de escribir una sola línea

1. Leer `config/content_sources.yaml` — ahí está cada fuente con su id y prioridad.
2. Leer `contenido/memoria-editorial.json` — lo ya publicado y lo ya planificado.
3. Verificar el MONTHLY BRIEF del mes: objetivo comercial, cupos, fechas.
   Sin brief no se arma el mes.

## Las tres capas

| Capa | Aporta | Pregunta |
|---|---|---|
| **Nadia** | Profundidad del diagnóstico, recorrido psicológico, posicionamiento | ¿Flor entiende el problema mejor de lo que su alumna lo entiende? |
| **Finmark** | Objetivo (GROWTH / CONNECTION / SALES), hook, rehook, valor, AHA, CTA | ¿Esta pieza está construida para cumplir su objetivo? |
| **AT WORK** | Verdad del producto, metodología real, territorios | ¿Esto es cierto sobre el programa? |

Ninguna sustituye a las otras. "Estilo Nadia" **no** es copiar su voz ni sus hooks:
es **calidad del diagnóstico**.

## Arquitectura psicológica de una pieza

```
SÍNTOMA / ESCENA → PENSAMIENTO PRIVADO → LO QUE ELLA CREE QUE SIGNIFICA
→ GIRO → DIAGNÓSTICO DE FLOR → MECANISMO → AHA
→ QUÉ NECESITA ENTRENAR DIFERENTE → OFERTA (si corresponde) → CTA
```

Nunca saltar de "te pasa X" a "compra AT WORK". Primero demostrar comprensión.

**Regla del diagnóstico:** si el diagnóstico de Flor es igual a lo que la alumna
ya cree, la pieza se rechaza. Hay identificación pero no expertise.

## El ritmo real (agosto 2026)

`LUN Concientización · MIÉ Diferenciación · VIE Concientización · SÁB Concientización · DOM Transformación`

Objetivo de agosto: **lista de espera para cupos de octubre (3) y noviembre (5).
CERO venta directa.** CTA único: *"Los cupos de AT WORK abren en octubre.
Escríbeme AT WORK y te aviso cuando sea el momento."*

⚠️ Los rótulos de día del calendario están corridos respecto a 2026 (dice "LUN 25 AGO"
y el 25 es martes). **Mandan las fechas.** Pendiente que Flor decida si se corrige.

## Los 10 ejes temáticos (síntomas, no módulos)

Small Talk · Questions Under Pressure · Executive Communication · Listening ·
Pronunciation / Connected Speech · Meetings / Disagreeing · Executive Introduction ·
Visibility Gap · Perfectionism · Leadership

## Formato de salida

**Carrusel:** 8 láminas + CAPTION + HISTORIA 1 + HISTORIA 2 (+24 h).
Una idea por lámina. Si necesita letra diminuta: `TOO_MUCH_TEXT`.

**Reel:** hook (0-3 s) + rehook (4-7 s) + guion hablado + texto en pantalla +
CAPTION + HISTORIA 1 + HISTORIA 2. Tiene que sonar hablado, no un artículo.

## Voz

Español latinoamericano: **tú, tienes, puedes, quieres, necesitas.**
Nunca vos, tenés, podés, querés — aunque los documentos de Nadia los usen.
Las citas textuales de alumnas van tal cual las dijeron.

Suena: inteligente, profesional, cálida, directa, humana, sofisticada.
Flor le habla a otra profesional. No a una principiante.

**Nunca:** "no puedes hablar inglés", "no entiendes nada", "necesitas empezar de cero".
La tensión real es: *"Puedo trabajar en inglés, pero mi inglés todavía no responde
con la rapidez, organización y autonomía que necesito para mostrar mi nivel profesional."*

## Privacidad de transcripts

Cadena obligatoria:
`RAW → PRIVATE_RESEARCH_EXTRACTION → ANONYMIZED_INSIGHT → CONTENT_EVIDENCE`

Nunca publicar nombre, empresa, cargo, proyecto, colegas, errores atribuibles,
screenshot, voz ni situación reconocible sin permiso explícito.
**Los transcripts crudos no se guardan en este repositorio.**

## Motor de repetición

Antes de aprobar una idea, compararla contra `contenido/memoria-editorial.json` en:
tema · territorio · síntoma · diagnóstico · mecanismo · escena · hook · formato ·
CTA · emoción · ángulo de venta.

Se puede volver a un territorio si cambia la manifestación, el diagnóstico, el nivel
de conciencia o la función estratégica. No alcanza con cambiar el hook.

## Lo que no se hace nunca

Inventar resultados, testimonios, situaciones, dolores, cupos, fechas o experiencias
de Flor · tratar a la alumna como principiante · convertir transcripts en contenido
literal · publicar información identificable · explicar todo con mentalidad ·
usar el roadmap como folleto · construir hooks agresivos "porque eso es Nadia".

## Canva

Plantillas reales de Flor (ninguna acepta autollenado, verificado 25/08/2026):

| Tipo | Plantilla | ID |
|---|---|---|
| Concientización lunes | CONCIENTIZACION 1 · lunes | `EAHLS8B0Mzw` |
| Concientización viernes | concientizacion 3 · viernes | `EAHMA4-YHW8` |
| Diferenciación | martes DIFERENCIACION | `EAHKB4Xyhuc` |
| Transformación | jueves TRANSFORMACION Y DESEO | `EAHKB4SjwII` |

Se abren con `https://www.canva.com/design?create=true&template=<ID>`.
**No usar `generate-design`**: trunca titulares e inventa copy.

## La app

Vive en dos lados, con el mismo contenido:

- **Instalable (la que usa Flor):** `contenido/index.html` servido por GitHub Pages en
  `https://florenciapersico-ctrl.github.io/brakingbarriersatwork/contenido/`.
  Es una PWA real: ícono propio, pantalla completa, funciona sin internet.
  Todo el contenido va dentro del HTML; no depende de archivos externos.
  Al publicar contenido nuevo hay que subir `CACHE` en `contenido/sw.js`.
- **Vista rápida:** `https://claude.ai/code/artifact/65185f6a-03fe-49a8-a9ed-4af91391d6f1`

Es el dashboard "qué publico hoy". **No genera texto** — es una página, no un bot.
Muestra caption, láminas, historias y la plantilla de Canva de cada pieza.
Al agregar contenido se **suma** al array `POSTS`, nunca se reemplaza.

## Estado del build

Hecho: registro de fuentes · memoria editorial · calendario real cargado (25 ago → 7 sep).
Pendiente: leer 01/02/territorios/QA/brief/estilo-Nadia/protocolo-VOC ·
pipeline de transcripts → insights anonimizados · generación de septiembre desde el 8.
