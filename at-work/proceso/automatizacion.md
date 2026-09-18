# El sistema automático · qué hace, qué necesita, qué no puede

Esto es el plano. Lo escribo en criollo primero, y abajo el detalle técnico para
quien lo arme.

---

## En una frase

Alguien paga en Stripe. Sin que vos toques nada: queda anotada en tu Notion con el
monto y las fechas, se le crea su carpeta en Drive con las subcarpetas, le llega el
mail de bienvenida con el contrato, y a vos te llega un aviso de que le des el acceso.
De ahí en adelante, un reloj mira todos los días las fechas de cada alumna y manda lo
que corresponda: el recordatorio del contrato, los tres pedidos de feedback, el aviso
de que entra en la última etapa, el pedido de testimonio. Todos los lunes a la mañana
le llega sola la invitación a completar su weekly report. Y cada noche lee tu Google
Calendar y anota cuántas sesiones tuvo cada una.

---

## Las cuatro piezas

| Pieza | Para qué | Estado |
|---|---|---|
| **Stripe** | Avisa cuando alguien paga | Ya la tenés |
| **Notion — base Alumnas** | El registro de todo | Ya la tenés, ya le agregué los campos que faltaban |
| **Google Drive y Calendar** | Las carpetas y las sesiones | Ya los tenés |
| **El conector** | El que escucha, escribe y manda los mails | **Falta. Es lo único que falta** |

El conector puede ser **Make.com** (visual, sin código, gratis al principio) o **código
propio** en un servidor. Ver "Con qué armarlo" al final.

---

## FLUJO 1 · Alguien paga

**Se dispara:** cuando Stripe confirma un pago.

1. Busca en Notion si ese email ya existe.
2. **Si es nueva:**
   - Crea su fila en **Alumnas** con: nombre, email, programa (según qué compró),
     mensualidad, Fecha inicio = hoy, **Fecha fin = hoy + 5 meses**, Estado = Activa,
     Estado financiero = Al día, Último pago = hoy, Próximo pago = hoy + 1 mes.
   - Crea su carpeta en Drive: `Alumna — Nombre Apellido`, con las siete subcarpetas
     (`00 Starting Point Record`, `01 Contexto`, `02 Material real`, `03 Baseline`,
     `04 Weekly reports`, `05 Sesiones`, `06 Review y cierre`).
   - Guarda el link de esa carpeta en la fila de Notion.
   - Le manda el **mail de bienvenida** con el link del contrato, el pedido de que lo
     devuelva firmado, y el aviso de que revise el spam porque el acceso a la
     plataforma llega por separado.
   - Marca *Bienvenida enviada = hoy*.
   - **Te manda un mail a vos:** "Entró Fulana. Dale el acceso a la plataforma."
3. **Si ya existe** (es una cuota mensual): actualiza Último pago, Próximo pago y
   Estado financiero. Nada más. No le manda otra bienvenida.

> ⚠️ Para que el programa y la duración salgan bien, **cada programa tiene que ser un
> producto distinto en Stripe**: AT WORK 1:1, AT WORK grupal, Interview Me. Si hoy
> cobrás todo con el mismo link, hay que separarlos. Es un rato en Stripe, una vez.

---

## FLUJO 2 · Las sesiones, leídas del Calendar

**Se dispara:** todas las noches.

Lee los eventos del día en tu Google Calendar. Por cada evento que corresponda a una
alumna: le suma 1 a *Sesiones dadas* y le pone *Última sesión = esa fecha*.

**Para que esto funcione hay una sola regla que sí depende de vos:** que la alumna esté
**invitada al evento con su email**. Así el cruce es exacto y no falla nunca. La
alternativa —que el título del evento tenga su nombre— funciona, pero se rompe el día
que escribís "Sesión Sol" en vez de "Soledad".

Con eso, además, se puede avisar cuando una alumna lleva más de dos semanas sin
sesión, que es la señal más temprana de que se está por ir.

---

## FLUJO 3 · El seguimiento (el reloj de todas las mañanas)

Mira las fechas de cada alumna activa y manda lo que toque. Cada envío queda marcado
en su fila, así nunca se repite.

| Cuándo | Qué pasa |
|---|---|
| Día 3, si el contrato no está firmado | Recordatorio del contrato |
| Día 28 (semana 4) | **Feedback 1** — "¿cómo venimos?" |
| Mitad del programa (día 75) | **Feedback 2** — qué está funcionando y qué no |
| Fecha fin − 45 | Aviso **a vos**: agendá la revisión interna |
| Fecha fin − 35 | A ella: "en estas semanas volvés a grabar" |
| Fecha fin − 30 | A ella: "estamos entrando en la última etapa" · y su Estado pasa solo a **Próxima a finalizar** |
| Fecha fin − 21 | Aviso **a vos**: la conversación de continuidad es esta semana |
| Fecha fin + 2 | **Feedback 3** — el testimonio, con las tres preguntas |
| Fecha fin + 90 | Aviso **a vos**: el mensaje de los 90 días |

