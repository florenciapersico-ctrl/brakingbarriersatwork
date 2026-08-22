# Cómo se arma una campaña (y cuál conviene acá)

## Los tres niveles, en criollo

| Nivel | Qué se decide | Analogía |
|---|---|---|
| **Campaña** | El objetivo y, si querés, el presupuesto total | Adónde vamos |
| **Conjunto de anuncios** (ad set) | A quién, dónde, cuánto por día, cuándo | Con qué mapa y cuánta nafta |
| **Anuncio** (ad) | La imagen/video, el texto, el botón, el link | Qué le decimos |

Error clásico: probar diez cosas en el mismo lugar. Regla —
**el público se prueba en el ad set, el mensaje se prueba en el anuncio.** Nunca los dos a la vez.

## Objetivos: cuál elegir

| Objetivo de Meta | Sirve para | Acá |
|---|---|---|
| `OUTCOME_LEADS` | Conseguir datos de contacto | ✅ **El principal.** Descarga del S.O.S. o aplicación al programa |
| `OUTCOME_ENGAGEMENT` (Conversaciones) | Que escriban por DM/WhatsApp | ✅ Muy bueno en LatAm: la conversación cierra ventas altas |
| `OUTCOME_ENGAGEMENT` (Interacción) | Impulsar un post orgánico que funcionó | ✅ Para calentar público con poco presupuesto |
| `OUTCOME_TRAFFIC` | Clics a la web | ⚠️ Solo para calentar. Trae clics, no compradoras |
| `OUTCOME_AWARENESS` | Alcance / reconocimiento | ❌ No, con presupuesto chico es tirar plata |
| `OUTCOME_SALES` | Compra directa en la web | ⚠️ Solo si hay checkout y el píxel ya tiene datos |

**Regla del ticket alto:** un programa de 5 meses no se vende con un anuncio a puerta
fría. El anuncio consigue el contacto o la conversación; la venta la cierra el
seguimiento. Cualquier campaña que intente vender directo en frío va a dar un costo
por venta desastroso y no significa que la pauta "no funcione".

## Estructura recomendada de arranque

```
CAMPAÑA A · Leads en frío           (70% del presupuesto)
└── Ad set 1 · Intereses profesionales
│   ├── Anuncio 1 · Ángulo Visibility Gap
│   ├── Anuncio 2 · Ángulo cita de alumna
│   └── Anuncio 3 · Ángulo "no es tu inglés"
└── Ad set 2 · Advantage+ / público amplio          ← el que suele ganar hoy
    └── (los mismos 3 anuncios)

CAMPAÑA B · Retargeting             (30% del presupuesto)
└── Ad set 1 · Visitó la landing + vio +50% de un video + interactuó con IG/FB (últimos 30 días)
    ├── Anuncio 4 · Testimonio
    └── Anuncio 5 · Objeción ("es para vos si / no es para vos si")
```

La Campaña B recién tiene sentido cuando la A juntó unas 1.000 personas de tráfico.
Antes de eso, todo al frío.

## Públicos

**Público 1 — Intereses profesionales.** Combinar:
- Cargos/intereses: *Leadership, Management, Human resources, Business administration,
  Executive, LinkedIn, Harvard Business Review, MBA*
- Estudio de idioma: *English language, Learning English, Duolingo, IELTS, TOEFL*
- Género: mujeres · Edad: 30–50 · Países: los de `negocio.md`
- Idioma: español (importante: filtra a quien no habla español)

**Público 2 — Amplio / Advantage+.** Solo país, edad e idioma; que el algoritmo
busque. Con creativos específicos suele ganarle al público armado a mano. Probalo
siempre en paralelo, no en vez de.

**Público 3 — Similar (lookalike) 1%.** Cuando haya al menos 100–200 leads o alumnas
cargadas como público personalizado. Es el de mejor rendimiento a mediano plazo.

⚠️ Si Meta marca categoría especial de Empleo, se caen género y edad. Ver
`politicas-meta.md` § 2.

## ✅ Chequeo obligatorio antes de publicar una campaña nueva

Meta trae dos opciones activadas de fábrica que rompen exactamente lo que esta cuenta
necesita. Vienen tildadas y con la palabra "recomendado" al lado, así que se pasan por
alto con facilidad — le pasó a Flor el 21/08 en dos campañas seguidas.

**Preguntarle SIEMPRE estas dos antes de que le dé a publicar:**

1. **¿Ubicaciones en manuales, solo Instagram?** (no "Advantage+ / automáticas")
2. **¿Público Advantage+ apagado?**

Contexto que importa: de los 72 conjuntos históricos de la cuenta, **52 son solo
Instagram**. Es su forma habitual de trabajar. Los que fallan son los creados desde el
flujo completo del Administrador — se reconocen por el nombre por defecto *"Nuevo
conjunto de anuncios de…"*, frente a los *"Publicación de Instagram: …"* que salen de
promocionar un post y arrancan en Instagram solos.

Si un conjunto se llama "Nuevo conjunto de anuncios de…", asumir que trae los dos
defaults puestos y verificarlo.

**Cómo verificar de verdad** (la configuración se discute, la entrega no):

```
adset_targeting → publisher_platforms   ← si el campo no está, son automáticas
get_data con publisher_platform + platform_position + impressions
```

Lo segundo es la prueba real: dice dónde se mostró el anuncio, no dónde debía mostrarse.

## ⚠️ Público Advantage+ : decidilo al crear, porque después no se puede sacar

Cuando un conjunto de anuncios se crea con `targeting_automation: {advantage_audience: 1}`,
**los intereses, el público similar y los públicos personalizados dejan de ser filtros y
pasan a ser sugerencias.** Meta puede ignorarlos y buscar donde le resulte más barato.

