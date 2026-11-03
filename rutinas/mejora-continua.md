# 🔧 Mejora continua del sistema

Pedido de Flor (03/11/2026): "Necesito que vayas actualizando todo para que se vaya mejorando el sistema cada vez más."

Este archivo dice cómo el sistema aprende y se corrige solo, semana a semana.

## 1 · Qué se anota, siempre y en cualquier rutina
Cada rutina, y la conversación principal, anota en `rutinas/mejoras-log.md` una línea por cada problema o aprendizaje. Así:
`- dd/mm · <rutina> · <qué pasó> · <causa> · <qué se cambió o se propone>`

Qué cuenta:
- Una corrección de Flor en el chat o por mail: "eso no", "ya se lo mandé", "no se entiende".
- Un borrador que Flor cambió antes de mandarlo. Se anota qué cambió y por qué (inferido). Si es de feedback, también va en criterio-correccion-log.md.
- Un borrador que Flor no mandó, que mandó tarde o que pidió borrar.
- Un duplicado, un dato equivocado, un link roto o un mail sin links.
- Una tarea programada que falló o que no corrió.
- Algo que Flor tuvo que hacer a mano y se podría automatizar.

Si Flor corrige algo en la conversación, la regla se actualiza EN EL MOMENTO en el archivo que corresponde (_reglas-comunes.md, bandeja-alumnas.md o el de la rutina), no se espera a la revisión semanal.

## 2 · Revisión semanal (viernes 17:58)
1. Leé `mejoras-log.md` de la semana.
2. Compará cada borrador con lo que Flor mandó de verdad (Enviados contra borradores, `criterio-correccion-log.md`).
3. Revisá sus respuestas a los mails de las rutinas y la última semana de la conversación principal.
4. Revisá qué tareas programadas corrieron y cuáles no (list_triggers: last_run).
5. Buscá patrones, es decir, cosas que se repiten 2 veces o más. Cada patrón se convierte en una regla concreta, con un ejemplo real.

## 3 · Qué se puede cambiar solo y qué no
**Se cambia sin preguntar** y se avisa en el mail:
- Reglas que repiten una corrección explícita de Flor.
- Arreglos de formato: links, asuntos, orden de la tabla.
- Reglas para evitar duplicados.
- Ejemplos del estilo de Flor sacados de sus propias ediciones.

Los cambios van en los archivos de `rutinas/`, en la skill de feedback o en los prompts de las tareas programadas de esta conversación.

**Se propone y espera el "ok" de Flor:**
- Cualquier cosa que cambie lo que reciben las alumnas sin que Flor lo haya pedido.
- Crear, pausar o borrar tareas programadas.
- Mandar algo sin revisión.
- Cambiar precios, horarios o lo que dice el programa.

## 4 · El mail de los viernes
UN mail SOLO a florenciapersico@breakingbarriers.site, con asunto `🔧 Tu sistema esta semana · <dd/mm>`, en voseo y en 10 líneas como máximo:
- ✅ Qué funcionó, en números: borradores armados, mandados sin cambios, mandados con cambios.
- 🔧 Qué cambié y por qué, una línea por cambio.
- 💡 Qué te propongo, si hay algo. Lo respondés con "ok 1", "ok 2" o "no".
- 🧱 Para la plataforma: qué de lo aprendido esta semana ya está listo para pasar a tu página web, con las reglas estables y los formatos que funcionan.

Si no hubo nada nuevo, el mail dice una sola línea.
