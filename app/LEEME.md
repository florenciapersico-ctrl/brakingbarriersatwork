# App de alumnas AT WORK · cómo ponerla en marcha

La app vive en `app/` y se publica sola con GitHub Pages:
`https://florenciapersico-ctrl.github.io/brakingbarriersatwork/app/`

Mientras `config.js` esté vacío, la app abre en **modo demo** (datos de ejemplo de Valeria,
guardados solo en tu navegador). Así la podés recorrer entera antes de conectarla.

## Qué tiene

**Para la alumna:** Mi semana, Flor AI (con los 4 coaches adentro: Role Play, Narrative Flow,
Color Method, Pronunciation), Pedir feedback, Weekly report, Mi camino, Mis coaches, Mi progreso
y Empieza acá (onboarding con checklist). Entra con mail y contraseña, sin cuenta de Claude.

**Para vos (Panel de Flor):** Bandeja (pedidos de feedback y weeklies, con "Borrador con IA"),
Alumnas (invitar, foco de la semana, tareas, clases asignadas, progreso, patrones de error)
y Programa (próximo lab, links, fechas, aviso para todas).

## Lo que hacés vos (una sola vez, ~30 min)

### 1. Supabase (gratis)
1. Creá una cuenta en supabase.com y un proyecto nuevo (región São Paulo).
2. **SQL Editor › New query**: pegá todo `supabase/schema.sql` y tocá **Run**.
3. **Authentication › Sign In / Providers**: dejá Email prendido y **apagá "Allow new users to sign up"**
   (así solo entran las alumnas que invitás).
4. **Authentication › URL Configuration**: en *Site URL* y *Redirect URLs* poné
   `https://florenciapersico-ctrl.github.io/brakingbarriersatwork/app/`
5. **Authentication › Users › Add user**: creá tu usuario con tu mail y contraseña.
   Después, en el SQL Editor, corré:
   `update public.perfiles set rol = 'admin' where email = 'TU-MAIL';`
6. **Project Settings › API**: copiá la *Project URL* y la *anon public key* y pasámelas
   (o pegalas vos en `app/config.js`). Esas dos son públicas, no pasa nada.

### 2. Clave de Anthropic (para Flor AI)
1. En console.anthropic.com creá una API key y cargá crédito. **No la pegues en el chat.**
2. En Supabase: **Edge Functions › Secrets** › agregá `ANTHROPIC_API_KEY` con tu clave.
3. Opcionales: `LIMITE_DIARIO` (mensajes por alumna por día, por defecto 60),
   `FLOR_AI_MODEL` (por defecto `claude-opus-5-5`; con `claude-sonnet-5-5` sale más barato)
   y `FLOR_AI_EFFORT` (`low` por defecto).

### 3. Publicar la función de Flor AI
Desde una compu con la terminal (o se lo pedís a Claude Code en una sesión con tu compu):
```bash
npx supabase login
npx supabase functions deploy flor-ai --project-ref TU-PROJECT-REF
```
O desde el panel: **Edge Functions › Deploy a new function › Via editor**, nombre `flor-ai`,
y pegás `supabase/functions/flor-ai/index.ts` y `prompts.ts`.

### 4. Invitar alumnas
Entrá a la app con tu usuario › **Alumnas › Invitar alumna**. Le llega un mail, crea su
contraseña y entra directo a "Empieza acá".

## Cosas para saber
- Los chats con Flor AI son privados de cada alumna: vos no los ves desde la app.
- Flor AI ve los datos que cargás en "Alumnas" (foco, tareas, clases, feedback). Cuanto más
  completo, mejor guía.
- Para sumar clases nuevas que grabes: editá la lista `clases` del módulo en `app/programa.js`.
- Para cambiar cómo responden Flor AI o los coaches: `supabase/functions/flor-ai/prompts.ts`
  y volvés a publicar la función.
