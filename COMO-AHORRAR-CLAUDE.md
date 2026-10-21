# Cómo gastar menos usando Claude

Guía corta para Flor. Lo que más consume no es lo que pedís, sino **cuánto tiene que
leer Claude cada vez que le respondés**: toda la conversación anterior se vuelve a
procesar en cada mensaje.

## Los 5 hábitos que más ahorran

1. **Una tarea, una conversación.** Terminaste los anuncios y ahora querés tocar la
   landing: abrí una sesión nueva (o escribí `/clear`). Arrastrar la charla vieja es
   lo que más cuesta.
2. **Si una charla se hizo larga y la necesitás, `/compact`.** Resume lo anterior y
   sigue con mucho menos peso.
3. **Usá el modelo justo.** Opus para pensar estrategia, oferta o algo difícil.
   Sonnet para copy, correcciones, cambios chicos en la web. Haiku para tareas
   mecánicas. Se cambia con `/model`.
4. **Pedí todo junto y concreto.** "Cambiá el título del hero por X y el botón por Y"
   en un mensaje gasta menos que cinco mensajes de ida y vuelta. Si sabés el archivo,
   nombralo: `en at-work/index.html…`.
5. **Desconectá los conectores que no usás.** Cada conector activo (Vercel, Stripe,
   Canva, Gamma, Gmail, Notion, Slack…) suma instrucciones a cada mensaje. Dejá
   prendidos solo los que usás esa semana (claude.ai → Configuración → Conectores).

## Para mirar cuánto gastás

- `/cost` muestra lo que lleva la sesión actual.
- `/usage` (o claude.ai → Configuración → Uso) muestra cuánto te queda del plan.

## Lo que ya está hecho en este repo

- `CLAUDE.md` le da a Claude el mapa del sitio, así no gasta explorando.
- Las tipografías de `rutina/index.html` salieron a `rutina/fonts/`: el archivo pasó
  de 310 KB a 158 KB, la mitad de lectura cada vez que Claude lo toca.
- Claude arranca en **Sonnet** en este proyecto (`.claude/settings.json`). Para algo
  de estrategia o difícil, escribí `/model opus` en esa sesión.
- El agente de Meta Ads también usa Sonnet.
- Claude tiene bloqueado leer el PDF de AT WORK y las tipografías, que no le sirven.
  Si algún día necesitás que lea el PDF, sacá esa línea de `.claude/settings.json`.
