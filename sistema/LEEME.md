# Sistema AT WORK · tu negocio funcionando solo (y con tu criterio)

## Qué es

Un programa tuyo que corre solo en internet (en GitHub), todos los días, a los horarios de tus rutinas.
No depende de ninguna conversación con Claude ni de que tengas la compu prendida.
Usa la IA de Claude por dentro, con tu criterio, tu voz y tus reglas, que salen de los archivos de este repo.

## La regla más importante

**Ningún feedback ni respuesta a una alumna sale sin tu aprobación.** Esto cubre tareas, mails y weekly reports, sin excepciones.
Está escrito en el código (`bbaw/guard.py`), no depende de que la IA "se acuerde", y hay una prueba automática que lo verifica.
Tu criterio es lo que hace humano a tu negocio: el sistema te ahorra el trabajo pesado, y la última palabra es siempre tuya.

Lo único que sale sin preguntarte es lo que ya autorizaste antes:

- el mail de los lunes con el link del weekly;
- las invitaciones o avisos de calendario de sus clases;
- compartirle su carpeta de Drive.

Todo lo demás llega solo a vos: resúmenes, avisos, borradores y pedidos de revisión.

## Cómo lo usás vos, en el día a día

1. **Feedback.** Dos veces por día, el sistema revisa el mail **y** las carpetas de Drive de todas tus alumnas. Ellas pueden mandar la tarea por cualquiera de las dos vías.
   Por cada entrega:
   - arma la devolución con tu skill y tu voz;
   - una segunda IA la revisa aparte;
   - la deja en Notion › **💬 Feedback para revisar**, con un semáforo:
     - 🟢 nada dudoso;
     - 🟡 hay algo puntual que mirar, por ejemplo "escuchá 0:20";
     - 🔴 falta información.
2. Te llega **un solo mail** con la lista y el link. Abrís cada fila, leés, cambiás lo que quieras **en la misma página** y tildás **✅ Aprobar**. También podés responder el mail con «ok Vir» u «ok todas».
3. Dentro de la hora siguiente sale el mail a la alumna con **exactamente tu texto**. Vos vas en copia oculta y queda anotado en su ficha.
4. Si cambiaste algo, el sistema lo anota en `rutinas/criterio-correccion-log.md`. Así aprende tu criterio y cada vez tenés que cambiar menos.

El resto de las rutinas (HOY en Notion, clases del día, correos para enviar, discovery, finanzas, lunes, viernes, ciclo de alumnas, Notion al día) corre solo y te deja todo en tu mail y en Notion, como hasta ahora.

## Lo que hay que hacer una sola vez para prenderlo

Nunca hace falta pasarle una contraseña a nadie: cada clave va directo a GitHub, a un lugar privado (Secrets).

1. **Clave de Claude.** Entrá a https://console.anthropic.com → API Keys → Create Key. Copiala y pegala en GitHub › repo › Settings › Secrets and variables › Actions › New secret, con el nombre `ANTHROPIC_API_KEY`.
2. **Notion.** Entrá a https://www.notion.so/profile/integrations → New integration → "Sistema AT WORK" → copiá el token y guardalo como secret `NOTION_TOKEN`. Después, en Notion, abrí **ECOSISTEMA AT WORK** y **HOY / ESTA SEMANA** → ⋯ → Connections → agregá "Sistema AT WORK".
3. **Google** (Gmail, Drive, Calendar).
   - En https://console.cloud.google.com, creá un proyecto "Sistema AT WORK".
   - Activá las APIs de Gmail, Drive, Docs y Calendar.
   - Creá una credencial OAuth de tipo "App de escritorio" y descargá el `client_secret.json`.
   - En tu compu, corré `python sistema/setup/obtener_token_google.py client_secret.json`. Se abre Google: elegí tu cuenta y tocá Permitir.
   - Guardá los 3 valores que imprime como secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_REFRESH_TOKEN`.
4. **Pasar el sistema a `main`.** GitHub solo corre los horarios automáticos desde la rama principal.
5. **Modo prueba.** Arranca en modo prueba: arma todo y te avisa, pero no le manda nada a ninguna alumna.
   Cuando veas que está bien, en Settings › Secrets and variables › Actions › **Variables**, creá `BBAW_DRY_RUN` con el valor `0`.
   Para frenarlo cuando quieras, cambiá ese valor a `1`.

## Cómo ver qué hizo

- GitHub › pestaña **Actions** › "Sistema AT WORK": cada corrida, con su registro.
- `sistema/registro/`: un archivo por corrida, con todo lo que hizo y lo que las reglas bloquearon.
- Para correr una rutina en el momento: Actions › Sistema AT WORK › Run workflow › escribí el nombre (por ejemplo `feedback`).

## Cómo cambiar lo que hace

Cada rutina lee sus instrucciones de un archivo:

- las de feedback están en `rutinas/feedback-alumnas.md`, `rutinas/feedback-sistema.md` y la skill `.claude/skills/feedback-alumnas`;
- la lista completa de rutinas, con sus horarios y herramientas, está en `sistema/config/jobs.yaml`.

Si cambiás un archivo, el sistema cambia desde la próxima corrida.

## Costo aproximado

- **Claude (API):** se paga por uso. Con 50 alumnas, una entrega por semana cada una y las rutinas diarias, calculo entre USD 30 y 80 por mes.
- **GitHub Actions:** el plan gratis alcanza para empezar. Si el repo es privado y se pasan los minutos gratis, el plan pago es barato.

## Qué queda todavía en las rutinas de Claude (fase 2)

Contenido semanal y carruseles (necesitan Canva), wins del viernes, "para subir hoy", clase lista para grabar, qué grabar esta semana, portales de alumnas, SOP lab, correo en orden y el EOD con Stripe.
Se pueden pasar al sistema después, de a una.

## Partes del código (para quien lo mantenga)

| Archivo | Qué hace |
|---|---|
| `bbaw/guard.py` | Reglas de Flor, que se cumplen en código. |
| `bbaw/jobs/feedback.py` | Circuito de feedback: recepción, contexto, armado, revisión, semáforo, Notion, aviso. |
| `bbaw/jobs/send_approved.py` | Envío de lo aprobado y registro de los cambios de Flor. |
| `bbaw/tools.py` | Lo único que la IA puede hacer en las rutinas. |
| `bbaw/runner.py` | Corre una rutina de `jobs.yaml`. |
| `tests/` | Pruebas de las reglas: `python -m pytest sistema/tests`. |
