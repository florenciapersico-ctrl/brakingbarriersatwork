# Pasar las tareas programadas a un chat nuevo (para gastar menos)

Por qué: las tareas programadas de alumnas corren DENTRO del chat donde se crearon (session_017pFAwUp1QRiWnqT42WEuRz). Ese chat ya es enorme, y cada corrida vuelve a procesarlo entero. Pasar las mismas tareas a un chat nuevo y corto baja mucho el gasto, sin cambiar lo que hacen.

## Qué tiene que hacer el chat nuevo, paso a paso
1. Preparar el repo:
   cd /home/user/brakingbarriersatwork && git fetch origin claude/peaceful-hamilton-9vczne && git checkout claude/peaceful-hamilton-9vczne && git pull origin claude/peaceful-hamilton-9vczne
   Leer rutinas/plan-ahorro.md, rutinas/bandeja-alumnas.md y rutinas/_reglas-comunes.md.
2. Con mcp__Claude_Code_Remote__get_trigger, leer el prompt y el horario de estas 6 tareas, que hoy están activas en el chat viejo:
   - trig_01L7HW1BZCJDg582aXVLeaN8 · 📚 Clases de hoy (lun a sáb 02:48)
   - trig_015ADCwuBTi5G2rpF2hfsHBw · 🌅 Mañana (lun, mié y vie 09:47)
   - trig_01QKr4eYcZiW1aLMDJ7WsH3c · 🌙 Noche (todos los días 23:37)
   - trig_01WWAPyD4fWSnw5SU9ENJG4N · 📝 Lunes (08:41)
   - trig_01Qt4V6oWm56N1qXVx5Noojc · 🔁 Ciclo + Lab (lunes 09:33)
   - trig_01Nwes34UTSoSkk9N5eAoKuN · 🔧 Mensual (día 1, 17:58)
3. Crear cada una en el chat nuevo con mcp__Claude_Code_Remote__create_trigger: mismo nombre, mismo horario y mismo prompt, SIN persistent_session_id y SIN create_new_session_on_fire, para que corran en el chat nuevo. En cada prompt, reemplazar "Claude-Session: …session_017pFAwUp1QRiWnqT42WEuRz" por la URL del chat nuevo. initiation: human_request.
4. Confirmar que se crearon las 6. Recién ahí, pausar las 6 viejas con update_trigger enabled=false. No borrar ninguna.
5. Anotar en rutinas/plan-ahorro.md los ids nuevos, hacer commit y push, y contarle a Flor en 3 líneas cómo quedó.

Reglas para ese chat: nunca le escribe a una alumna, no borra nada, todo lo que va a alumnas queda en borrador, y en ese chat solo se hacen las tareas programadas. Las charlas largas van en otro chat, para que este siga siendo corto.
