# Bitácora de pauta

Toda decisión que gaste, apague o cambie algo va acá. Sin esto, en dos meses nadie se
acuerda por qué se apagó un anuncio que funcionaba.

| Fecha | Qué se hizo | Por qué | Resultado |
|---|---|---|---|
| 2026-08-21 | Se creó el agente de Meta Ads y el plan de Campaña 01 | Arrancar la pauta con estructura en vez de improvisar | — |
| 2026-08-22 | Se revisó el orgánico de `@ysi_speakenglish` (34 posts, 25/06–21/08) | Flor preguntó cómo va su anuncio y Meta Ads no está conectado | Sin datos de pauta. Hallazgo: la venta se cierra por DM, no por formulario → se corrigió el objetivo de la Campaña 01 a Click-to-Message |
| 2026-08-22 | Se escribió la Campaña 02 (Click-to-Message, 3 anuncios listos) | Es el embudo que Flor ya usa y no depende de píxel ni landing | Pendiente de lanzar: falta conectar Meta y definir presupuesto |
| 2026-08-22 | Diagnóstico del primer anuncio de Flor (creado el 21/8 en el Administrador) | Trajo cero comentarios y Flor lo leyó como fracaso | Causa: objetivo **Interacción con la publicación**. Meta compra la interacción más barata (like / 3s de video), nunca buscó mensajes. El objetivo no se puede editar → recomendación: apagarlo y relanzar con Interacción → Mensajes → Instagram Direct (Campaña 02) |
| 2026-08-22 | Se conectó Meta Ads (cuenta Flor Pérsico · 37106731 · USD) y se auditó la cuenta | Primera lectura de datos reales | 3 campañas activas, todas OUTCOME_ENGAGEMENT. USD 106 en 12 días. Hallazgos: el anuncio nuevo corre 12.984/13.004 impresiones en feed de Facebook (casi nada en Instagram); México recibe el 5% del gasto; Perú se lleva más que México. Retargeting = 59 visitas al perfil por USD 11; frío = 7 por USD 19 |
| 2026-08-22 | **CORRECCIÓN** de la entrada anterior sobre el objetivo | Flor preguntó si estaba seguro; se verificó la config real en vez de deducirla | Estaba MAL: los tres conjuntos son `CONVERSATIONS` + `INSTAGRAM_DIRECT`. La configuración de Flor era correcta. Resultados reales: 2 conversaciones por USD 31, ambas de retargeting, 0 en frío |
| 2026-08-22 | Diagnóstico corregido | Con la config ya verificada | Problemas reales: (1) anuncios con destino Instagram Direct corriendo 99% en feed de Facebook; (2) USD 19/día repartidos en 3 campañas → ningún conjunto sale de la fase de aprendizaje → entrega degradada a inventario barato. Plan: ubicaciones solo Instagram, una sola campaña, México en conjunto propio |
| 2026-08-22 | **CORRECCIÓN**: Perú sí genera alumnas (1) | Se había anotado como país sin alumnas y se recomendó sacarlo | Perú se queda. Con 60 días de datos: 314 conversaciones por USD 442 (USD 1,41 c/u), no las 2 que mostraba la ventana de 3 días. México lidera con USD 0,98 |
| 2026-08-22 | Se leyó `adset_targeting` de los tres conjuntos | Flor dijo que el anuncio de ayer era solo Instagram | El de RETARGETING sí (`publisher_platforms: [instagram]`). Los dos de ayer NO tienen el campo → ubicaciones automáticas, y además `advantage_audience: 1`. Confusión razonable: destino Instagram Direct ≠ ubicación Instagram, son dos campos distintos |
| 2026-08-22 | **CORRECCIÓN**: Paraguay tiene 2 alumnas | Se lo había marcado como el peor país por costo por conversación (USD 5,39) | Paraguay se queda: 2 conversaciones → 2 alumnas con USD 10,78. Es el que mejor convierte de la cuenta. Tercer recorte propuesto y desmentido (Colombia, Perú, Paraguay) → se prohíbe recortar países por costo por conversación |
| 2026-08-22 | Se intentó pasar los conjuntos `52545204552333` y `52545473038133` a ubicaciones solo Instagram (autorizado por Flor) | Anuncios con destino Instagram Direct entregando 99% en feed de Facebook | **NO se aplicó.** Meta lo rechazó: los conjuntos usan público Advantage+ y no admiten cambios de segmentación. Hallazgo mayor: los 22 intereses y el lookalike 1% de Flor no están filtrando, son solo sugerencias. Nada fue modificado. Camino correcto: crear campaña nueva con Advantage+ apagado |
| 2026-08-22 | Se creó la campaña `BBatW \| MENSAJES \| Frio \| IG-solo \| 2026-08` (id `52545627674933`), vacía y en pausa | Contenedor para la campaña bien configurada | Sin conjunto de anuncios: Meta bloquea la creación por falta de permisos de página en la conexión de Windsor |
| 2026-08-22 | **Pausada** la campaña `probando ads` (id `52545473037933`), autorizado por Flor | USD 10,42 gastados, 0 conversaciones, 99% de entrega en feed de Facebook con destino Instagram Direct, y Advantage+ ignorando la segmentación | Tenía USD 15/día de presupuesto, más que las otras dos juntas. Reversible con `enable_campaign` |
| 2026-08-22 | Estado de conexiones | — | Meta Ads (Windsor): lectura ✅, escritura de anuncios ❌ (falta permiso de página). Instagram: ✅ conectado vía Supermetrics (`IGI`, cuenta `17841463522872570` · Flor \| english coach). Windsor free = 1 sola cuenta, por eso `instagram_public` se cayó al conectar `facebook` |
| 2026-08-22 | **Pausada** `ad en frio` (id `52545204551933`), pedido por Flor | USD 8,50 en 2 días, 0 conversaciones. CTR 2,9% (el creativo funciona) pero 80% del gasto en feed de Facebook con destino Instagram Direct |
| 2026-08-22 | Intento de arreglar las ubicaciones del conjunto `52545204552333` enviando solo campos de ubicación | Ver si Meta aceptaba el cambio sin tocar el público | **Rechazado igual** (error 1359202). Confirmado por segunda vez: un conjunto Advantage+ no admite NINGÚN cambio de targeting, ni siquiera de ubicaciones. Nada fue modificado |
| 2026-08-22 | Camino recomendado a Flor: **duplicar** el conjunto en el Administrador | El duplicado nace nuevo → permite apagar Advantage+ y poner ubicaciones manuales, conservando intereses, lookalike, países y presupuesto | Es la única salida sin permisos de página. Pendiente de que lo haga ella |
| 2026-08-22 | Auditoría de los 72 conjuntos históricos de la cuenta | Flor recordaba haber puesto Instagram solo y preguntó si estaba seguro | **Ella tiene razón sobre su costumbre: 52 de 72 son solo Instagram.** Pero los dos del 21/08 están entre los 9 automáticos. Diferencia: los suyos habituales salen del flujo de promocionar post (nombre "Publicación de Instagram: …"); los dos fallados son del flujo completo del Administrador ("Nuevo conjunto de anuncios de…"), que trae Advantage+ y ubicaciones automáticas por defecto |
| 2026-08-22 | **Pausadas 33 campañas** viejas que figuraban activas, autorizado por Flor | La cuenta tenía 34 campañas en estado ACTIVE pero solo RETARGETING gastaba; el resto eran promociones terminadas sin apagar, y el desorden la abrumaba | Verificado: queda **una sola** campaña activa (RETARGETING). Ninguna gastaba, así que no hubo ahorro — fue orden. Reversible con `enable_campaign` |
| 2026-08-22 | **No** se borró ni archivó nada | Flor pidió borrar; la conexión no tiene esas acciones y borrar destruye el historial | Archivar lo hace ella desde el Administrador (filtrar Pausadas → seleccionar todas → ⋯ → Archivar). Advertido explícitamente: Archivar sí, Eliminar no |
| 2026-08-22 | **PUBLICADO**: impulso del reel del 21/08 ("Saber más inglés no siempre significa…") | Reemplazo correcto de las dos campañas mal configuradas del 21/08 | Campaña `52545642140533` / conjunto `52545642144933`. ACTIVA, USD 10/día, hasta el 29/08. Verificado: `advantage_audience: 0`, `publisher_platforms: ["instagram"]`, edad 25-60 (no ampliada), mujeres, 8 países, 22 intereses activos, CONVERSATIONS → INSTAGRAM_DIRECT, categoría especial NONE. Lo publicó Flor desde Business Suite guiada paso a paso |
| 2026-08-22 | Pendiente | — | Falta impulsar el carrusel del 21/08 con la misma configuración. Y verificar el 23/08 el reparto real por país y plataforma del anuncio nuevo |
| 2026-08-22 | **PUBLICADO** el segundo: impulso del carrusel "Sabes inglés. Pero…" | Reemplazo de la segunda campaña mal configurada del 21/08 | Campaña `52545649578333` / conjunto `52545649593733`. ACTIVA, USD 7/día, **sin fecha de fin** (circulación continua). Verificado: `advantage_audience: 0`, `publisher_platforms: ["instagram"]`, 25-60, mujeres, 8 países, 22 intereses, CONVERSATIONS → INSTAGRAM_DIRECT, categoría NONE. Lo configuró Flor sola |
| 2026-08-22 | Estado de cierre del día | — | Corriendo: carrusel USD 7 + reel USD 10 (en revisión) + retargeting ~USD 5 = **USD 22/día**. Todo lo demás pausado |
| 2026-08-22 | Hallazgo operativo | Impulsar desde la app de iPhone | **Apple cobra 30% de comisión** sobre la pauta comprada dentro de la app en iOS. Siempre impulsar desde el navegador. Y: **los carruseles con música no se pueden promocionar**, sin importar el tema — hay que publicarlos sin audio |
| 2026-08-23 | Auditoría del anuncio estrella "¿Tienes un nivel intermedio…" (ad `6920458249129`) | Flor preguntó por qué dejó de funcionar | **No cambió nada en su configuración** entre el 4/03 y el 20/08, y entregó 99,9% en Instagram siempre. Lo que pasó: eficiencia cayó 6,5 → 5,6 → 4,6 conversaciones por mil (fatiga de creativo, 44.000 personas alcanzadas) y el presupuesto bajó de USD 150 a USD 37. El **20/08 alguien le cambió la segmentación a España / 18-65 / ambos sexos** — no fue a propósito. Si se revive, hay que volver a promocionar el posteo, no editarlo |
| 2026-08-23 | Análisis por edad de los dos anuncios nuevos | Flor recibía contactos fuera de su público | 100% de las impresiones fueron a mujeres (el nene de 10 años NO vino de la pauta). Pero el 49% del gasto iba a 25-34 y las 4 conversaciones salieron de los extremos (25-34 y 55-64); del núcleo 35-54, cero. Se achicó el reel a **30-50** (autorizado). El carrusel no se pudo: Meta solo permite editar publicaciones promocionadas desde la app de Instagram |
| 2026-08-23 | **PAUSADO** RETARGETING (`52518235741533`) | Su público se secó: USD 1 por conversación en julio → USD 4-11 en agosto, porque el frío estuvo apagado desde junio | Se reevalúa el 7/09, cuando las dos campañas de frío hayan rellenado el público de 180 días |
| 2026-08-23 | **CONGELAMIENTO hasta el 7/09/2026** | Flor señaló —con razón— que se le cambiaba algo todos los días y ningún anuncio salía de la fase de aprendizaje | Corriendo y sin tocar: reel `52545642140533` (USD 10/día, 30-50) + carrusel `52545649578333` (USD 7/día) = **USD 17/día**. Las dos rutinas se reescribieron para reportar sin proponer cambios hasta esa fecha |
| 2026-08-25 | **PAUSADO** el reel (`52545642140533`), pedido por Flor | Figuraba ACTIVE pero dejó de entregar: gastó el 22 (USD 6,08) y el 23 (USD 7,22) y **cero** el 24 y el 25. Único cambio previo: se le achicó la edad de 25-60 a 30-50 el 23/08 a las 13:13 — el público quedó demasiado chico para entregar |
| 2026-08-25 | Estado final | — | Corre **una sola campaña**: carrusel "Sabes inglés. Pero…" (`52545649578333`), USD 7/día. Ayer 3 conversaciones. Congelamiento hasta el 7/09 |