Y no se puede desactivar después. Intentado el 22/08 sobre los conjuntos
`52545204552333` y `52545473038133`; Meta respondió:

> "No se pueden desactivar las opciones de Advantage. La segmentación detallada
> Advantage+, el público similar Advantage+ y el público personalizado Advantage+ no se
> pueden cambiar porque tu campaña usa el público Advantage+. Si necesitas establecer la
> segmentación detallada, los públicos similares o los públicos personalizados como
> controles, crea una nueva campaña."

Consecuencia: **para cambiar ubicaciones o segmentación en un conjunto Advantage+, hay
que crear uno nuevo.** No se arregla editando. Confirmado dos veces el 22/08: falla
tanto reenviando el spec completo como enviando solo los campos de ubicación.

**Salida sin API: duplicar el conjunto en el Administrador.** El duplicado se crea como
conjunto nuevo, así que admite apagar Advantage+ y pasar las ubicaciones a manuales, y
conserva intereses, públicos similares, países y presupuesto del original. Es el camino
a recomendar cuando no hay permisos de página para crear por API.

Es la explicación de por qué un conjunto con 22 intereses profesionales bien elegidos
terminó entregando en el feed de Facebook en Colombia y Perú a CPM de USD 0,79: los
intereses no estaban filtrando.

Cuándo sí conviene Advantage+: cuando hay volumen de conversiones y se quiere que Meta
explore. Cuándo no: presupuesto chico, mercados de costo muy distinto en el mismo
conjunto, o cuando el público correcto es estrecho y específico — que es este caso.

### Nota de API: `update_adset` reemplaza el targeting entero

Windsor manda el objeto `targeting` completo a Meta, que lo reemplaza — no lo fusiona.
Para tocar solo las ubicaciones hay que reenviar el spec entero leído con
`adset_targeting`. Y si el conjunto es Advantage+, Meta rechaza el reenvío de
`flexible_spec` y `custom_audiences`, así que directamente no se puede.

Otro detalle: `instagram_positions` con `explore_home` exige incluir también `explore`,
o Meta devuelve error 2490392.

## Separar los países caros de los baratos

Meta reparte el presupuesto de un conjunto de anuncios buscando el resultado más
barato. Si en el mismo conjunto conviven un mercado caro y uno barato, el caro no
recibe casi nada — no porque rinda peor, sino porque llegar ahí cuesta más.

En esta cuenta eso es crítico: **México es el mercado que más vende y el que tiene el
CPM más alto de la región.** Metido junto a Colombia y Perú, se queda sin pauta.

Regla: **un conjunto de anuncios por mercado prioritario**, con su propio presupuesto.
Nunca "toda LatAm" en un solo conjunto.

Estructura para esta cuenta:

```
Conjunto A · México                          ← presupuesto propio, el más alto
Conjunto B · Colombia + Chile + Costa Rica   ← mercados secundarios reales
Conjunto C · Argentina                       ← solo si hay precio en pesos o pago local
```

Cómo detectarlo cuando ya está pasando: pedí `get_data` con el campo `country` y mirá
el reparto de `spend`. Si tu mejor mercado está abajo en la lista, es esto.

## Presupuesto

Mínimos honestos:
- **Menos de USD 5/día**: no alcanza para aprender nada. Mejor no pautar.
- **USD 10–15/día**: piso realista para una campaña de leads. Da resultados leíbles
  en 7–10 días.
- **USD 20–30/día**: permite testear dos ad sets en paralelo de verdad.

Reglas:
- Presupuesto **diario**, no total, mientras estés testeando.
- No lo toques los primeros 3–4 días (fase de aprendizaje).
- Para escalar: **+20% cada 3 días**, nunca lo dupliques de golpe.
- Para bajar: apagá el anuncio malo, no bajes el presupuesto de todo.

Cuánto sale un lead: hacé la cuenta al revés desde el precio del programa.
`Precio × tasa de cierre esperada = lo máximo que podés pagar por lead.`
Con ticket alto suele cerrar bien pagando USD 3–8 por lead de lead magnet.

## Nombres (usalos siempre así)

```
Campaña:  BBatW | LEADS | Frio | 2026-08
Ad set:   Intereses-Liderazgo | MX-AR | M 30-50
Anuncio:  A1 | VisibilityGap | video-testimonio | v1
```

Sin convención de nombres, en tres semanas no se entiende el reporte. Es aburrido y
es lo que hace que las decisiones sean rápidas después.

## Cómo se testea de verdad

1. Empezá con **3 ángulos distintos**, no 3 títulos parecidos. Los ganchos que
   funcionan cambian el resultado 5x; una palabra cambia el resultado 5%.
2. Dejá correr hasta ~50 resultados por anuncio o 4 días, lo que llegue primero.
3. Apagá el peor. **No apagues más de uno por vez**: te quedás sin volumen.
4. El ángulo ganador se convierte en la base de los 3 siguientes.
5. Anotá qué ganó y por qué en `campanas/bitacora.md`.

## Formatos creativos, por lo que rinde acá

1. **Video vertical de Flor hablando a cámara, 15–40 s.** El primer segundo tiene que
   nombrar el problema. Es lo que mejor funciona para servicios de alto ticket:
   la gente compra a la persona.
2. **Post orgánico que ya voló, impulsado** (`boost_post`). Barato y con prueba social
   real ya cargada.
3. **Carrusel de testimonios textuales** con la estética de la landing (crema,
   terracota, marrón).
4. **Imagen simple con una frase fuerte** y mucho aire. Buena para retargeting.

Siempre en 9:16 (feed/reels/stories) y con subtítulos quemados: se ve sin sonido.
