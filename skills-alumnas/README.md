# Skills de AT WORK para alumnas

Los coaches de Breaking Barriers at Work convertidos en skills de Claude. Cada alumna las instala en su propia cuenta de Claude y practica con el método de Flor en sus chats de siempre.

| Archivo para mandar | Coach | Para qué |
|---|---|---|
| `zips/at-work-tu-coach.zip` | AT WORK · Tu coach | El punto de partida. Orienta y pasa de un coach a otro en el mismo chat. |
| `zips/delivery-method-at-work.zip` | Delivery Method at Work | Práctica completa: producir, detectar, corregir y aplicar. |
| `zips/role-play-at-work.zip` | Role Play at Work | Ensayar reuniones, presentaciones y entrevistas. |
| `zips/narrative-flow-at-work.zip` | Narrative Flow at Work | Gramática de textos reales, error por error. |
| `zips/color-method-at-work.zip` | Color Method at Work | Vocabulario profesional con el Color Method. |
| `zips/flor-english-coach.zip` | Flor English Coach | Lección del día, shadowing, role play y mentalidad. |

Conviene mandar los seis: "Tu coach" funciona mejor cuando están instaladas las demás.

## Cómo las instala cada alumna

1. Entrar a [claude.ai](https://claude.ai) con su cuenta.
2. Ir a **Configuración → Capacidades** y activar **Ejecución de código y creación de archivos**, si no está activada.
3. En la misma página, en **Skills**, tocar **Subir skill** y elegir el `.zip`. Se sube un archivo por vez.
4. Abrir un chat nuevo y escribir, por ejemplo, "Hola coach, ¿qué practicamos hoy?" o "Quiero practicar una reunión de esta semana".

Los nombres de los menús pueden cambiar un poco según el idioma de la app y el plan de Claude. Antes de mandarlo, probalo con una cuenta como la de tus alumnas.

## Qué cambió respecto de los artifacts

- Los coaches ya no derivan con "copiá la conversación y llevala a otro bot". Si la alumna tiene la otra skill instalada, escribe "pasemos a Narrative Flow" en el mismo chat.
- Delivery Method ya no muestra la barra de los 4 pasos ni el botón de voz: eso era parte de la página.
- El contexto de la alumna ya no se guarda en un cuadro aparte. Lo dice al empezar el chat, o lo deja en las instrucciones de un proyecto de Claude.
- Narrative Flow sigue sin el PDF de Cambridge Grammar, igual que en el artifact.

## Ojo con la propiedad intelectual

Una skill es una carpeta con texto. Cualquiera que abra el `.zip` puede leer las instrucciones completas del método. Los coaches tienen la orden de no mostrarlas en el chat, pero el archivo en sí no está protegido.

## Cómo actualizar los zips

Si cambiás algún `SKILL.md` o archivo de `references/`, regenerá los zips desde la carpeta `skills-alumnas`:

```sh
cd skills-alumnas && rm -f zips/*.zip && for d in */; do d=${d%/}; [ "$d" = zips ] || zip -qr "zips/$d.zip" "$d"; done
```