---

## 29 ago 2026 — Cuenta a cero. El hallazgo de los intereses.

**Se apagaron las cuatro campañas activas.** Autorizado explícitamente por Flor.
Gasto diario: USD 10 → **USD 0**.

| Campaña | ID |
|---|---|
| Carrusel "Sabes inglés. Pero…" (conversión, $7/día) | `52545649578333` |
| "¿Alguna vez saliste de…" (siembra, $1/día) | `52546959522133` |
| "Te repiten lo que…" (siembra, $1/día) | `52546960154933` |
| "Si tu problema es que…" (siembra, $1/día) | `52546960933933` |

Verificado con `campaign_effective_status = PAUSED` en las cuatro.

### Por qué se apagaron

Flor reportó dos cosas: el anuncio de $7 no le traía consultas reales, y los
seguidores nuevos venían desalineados. Al revisar los 8 meses completos:

| Mes | Gasto | Conversaciones | Costo |
|---|---|---|---|
| Enero | $263 | 142 | $1,85 |
| Febrero | $202 | 145 | $1,39 |
| **Marzo** | $304 | **448** | **$0,68** |
| Abril | $384 | 247 | $1,55 |
| **Mayo** | $327 | **474** | **$0,69** |
| Junio | $33 | 38 | $0,86 |
| Julio | $293 | 276 | $1,06 |
| **Agosto** | $197 | **47** | **$4,20** |