Los textos de todos estos mails están en `mails-automaticos.md`.

---

## FLUJO 5 · El weekly report de los lunes

**Se dispara:** todos los lunes a las 8 de la mañana.

Le manda un mail a cada alumna **activa** con el link a su weekly report para completar.
Nada más. Es el mail más corto de todos y el más importante: el weekly report es el
sensor de todo lo demás — si deja de llegar, dejás de ver.

Dos cosas que conviene que haga además:

- **Que no le llegue a quien ya lo mandó.** Si completó el de esta semana, no se le
  manda el recordatorio. Eso pide que el formulario escriba de vuelta la fecha del
  último reporte.
- **Que a vos te llegue el resumen los martes:** quiénes lo completaron y quiénes no.
  Así el "tres alumnas no mandaron reporte" lo ves de una, sin revisar una por una.

> El weekly report tiene que ser un **formulario** (Google Forms), no un mail a mano.
> Si es formulario, las respuestas caen ordenadas, se pueden guardar en su carpeta de
> Drive, y el sistema sabe quién contestó. Si es texto libre por mail, nada de eso
> se puede saber.

---

## FLUJO 4 · El contrato firmado

El mail de bienvenida lleva un **link a un formulario**, no un PDF suelto. Ella
descarga el contrato, lo firma, y lo sube ahí mismo.

Cuando lo sube: se marca sola la casilla *Contrato firmado* en Notion, el archivo se
guarda en su carpeta de Drive, y a vos te llega el aviso.

Si en cambio lo mandás como PDF por mail, la casilla la tenés que marcar vos a mano.
Por eso conviene el formulario: es lo que convierte "me lo tiene que devolver firmado"
en algo que se cierra solo.

---

## Lo que NO se puede automatizar

Te lo digo ahora para que no lo esperes:

- **Dar el acceso a la plataforma.** Ninguna plataforma de cursos deja que otro
  programa dé de alta gente sola. Te llega el aviso y lo hacés en un minuto.
- **Leer el contrato firmado.** Llega, se guarda, se marca. Mirarlo es tuyo.
- **Las sesiones, la revisión, el Progress Review.** Eso es el trabajo. Nada de esto
  lo reemplaza: lo que hace es que no se te pase nada alrededor.

---

## Con qué armarlo

**Make.com — lo que recomiendo.** Es visual: cajas conectadas con flechas, sin código.
Ya trae conexión con Stripe, Notion, Google Drive, Calendar y Gmail. Cuando algo falla
te manda un mail avisando, y el arreglo suele ser volver a apretar un botón.

- Gratis hasta 1.000 operaciones por mes. Con tus 20 alumnas puede quedar justo.
- Si se queda corto: **USD 9 por mes** por 10.000 operaciones, que te sobran.

**Lo que hace falta de vos, una sola vez:** crear la cuenta y apretar "conectar" en
cada servicio (Stripe, Notion, Drive, Calendar, Gmail). Es iniciar sesión y dar
permiso, cinco veces. No hay que programar nada: los escenarios te los dejo armados.

**La alternativa, código propio.** Sale cero por mes y no tiene límite de operaciones,
pero si se rompe se rompe callado y necesitás a alguien que lo mire. Tiene sentido más
adelante, cuando el sistema ya esté probado y sepas exactamente qué querés que haga.

---

## El orden en que hay que armarlo

No todo junto. Cada uno anda solo antes de sumar el siguiente:

1. **Flujo 5** (el weekly report de los lunes). Es el más simple de todos y el que más
   rápido se siente: un formulario, un mail, un horario. Sirve para probar que el
   conector funciona antes de meterle nada complicado.
2. **Flujo 1** (pago → Notion + carpeta + bienvenida). Es el que más te ahorra, y se
   prueba fácil: hacés un pago de USD 1 a vos misma y mirás si aparece todo.
3. **Flujo 4** (el formulario del contrato). Diez minutos, y cierra el círculo del 1.
4. **Flujo 3** (el reloj del seguimiento). Es el que sostiene el offboarding.
5. **Flujo 2** (las sesiones del Calendar). El más prolijo de todos, y el que menos
   urge.

Empezar por el 5 y no por el 1 no es dar vueltas: es que la primera vez que armás algo
así conviene que sea algo chico, para descubrir los problemas cuando todavía son
baratos.
