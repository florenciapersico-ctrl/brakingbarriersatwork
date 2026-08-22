# Leer los números sin marearse

## Regla previa: ¿hay suficiente para decidir?

Antes de mirar nada:
- **Menos de 1.000 impresiones por anuncio** → no hay datos. No decidas.
- **Menos de 4 días corriendo** → seguís en fase de aprendizaje. No toques.
- **Menos de ~50 resultados en el ad set** → Meta todavía no optimizó. Paciencia o
  más presupuesto.

El error más caro no es elegir mal el público: es apagar un anuncio bueno al segundo día.

## Las 5 métricas que importan (y las que no)

| Métrica | Qué te dice | Rango sano (servicios, LatAm) |
|---|---|---|
| **CPM** | Cuánto sale llegar a 1.000 personas | USD 3–12. Muy alto = público chico o creativo aburrido |
| **CTR (link)** | Si el mensaje engancha | 1%+ está bien · menos de 0,6% = creativo flojo |
| **CPC (link)** | Costo por clic al sitio | USD 0,20–1,20 |
| **CPL** | Costo por lead | USD 2–8 para lead magnet · USD 20–60 para aplicación |
| **Tasa de conversión de la landing** | Si la página cumple lo que prometió el anuncio | 15–35% para lead magnet |

Ignorá: alcance, "interacciones", "me gusta de la página", frecuencia (salvo que pase
de 3 en retargeting). No pagan nada.

## Los comentarios NO son la métrica de un anuncio

Esto merece su propia sección porque es la confusión más cara de esta cuenta.

Orgánicamente, los posts de Flor cierran con "comentá GUÍA y te lo envío" y funcionan:
el post del 1/7 sacó 15 comentarios. Pero eso pasa con **seguidoras**, gente que ya
eligió seguirla y que ya está adentro del tema.

En pauta le estás hablando a desconocidas. Y una desconocida no comenta, por dos razones:

1. **Comentar es público.** El problema que vende Flor es vergonzante: escribir "GUÍA"
   debajo de un anuncio sobre no poder hablar inglés en el trabajo es admitir en
   público, con nombre y foto, que a una le pasa eso. Con las seguidoras hay confianza
   construida. Con una desconocida, no.
2. **No hay vínculo.** Comentar es un gesto de comunidad. El primer contacto no lo es.

Una desconocida interesada hace otras cosas: mira el video entero, guarda, entra al
perfil, y —si el anuncio se lo hace fácil— manda un DM. El DM es privado: ahí sí.

**Consecuencia práctica:** un anuncio con cero comentarios puede estar funcionando
perfecto. Si el objetivo es Mensajes, la métrica es **conversaciones iniciadas**, y se
lee en el Administrador de anuncios, no abajo del post.

Métricas a ignorar en un anuncio: comentarios, likes, "me gusta de la página".

## Antes de diagnosticar nada: mirá qué objetivo se eligió

Un anuncio hace lo que le pediste, no lo que esperabas. La mitad de los "no funcionó"
son en realidad "le pedí otra cosa".

**Interacción → con la publicación** le pide a Meta la interacción más barata que
exista: un like, un reacción, tres segundos de video. Meta sale a buscar gente propensa
a eso, que no es la misma gente propensa a escribirte. Con ese objetivo, cero mensajes
y cero comentarios es el resultado esperable, no una falla.

Para que alguien escriba hay que pedirlo explícitamente:
**Interacción → Mensajes → Instagram Direct.**

⚠️ **El objetivo no se puede editar después de crear la campaña.** Si está mal elegido,
no hay ajuste posible: se apaga y se relanza. Es la única excepción legítima a la regla
de "no toques nada los primeros 3–4 días" — esa regla es para problemas de rendimiento,
no para una campaña que estructuralmente nunca va a traer lo que se busca.

## Árbol de diagnóstico

**Pocas impresiones / casi no gasta**
→ Público chico, presupuesto insuficiente, anuncio en revisión o problema de pago.
Ver `politicas-meta.md` § "La campaña está activa pero no gasta".

**Muchas impresiones, CTR bajo (<0,6%)**
→ El problema es el **creativo**. La gente ve y no le interesa.
Cambiá el ángulo (no el titular). Probá video de Flor a cámara si aún no lo hiciste.

**CTR bien, pero casi no hay leads**
→ El problema es la **landing**, no la pauta. Chequeá: ¿carga rápido en celular?
¿el formulario está arriba? ¿dice lo mismo que el anuncio? ¿pide demasiados datos?

**Leads baratos pero nadie compra**
→ Público equivocado o filtro flojo. Agregá el ángulo 6 (anti-avatar) y subí el
requisito del lead magnet. Un lead más caro y mejor calificado sale más barato.

**Andaba bien y se cayó de golpe**
→ 90% de las veces: alguien editó algo y se reinició el aprendizaje. Mirá el historial
de cambios. El otro 10%: fatiga creativa (frecuencia arriba de 3) → creativo nuevo.

**Todo caro de repente, sin cambios**
→ Estacionalidad o competencia (fin de año, Black Friday, elecciones suben el CPM
para todos). Aguantá o bajá presupuesto, no rearmes la campaña.

## Frecuencia con la que hay que mirar esto

- **Diario**: solo que gaste y que no haya nada rechazado. 2 minutos.
- **Cada 3–4 días**: decisión de apagar/escalar un anuncio.
- **Semanal**: reporte completo y decisión de presupuesto.
- **Mensual**: qué ángulo ganó, qué probamos el mes que viene.

Mirar la cuenta diez veces por día no mejora nada y sí desgasta. Está prohibido.

## Cómo pedir los datos

Con Windsor: `mcp__Windsor_ai__get_data` sobre el conector `facebook`.
Con Supermetrics: `data_query(ds_id="FA", ...)` — pedí primero `field_discovery`.

Presentale a Flor **una tabla corta** (anuncio · gasto · resultados · costo por
resultado) y **una recomendación**. No le pegues el volcado crudo del reporte.