Y el CPM se derrumbó: de $2,70-4,70 todo el año a **$1,20** desde el 14 de
agosto. CPM barato con cero conversiones = Meta comprando el inventario más
barato que tiene, porque sin eventos suficientes el optimizador no tiene señal.

### 🔑 El hallazgo: los intereses cambiaron

Comparando la segmentación de las campañas ganadoras de marzo contra la de
agosto, **las cuatro campañas de agosto comparten la misma lista de 22
intereses**, idénticos ID por ID.

**Lo que marzo tenía y agosto NO:**

| Interés | A quién selecciona |
|---|---|
| Administración de la cadena de suministro | Puesto corporativo |
| Administración de ventas | Puesto corporativo |
| Sistema de administración de RRHH | Puesto corporativo |
| Software de administración de proyectos | Gestiona proyectos |
| **IELTS** | Inglés avanzado |
| **TOEFL** | Inglés avanzado |
| Language school | Estudia en serio |
| Escuelas de negocios de EEUU | Perfil ejecutivo |

**Lo que agosto tiene y marzo NO:**

| Interés | Problema |
|---|---|
| **Duolingo** | Aprendices desde cero — lo opuesto a la alumna |
| **Enseñanza de idiomas** | Es *enseñar* idiomas → trae profesoras, no alumnas |
| **Vida Saludable** | Masivo, no filtra |
| **Medical education** | Sin relación |
| **Ciencia y Tecnología** | Masivo, no filtra |
| **Educación vocacional** | Formación no profesional |

**Por qué pesa tanto:** los 22 intereses están en un solo bloque de
`flexible_spec`, así que Meta los trata con OR. Basta cumplir **uno** para
entrar al público. El interés más amplio de la lista define la calidad de todo
el público — y ahí hay tres masivos y uno de principiantes.

**Matiz honesto:** marzo también tenía intereses amplios (Motivación,
Confianza en sí mismo, Desarrollo personal) y rendía a $0,68. Así que lo
amplio por sí solo no explica el derrumbe. Lo que falta son las señales
fuertes que identificaban a una profesional con inglés avanzado: hoy no hay
ni IELTS, ni TOEFL, ni una sola herramienta de trabajo corporativo.

### Lista de intereses para el relanzamiento

La de marzo, la que rindió $0,68:

> Administración de la cadena de suministro · Escuela de negocios ·
> Coaching (educación) · Administración de ventas · Sistema de administración
> de RRHH · Software de administración de proyectos · Business English ·
> **IELTS** · **TOEFL** · English as a second or foreign language · Maestría
> en administración de empresas · Educación de posgrado · Language school ·
> Inglés (idiomas) · Lengua extranjera · Confianza en sí mismo · Desarrollo
> personal · Administración de empresas · Escuelas de negocios de EEUU

**Sin Duolingo. Sin Enseñanza de idiomas. Sin Vida Saludable. Sin Medical
education. Sin Ciencia y Tecnología. Sin Educación vocacional.**

⚠️ **Crear un público nuevo, no reutilizar el existente.** La segmentación de
una publicación impulsada no se puede editar después (error 1991005): se
define al momento de impulsar y queda fija.

### Errores míos en esta sesión, para no repetirlos

1. **Firmé la segmentación sin leerla.** Revisé ubicaciones, Advantage+,
   objetivo, edad y países — y di el conjunto por bueno. Nunca abrí los 22
   nombres de intereses. Ahí estaba todo el problema.
   **Regla: leer los nombres de los intereses, no contarlos.**

2. **Afirmé que el público guardado "Profesionales" contenía esos intereses.**
   No tengo acceso a los públicos guardados ni a sus nombres. Uní el dato del
   `targeting` del conjunto con lo que Flor me contó y lo presenté como hecho.
   **Regla: el API muestra el targeting efectivo del conjunto, no de qué
   público guardado salió. No inventar el puente.**

3. **Recomendé la capa de siembra a $1/día por anuncio.** Con este presupuesto
   no aprenden nada, no se pueden medir, y al ser "visitas al perfil" con el
   público contaminado, traían justamente los seguidores desalineados que Flor
   venía sufriendo.

### Queda pendiente

- Confirmar con Flor si el público que eligió al impulsar muestra estos
  intereses (opción A) o muestra otra cosa (opción B — el impulso no aplicó su
  elección, que sería un problema distinto y más grave).
- Grabar el reel de reemplazo (guion en `campanas/guion-en-espanol-lideras.md`).
- Escribir los cinco casos de diagnóstico
  (molde en `referencias/casos-de-diagnostico.md`).
- Relanzar con **un solo anuncio**, público nuevo y todo el presupuesto junto.
